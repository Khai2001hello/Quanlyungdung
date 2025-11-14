const validator = require('../utils/validate');

class ValidationMiddleware {
  // Validate register input
  validateRegister(req, res, next) {
    const { username, fullName, email, password } = req.body;
    const errors = [];

    // Check required fields
    if (!username || username.trim() === '') {
      errors.push('Username là bắt buộc');
    }

    if (!fullName || fullName.trim() === '') {
      errors.push('Họ và tên là bắt buộc');
    }

    if (!email || email.trim() === '') {
      errors.push('Email là bắt buộc');
    }

    if (!password || password === '') {
      errors.push('Mật khẩu là bắt buộc');
    }

    // Validate username
    if (username) {
      if (username.length < 3) {
        errors.push('Username phải có ít nhất 3 ký tự');
      }
      if (username.length > 30) {
        errors.push('Username không được quá 30 ký tự');
      }
      // Only allow alphanumeric and underscore
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
      }
    }

    // Validate fullName
    if (fullName) {
      if (fullName.length < 2) {
        errors.push('Họ và tên phải có ít nhất 2 ký tự');
      }
      if (fullName.length > 100) {
        errors.push('Họ và tên không được quá 100 ký tự');
      }
    }

    // Validate email
    if (email && !validator.isValidEmail(email)) {
      errors.push('Email không hợp lệ');
    }

