const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  title: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    trim: true
  },
  attendees: {
    type: [String], // Array of email addresses
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Phải có ít nhất 1 người tham gia'
    }
  },
  attendeesCount: {
    type: Number,
    min: [1, 'Phải có ít nhất 1 người tham gia'],
    default: null // For backward compatibility
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Middleware để kiểm tra xung đột thời gian và sức chứa
bookingSchema.pre('save', async function(next) {
  // Kiểm tra sức chứa phòng
  const attendeeCount = this.attendeesCount || (this.attendees ? this.attendees.length : 0);
  if (attendeeCount && (this.isModified('attendees') || this.isModified('attendeesCount') || this.isModified('room') || this.isNew)) {
    const Room = mongoose.model('Room');
    const room = await Room.findById(this.room);
    
    if (!room) {
      const error = new Error('Room not found');
      error.status = 404;
      return next(error);
    }
    
    if (attendeeCount > room.capacity) {
      const error = new Error(`Số người tham gia (${attendeeCount}) vượt quá sức chứa phòng (${room.capacity} người)`);
      error.status = 400;
      return next(error);
    }
  }
  
  // Kiểm tra xung đột thời gian
  if (!this.isModified('startTime') && !this.isModified('endTime') && !this.isModified('room') && !this.isNew) {
    return next();
  }

  const conflictingBooking = await this.constructor.findOne({
    room: this.room,
    status: { $ne: 'cancelled' },
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ],
    _id: { $ne: this._id }
  });

  if (conflictingBooking) {
    const error = new Error('Room is already booked for this time period');
    error.status = 409;
    return next(error);
  }

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;