const Audit = require('../models/audit.model');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Log an audit event
   * @param {Object} params - Audit parameters
   * @param {String} params.userId - User ID performing the action
   * @param {String} params.action - Action type (BOOKING_CREATED, etc.)
   * @param {String} params.resourceType - Resource type (booking, room, user, auth)
   * @param {String} params.resourceId - Resource ID (optional)
   * @param {Object} params.details - Additional details (optional)
   * @param {Object} params.req - Express request object for IP and user agent
   */
  async log({ userId, action, resourceType, resourceId, details = {}, req }) {
    try {
      const auditEntry = await Audit.create({
        user: userId,
        action,
        resourceType,
        resourceId,
        details,
        ipAddress: req ? req.ip || req.connection?.remoteAddress : null,
        userAgent: req ? req.get('user-agent') : null,
        timestamp: new Date()
      });

      logger.info(`Audit log created: ${action} by user ${userId}`);
      return auditEntry;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw error to prevent audit logging from breaking business logic
    }
  }

  /**
   * Get audit logs with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} Audit logs
   */
  async getLogs(filters = {}) {
    try {
      const { userId, action, resourceType, startDate, endDate, limit = 100, skip = 0 } = filters;

      const query = {};
      if (userId) query.user = userId;
      if (action) query.action = action;
      if (resourceType) query.resourceType = resourceType;

      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const logs = await Audit.find(query)
        .populate('user', 'fullName email role')
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip);

      return logs;
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(filters = {}) {
    try {
      const { startDate, endDate } = filters;

      const query = {};
      if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
      }

      const stats = await Audit.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return stats;
    } catch (error) {
      logger.error('Error calculating audit statistics:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();
