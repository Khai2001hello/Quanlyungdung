const roomService = require('../services/room.service');
const AuditLog = require('../models/auditLog.model');

class RoomController {
  // Get all rooms
  async getAllRooms(req, res) {
    try {
      const filters = {
        capacity: req.query.capacity ? parseInt(req.query.capacity) : undefined,
        status: req.query.status,
        facilities: req.query.facilities ? req.query.facilities.split(',') : undefined,
        building: req.query.building,
        floor: req.query.floor ? parseInt(req.query.floor) : undefined
      };

      const rooms = await roomService.getAllRooms(filters);

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get room by ID
  async getRoomById(req, res) {
    try {
      const room = await roomService.getRoomById(req.params.id);

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Create new room
  async createRoom(req, res) {
    try {
      const room = await roomService.createRoom(req.body);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'create',
        resource: 'room',
        resourceId: room._id,
        details: { name: room.name, code: room.code },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(201).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update room
  async updateRoom(req, res) {
    try {
      const room = await roomService.updateRoom(req.params.id, req.body);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'update',
        resource: 'room',
        resourceId: room._id,
        details: req.body,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: room
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete room
  async deleteRoom(req, res) {
    try {
      const result = await roomService.deleteRoom(req.params.id);

      // Log audit
      await AuditLog.create({
        user: req.user.id,
        action: 'delete',
        resource: 'room',
        resourceId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Check room availability
  async checkAvailability(req, res) {
    try {
      const { startTime, endTime } = req.query;
      const isAvailable = await roomService.checkAvailability(
        req.params.id,
        new Date(startTime),
        new Date(endTime)
      );

      res.status(200).json({
        success: true,
        data: { available: isAvailable }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get room statistics
  async getRoomStatistics(req, res) {
    try {
      const stats = await roomService.getRoomStatistics(req.params.id);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RoomController();

