const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { checkPermission, permissions, isAdmin } = require('../middlewares/rbac.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// Protect all user routes
router.use(authMiddleware.protect);

// Get all users (admin only)
router.get('/',
  isAdmin,
  userController.getAllUsers
);

// Update user role (admin only)
router.patch('/:userId/role',
  isAdmin,
  userController.updateUserRole
);

module.exports = router;