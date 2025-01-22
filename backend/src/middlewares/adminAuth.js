const adminAuth = async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        throw new Error();
      }
      next();
    } catch (error) {
      res.status(403).json({ error: 'Admin access required' });
    }
  };

module.exports = adminAuth;