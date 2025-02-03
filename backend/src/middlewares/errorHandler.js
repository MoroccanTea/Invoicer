const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code
  });

  // MongoDB connection errors
  if (err.name === 'MongoServerError') {
    if (err.code === 18) {
      return res.status(500).json({
        error: 'Database authentication failed',
        details: 'Please check database credentials'
      });
    }
    if (err.code === 8000) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: 'Unable to reach database server'
      });
    }
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // MongoDB casting errors (invalid IDs etc)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid data format',
      details: `Invalid ${err.kind} for field '${err.path}'`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication error',
      details: 'Invalid or malformed token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentication error',
      details: 'Token has expired'
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
};

module.exports = errorHandler;
