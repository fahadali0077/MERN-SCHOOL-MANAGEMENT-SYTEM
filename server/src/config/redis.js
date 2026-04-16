const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;

const connectRedis = async () => {
  // FIX: If no REDIS_URL is configured, skip Redis entirely instead of crashing.
  // Bull queues also check redisAvailable before initializing.
  if (!process.env.REDIS_URL) {
    logger.warn('⚠️  REDIS_URL not set — Redis and Bull queues are DISABLED. Caching will be skipped.');
    return;
  }

  try {
    const Redis = require('ioredis');

    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 5) {
          logger.error('Redis: Max retries exceeded — giving up');
          return null; // stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Upstash requires TLS (rediss://) — ioredis handles this automatically from the URL
      tls: process.env.REDIS_URL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      logger.info('✅ Redis connected');
    });
    redisClient.on('error', (err) => {
      redisAvailable = false;
      logger.error(`Redis error: ${err.message}`);
    });
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
    redisClient.on('end', () => {
      redisAvailable = false;
      logger.warn('Redis connection closed');
    });

    await redisClient.connect();
  } catch (error) {
    // FIX: Catch startup errors and warn instead of crashing the process
    redisAvailable = false;
    logger.warn(`⚠️  Redis connection failed: ${error.message} — continuing without cache`);
    redisClient = null;
  }
};

const getRedis = () => {
  if (!redisClient || !redisAvailable) return null;
  return redisClient;
};

// ─── Cache helpers — all methods silently no-op if Redis is unavailable ───────
const cache = {
  async get(key) {
    try {
      const client = getRedis();
      if (!client) return null;
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error(`Cache GET error (${key}): ${err.message}`);
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
      logger.error(`Cache SET error (${key}): ${err.message}`);
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
      logger.error(`Cache DEL error (${key}): ${err.message}`);
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
      logger.error(`Cache DEL pattern error (${pattern}): ${err.message}`);
      return false;
    }
  }
};

module.exports = connectRedis;
module.exports.cache = cache;
module.exports.getRedis = getRedis;
module.exports.isRedisAvailable = () => redisAvailable;
