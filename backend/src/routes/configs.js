const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

// Load Config 
router.get('/', auth, async (req, res) => {
  try {
    const config = await Config.findOne({ owner: req.user._id });
    if (!config) {
      // Return default config if none exists
      return res.json({
        defaultTaxRate: 0,
        currency: { code: 'USD', symbol: '$' },
        categories: [
          { name: 'Teaching', code: 'TCH' },
          { name: 'Development', code: 'DEV' },
          { name: 'Consulting', code: 'CNS' }
        ],
        allowRegistration: true,
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
    res.json(config);
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Error fetching configuration' });
  }
});


// Update the config settings
router.patch('/', auth, adminAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['defaultTaxRate', 'currency', 'categories', 'allowRegistration', 'businessInfo'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    let config = await Config.findOne({ owner: req.user._id });
    if (!config) {
      config = new Config({ owner: req.user._id });
    }

    // Handle nested updates
    updates.forEach(update => {
      if (update === 'businessInfo' || update === 'currency') {
        config[update] = {
          ...config[update],
          ...req.body[update]
        };
      } else {
        config[update] = req.body[update];
      }
    });

    await config.save();
    res.json(config);
  } catch (error) {
    console.error('Config update error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;