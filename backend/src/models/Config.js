const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  firstLaunch: {
    type: Boolean,
    default: true
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  invoicePrefix: {
    type: String,
    default: 'INV'
  },
  defaultTaxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
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
  categories: [{
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      maxlength: 3
    }
  }],
  businessInfo: {
    CNIE: String,
    IF: String,
    taxeProfessionnelle: String,
    ICE: String,
    telephone: String,
    website: String,
    email: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Config', configSchema);
