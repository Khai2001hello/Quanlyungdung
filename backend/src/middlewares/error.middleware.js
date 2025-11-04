class ErrorMiddleware {
  // Handle 404 errors
  notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  }

  // Global error handler
  errorHandler(err, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
      ...(process.env.NODE_ENV === 'development' && { error: err })
    });
  }

  // Async error handler wrapper
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Validation error handler
  validationError(errors) {
    return (req, res) => {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    };
  }

  // Mongoose duplicate key error
  handleDuplicateKeyError(err, res) {
    const field = Object.keys(err.keyValue);
    const message = `${field} already exists. Please use a different ${field}.`;
    res.status(400).json({
      success: false,
      message: message
    });
  }

  // Mongoose validation error
  handleValidationError(err, res) {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    res.status(400).json({
      success: false,
      message: message,
      errors: errors
    });
  }

  // JWT error handler
  handleJWTError(res) {
    res.status(401).json({
      success: false,
      message: 'Invalid token. Please login again.'
    });
  }

  handleJWTExpiredError(res) {
    res.status(401).json({
      success: false,
      message: 'Token has expired. Please login again.'
    });
  }
}

module.exports = new ErrorMiddleware();

