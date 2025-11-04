const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbacMiddleware = require('../middlewares/rbac.middleware');

// Public routes (authenticated users can view rooms)
router.get('/', authMiddleware.protect, roomController.getAllRooms);
router.get('/:id', authMiddleware.protect, roomController.getRoomById);
router.get('/:id/availability', authMiddleware.protect, roomController.checkAvailability);
router.get('/:id/statistics', authMiddleware.protect, roomController.getRoomStatistics);

// Admin/Manager only routes
router.post(
  '/',
  authMiddleware.protect,
  rbacMiddleware.authorize(['admin', 'manager']),
  roomController.createRoom
);

router.put(
  '/:id',
  authMiddleware.protect,
  rbacMiddleware.authorize(['admin', 'manager']),
  roomController.updateRoom
);

router.delete(
  '/:id',
  authMiddleware.protect,
  rbacMiddleware.authorize(['admin']),
  roomController.deleteRoom
);

module.exports = router;

