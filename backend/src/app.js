const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
require('dotenv').config();

// Initialize express
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (v1)
const apiV1Router = express.Router();

// Routes
apiV1Router.use('/projects', require('./routes/projects'));
apiV1Router.use('/invoices', require('./routes/invoices'));
apiV1Router.use('/clients', require('./routes/clients'));
apiV1Router.use('/configs', require('./routes/configs'));
apiV1Router.use('/stats', require('./routes/stats'));
apiV1Router.use('/auth', require('./routes/auth'));
apiV1Router.use('/users', require('./routes/users'));

// Mount v1 routes
app.use('/api/v1', apiV1Router);

// Error handling
app.use(errorHandler);

// Catch-all route for API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});


// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
};


module.exports = app;
