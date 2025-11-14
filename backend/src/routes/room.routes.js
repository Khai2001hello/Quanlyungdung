const express = require('express');
const path = require('path');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { checkPermission, permissions } = require('../middlewares/rbac.middleware');
const { validateRoom } = require('../middlewares/validation.middleware');
const { preventStatusModification } = require('../middlewares/room.middleware');

const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// ✅ CORS middleware cho static files
const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

// Serve static files từ thư mục uploads với CORS
router.use('/uploads', corsMiddleware, express.static(path.join(__dirname, '../../uploads')));

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     description: Retrieve a list of all meeting rooms with their details
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of rooms retrieved successfully
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
 *                     $ref: '#/components/schemas/Room'
 */
// Get all rooms
router.get('/', roomController.getAllRooms);

// Protected routes
router.use(authMiddleware.protect);

// Debug middleware - Log raw request before multer
const debugMiddleware = (req, res, next) => {
  console.log('\n🔍 DEBUG MIDDLEWARE (Before Multer):');
  console.log('   - Content-Type:', req.headers['content-type']);
  console.log('   - Content-Length:', req.headers['content-length']);
  console.log('   - Method:', req.method);
  console.log('   - URL:', req.url);
  next();
};

// Middleware check image bắt buộc khi tạo phòng mới
const requireImageForCreate = (req, res, next) => {
  console.log('🔍 AFTER MULTER - req.body:', req.body);
  console.log('🔍 AFTER MULTER - req.body keys:', Object.keys(req.body));
  console.log('🔍 AFTER MULTER - req.file:', req.file ? 'exists' : 'missing');
  
  if (req.method === 'POST' && !req.file) {
    return res.status(400).json({
      success: false,
      message: 'Ảnh phòng họp là bắt buộc'
    });
  }
  next();
};

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room (Admin only)
 *     description: Create a new meeting room with details and optional image upload
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - type
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: Phòng họp A1
 *               code:
 *                 type: string
 *                 example: MR-001
 *               type:
 *                 type: string
 *                 enum: [small, medium, large]
 *                 example: medium
 *               capacity:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: Phòng họp với đầy đủ trang thiết bị
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Máy chiếu", "Tivi"]
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Room image file
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */
// Create new room
router.post('/',
  debugMiddleware,
  preventStatusModification,
  checkPermission(permissions.CREATE_ROOM),
  upload.single('image'),
  requireImageForCreate,
  validateRoom,
  roomController.createRoom
);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update a room (Admin only)
 *     description: Update room details including optional image replacement
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [small, medium, large]
 *               capacity:
 *                 type: integer
 *               description:
 *                 type: string
 *               equipment:
 *                 type: array
 *                 items:
 *                   type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Room not found
 */
// Update room
router.put('/:id',
  checkPermission(permissions.UPDATE_ROOM),
  upload.single('image'),
  validateRoom,
  roomController.updateRoom
);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room (Admin only)
 *     description: Permanently delete a room from the system
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room deleted successfully
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
 *                   example: Room deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 *       404:
 *         description: Room not found
 */
// Delete room
router.delete('/:id',
  checkPermission(permissions.DELETE_ROOM),
  roomController.deleteRoom
);

module.exports = router;