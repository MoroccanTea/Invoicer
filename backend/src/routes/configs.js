const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');
const Config = require('../models/Config');

/**
 * @swagger
 * tags:
 *   name: Configuration
 *   description: Application configuration management
 */

/**
 * @swagger
 * /configs:
 *   get:
 *     tags: [Configuration]
 *     summary: Get application configuration
 *     description: Retrieve the current application configuration
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *             example:
 *               defaultTaxRate: 20
 *               currency: { code: 'USD', symbol: '$' }
 *               allowRegistration: true
 *               businessInfo:
 *                 CNIE: '123456789'
 *                 IF: '987654321'
 *                 taxeProfessionnelle: '456789123'
 *                 ICE: '321654987'
 *                 telephone: '+212600000000'
 *                 website: 'https://example.com'
 *                 email: 'contact@example.com'
 *                 categories:
 *                   - { name: 'Teaching', code: 'TCH' }
 *                   - { name: 'Development', code: 'DEV' }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// Redirect legacy singular endpoint to plural
router.get('/config', (req, res) => res.redirect(301, './configs'));

// Load Config 
router.get('/', require('../middlewares/loadConfig'), async (req, res) => { // Main plural endpoint
  try {
    const config = req.config;
    if (!config) {
      // Return default config if none exists
      return res.json({
        defaultTaxRate: 0,
        currency: { code: 'USD', symbol: '$' },
        allowRegistration: true,
        businessInfo: {
          CNIE: '',
          IF: '',
          taxeProfessionnelle: '',
          ICE: '',
          telephone: '',
          website: '',
          email: '',
          categories: [
            { name: 'Teaching', code: 'TCH' },
            { name: 'Development', code: 'DEV' },
            { name: 'Consulting', code: 'CNS' },
            { name: 'Pentesting', code: 'PNT' },
            { name: 'Support', code: 'SPT' },
            { name: 'Other', code: 'OTH' }
          ],
        }
      });
    }
    res.json(config);
  } catch (error) {
    console.error('Config fetch error for user %s:', req.user?._id, error);
    res.status(500).json({ 
      error: 'Error fetching configuration',
      details: error.message,
      allowRegistration: true // Ensure fallback value in error response
    });
  }
});


/**
 * @swagger
 * /configs:
 *   patch:
 *     tags: [Configuration]
 *     summary: Update application configuration
 *     description: Update application configuration settings (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Config'
 *           examples:
 *             basicUpdate:
 *               summary: Basic configuration update
 *               value:
 *                 defaultTaxRate: 20
 *                 currency: { code: 'MAD', symbol: 'DH' }
 *             businessInfoUpdate:
 *               summary: Business info update
 *               value:
 *                 businessInfo:
 *                   CNIE: '123456789'
 *                   IF: '987654321'
 *                   taxeProfessionnelle: '456789123'
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Config'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// Update the config settings
router.patch('/', auth, adminAuth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['defaultTaxRate', 'currency', 'categories', 'allowRegistration', 'businessInfo'];
    const currencyUpdates = ['code', 'symbol'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    let config = await Config.findOne();
    if (!config) {
      config = new Config();
    }

    // Handle nested updates
    // Validate currency structure
    if (req.body.currency && (!req.body.currency.code || !req.body.currency.symbol)) {
      return res.status(400).json({ error: 'Currency must contain both code and symbol' });
    }

    updates.forEach(update => {
      if (update === 'businessInfo') {
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
