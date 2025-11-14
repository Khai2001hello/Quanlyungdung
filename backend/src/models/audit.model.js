const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: [
      'BOOKING_CREATED',
      'BOOKING_APPROVED',
      'BOOKING_REJECTED',
      'BOOKING_CANCELLED',
      'ROOM_CREATED',
      'ROOM_UPDATED',
      'ROOM_DELETED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_CREATED',
      'USER_UPDATED'
    ],
    required: true
  },
  resourceType: {
    type: String,
    enum: ['booking', 'room', 'user', 'auth'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditSchema.index({ user: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('Audit', auditSchema);
