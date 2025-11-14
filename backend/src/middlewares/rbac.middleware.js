// Define permissions
const permissions = {
  // Room permissions
  CREATE_ROOM: 'create:room',
  UPDATE_ROOM: 'update:room',
  DELETE_ROOM: 'delete:room',
  VIEW_ROOMS: 'view:rooms',
  
  // Booking permissions
  CREATE_BOOKING: 'create:booking',
  UPDATE_BOOKING: 'update:booking',
  DELETE_BOOKING: 'delete:booking',
  VIEW_BOOKINGS: 'view:bookings',
  VIEW_ALL_BOOKINGS: 'view:all_bookings'
};

// Define roles and their permissions
const roles = {
  ADMIN: 'admin',
  USER: 'user'
};

const rolePermissions = {
  [roles.ADMIN]: [
    permissions.CREATE_ROOM,
    permissions.UPDATE_ROOM,
    permissions.DELETE_ROOM,
    permissions.VIEW_ROOMS,
    permissions.CREATE_BOOKING,
    permissions.UPDATE_BOOKING,
    permissions.DELETE_BOOKING,
    permissions.VIEW_BOOKINGS,
    permissions.VIEW_ALL_BOOKINGS
  ],
  [roles.USER]: [
    permissions.VIEW_ROOMS,
    permissions.CREATE_BOOKING,
    permissions.UPDATE_BOOKING,
    permissions.DELETE_BOOKING,
    permissions.VIEW_BOOKINGS
  ]
};

// Middleware to check permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const userRole = req.user.role || roles.USER;
    const userPermissions = rolePermissions[userRole] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== roles.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const isOwner = req.user._id.toString() === resourceUserId.toString();
    const isAdmin = req.user.role === roles.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

module.exports = {
  permissions,
  roles,
  checkPermission,
  isAdmin,
  isOwnerOrAdmin
};

