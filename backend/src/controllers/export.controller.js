const Booking = require('../models/booking.model');
const Room = require('../models/room.model');

class ExportController {
  // Export bookings to CSV
  async exportBookingsCSV(req, res) {
    try {
      const { startDate, endDate, roomId, status } = req.query;
      
      const query = {};
      if (startDate && endDate) {
        query.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (roomId) query.room = roomId;
      if (status) query.status = status;

      const bookings = await Booking.find(query)
        .populate('room', 'name code')
        .populate('user', 'fullName email department')
        .sort({ startTime: -1 });

      // Create CSV content
      let csv = 'Booking ID,Room Name,Room Code,User Name,Email,Department,Title,Start Time,End Time,Status,Participants\n';
      
      bookings.forEach(booking => {
        csv += `"${booking._id}","${booking.room.name}","${booking.room.code}","${booking.user.fullName}","${booking.user.email}","${booking.user.department || ''}","${booking.title}","${booking.startTime}","${booking.endTime}","${booking.status}","${booking.numberOfParticipants || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Export rooms to CSV
  async exportRoomsCSV(req, res) {
    try {
      const rooms = await Room.find({ isActive: true }).sort({ name: 1 });

      // Create CSV content
      let csv = 'Room ID,Name,Code,Capacity,Building,Floor,Status,Facilities\n';
      
      rooms.forEach(room => {
        csv += `"${room._id}","${room.name}","${room.code}","${room.capacity}","${room.location?.building || ''}","${room.location?.floor || ''}","${room.status}","${room.facilities.join(', ')}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=rooms.csv');
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get booking statistics
  async getBookingStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const totalBookings = await Booking.countDocuments(dateFilter);
      const pendingBookings = await Booking.countDocuments({ ...dateFilter, status: 'pending' });
      const approvedBookings = await Booking.countDocuments({ ...dateFilter, status: 'approved' });
      const rejectedBookings = await Booking.countDocuments({ ...dateFilter, status: 'rejected' });
      const cancelledBookings = await Booking.countDocuments({ ...dateFilter, status: 'cancelled' });
      const completedBookings = await Booking.countDocuments({ ...dateFilter, status: 'completed' });

      // Most booked rooms
      const mostBookedRooms = await Booking.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$room', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'rooms', localField: '_id', foreignField: '_id', as: 'roomInfo' } },
        { $unwind: '$roomInfo' },
        { $project: { _id: 1, count: 1, name: '$roomInfo.name', code: '$roomInfo.code' } }
      ]);

      // Bookings by status
      const bookingsByStatus = {
        pending: pendingBookings,
        approved: approvedBookings,
        rejected: rejectedBookings,
        cancelled: cancelledBookings,
        completed: completedBookings
      };

      res.status(200).json({
        success: true,
        data: {
          totalBookings,
          bookingsByStatus,
          mostBookedRooms
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get room utilization report
  async getRoomUtilizationReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const rooms = await Room.find({ isActive: true });
      const utilization = [];

      for (const room of rooms) {
        const query = {
          room: room._id,
          status: { $in: ['approved', 'completed'] }
        };

        if (startDate && endDate) {
          query.startTime = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          };
        }

        const bookings = await Booking.find(query);
        
        // Calculate total hours booked
        const totalHours = bookings.reduce((sum, booking) => {
          const duration = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
          return sum + duration;
        }, 0);

        utilization.push({
          roomId: room._id,
          roomName: room.name,
          roomCode: room.code,
          capacity: room.capacity,
          totalBookings: bookings.length,
          totalHoursBooked: totalHours.toFixed(2)
        });
      }

      // Sort by total hours booked
      utilization.sort((a, b) => b.totalHoursBooked - a.totalHoursBooked);

      res.status(200).json({
        success: true,
        data: utilization
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ExportController();

