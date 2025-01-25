const Config = require('../models/Config');

module.exports = async (req, res, next) => {
  try {
    // Get or create user-specific config if none exists
    let config = req.user ? await Config.findOne({ owner: req.user._id }) : await Config.findOne();
    
    // Convert legacy string currency format to object
    if (config && typeof config.currency === 'string') {
      config.currency = {
        code: config.currency,
        symbol: '$'
      };
      await config.save();
    }

    if (!config) {
      config = await Config.create({
        owner: req.user?._id,
        allowRegistration: true,
        invoicePrefix: 'INV',
        taxRate: 0.2,
        currency: {
          code: 'USD',
          symbol: '$'
        },
        businessInfo: {
          name: 'My Business',
          address: '',
          email: '',
          phone: ''
        }
      });
    }

    req.config = config;
    next();
  } catch (error) {
    console.error('Config loading error:', error);
    res.status(500).json({ 
      error: 'Failed to load configuration',
      details: error.message
    });
  }
};
