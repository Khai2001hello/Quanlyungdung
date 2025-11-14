const authService = require('../services/auth.service');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const result = await authService.register(req.body);

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

  // Logout
  async logout(req, res) {
    try {
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

  // Google OAuth callback
  async googleCallback(req, res) {
    try {
      const user = req.user;
      const token = authService.generateToken(user._id);

      const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientURL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar
      }))}`);
    } catch (error) {
      const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientURL}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Verify email with token
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Resend verification email
  async resendVerification(req, res) {
    try {
      const result = await authService.resendVerification(req.user.id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
