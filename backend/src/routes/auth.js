const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middlewares/auth');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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