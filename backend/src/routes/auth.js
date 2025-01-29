const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const loadConfig = require('../middlewares/loadConfig');
const User = require('../models/User');
const auth = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new user
 *     description: Creates new user account (admin-only when registration is disabled)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *           examples:
 *             basicUser:
 *               summary: Basic registration
 *               value:
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 password: "securePassword123"
 *             adminUser:
 *               summary: Admin registration (requires admin privileges)
 *               value:
 *                 name: "Admin User"
 *                 email: "admin@example.com"
 *                 password: "adminSecurePass123"
 *                 role: "admin"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               _id: "641f0b6d58c5d33e5b0e12a3"
 *               name: "John Doe"
 *               email: "john@example.com"
 *               role: "user"
 *               createdAt: "2024-03-01T12:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden operation
 *         content:
 *           application/json:
 *             examples:
 *               disabledRegistration:
 *                 value:
 *                   statusCode: 403
 *                   error: "Forbidden"
 *                   message: "User registration is disabled"
 *               adminRequired:
 *                 value:
 *                   statusCode: 403
 *                   error: "Forbidden"
 *                   message: "Admin privileges required"
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
const Config = require('../models/Config');

router.post('/register', loadConfig, async (req, res) => {
  try {
    // Check registration configuration from middleware
    if (!req.config?.allowRegistration) {
      return res.status(403).json({ error: 'User registration is disabled' });
    }

    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Authentication]
 *     description: Returns JWT token for authenticated users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: 
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: 
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MWYw..."
 *                 user: 
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid login credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid login credentials');
    }
    if (!user.isActivated) {
      throw new Error('Account is disabled');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify authentication token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     description: Validates JWT token and returns user details
 *     responses:
 *       200:
 *         description: Valid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               user:
 *                 _id: "641f0b6d58c5d33e5b0e12a3"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 role: "user"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Account disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/verify', auth, async (req, res) => {
  try {
    // Token is already verified by auth middleware
    // Return user data without sensitive information
    const { password, tokens, ...userWithoutSensitive } = req.user.toObject();
    res.json({ user: userWithoutSensitive });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
