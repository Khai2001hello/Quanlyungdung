const express = require('express');
const router = express.Router();
const exportController = require('../controllers/export.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbacMiddleware = require('../middlewares/rbac.middleware');

// All routes require authentication and admin/manager role
router.use(authMiddleware.protect);
router.use(rbacMiddleware.authorize(['admin', 'manager']));

router.get('/bookings/csv', exportController.exportBookingsCSV);
router.get('/rooms/csv', exportController.exportRoomsCSV);
router.get('/statistics', exportController.getBookingStatistics);
router.get('/utilization', exportController.getRoomUtilizationReport);

module.exports = router;

