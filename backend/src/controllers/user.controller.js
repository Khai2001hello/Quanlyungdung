const User = require('../models/user.model');
const logger = require('../utils/logger');

const userController = {
  // Get all users (admin only)
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.find().select('-password');
      res.json(users);
    } catch (error) {
      logger.error('Error getting users:', error);
      next(error);
    }
  },

  // Update user role (admin only)
  updateUserRole: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      // Prevent self-role change
      if (userId === req.user._id.toString()) {
        return res.status(403).json({ message: 'Cannot change your own role' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Error updating user role:', error);
      next(error);
    }
  }
};

module.exports = userController;