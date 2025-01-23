const adminAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required',
        requiredRole: 'admin',
        currentRole: req.user.role
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Internal server error during authorization check'
    });
  }
};

module.exports = adminAuth;
