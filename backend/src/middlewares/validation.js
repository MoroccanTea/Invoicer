const Joi = require('joi');

const invoiceSchema = Joi.object({
  project: Joi.string().hex().length(24).required(),
  items: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().min(0).required(),
      rate: Joi.number().min(0).required()
    })
  ).min(1).required(),
  invoiceDate: Joi.date().iso().required(),
  dueDate: Joi.date().iso().min(Joi.ref('invoiceDate')).required(),
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue').default('draft'),
  notes: Joi.string().allow('')
});

const validateInvoice = (req, res, next) => {
  const { error } = invoiceSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: error.details.map(d => d.message)
    });
  }
  next();
};

module.exports = {
  validateInvoice
};
