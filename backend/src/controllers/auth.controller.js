const authService = require('../services/auth.service');
const AuditLog = require('../models/auditLog.model');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      // Log audit
      await AuditLog.create({
        user: result.user.id,
        action: 'create',
        resource: 'user',
        resourceId: result.user.id,
        details: { username: result.user.username, email: result.user.email },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Log audit
      await AuditLog.create({
        user: result.user.id,
        action: 'login',
        resource: 'user',
        resourceId: result.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await authService.getUserProfile(req.user.id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'update',
        resource: 'user',
        resourceId: req.user.id,
        details: req.body,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, oldPassword, newPassword);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'update',
        resource: 'user',
        resourceId: req.user.id,
        details: { action: 'password_change' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Logout (optional - mainly for audit logging)
  async logout(req, res) {
    try {
      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'logout',
        resource: 'user',
        resourceId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();

