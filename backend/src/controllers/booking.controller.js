const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');
const auditService = require('../services/audit.service');

const buildBookingFilters = (query, user) => {
  const { room, user: userId, startDate, endDate, status } = query;
  const filters = {};

  if (room) {
    filters.room = room;
  }

  if (status) {
    filters.status = status;
  }

  const isAdmin = user?.role === 'admin';
  // Admin: only filter by userId if explicitly provided in query
  // Non-admin: always filter by their own user ID
  if (!isAdmin && user?._id) {
    filters.user = user._id;
  } else if (isAdmin && userId) {
    filters.user = userId;
  }

  if (startDate || endDate) {
    filters.startTime = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) {
        filters.startTime.$gte = start;
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        filters.startTime.$lte = end;
      }
    }
  }

  return filters;
};

const bookingController = {
  async getBookings(req, res, next) {
    try {
      const filters = buildBookingFilters(req.query, req.user);

      const bookings = await Booking.find(filters)
        .populate('room', 'name code type capacity status')
        .populate('user', 'fullName email role')
        .sort({ startTime: 1 });

      // Auto-cancel pending bookings that have already started
      const now = new Date();
      const autoCancelPromises = bookings
        .filter(booking => 
          booking.status === 'pending' && 
          new Date(booking.startTime) < now
        )
        .map(async (booking) => {
          booking.status = 'cancelled';
          booking.rejectionReason = 'Cuộc họp bị hủy do chưa được phê duyệt trước thời gian họp';
          await booking.save();
          
          // Send rejection email
          try {
            await emailService.sendBookingRejectedEmail(booking, booking.rejectionReason);
          } catch (error) {
            logger.error('Error sending auto-cancel email:', error);
          }
        });

      await Promise.all(autoCancelPromises);

      // Reload bookings to get updated status
      const updatedBookings = await Booking.find(filters)
        .populate('room', 'name code type capacity status')
        .populate('user', 'fullName email role')
        .sort({ startTime: 1 });

      return res.status(200).json({
        success: true,
        data: updatedBookings,
        meta: {
          total: updatedBookings.length,
          filters
        }
      });
    } catch (error) {
      logger.error('Lỗi khi lấy danh sách đặt phòng:', error);
      return next(error);
    }
  },

  async createBooking(req, res) {
    try {
      const { room, startTime, endTime, purpose, attendees } = req.body;
      
      console.log('📥 Create booking request:', { room, startTime, endTime, purpose, attendees });

      const start = new Date(startTime);
      const end = new Date(endTime);

      if (!room) {
        return res.status(400).json({
          success: false,
          message: 'Phòng họp là bắt buộc'
        });
      }

      const roomExists = await Room.findById(room);
      if (!roomExists) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phòng họp'
        });
      }

      const conflict = await Booking.findOne({
        room,
        status: { $ne: 'cancelled' },
        startTime: { $lt: end },
        endTime: { $gt: start }
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: 'Phòng họp đã được đặt trong khung giờ này'
        });
      }

      // 🎯 AUTO-APPROVE: Admin bookings are automatically approved
      const isAdmin = req.user.role === 'admin';
      
      const booking = await Booking.create({
        room,
        user: req.user._id,
        startTime: start,
        endTime: end,
        purpose,
        attendees: attendees || null,
        status: isAdmin ? 'confirmed' : 'pending'
      });

      await booking.populate([
        { path: 'room', select: 'name code type capacity status' },
        { path: 'user', select: 'fullName email role' }
      ]);

      // Send appropriate email notification
      if (isAdmin) {
        // Admin booking is auto-approved, send confirmation email
        await emailService.sendBookingApprovedEmail(booking);
      } else {
        // Regular user booking, send pending email
        await emailService.sendBookingCreatedEmail(booking);
      }

      // Log audit
      await auditService.log({
        userId: req.user._id,
        action: 'BOOKING_CREATED',
        resourceType: 'booking',
        resourceId: booking._id,
        details: {
          room: booking.room._id,
          roomName: booking.room.name,
          startTime: booking.startTime,
          endTime: booking.endTime
        },
        req
      });

      return res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      if (error.status === 409) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      logger.error('Lỗi khi tạo đặt phòng:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo đặt phòng'
      });
    }
  },

  async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      const booking = await Booking.findById(id);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch đặt phòng'
        });
      }

      const isOwner = booking.user.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền hủy lịch đặt phòng này'
        });
      }

      // 🔒 POLICY: Không được hủy booking đã phê duyệt
      // Chỉ admin mới có thể hủy booking confirmed
      if (booking.status === 'confirmed' && !isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy lịch họp đã được phê duyệt. Vui lòng liên hệ admin.'
        });
      }

      // ⏰ POLICY: Nhân viên chỉ được hủy trước 30 phút so với giờ họp
      // Admin có thể hủy bất cứ lúc nào
      if (!isAdmin) {
        const now = new Date();
        const startTime = new Date(booking.startTime);
        const timeUntilMeeting = startTime - now; // milliseconds
        const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes = 1800000 ms

        // Chỉ kiểm tra nếu cuộc họp CHƯA diễn ra (timeUntilMeeting > 0)
        // và còn ít hơn 30 phút
        if (timeUntilMeeting > 0 && timeUntilMeeting < thirtyMinutesInMs) {
          return res.status(400).json({
            success: false,
            message: 'Không thể hủy phòng trong vòng 30 phút trước giờ họp. Vui lòng liên hệ admin.'
          });
        }
      }

      await booking.populate([
        { path: 'room', select: 'name code type capacity status' },
        { path: 'user', select: 'fullName email role' }
      ]);

      // Send cancellation email
      await emailService.sendBookingCancelledEmail(booking);

      // Log audit
      await auditService.log({
        userId: req.user._id,
        action: 'BOOKING_CANCELLED',
        resourceType: 'booking',
        resourceId: booking._id,
        details: {
          room: booking.room._id,
          roomName: booking.room.name,
          startTime: booking.startTime,
          endTime: booking.endTime
        },
        req
      });

      await booking.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'Đã hủy lịch đặt phòng thành công'
      });
    } catch (error) {
      logger.error('Lỗi khi hủy đặt phòng:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi hủy đặt phòng'
      });
    }
  },

  // Admin approve booking
  async approveBooking(req, res) {
    try {
      const { id } = req.params;
      
      const booking = await Booking.findById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch đặt phòng'
        });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Không thể phê duyệt lịch đặt phòng có trạng thái: ${booking.status}`
        });
      }

      booking.status = 'confirmed';
      await booking.save();

      await booking.populate([
        { path: 'room', select: 'name code type capacity status' },
        { path: 'user', select: 'fullName email role' }
      ]);

      // Send approval email
      await emailService.sendBookingApprovedEmail(booking);

      // Log audit
      await auditService.log({
        userId: req.user._id,
        action: 'BOOKING_APPROVED',
        resourceType: 'booking',
        resourceId: booking._id,
        details: {
          bookingUser: booking.user._id,
          room: booking.room._id,
          roomName: booking.room.name
        },
        req
      });

      return res.status(200).json({
        success: true,
        message: 'Phê duyệt đặt phòng thành công',
        data: booking
      });
    } catch (error) {
      logger.error('Lỗi khi phê duyệt đặt phòng:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi phê duyệt đặt phòng'
      });
    }
  },

  // Admin reject booking
  async rejectBooking(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const booking = await Booking.findById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lịch đặt phòng'
        });
      }

      if (booking.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Không thể từ chối lịch đặt phòng có trạng thái: ${booking.status}`
        });
      }

      booking.status = 'cancelled';
      if (reason) {
        booking.rejectionReason = reason;
      }
      await booking.save();

      await booking.populate([
        { path: 'room', select: 'name code type capacity status' },
        { path: 'user', select: 'fullName email role' }
      ]);

      // Send rejection email
      await emailService.sendBookingRejectedEmail(booking, reason);

      // Log audit
      await auditService.log({
        userId: req.user._id,
        action: 'BOOKING_REJECTED',
        resourceType: 'booking',
        resourceId: booking._id,
        details: {
          bookingUser: booking.user._id,
          room: booking.room._id,
          roomName: booking.room.name,
          reason: reason || 'No reason provided'
        },
        req
      });

      return res.status(200).json({
        success: true,
        message: 'Từ chối đặt phòng thành công'
      });
    } catch (error) {
      logger.error('Lỗi khi từ chối đặt phòng:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi từ chối đặt phòng'
      });
    }
  },

  // Export bookings to Excel
  async exportBookings(req, res) {
    try {
      const xlsx = require('xlsx');
      
      // Build filters (admin có thể filter, user chỉ xem của mình)
      const filters = buildBookingFilters(req.query, req.user);
      
      // Get bookings
      const bookings = await Booking.find(filters)
        .populate('room', 'name code type capacity')
        .populate('user', 'fullName email')
        .sort({ startTime: -1 });

      // Transform data for Excel
      const excelData = bookings.map((booking, index) => ({
        'STT': index + 1,
        'Mã phòng': booking.room?.code || 'N/A',
        'Tên phòng': booking.room?.name || 'N/A',
        'Loại phòng': booking.room?.type || 'N/A',
        'Sức chứa': booking.room?.capacity || 'N/A',
        'Người đặt': booking.user?.fullName || 'N/A',
        'Email': booking.user?.email || 'N/A',
        'Mục đích': booking.purpose || 'N/A',
        'Thời gian bắt đầu': new Date(booking.startTime).toLocaleString('vi-VN'),
        'Thời gian kết thúc': new Date(booking.endTime).toLocaleString('vi-VN'),
        'Trạng thái': booking.status === 'pending' ? 'Chờ duyệt' : 
                     booking.status === 'confirmed' ? 'Đã phê duyệt' : 'Đã hủy',
        'Lý do hủy': booking.rejectionReason || '',
        'Ngày tạo': new Date(booking.createdAt).toLocaleString('vi-VN')
      }));

      // Create workbook and worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 12 }, // Mã phòng
        { wch: 25 }, // Tên phòng
        { wch: 15 }, // Loại phòng
        { wch: 10 }, // Sức chứa
        { wch: 20 }, // Người đặt
        { wch: 25 }, // Email
        { wch: 30 }, // Mục đích
        { wch: 20 }, // Thời gian bắt đầu
        { wch: 20 }, // Thời gian kết thúc
        { wch: 15 }, // Trạng thái
        { wch: 30 }, // Lý do hủy
        { wch: 20 }  // Ngày tạo
      ];

      xlsx.utils.book_append_sheet(wb, ws, 'Danh sách đặt phòng');

      // Generate buffer
      const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

      // Generate filename with timestamp
      const filename = `Booking_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Log audit
      await auditService.log({
        userId: req.user._id,
        action: 'BOOKINGS_EXPORTED',
        resourceType: 'booking',
        details: {
          totalRecords: bookings.length,
          filters: req.query
        },
        req
      });

      // Send file
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);

    } catch (error) {
      logger.error('Lỗi khi xuất danh sách đặt phòng:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xuất danh sách đặt phòng ra Excel'
      });
    }
  }
};

module.exports = bookingController;
