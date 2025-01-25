const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectRedis, redisClient } = require('./db/redis');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Redis connection
connectRedis();

// Configuration initialization
const initializeConfig = async () => {
  try {
    const Config = require('./models/Config');
    const existingConfig = await Config.findOne();
    
    if (!existingConfig) {
      const initialConfig = new Config({
        owner: null,
        allowRegistration: true
      });
      await initialConfig.save();
      console.log('Initial configuration created');
    }
  } catch (error) {
    console.error('Failed to initialize configuration:', error);
  }
};

// Create express app
const app = express();

// Initialize config before starting server
initializeConfig();

// Health check endpoint
app.get('/status', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = await redisClient.ping().then(() => 'connected').catch(() => 'error');
  
  res.json({
    status: 'ok',
    services: {
      database: dbStatus,
      redis: redisStatus,
      uptime: process.uptime()
    }
  });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(limiter);
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.urlencoded({ extended: true }));

// API Routes (v1)
app.use('/api/v1', 
  express.Router()
    .use('/projects', require('./routes/projects'))
    .use('/invoices', require('./routes/invoices'))
    .use('/clients', require('./routes/clients'))
    .use('/configs', require('./routes/configs'))
    .use('/stats', require('./routes/stats'))
    .use('/auth', require('./routes/auth'))
    .use('/users', require('./routes/users'))
);

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
}

module.exports = app;