    // Validate password
    if (password) {
      const passwordValidation = validator.isValidPassword(password);
      if (!passwordValidation.valid) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự');
      }
      if (password.length > 100) {
        errors.push('Mật khẩu không được quá 100 ký tự');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0], // Return first error
        errors: errors
      });
    }

    // Sanitize inputs
    req.body.username = validator.sanitizeString(username.trim());
    req.body.fullName = validator.sanitizeString(fullName.trim());
    req.body.email = email.trim().toLowerCase();

    next();
  }

  // Validate login input
  validateLogin(req, res, next) {
    const { email, password } = req.body;
    const errors = [];

    // Check required fields
    if (!email || email.trim() === '') {
      errors.push('Email là bắt buộc');
    }

    if (!password || password === '') {
      errors.push('Mật khẩu là bắt buộc');
    }

    // Validate email format
    if (email && !validator.isValidEmail(email)) {
      errors.push('Email không hợp lệ');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors: errors
      });
    }

    // Sanitize inputs
    req.body.email = email.trim().toLowerCase();

    next();
  }

  // Validate change password input
  validateChangePassword(req, res, next) {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const errors = [];

    // Check required fields
    if (!oldPassword || oldPassword === '') {
      errors.push('Mật khẩu cũ là bắt buộc');
    }

    if (!newPassword || newPassword === '') {
      errors.push('Mật khẩu mới là bắt buộc');
    }

    // Validate new password
    if (newPassword) {
      const passwordValidation = validator.isValidPassword(newPassword);
      if (!passwordValidation.valid) {
        errors.push('Mật khẩu mới phải có ít nhất 6 ký tự');
      }
      if (newPassword.length > 100) {
        errors.push('Mật khẩu mới không được quá 100 ký tự');
      }
    }

    // Check if old and new passwords are the same
    if (oldPassword && newPassword && oldPassword === newPassword) {
      errors.push('Mật khẩu mới phải khác mật khẩu cũ');
    }

    // Check confirm password if provided
    if (confirmPassword && newPassword !== confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors: errors
      });
    }

    next();
  }

  // Validate update profile input
  validateUpdateProfile(req, res, next) {
    const { fullName, phoneNumber, department } = req.body;
    const errors = [];

    // Validate fullName if provided
    if (fullName !== undefined) {
      if (!fullName || fullName.trim() === '') {
        errors.push('Họ và tên không được để trống');
      } else if (fullName.length < 2) {
        errors.push('Họ và tên phải có ít nhất 2 ký tự');
      } else if (fullName.length > 100) {
        errors.push('Họ và tên không được quá 100 ký tự');
      }
    }

    // Validate phone number if provided
    if (phoneNumber !== undefined && phoneNumber !== '') {
      if (!validator.isValidPhoneNumber(phoneNumber)) {
        errors.push('Số điện thoại không hợp lệ (10-11 chữ số)');
      }
    }

    // Validate department if provided
    if (department !== undefined && department.length > 100) {
      errors.push('Tên phòng ban không được quá 100 ký tự');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors: errors
      });
    }

    // Sanitize inputs
    if (fullName) req.body.fullName = validator.sanitizeString(fullName.trim());
    if (department) req.body.department = validator.sanitizeString(department.trim());

    next();
  }

  // Validate room input
  validateRoom(req, res, next) {
    const { name, description, capacity, type, code } = req.body;
    const errors = [];

    console.log('🔍 VALIDATION MIDDLEWARE - Room Input:');
    console.log('   - name:', name);
    console.log('   - description:', description);
    console.log('   - capacity:', capacity);
    console.log('   - type:', type);

    // Check required fields
    if (!name || name.trim() === '') {
      errors.push('Tên phòng là bắt buộc');
    }

    if (!type || type.trim() === '') {
      errors.push('Loại phòng là bắt buộc');
    }

    if (!capacity) {
      errors.push('Sức chứa là bắt buộc');
    }

    if (!description || description.trim() === '') {
      errors.push('Mô tả phòng là bắt buộc');
    }

    // Validate type value - chấp nhận cả tiếng Anh và tiếng Việt
    const validTypes = ['small', 'medium', 'large', 'Nhỏ', 'Trung bình', 'Lớn', 'Phòng nhỏ', 'Phòng trung bình', 'Phòng lớn'];
    if (type && !validTypes.includes(type)) {
      errors.push('Loại phòng không hợp lệ');
    }

    // Validate name
    if (name) {
      if (name.length < 2) {
        errors.push('Tên phòng phải có ít nhất 2 ký tự');
      }
      if (name.length > 100) {
        errors.push('Tên phòng không được quá 100 ký tự');
      }
    }

    // Validate capacity
    if (capacity) {
      const cap = parseInt(capacity);
      
      if (isNaN(cap)) {
        errors.push('Sức chứa phải là một số');
      } else {
        if (cap < 1) {
          errors.push('Sức chứa phải lớn hơn 0');
        }
        if (cap > 1000) {
          errors.push('Sức chứa không được quá 1000');
        }

        // Validate capacity based on room type
        if (type) {
          const isSmall = ['Nhỏ', 'small', 'Phòng nhỏ'].includes(type);
          const isMedium = ['Trung bình', 'medium', 'Phòng trung bình'].includes(type);
          const isLarge = ['Lớn', 'large', 'Phòng lớn'].includes(type);
          
          if (isSmall && (cap < 1 || cap > 10)) {
            errors.push('Phòng nhỏ chỉ chứa từ 1-10 người');
          } else if (isMedium && (cap < 11 || cap > 20)) {
            errors.push('Phòng trung bình chỉ chứa từ 11-20 người');
          } else if (isLarge && (cap < 21 || cap > 50)) {
            errors.push('Phòng lớn chỉ chứa từ 21-50 người');
          }
        }
      }
    }

    // Validate description if provided
    if (description && description.length > 500) {
      errors.push('Mô tả không được quá 500 ký tự');
    }

    // Validate equipment - BẮT BUỘC ít nhất 1 thiết bị
    console.log('🔍 DEBUG - All body keys:', Object.keys(req.body));
    console.log('🔍 DEBUG - Full req.body:', req.body);
    
    // Check cả 2 format: equipment[] keys hoặc equipment array
    const equipmentFields = Object.keys(req.body).filter(key => 
      key.startsWith('equipment[') && key.endsWith(']')
    );
    
    const hasEquipmentArray = req.body.equipment && Array.isArray(req.body.equipment) && req.body.equipment.length > 0;
    
    console.log('🔍 DEBUG - Equipment fields found:', equipmentFields);
    console.log('🔍 DEBUG - Has equipment array:', hasEquipmentArray);
    console.log('🔍 DEBUG - Equipment array value:', req.body.equipment);
    
    if (equipmentFields.length === 0 && !hasEquipmentArray) {
      errors.push('Phải thêm ít nhất 1 thiết bị cho phòng');
    }
    
    const totalEquipment = hasEquipmentArray ? req.body.equipment.length : equipmentFields.length;
    
    if (totalEquipment > 20) {
      errors.push('Chỉ được thêm tối đa 20 thiết bị');
    }

    // Validate each equipment item
    equipmentFields.forEach(key => {
      const equipmentItem = req.body[key];
      if (equipmentItem) {
        if (equipmentItem.length < 2) {
          errors.push('Tên thiết bị phải có ít nhất 2 ký tự');
        }
        if (equipmentItem.length > 50) {
          errors.push('Tên thiết bị không được quá 50 ký tự');
        }
      }
    });

    // Force status to be 'available' for new rooms
    if (req.method === 'POST') {
      req.body.status = 'available';
    }

    if (errors.length > 0) {
      console.log('❌ VALIDATION ERRORS:', errors);
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors: errors
      });
    }

    console.log('✅ VALIDATION PASSED');

    // Sanitize inputs
    req.body.name = validator.sanitizeString(name.trim());
    if (description) {
      req.body.description = validator.sanitizeString(description.trim());
    }

    next();
  }

  // Validate booking payload
  validateBooking(req, res, next) {
    const { room, startTime, endTime, purpose } = req.body;
    const errors = [];

    console.log('🔍 VALIDATE BOOKING:');
    console.log('   - room:', room);
    console.log('   - startTime:', startTime);
    console.log('   - endTime:', endTime);
    console.log('   - purpose:', purpose);

    if (!room) {
      errors.push('Room is required');
    }

    const startDate = startTime ? new Date(startTime) : null;
    const endDate = endTime ? new Date(endTime) : null;

    if (!startDate || Number.isNaN(startDate.getTime())) {
      errors.push('Start time is invalid');
    }

    if (!endDate || Number.isNaN(endDate.getTime())) {
      errors.push('End time is invalid');
    }

    if (startDate && endDate) {
      if (startDate >= endDate) {
        errors.push('End time must be after start time');
      }

      // Cho phép đặt phòng trong vòng 5 phút trước hiện tại (để tránh lỗi do delay mạng)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      console.log('   - Current time:', now.toISOString());
      console.log('   - 5 minutes ago:', fiveMinutesAgo.toISOString());
      console.log('   - Start time:', startDate.toISOString());
      
      if (startDate < fiveMinutesAgo) {
        errors.push('Bookings must be created for a future time');
      }
    }

    if (!purpose || purpose.trim() === '') {
      errors.push('Purpose is required');
    } else if (purpose.length > 200) {
      errors.push('Purpose cannot be longer than 200 characters');
    }

    if (errors.length > 0) {
      console.log('❌ VALIDATION ERRORS:', errors);
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors
      });
    }

    console.log('✅ VALIDATION PASSED');

    req.body.startTime = startDate.toISOString();
    req.body.endTime = endDate.toISOString();
    req.body.purpose = validator.sanitizeString(purpose.trim());

    next();
  }
}

module.exports = new ValidationMiddleware();

