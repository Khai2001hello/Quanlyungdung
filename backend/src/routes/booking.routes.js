const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbacMiddleware = require('../middlewares/rbac.middleware');

// All routes require authentication
router.use(authMiddleware.protect);

// User routes
router.get('/', bookingController.getAllBookings);
router.get('/my-bookings', bookingController.getUserBookings);
router.get('/upcoming', bookingController.getUpcomingBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/', bookingController.createBooking);
router.put('/:id', bookingController.updateBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

// Admin/Manager only routes
router.post(
  '/:id/approve',
  rbacMiddleware.authorize(['admin', 'manager']),
  bookingController.approveBooking
);

router.post(
  '/:id/reject',
  rbacMiddleware.authorize(['admin', 'manager']),
  bookingController.rejectBooking
);

module.exports = router;

