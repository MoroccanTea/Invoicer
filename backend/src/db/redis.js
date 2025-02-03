const redis = require('redis');

let client = null;
let isConnected = false;

const connectRedis = async () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Skipping Redis in development mode');
    return null;
  }

  if (isConnected) return client;
  
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      isConnected = false;
    });
    
    client.on('connect', () => {
      console.log('Connected to Redis');
      isConnected = true;
    });

    await client.connect();
    console.log('✅ Redis connection established');
    return client;
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    console.log('⚠️ Continuing without Redis - rate limiting will be disabled');
    return null;
  }
};

const getRedisClient = () => client;

module.exports = {
  connectRedis,
  redisClient: getRedisClient,
  isConnected: () => isConnected
};
