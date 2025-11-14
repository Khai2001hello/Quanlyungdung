const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { checkPermission, permissions } = require('../middlewares/rbac.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
// 🔓 REMOVED: Email verification not required for booking
// const { checkEmailVerified } = require('../middlewares/emailVerification.middleware');

router.use(authMiddleware.protect);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings with filters
 *     description: Retrieve bookings. Admin can see all, users see only their own. Supports filtering by room, user, date range, and status.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *         description: Filter by room ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID (admin only)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter bookings until this date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     filters:
 *                       type: object
 *       401:
 *         description: Not authenticated
 */
/**
 * @swagger
 * /bookings/export:
 *   get:
 *     summary: Export bookings to Excel
 *     description: Export bookings list to Excel file (.xlsx). Admin can export all, users can export their own bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room
 *         schema:
 *           type: string
 *         description: Filter by room ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter to date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Excel file downloaded successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
// Export bookings to Excel (must be BEFORE the generic GET /)
router.get('/export',
  checkPermission(permissions.VIEW_BOOKINGS),
  bookingController.exportBookings
);

// Get bookings (with filters)
router.get('/',
  checkPermission(permissions.VIEW_BOOKINGS),
  bookingController.getBookings
);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a booking for a meeting room. Validates time conflicts and prevents overlapping bookings.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room
 *               - startTime
 *               - endTime
 *             properties:
 *               room:
 *                 type: string
 *                 description: Room ID
 *                 example: "507f1f77bcf86cd799439011"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Booking start time
 *                 example: "2025-11-12T09:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Booking end time
 *                 example: "2025-11-12T11:00:00.000Z"
 *               purpose:
 *                 type: string
 *                 description: Purpose of booking
 *                 example: "Team meeting"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Room not found
 *       409:
 *         description: Time conflict - room already booked for this time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Room is already booked for this time range"
 */
// Create new booking
router.post('/',
  checkPermission(permissions.CREATE_BOOKING),
  // 🔓 REMOVED: checkEmailVerified - Allow booking without email verification
  validationMiddleware.validateBooking,
  bookingController.createBooking
);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel/delete a booking
 *     description: Cancel a booking. Users can only cancel their own bookings. Admin can cancel any booking.
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Booking cancelled"
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this booking
 *       404:
 *         description: Booking not found
 */
// Delete booking
router.delete('/:id',
  checkPermission(permissions.DELETE_BOOKING),
  bookingController.deleteBooking
);

// Admin approve booking
router.patch('/:id/approve',
  checkPermission(permissions.VIEW_ALL_BOOKINGS), // Admin only
  bookingController.approveBooking
);

// Admin reject booking
router.patch('/:id/reject',
  checkPermission(permissions.VIEW_ALL_BOOKINGS), // Admin only
  bookingController.rejectBooking
);

module.exports = router;
