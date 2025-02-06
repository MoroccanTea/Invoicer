const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 10;
  const retryInterval = 5000; // 5 seconds
  let currentTry = 1;

  while (currentTry <= maxRetries) {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined');
      }

      const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        // MongoDB driver will handle auth from the URI
      };

      console.log('Attempting MongoDB connection...');
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('✅ MongoDB connected successfully to:', process.env.MONGODB_URI.replace(/\/\/[^@]+@/, '//***:***@'));
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${currentTry}/${maxRetries} failed:`, error.message);
      if (error.name === 'MongoServerError') {
        console.error('❌ MongoDB Error Details:', {
          code: error.code,
          codeName: error.codeName
        });
      }
      
      if (currentTry === maxRetries) {
        console.error('❌ Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }

      console.log(`⏳ Waiting ${retryInterval/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
      currentTry++;
    }
  }
};

mongoose.connection.on('error', err => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ MongoDB disconnected. Attempting to reconnect...');
  connectDB();
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

module.exports = connectDB;
