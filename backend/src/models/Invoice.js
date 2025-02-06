const mongoose = require('mongoose');
const Counter = require('./Counter');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  amount: {
    type: Number,
    required: true
  }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    code: {
      type: String,
      default: 'USD'
    },
    symbol: {
      type: String,
      default: '$'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'received', 'paid', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  notes: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate invoice number
invoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      // Get project category
      const Project = mongoose.model('Project');
      const project = await Project.findById(this.project);
      if (!project) {
        throw new Error('Project not found');
      }
      // Get category and ensure it's valid
      if (!project.category) {
        throw new Error('Project category is required');
      }
      // Use uppercase for invoice number but preserve original case in project
      const activity = project.category.toUpperCase();
      
      const counter = await Counter.findByIdAndUpdate(
        { _id: `${month}-${year}-${activity}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      
      this.invoiceNumber = `${month}-${year}-${activity}-${String(counter.seq).padStart(3, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
