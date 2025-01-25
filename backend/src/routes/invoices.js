const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Config = require('../models/Config');
const auth = require('../middlewares/auth');
const { redisClient } = require('../db/redis');

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const { project: projectId } = req.body;
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    }).populate('client');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const config = await Config.findOne({ owner: req.user._id });
    
    const items = req.body.items.map(item => ({
      ...item,
      amount: parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = req.body.taxRate ?? config?.defaultTaxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoiceData = {
      project: project._id,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      owner: req.user._id,
      currency: {
        code: config?.currency?.code || 'USD',
        symbol: config?.currency?.symbol || '$'
      },
      invoiceDate: req.body.invoiceDate || new Date(),
      dueDate: req.body.dueDate || new Date(),
      status: req.body.status || 'draft',
      notes: req.body.notes
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();
    await invoice.populate('project');
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    let errorMessage = 'Error creating invoice';
    let statusCode = 400;

    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate invoice number detected';
    } else if (error.message === 'Project not found') {
      statusCode = 404;
      errorMessage = error.message;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

// Get all invoices with caching
router.get('/', auth, async (req, res) => {
  const cacheKey = `invoices:${req.user._id}`;
  try {
    const cachedInvoices = await redisClient.get(cacheKey);
    if (cachedInvoices) {
      return res.json(JSON.parse(cachedInvoices));
    }

    const invoices = await Invoice.find({ owner: req.user._id })
      .populate({ path: 'project', populate: { path: 'client' } });

    await redisClient.set(cacheKey, JSON.stringify(invoices), { EX: 300 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate({ path: 'project', populate: { path: 'client' } });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
router.patch('/:id', auth, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid invoice ID' });
  }
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['status', 'items', 'dueDate', 'notes', 'invoiceDate', 'taxRate'];
    
    if (!updates.every(update => allowedUpdates.includes(update))) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    if (req.body.items || req.body.taxRate) {
      const items = req.body.items.map(item => ({
        ...item,
        amount: parseFloat(item.quantity) * parseFloat(item.rate)
      }));
      
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (req.body.taxRate / 100);
      
      invoice.items = items;
      invoice.subtotal = subtotal;
      invoice.taxAmount = taxAmount;
      invoice.total = subtotal + taxAmount;
    }

    updates.forEach(update => {
      if (update !== 'items') invoice[update] = req.body[update];
    });

    await invoice.save();
    await redisClient.del(`invoices:${req.user._id}`);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    await redisClient.del(`invoices:${req.user._id}`);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
