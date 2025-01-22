const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    description: String,
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    category: {
      type: String,
      required: true,
      enum: ['TEACHING', 'DEVELOPMENT', 'CONSULTING', 'PENTESTING'].map(cat => cat.toLowerCase()),
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;