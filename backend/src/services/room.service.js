const Room = require('../models/room.model');

class RoomService {
  // Get all rooms with filters
  async getAllRooms(filters = {}) {
    const query = { isActive: true };

    if (filters.capacity) {
      query.capacity = { $gte: filters.capacity };
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.facilities && filters.facilities.length > 0) {
      query.facilities = { $all: filters.facilities };
    }

    if (filters.building) {
      query['location.building'] = filters.building;
    }

    if (filters.floor) {
      query['location.floor'] = filters.floor;
    }

    const rooms = await Room.find(query).sort({ name: 1 });
    return rooms;
  }

  // Get room by ID
  async getRoomById(roomId) {
    const room = await Room.findOne({ _id: roomId, isActive: true });

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  // Create new room
  async createRoom(roomData) {
    const existingRoom = await Room.findOne({
      $or: [{ name: roomData.name }, { code: roomData.code }]
    });

    if (existingRoom) {
      throw new Error('Room already exists with this name or code');
    }

    const room = await Room.create(roomData);
    return room;
  }

  // Update room
  async updateRoom(roomId, updateData) {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  // Delete room (soft delete)
  async deleteRoom(roomId) {
    const room = await Room.findByIdAndUpdate(
      roomId,
      { isActive: false },
      { new: true }
    );

    if (!room) {
      throw new Error('Room not found');
    }

    return { message: 'Room deleted successfully' };
  }

  // Check room availability
  async checkAvailability(roomId, startTime, endTime, excludeBookingId = null) {
    const Booking = require('../models/booking.model');
    
    const query = {
      room: roomId,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await Booking.find(query);
    return conflictingBookings.length === 0;
  }

  // Get room statistics
  async getRoomStatistics(roomId) {
    const Booking = require('../models/booking.model');
    
    const totalBookings = await Booking.countDocuments({ room: roomId });
    const completedBookings = await Booking.countDocuments({ 
      room: roomId, 
      status: 'completed' 
    });
    const cancelledBookings = await Booking.countDocuments({ 
      room: roomId, 
      status: 'cancelled' 
    });

    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      utilizationRate: totalBookings > 0 
        ? ((completedBookings / totalBookings) * 100).toFixed(2) 
        : 0
    };
  }
}

module.exports = new RoomService();

