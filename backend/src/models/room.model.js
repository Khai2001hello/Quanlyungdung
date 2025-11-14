const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Tên phòng là bắt buộc'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['small', 'medium', 'large', 'Nhỏ', 'Trung bình', 'Lớn', 'Phòng nhỏ', 'Phòng trung bình', 'Phòng lớn'],
      message: 'Loại phòng không hợp lệ'
    },
    required: [true, 'Loại phòng là bắt buộc']
  },
  capacity: {
    type: Number,
    required: [true, 'Sức chứa là bắt buộc'],
    min: [1, 'Sức chứa phải lớn hơn 0']
  },
  status: {
    type: String,
    enum: ['available'],
    default: 'available',
    immutable: true // Không cho phép thay đổi trực tiếp
  },
  description: {
    type: String,
    trim: true
  },
  equipment: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    required: [true, 'Ảnh phòng họp là bắt buộc']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual để lấy trạng thái động dựa trên bookings
roomSchema.virtual('currentStatus').get(function() {
  return this.status;
});

// Method để check trạng thái hiện tại dựa trên bookings
roomSchema.methods.getStatusWithBookings = async function() {
  const Booking = require('./booking.model');
  const now = new Date();
  
  // 🔄 Tự động hủy các booking pending đã bắt đầu (quá startTime)
  await Booking.updateMany(
    {
      room: this._id,
      status: 'pending',
      startTime: { $lt: now } // Đã qua giờ bắt đầu cuộc họp
    },
    {
      $set: { 
        status: 'cancelled',
        rejectionReason: 'Tự động hủy do cuộc họp đã bắt đầu mà chưa được phê duyệt'
      }
    }
  );
  
  // Check nếu có booking confirmed (hiện tại hoặc tương lai)
  const confirmedBooking = await Booking.findOne({
    room: this._id,
    status: 'confirmed',
    endTime: { $gte: now } // Chưa hết hạn
  }).populate('user', '_id email fullName');
  
  if (confirmedBooking) {
    return { status: 'booked', bookingUser: confirmedBooking.user };
  }
  
  // Check nếu có booking pending (chỉ những booking chưa bắt đầu)
  const pendingBooking = await Booking.findOne({
    room: this._id,
    status: 'pending',
    startTime: { $gte: now } // Chưa bắt đầu
  }).populate('user', '_id email fullName');
  
  if (pendingBooking) {
    return { status: 'pending', bookingUser: pendingBooking.user };
  }
  
  return { status: 'available', bookingUser: null }; // Còn trống
};

module.exports = mongoose.model('Room', roomSchema);

