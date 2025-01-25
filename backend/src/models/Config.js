const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  allowRegistration: {
    type: Boolean,
    default: true
  },
  invoicePrefix: {
    type: String,
    default: 'INV'
  },
  taxRate: {
    type: Number,
    default: 0.2,
    min: 0,
    max: 1
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
  businessInfo: {
    name: String,
    address: String,
    email: String,
    phone: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', configSchema);
