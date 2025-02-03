const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      if (!user.isActivated) {
        return res.status(403).json({ error: 'Account is disabled' });
      }

      req.token = token;
      req.user = user;
      next();
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', tokenExpired: true });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = auth;
