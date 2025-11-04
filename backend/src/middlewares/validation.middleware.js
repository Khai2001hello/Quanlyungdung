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
}

module.exports = new ValidationMiddleware();

