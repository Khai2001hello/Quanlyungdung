const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    building: String,
    floor: Number,
    description: String
  },
  facilities: [{
    type: String,
    enum: ['projector', 'whiteboard', 'tv', 'conference_phone', 'video_conference', 'wifi', 'air_conditioner', 'computer']
  }],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available'
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);

