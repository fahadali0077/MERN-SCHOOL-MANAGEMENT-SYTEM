const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });

    redisClient.on('connect', () => logger.info('✅ Redis Connected'));
    redisClient.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));

  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
  }
};

const getRedis = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized, using fallback');
    return null;
  }
  return redisClient;
};

// Cache helpers
const cache = {
  async get(key) {
    try {
      const client = getRedis();
      if (!client) return null;
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`Cache GET error: ${err.message}`);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 300) {
    try {
      const client = getRedis();
      if (!client) return false;
      await client.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (err) {
      logger.error(`Cache SET error: ${err.message}`);
      return false;
    }
  },

  async del(key) {
    try {
      const client = getRedis();
      if (!client) return false;
      await client.del(key);
      return true;
    } catch (err) {
      logger.error(`Cache DEL error: ${err.message}`);
      return false;
    }
  },

  async delPattern(pattern) {
    try {
      const client = getRedis();
      if (!client) return false;
      const keys = await client.keys(pattern);
      if (keys.length > 0) await client.del(...keys);
      return true;
    } catch (err) {
      logger.error(`Cache DEL pattern error: ${err.message}`);
      return false;
    }
  }
};

module.exports = connectRedis;
module.exports.cache = cache;
module.exports.getRedis = getRedis;
