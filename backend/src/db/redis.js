const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('Connected to Redis'));


let isConnected = false;

const connectRedis = async () => {
  if (isConnected) return client;
  
  try {
    await client.connect();
    isConnected = true;
    console.log('✅ Redis connection established');
    return client;
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    process.exit(1);
  }
};

module.exports = {
  connectRedis,
  redisClient: client
};
