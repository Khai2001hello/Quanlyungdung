const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', authMiddleware.protect, authController.getProfile);
router.put('/profile', authMiddleware.protect, authController.updateProfile);
router.post('/change-password', authMiddleware.protect, authController.changePassword);
router.post('/logout', authMiddleware.protect, authController.logout);

module.exports = router;

