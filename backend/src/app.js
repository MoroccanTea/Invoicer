const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectRedis, redisClient, isConnected: isRedisConnected } = require('./db/redis');
const mongoose = require('mongoose');
require('dotenv').config();

// Create express app
const app = express();

// Trust proxy - required for proper IP handling behind nginx
app.set('trust proxy', 1);  // Trust first proxy hop (e.g., nginx)

// Initialize MongoDB connection
const connectDB = require('./db/mongoose');

// Initialize services
const initializeServices = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Initialize Redis (skipped in development)
    await connectRedis();

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// Initialize services before starting server
initializeServices().catch(error => {
  console.error('Failed to initialize services:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});

// Health check endpoint
app.get('/status', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = process.env.NODE_ENV === 'development'
    ? 'disabled in development'
    : isRedisConnected() ? 'connected' : 'error';
  
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

// Configure Helmet based on environment
if (process.env.NODE_ENV !== 'production') {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginOpenerPolicy: { policy: "unsafe-none" },
      contentSecurityPolicy: false,
    })
  );
} else {
  app.use(helmet()); // Default strict configuration for production
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost', 'http://localhost:80'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
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

// No static file serving needed - handled by frontend container

module.exports = app;
