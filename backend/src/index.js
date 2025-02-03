require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/mongoose');
const crypto = require('crypto');
const User = require('./models/User');
const Config = require('./models/Config');
const fs = require('fs');
const path = require('path');

// Validate required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
];

// Check for either MONGODB_URI or MONGO_ROOT_USER/MONGO_ROOT_PASSWORD pair
if (!process.env.MONGODB_URI && (!process.env.MONGO_ROOT_USER || !process.env.MONGO_ROOT_PASSWORD)) {
  console.error('Missing required MongoDB configuration. Need either MONGODB_URI or both MONGO_ROOT_USER and MONGO_ROOT_PASSWORD');
  process.exit(1);
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// If MONGODB_URI is not provided, construct it from user and password
if (!process.env.MONGODB_URI && process.env.MONGO_ROOT_USER && process.env.MONGO_ROOT_PASSWORD) {
  process.env.MONGODB_URI = `mongodb://${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@mongodb:27017/invoicer?authSource=admin`;
}

const PORT = process.env.PORT || 5001;

// Log environment configuration (without sensitive data)
console.log('Environment Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  MONGODB_URI: process.env.MONGODB_URI?.replace(/\/\/[^@]+@/, '//***:***@'),
  REDIS_URL: process.env.REDIS_URL?.replace(/\/\/[^@]+@/, '//***:***@')
});

// Seeding function for first launch
async function seedFirstLaunch() {
  try {
    // Check if it's the first launch
    let configDoc = await Config.findOne({});
    
    if (!configDoc) {
      configDoc = new Config();
    }

    if (configDoc.firstLaunch) {
      // Generate a random admin password
      const randomPassword = crypto.randomBytes(12).toString('hex');
      
      // Create admin user
      const adminUser = new User({
        email: 'admin@invoicer.com',
        password: randomPassword,
        name: 'Admin',
        role: 'admin',
        isActivated: true
      });
      
      await adminUser.save();

      // Update firstLaunch flag
      configDoc.firstLaunch = false;
      await configDoc.save();

      // Write the initial password to a secure file and log it
      console.log('Initial admin credentials:');
      console.log('Email: admin@invoicer.com');
      console.log(`Password: ${randomPassword}`);
      
      console.log('First launch seeding completed. Admin user created.');
    }
  } catch (error) {
    console.error('Error during first launch seeding:', error);
  }
}

const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connection successful');
    
    // Perform first launch seeding
    console.log('Checking first launch status...');
    await seedFirstLaunch();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Server initialization complete');
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      }
      process.exit(1);
    });

    // Handle process termination
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    if (error.name === 'MongoServerError') {
      console.error('MongoDB connection details:', {
        error: error.message,
        code: error.code,
        codeName: error.codeName
      });
    }
    process.exit(1);
  }
};

startServer();
