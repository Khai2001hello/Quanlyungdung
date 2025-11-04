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
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  participants: [{
    type: String,
    trim: true
  }],
  numberOfParticipants: {
    type: Number,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  purpose: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  cancelledReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, startTime: 1 });

// Validate that endTime is after startTime
bookingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

