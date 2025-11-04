class RBACMiddleware {
  // Role-based access control
  authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Role '${req.user.role}' is not authorized to access this resource. Required roles: ${roles.join(', ')}`
        });
      }

      next();
    };
  }

  // Check if user is admin
  isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    next();
  }

  // Check if user is manager or admin
  isManagerOrAdmin(req, res, next) {
    if (!req.user || !['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager or Admin role required.'
      });
    }
    next();
  }

  // Check if user owns the resource or is admin
  isOwnerOrAdmin(resourceUserId) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      const isOwner = req.user._id.toString() === resourceUserId.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    };
  }
}

module.exports = new RBACMiddleware();

