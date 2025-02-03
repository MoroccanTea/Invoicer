const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Config = require('../models/Config');
const auth = require('../middlewares/auth');
const { redisClient } = require('../db/redis');
const PDFDocument = require('pdfkit');

// Get all invoices with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find({ owner: req.user._id })
      .populate({
        path: 'project',
        populate: { path: 'client' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments({ owner: req.user._id });
    const totalPages = Math.ceil(total / limit);

    res.json({
      invoices,
      totalPages,
      currentPage: page,
      totalItems: total
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate({
      path: 'project',
      populate: { path: 'client' }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create invoice
router.post('/', auth, async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      owner: req.user._id
    });
    await invoice.save();
    
    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'project',
        populate: { path: 'client' }
      });

    res.status(201).json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update invoice (PUT & PATCH)
router.put('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['invoiceNumber', 'project', 'items', 'subtotal', 'taxRate', 'taxAmount', 'total', 'status', 'notes', 'dueDate', 'invoiceDate'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    updates.forEach(update => invoice[update] = req.body[update]);
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'project',
        populate: { path: 'client' }
      });

    res.json(populatedInvoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['invoiceNumber', 'project', 'items', 'subtotal', 'taxRate', 'taxAmount', 'total', 'status', 'notes', 'dueDate', 'invoiceDate'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    updates.forEach(update => invoice[update] = req.body[update]);
    await invoice.save();

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({
        path: 'project',
        populate: { path: 'client' }
      });

    res.json(populatedInvoice);
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
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    // Fetch invoice with full population
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate({ 
      path: 'project', 
      populate: { path: 'client' } 
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Fetch user's configuration to get currency details
    const config = await Config.findOne({ owner: req.user._id });
    const currencyCode = config?.currency?.code || 'USD';
    const currencySymbol = config?.currency?.symbol || '$';

    // Create a new PDF document
    const doc = new PDFDocument();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    // Pipe the PDF document directly to the response
    doc.pipe(res);

    // PDF Content
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(12)
       .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'left' })
       .text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, { align: 'left' })
       .text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, { align: 'left' });

    // Project and Client Details
    if (invoice.project) {
      doc.moveDown();
      
      if (invoice.project.client) {
        doc.text(`Client: ${invoice.project.client.name}`, { align: 'left' });
      }
      
      doc.text(`Project: ${invoice.project.name}`, { align: 'left' });
    }
 
    // Invoice Items
    doc.moveDown();
    doc.fontSize(14).text('Items', { underline: true });
    doc.fontSize(10);
    invoice.items.forEach(item => {
      doc.text(`${item.description} - Qty: ${item.quantity} x ${currencySymbol}${item.rate.toFixed(2)} = ${currencySymbol}${item.amount.toFixed(2)}`);
    });

    // Totals
    doc.moveDown();
    doc.fontSize(12)
       .text(`Subtotal: ${currencySymbol}${invoice.subtotal.toFixed(2)} ${currencyCode}`, { align: 'right' })
       .text(`Tax (${invoice.taxRate}%): ${currencySymbol}${invoice.taxAmount.toFixed(2)} ${currencyCode}`, { align: 'right' })
       .text(`Total: ${currencySymbol}${invoice.total.toFixed(2)} ${currencyCode}`, { align: 'right', underline: true });

    // Notes
    if (invoice.notes) {
      doc.moveDown()
         .fontSize(10)
         .text(`Notes: ${invoice.notes}`);
    }

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Error generating PDF', details: error.message });
  }
});

// Rest of the existing routes remain the same...

module.exports = router;
