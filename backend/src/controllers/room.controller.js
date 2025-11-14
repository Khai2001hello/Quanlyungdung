const Room = require('../models/room.model');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const normalizeEquipment = (rawEquipment) => {
  console.log('\n🔄 normalizeEquipment called with:', rawEquipment);
  console.log('   - Type:', typeof rawEquipment);
  console.log('   - Is Array:', Array.isArray(rawEquipment));
  console.log('   - Length:', rawEquipment?.length);
  
  if (!rawEquipment) {
    console.log('   ⚠️  Raw equipment is null/undefined, returning []');
    return [];
  }

  const items = Array.isArray(rawEquipment)
    ? rawEquipment
    : String(rawEquipment)
        .split(',')
        .map(item => item.trim());

  console.log('   - Items after split:', items);

  const result = [
    ...new Set(
      items
        .map(item => (typeof item === 'string' ? item.trim() : String(item).trim()))
        .filter(Boolean)
    )
  ];
  
  console.log('   - Result after normalize:', result);
  return result;
};

const buildRoomFilters = (query) => {
  const {
    type,
    status,
    minCapacity,
    maxCapacity,
    equipment,
    search
  } = query;

  const filters = {};

  if (type) {
    filters.type = type;
  }

  if (status) {
    filters.status = status;
  }

  const min = Number(minCapacity);
  const max = Number(maxCapacity);
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    filters.capacity = {};
    if (!Number.isNaN(min)) {
      filters.capacity.$gte = min;
    }
    if (!Number.isNaN(max)) {
      filters.capacity.$lte = max;
    }
  }

  if (equipment) {
    const equipments = normalizeEquipment(equipment);
    if (equipments.length) {
      filters.equipment = { $all: equipments };
    }
  }

  if (search) {
    const regex = new RegExp(search, 'i');
    filters.$or = [
      { name: regex },
      { description: regex },
      { code: regex }
    ];
  }

  return filters;
};

