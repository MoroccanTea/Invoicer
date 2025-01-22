const errorHandler = (err, req, res, next) => {
    console.error(err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
  
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
  
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
  
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
  
    // Default error
    res.status(500).json({ error: 'Internal server error' });
  };
  
  module.exports = errorHandler;