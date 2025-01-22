const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  businessInfo: {
    CNIE: String,
    IF: String,
    taxeProfessionnelle: String,
    ICE: String,
    telephone: String,
    website: String,
    email: String
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
    name: String,
    code: String
  }]
}, {
  timestamps: true
});

const Config = mongoose.model('Config', configSchema);

module.exports = Config;