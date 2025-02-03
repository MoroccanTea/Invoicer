const Config = require('../models/Config');

module.exports = async (req, res, next) => {
  try {
    // Get all configs and handle duplicates
    const configs = await Config.find();
    
    if (configs.length > 1) {
      // Keep the first config and delete the rest
      const [keep, ...remove] = configs;
      await Config.deleteMany({ _id: { $in: remove.map(c => c._id) } });
      config = keep;
    } else if (configs.length === 1) {
      config = configs[0];
    } else {
      config = await Config.create({
        allowRegistration: true,
        defaultTaxRate: 0,
        currency: {
          code: 'USD',
          symbol: '$'
        },
        categories: [
          { name: 'Teaching', code: 'TCH' },
          { name: 'Development', code: 'DEV' },
          { name: 'Consulting', code: 'CNS' },
          { name: 'Pentesting', code: 'PNT' },
          { name: 'Support', code: 'SPT' },
          { name: 'Other', code: 'OTH' }
        ],
        businessInfo: {
          CNIE: '',
          IF: '',
          taxeProfessionnelle: '',
          ICE: '',
          telephone: '',
          website: '',
          email: ''
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
