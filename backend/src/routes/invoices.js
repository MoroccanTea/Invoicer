const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Config = require('../models/Config');
const auth = require('../middlewares/auth');
const { redisClient } = require('../db/redis');

/**
 * @swagger
 * /invoices:
 *   post:
 *     tags: [Invoices]
 *     summary: Create new invoice
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Invoice'
 *           examples:
 *             sampleInvoice:
 *               value:
 *                 project: "60a3e5a8e6b940001f6d4e1a"
 *                 items:
 *                   - description: "Web Development"
 *                     quantity: 10
 *                     rate: 75
 *                   - description: "Consulting"
 *                     quantity: 5
 *                     rate: 100
 *                 invoiceDate: "2024-03-01"
 *                 dueDate: "2024-03-15"
 *                 notes: "Payment terms: Net 15 days"
 *     responses:
 *       201:
 *         description: Invoice created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *             example:
 *               invoiceNumber: "INV-2023-001"
 *               status: "draft"
 *               total: 1250.00
 *               currency: { code: "USD", symbol: "$" }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Project not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /invoices:
 *   get:
 *     tags: [Invoices]
 *     summary: List invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: client
 *         schema: { type: string }
 *         description: Filter by client ID
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, sent, paid, overdue] }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *         description: Filter invoices after this date
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *         description: Filter invoices before this date
 *     responses:
 *       200:
 *         description: Invoice list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Invoice' }
 *             example:
 *               - invoiceNumber: "INV-2023-001"
 *                 client: "64a1b5c3f8a9b6e7d4f3c2a1"
 *                 total: 1500.00
 *                 status: "paid"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, async (req, res) => {
  const cacheKey = `invoices:${req.user._id}`;
  try {
    let invoices;
    try {
      const cachedInvoices = await redisClient.get(cacheKey);
      if (cachedInvoices) {
        return res.json(JSON.parse(cachedInvoices));
      }
    } catch (redisError) {
      console.error('Redis cache get error:', redisError);
      // Continue without cache if Redis fails
    }

    invoices = await Invoice.find({ owner: req.user._id })
      .populate({ path: 'project', populate: { path: 'client' } });

    try {
      await redisClient.set(cacheKey, JSON.stringify(invoices), { EX: 300 });
    } catch (redisError) {
      console.error('Redis cache set error:', redisError);
      // Continue without caching if Redis fails
    }
    
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get an invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: MongoDB invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

/**
 * @swagger
 * /invoices/{id}:
 *   patch:
 *     tags: [Invoices]
 *     summary: Update invoice details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: "641f0b6d58c5d33e5b0e12a3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceUpdate'
 *           examples:
 *             statusUpdate:
 *               value:
 *                 status: "sent"
 *             itemsUpdate:
 *               value:
 *                 items:
 *                   - description: "Updated Service"
 *                     quantity: 2
 *                     rate: 200
 *     responses:
 *       200:
 *         description: Invoice updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
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

    // Handle items update
    if (req.body.items) {
      const items = req.body.items.map(item => ({
        ...item,
        amount: parseFloat(item.quantity) * parseFloat(item.rate)
      }));
      
      invoice.items = items;
      invoice.subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    }

    // Handle tax rate update
    if (req.body.taxRate !== undefined) {
      invoice.taxRate = req.body.taxRate;
    }

    // Recalculate tax amount and total
    if (req.body.items || req.body.taxRate !== undefined) {
      invoice.taxAmount = invoice.subtotal * (invoice.taxRate / 100);
      invoice.total = invoice.subtotal + invoice.taxAmount;
    }

    updates.forEach(update => {
      if (update !== 'items') invoice[update] = req.body[update];
    });

    await invoice.save();
    try {
      await redisClient.del(`invoices:${req.user._id}`);
    } catch (redisError) {
      console.error('Redis cache clear error:', redisError);
      // Continue even if Redis fails
    }
    res.json(invoice);
  } catch (error) {
    console.error('Invoice update error:', error);
    let errorMessage = 'Error updating invoice';
    let statusCode = 400;

    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
    } else if (error.message === 'Invoice not found') {
      statusCode = 404;
      errorMessage = error.message;
    }

    res.status(statusCode).json({ error: errorMessage });
  }
});

/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     tags: [Invoices]
 *     summary: Delete invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: "641f0b6d58c5d33e5b0e12a3"
 *     responses:
 *       200:
 *         description: Invoice deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Invoice'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    try {
      await redisClient.del(`invoices:${req.user._id}`);
    } catch (redisError) {
      console.error('Redis cache delete error:', redisError);
      // Continue even if Redis fails
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /invoices/{id}/pdf:
 *   get:
 *     tags: [Invoices]
 *     summary: Generate PDF for invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: "641f0b6d58c5d33e5b0e12a3"
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

module.exports = router;
