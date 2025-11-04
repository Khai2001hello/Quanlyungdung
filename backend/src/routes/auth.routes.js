const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');

// Public routes
router.post('/register', validationMiddleware.validateRegister, authController.register);
router.post('/login', validationMiddleware.validateLogin, authController.login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
  }),
  authController.googleCallback
);

// Protected routes
router.get('/profile', authMiddleware.protect, authController.getProfile);
router.put('/profile', authMiddleware.protect, validationMiddleware.validateUpdateProfile, authController.updateProfile);
router.post('/change-password', authMiddleware.protect, validationMiddleware.validateChangePassword, authController.changePassword);
router.post('/logout', authMiddleware.protect, authController.logout);

module.exports = router;

