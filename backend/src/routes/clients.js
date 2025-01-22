const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middlewares/auth');

// Create client
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      owner: req.user._id
    });
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const clients = await Client.find({ owner: req.user._id });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, owner: req.user._id });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update client
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'company', 'address', 'phone', 'RC', 'ICE'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;