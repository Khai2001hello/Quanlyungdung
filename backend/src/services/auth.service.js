const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const emailService = require('./email.service');

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  // Register new user
  async register(userData) {
    // Check if user exists by email
    const existingEmail = await User.findOne({ email: userData.email });
    if (existingEmail) {
      throw new Error('Email này đã được đăng ký');
    }

    // Check if user exists by username
    const existingUsername = await User.findOne({ username: userData.username });
    if (existingUsername) {
      throw new Error('Username này đã được sử dụng');
    }

    try {
      // 🔓 AUTO-VERIFY: Tự động xác thực email khi đăng ký (không cần email thật)
      const user = await User.create({
        ...userData,
        isEmailVerified: true, // Auto-verify all users
        emailVerificationToken: undefined,
        emailVerificationExpires: undefined
      });

      // ⚠️ OPTIONAL: Uncomment để gửi email xác thực (cần config SMTP)
      // const verificationToken = crypto.randomBytes(32).toString('hex');
      // const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      // user.emailVerificationToken = verificationToken;
      // user.emailVerificationExpires = verificationExpires;
      // await user.save();
      // await emailService.sendVerificationEmail(user, verificationToken);

      const token = this.generateToken(user._id);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          isEmailVerified: user.isEmailVerified
        },
        token,
        message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay.'
      };
    } catch (error) {
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(messages[0] || 'Dữ liệu không hợp lệ');
      }
      throw error;
    }
  }

  // Login user
  async login(email, password) {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    const token = this.generateToken(user._id);

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department
      },
      token
    };
  }

  // Get user profile
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (!user.isActive) {
      throw new Error('Tài khoản đã bị vô hiệu hóa');
    }

    return user;
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    // Don't allow updating sensitive fields
    delete updateData.password;
    delete updateData.role;
    delete updateData.email;
    delete updateData.username;
    delete updateData.provider;
    delete updateData.googleId;

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        throw new Error('Không tìm thấy người dùng');
      }

      return user;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(messages[0] || 'Dữ liệu không hợp lệ');
      }
      throw error;
    }
  }

  // Change password
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    // Users who logged in with Google don't have a local password
    if (user.provider === 'google' && !user.password) {
      throw new Error('Tài khoản Google không thể đổi mật khẩu');
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
  }

  // Verify email with token
  async verifyEmail(token) {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Token xác thực không hợp lệ hoặc đã hết hạn');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { message: 'Xác thực email thành công! Bạn có thể đăng nhập và sử dụng đầy đủ tính năng.' };
  }

  // Resend verification email
  async resendVerification(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    if (user.isEmailVerified) {
      throw new Error('Email đã được xác thực rồi');
    }

    if (user.provider === 'google') {
      throw new Error('Tài khoản Google đã được xác thực tự động');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    return { message: 'Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.' };
  }
}

module.exports = new AuthService();