const roomController = {
  async getAllRooms(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;

      const filters = buildRoomFilters(req.query);
      const skip = (page - 1) * limit;

      const [rooms, total] = await Promise.all([
        Room.find(filters)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit),
        Room.countDocuments(filters)
      ]);

      // Thêm trạng thái động dựa trên bookings
      const roomsWithStatus = await Promise.all(
        rooms.map(async (room) => {
          const roomObj = room.toObject();
          const statusInfo = await room.getStatusWithBookings();
          roomObj.dynamicStatus = statusInfo.status;
          roomObj.bookingUser = statusInfo.bookingUser; // Thêm thông tin user của booking
          return roomObj;
        })
      );

      return res.status(200).json({
        success: true,
        data: roomsWithStatus,
        meta: {
          total,
          page,
          limit,
          filters: req.query
        }
      });
    } catch (error) {
      logger.error('Error getting rooms:', error);
      return next(error);
    }
  },

  async generateRoomCode(type) {
    const count = await Room.countDocuments({ type });
    const prefix = type
      .split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('');
    const sequence = (count + 1).toString().padStart(3, '0');
    return `${prefix}${sequence}`;
  },

  async createRoom(req, res) {
    try {
      console.log('\n========== 🚀 CREATE ROOM REQUEST ==========');
      console.log('⏰ Time:', new Date().toISOString());
      console.log('👤 User:', req.user?.email || 'Unknown');
      
      // 🔍 Debug: Log tất cả dữ liệu nhận được
      console.log('\n📦 Request Body (All Keys):');
      Object.keys(req.body).forEach(key => {
        console.log(`   - ${key}: ${typeof req.body[key]} = "${req.body[key]}"`);
      });
      
      console.log('\n🖼️  Request File:');
      if (req.file) {
        console.log('   - filename:', req.file.filename);
        console.log('   - originalname:', req.file.originalname);
        console.log('   - size:', req.file.size, 'bytes');
        console.log('   - mimetype:', req.file.mimetype);
      } else {
        console.log('   ❌ No file uploaded');
      }
      
      // Parse body data
      const name = req.body.name;
      const description = req.body.description;
      const capacity = req.body.capacity;
      const type = req.body.type || 'Trung bình';
      
      console.log('\n📝 Parsed Basic Fields:');
      console.log('   - name:', name);
      console.log('   - description:', description);
      console.log('   - capacity:', capacity);
      console.log('   - type:', type);
      
      // ✅ Xử lý thiết bị từ FormData - multer có thể parse theo 2 cách:
      // Cách 1: equipment[0], equipment[1], ... → Tìm các key riêng biệt
      // Cách 2: equipment → String ngăn cách bằng dấu phẩy
      let equipment = [];
      
      console.log('\n🔧 Looking for equipment fields...');
      
      // Check cách 1: equipment[0], equipment[1], ...
      const equipmentKeys = Object.keys(req.body).filter(key => 
        key.startsWith('equipment[') && key.endsWith(']')
      );
      
      if (equipmentKeys.length > 0) {
        console.log('   📋 Found array-style equipment fields');
        equipmentKeys.forEach(key => {
          console.log(`   ✅ Found: ${key} = "${req.body[key]}"`);
          equipment.push(req.body[key]);
        });
      } 
      // Check cách 2: equipment (string)
      else if (req.body.equipment) {
        console.log('   📋 Found string-style equipment field');
        console.log(`   ✅ Value: "${req.body.equipment}"`);
        
        // Tách chuỗi thành array
        if (typeof req.body.equipment === 'string') {
          equipment = req.body.equipment
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
        } else if (Array.isArray(req.body.equipment)) {
          equipment = req.body.equipment;
        }
      }
      
      console.log('\n🔧 Equipment array:', equipment);
      console.log('   - Count:', equipment.length);
      console.log('   - Items:', JSON.stringify(equipment));

      const capacityNum = Number(capacity);

      // ✅ Validate required fields
      if (!name || !description || !Number.isFinite(capacityNum) || capacityNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide name, description and valid capacity'
        });
      }

      // ✅ Validate image is required
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Ảnh phòng họp là bắt buộc'
        });
      }

      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Room name already exists'
        });
      }

      const code = await roomController.generateRoomCode(type);

      const roomData = {
        code,
        name,
        description,
        capacity: capacityNum,
        type,
        status: 'available',
        createdBy: req.user?._id,
        equipment: normalizeEquipment(equipment)
      };

      // ✅ Thêm ảnh nếu có - lưu đường dẫn đầy đủ
      if (req.file) {
        roomData.image = `/api/rooms/uploads/${req.file.filename}`;
      }
      
      console.log('\n💾 Room Data Before Save:');
      console.log(JSON.stringify(roomData, null, 2));

      const room = await Room.create(roomData);
      
      console.log('\n✅ Room Created Successfully:');
      console.log('   - ID:', room._id);
      console.log('   - Name:', room.name);
      console.log('   - Equipment:', room.equipment);
      console.log('   - Image:', room.image);
      console.log('========================================\n');

      return res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Room with this code or name already exists'
        });
      }

      // Handle Mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: messages[0] || 'Validation error',
          errors: messages
        });
      }

      console.error('❌ Error creating room:', error);
      logger.error('Error creating room:', error?.message || 'Unknown error');
      
      return res.status(500).json({
        success: false,
        message: 'Error creating room',
        error: error?.message || 'Unknown error'
      });
    }
  },

  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const { name, description, capacity, status, type } = req.body;

      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (capacity !== undefined) {
        const capacityNum = Number(capacity);
        if (!Number.isFinite(capacityNum) || capacityNum <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Capacity must be a positive number'
          });
        }
        updateData.capacity = capacityNum;
      }
      if (status !== undefined) updateData.status = status;
      if (type !== undefined) updateData.type = type;
      
      // ✅ Xử lý equipment từ FormData
      let equipment = [];
      Object.keys(req.body).forEach(key => {
        if (key.startsWith('equipment[') && key.endsWith(']')) {
          equipment.push(req.body[key]);
        }
      });
      if (equipment.length > 0) {
        updateData.equipment = normalizeEquipment(equipment);
      }

      // ✅ Cập nhật ảnh nếu có upload file mới
      if (req.file) {
        // Xóa ảnh cũ nếu có
        const oldRoom = await Room.findById(id);
        if (oldRoom?.image) {
          const oldImagePath = path.join(__dirname, '../../uploads', path.basename(oldRoom.image));
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            logger.error('Error deleting old image:', err);
          }
        }
        updateData.image = `/api/rooms/uploads/${req.file.filename}`;
      }

      const room = await Room.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      logger.error('Error updating room:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating room'
      });
    }
  },

  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const room = await Room.findByIdAndDelete(id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting room:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting room'
      });
    }
  }
};

module.exports = roomController;
