const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Config = require('../models/Config');
const auth = require('../middlewares/auth');

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    // Fetch the project first
    const project = await Project.findOne({
      _id: req.body.project,
      owner: req.user._id
    }).populate('client');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Fetch user's config for defaults
    const config = await Config.findOne({ owner: req.user._id });
    
    // Calculate amounts
    const items = req.body.items.map(item => ({
      ...item,
      amount: parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxRate = req.body.taxRate ?? config?.defaultTaxRate ?? 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Prepare invoice data
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
    
    // Populate project details for response
    await invoice.populate('project');
    
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Invoice creation error:', error);
    let errorMessage = 'Error creating invoice';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join(', ');
    }
    res.status(400).json({ error: errorMessage });
  }
});

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ owner: req.user._id })
      .populate({
        path: 'project',
        populate: {
          path: 'client'
        }
      });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate('project').populate('client');
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['status', 'items', 'dueDate', 'notes', 'invoiceDate', 'taxRate'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates!' });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Recalculate amounts if items or tax rate updated
    if (req.body.items || req.body.taxRate) {
      const items = req.body.items.map(item => ({
        ...item,
        amount: parseFloat(item.quantity) * parseFloat(item.rate)
      }));

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * (req.body.taxRate / 100);
      const total = subtotal + taxAmount;

      invoice.items = items;
      invoice.subtotal = subtotal;
      invoice.taxAmount = taxAmount;
      invoice.total = total;
    }

    updates.forEach(update => {
      if (update !== 'items') { // Skip items as we handled them above
        invoice[update] = req.body[update];
      }
    });

    await invoice.save();
    await invoice.populate('client');
    
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

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;