const Booking = require('../models/booking.model');
const Room = require('../models/room.model');
const roomService = require('./room.service');

class BookingService {
  // Get all bookings with filters
  async getAllBookings(filters = {}) {
    const query = {};

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.roomId) {
      query.room = filters.roomId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.startDate && filters.endDate) {
      query.startTime = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    const bookings = await Booking.find(query)
      .populate('room', 'name code location')
      .populate('user', 'fullName email department')
      .populate('approvedBy', 'fullName')
      .sort({ startTime: -1 });

    return bookings;
  }

  // Get booking by ID
  async getBookingById(bookingId) {
    const booking = await Booking.findById(bookingId)
      .populate('room')
      .populate('user', 'fullName email department phoneNumber')
      .populate('approvedBy', 'fullName');

    if (!booking) {
      throw new Error('Booking not found');
    }

    return booking;
  }

  // Create new booking
  async createBooking(bookingData) {
    // Validate room exists
    const room = await Room.findById(bookingData.room);
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if room has enough capacity
    if (bookingData.numberOfParticipants > room.capacity) {
      throw new Error(`Room capacity is ${room.capacity}, but ${bookingData.numberOfParticipants} participants requested`);
    }

    // Check room availability
    const isAvailable = await roomService.checkAvailability(
      bookingData.room,
      bookingData.startTime,
      bookingData.endTime
    );

    if (!isAvailable) {
      throw new Error('Room is not available for the selected time slot');
    }

    // Validate time
    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);

    if (startTime < new Date()) {
      throw new Error('Cannot book for past time');
    }

    if (endTime <= startTime) {
      throw new Error('End time must be after start time');
    }

    const booking = await Booking.create(bookingData);
    return await this.getBookingById(booking._id);
  }

  // Update booking
  async updateBooking(bookingId, updateData, userId, userRole) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check permissions
    if (booking.user.toString() !== userId && !['admin', 'manager'].includes(userRole)) {
      throw new Error('You do not have permission to update this booking');
    }

    // If updating time or room, check availability
    if (updateData.startTime || updateData.endTime || updateData.room) {
      const startTime = updateData.startTime || booking.startTime;
      const endTime = updateData.endTime || booking.endTime;
      const roomId = updateData.room || booking.room;

      const isAvailable = await roomService.checkAvailability(
        roomId,
        startTime,
        endTime,
        bookingId
      );

      if (!isAvailable) {
        throw new Error('Room is not available for the selected time slot');
      }
    }

    Object.assign(booking, updateData);
    await booking.save();

    return await this.getBookingById(bookingId);
  }

  // Cancel booking
  async cancelBooking(bookingId, userId, userRole, reason) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check permissions
    if (booking.user.toString() !== userId && !['admin', 'manager'].includes(userRole)) {
      throw new Error('You do not have permission to cancel this booking');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }

    booking.status = 'cancelled';
    booking.cancelledReason = reason;
    await booking.save();

    return await this.getBookingById(bookingId);
  }

  // Approve booking (admin/manager only)
  async approveBooking(bookingId, approverId) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be approved');
    }

    booking.status = 'approved';
    booking.approvedBy = approverId;
    booking.approvedAt = new Date();
    await booking.save();

    return await this.getBookingById(bookingId);
  }

  // Reject booking (admin/manager only)
  async rejectBooking(bookingId, reason) {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be rejected');
    }

    booking.status = 'rejected';
    booking.cancelledReason = reason;
    await booking.save();

    return await this.getBookingById(bookingId);
  }

  // Get user's bookings
  async getUserBookings(userId) {
    const bookings = await Booking.find({ user: userId })
      .populate('room', 'name code location')
      .sort({ startTime: -1 });

    return bookings;
  }

  // Get upcoming bookings
  async getUpcomingBookings(limit = 10) {
    const bookings = await Booking.find({
      startTime: { $gte: new Date() },
      status: 'approved'
    })
      .populate('room', 'name code location')
      .populate('user', 'fullName department')
      .sort({ startTime: 1 })
      .limit(limit);

    return bookings;
  }
}

module.exports = new BookingService();

