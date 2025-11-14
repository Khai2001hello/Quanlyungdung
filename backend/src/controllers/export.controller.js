const ExcelJS = require('exceljs');
const Booking = require('../models/booking.model');
const logger = require('../utils/logger');

const exportController = {
  async exportBookingsToExcel(req, res) {
    try {
      const { startDate, endDate, room, status } = req.query;

      // Build filters
      const filters = {};
      if (room) filters.room = room;
      if (status) filters.status = status;

      if (startDate || endDate) {
        filters.startTime = {};
        if (startDate) filters.startTime.$gte = new Date(startDate);
        if (endDate) filters.startTime.$lte = new Date(endDate);
      }

      // Fetch bookings
      const bookings = await Booking.find(filters)
        .populate('room', 'name code type capacity')
        .populate('user', 'fullName email')
        .sort({ startTime: 1 });

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Bookings');

      // Define columns
      worksheet.columns = [
        { header: 'STT', key: 'index', width: 10 },
        { header: 'Mã phòng', key: 'roomCode', width: 15 },
        { header: 'Tên phòng', key: 'roomName', width: 25 },
        { header: 'Loại phòng', key: 'roomType', width: 15 },
        { header: 'Người đặt', key: 'userName', width: 25 },
        { header: 'Email', key: 'userEmail', width: 30 },
        { header: 'Thời gian bắt đầu', key: 'startTime', width: 20 },
        { header: 'Thời gian kết thúc', key: 'endTime', width: 20 },
        { header: 'Mục đích', key: 'purpose', width: 35 },
        { header: 'Số người tham gia', key: 'attendees', width: 18 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 12 };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Add data rows
      bookings.forEach((booking, index) => {
        const statusMap = {
          pending: 'Chờ duyệt',
          confirmed: 'Đã xác nhận',
          cancelled: 'Đã hủy'
        };

        worksheet.addRow({
          index: index + 1,
          roomCode: booking.room?.code || 'N/A',
          roomName: booking.room?.name || 'N/A',
          roomType: booking.room?.type || 'N/A',
          userName: booking.user?.fullName || 'N/A',
          userEmail: booking.user?.email || 'N/A',
          startTime: new Date(booking.startTime).toLocaleString('vi-VN'),
          endTime: new Date(booking.endTime).toLocaleString('vi-VN'),
          purpose: booking.purpose || '',
          attendees: booking.attendees ? `${booking.attendees} người` : 'N/A',
          status: statusMap[booking.status] || booking.status,
          createdAt: new Date(booking.createdAt).toLocaleString('vi-VN')
        });
      });

      // Apply borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=bookings_${Date.now()}.xlsx`
      );

      // Write to response
      await workbook.xlsx.write(res);
      res.end();

      logger.info(`Exported ${bookings.length} bookings to Excel`);
    } catch (error) {
      console.error('Error exporting bookings to Excel:', error);
      
      // Check if response already sent
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Error exporting bookings'
        });
      }
    }
  }
};

module.exports = exportController;
