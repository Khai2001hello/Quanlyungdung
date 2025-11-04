const bookingService = require('../services/booking.service');
const notificationService = require('../services/notification.service');
const AuditLog = require('../models/auditLog.model');

class BookingController {
  // Get all bookings
  async getAllBookings(req, res) {
    try {
      const filters = {
        userId: req.query.userId,
        roomId: req.query.roomId,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const bookings = await bookingService.getAllBookings(filters);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get booking by ID
  async getBookingById(req, res) {
    try {
      const booking = await bookingService.getBookingById(req.params.id);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new booking
  async createBooking(req, res) {
    try {
      const bookingData = {
        ...req.body,
        user: req.user.id
      };

      const booking = await bookingService.createBooking(bookingData);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'create',
        resource: 'booking',
        resourceId: booking._id,
        details: { room: booking.room._id, startTime: booking.startTime },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Send notification
      await notificationService.sendBookingConfirmation(booking);

      res.status(201).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update booking
  async updateBooking(req, res) {
    try {
      const booking = await bookingService.updateBooking(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role
      );

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'update',
        resource: 'booking',
        resourceId: booking._id,
        details: req.body,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cancel booking
  async cancelBooking(req, res) {
    try {
      const { reason } = req.body;
      const booking = await bookingService.cancelBooking(
        req.params.id,
        req.user.id,
        req.user.role,
        reason
      );

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'cancel',
        resource: 'booking',
        resourceId: booking._id,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Send notification
      await notificationService.sendBookingCancellation(booking, reason);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Approve booking (admin/manager only)
  async approveBooking(req, res) {
    try {
      const booking = await bookingService.approveBooking(req.params.id, req.user.id);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'approve',
        resource: 'booking',
        resourceId: booking._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Send notification
      await notificationService.sendBookingApproval(booking);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Reject booking (admin/manager only)
  async rejectBooking(req, res) {
    try {
      const { reason } = req.body;
      const booking = await bookingService.rejectBooking(req.params.id, reason);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'reject',
        resource: 'booking',
        resourceId: booking._id,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      // Send notification
      await notificationService.sendBookingRejection(booking, reason);

      res.status(200).json({
        success: true,
        data: booking
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get user's bookings
  async getUserBookings(req, res) {
    try {
      const bookings = await bookingService.getUserBookings(req.user.id);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get upcoming bookings
  async getUpcomingBookings(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const bookings = await bookingService.getUpcomingBookings(limit);

      res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new BookingController();

