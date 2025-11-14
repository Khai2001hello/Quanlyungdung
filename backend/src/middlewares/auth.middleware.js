const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

class AuthMiddleware {
  // Protect routes - verify JWT token
  async protect(req, res, next) {
    try {
      console.log('Auth Headers:', req.headers);
      let token;

      // Check if token exists in headers
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token found:', token);
      }

      if (!token) {
        console.log('No token found in request');
        return res.status(401).json({
          success: false,
          message: 'Not authorized to access this route. Please login.'
        });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get user from token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'User account is deactivated'
          });
        }

        // Attach user to request object
        req.user = user;
        next();
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthMiddleware();

