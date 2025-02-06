const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Config = require('../models/Config');
const auth = require('../middlewares/auth');
const { redisClient } = require('../db/redis');
const PDFDocument = require('pdfkit');

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management endpoints
 */

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

    const config = await Config.findOne({ owner: req.user._id });
    const currencySymbol = config?.currency?.symbol || '$';

    const doc = new PDFDocument({
      margin: 50,
      size: 'A4'
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).text('INVOICE', { align: 'right' });
    doc.fontSize(10)
      .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${invoice.invoiceDate.toLocaleDateString()}`, { align: 'right' })
      .text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, { align: 'right' });

    // Business Info
    doc.moveDown(2);
    doc.fontSize(12).text(config?.businessName || 'Business Name');
    doc.fontSize(10)
      .text(config?.businessAddress || '')
      .text(`Tel: ${config?.businessPhone || ''}`)
      .text(`Email: ${config?.businessEmail || ''}`);

    // Client Info
    doc.moveDown(2);
    doc.fontSize(12).font('Helvetica-Bold').text('Bill To:');
    doc.moveDown(0.5).font('Helvetica');
    doc.fontSize(10)

    // Format address fields properly
    const client = invoice.project?.client;
    const address = {
      street: client?.street || '',
      city: client?.city || '',
      state: client?.state || '',
      country: client?.country || '',
      zipCode: client?.zipCode || ''
    };
    
    doc.text(client?.name || '')
      .text(client?.email || '')
      .text([
        address.street,
        [address.city, address.state, address.zipCode].filter(Boolean).join(', '),
        address.country
      ].filter(Boolean).join('\n'));

    // Items Table
    doc.moveDown(2);
    const tableTop = doc.y;
    const tableHeaders = ['Description', 'Quantity', 'Rate', 'Amount'];
    const columnWidths = [250, 70, 100, 100];
    let currentY = tableTop;

    // Table Headers
    doc.fontSize(10).font('Helvetica-Bold');
    let currentX = 50;
    tableHeaders.forEach((header, i) => {
      doc.text(header, currentX, currentY, { width: columnWidths[i], align: i > 0 ? 'right' : 'left' });
      currentX += columnWidths[i];
    });

    // Table Lines
    doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
    currentY += 25;

    // Table Content
    doc.font('Helvetica');
    invoice.items.forEach(item => {
      currentX = 50;
      doc.text(item.description, currentX, currentY, { width: columnWidths[0] });
      currentX += columnWidths[0];
      doc.text(item.quantity.toString(), currentX, currentY, { width: columnWidths[1], align: 'right' });
      currentX += columnWidths[1];
      doc.text(`${currencySymbol}${item.rate.toFixed(2)}`, currentX, currentY, { width: columnWidths[2], align: 'right' });
      currentX += columnWidths[2];
      doc.text(`${currencySymbol}${item.amount.toFixed(2)}`, currentX, currentY, { width: columnWidths[3], align: 'right' });
      currentY += 20;
    });

    // Totals
    doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
    currentY += 10;
    
    doc.text('Subtotal:', 380, currentY, { width: 100, align: 'right' });
    doc.text(`${currencySymbol}${invoice.subtotal.toFixed(2)}`, 480, currentY, { width: 70, align: 'right' });
    currentY += 20;
    
    doc.text(`Tax (${invoice.taxRate}%):`, 380, currentY, { width: 100, align: 'right' });
    doc.text(`${currencySymbol}${invoice.taxAmount.toFixed(2)}`, 480, currentY, { width: 70, align: 'right' });
    currentY += 20;
    
    doc.font('Helvetica-Bold');
    doc.text('Total:', 380, currentY, { width: 100, align: 'right' });
    doc.text(`${currencySymbol}${invoice.total.toFixed(2)}`, 480, currentY, { width: 70, align: 'right' });

    // Footer
    doc.fontSize(10).font('Helvetica');
    doc.text(config?.businessInfo?.ICE || 'Thank you for your business!', 50, 720);
    doc.text(config?.businessInfo?.telephone || '', 50, 735);
    doc.text(config?.businessInfo?.email || '', 50, 750);

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Error generating PDF' });
  }
});

module.exports = router;
