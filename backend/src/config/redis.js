const redis = require('redis');
const { logger } = require('../middleware/errorHandler');

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initialize Redis client
 * Falls back gracefully if Redis is not available
 */
const initRedis = async () => {
  try {
    // Only connect if REDIS_URL is provided
    if (process.env.REDIS_URL) {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.warn('Redis reconnection attempts exceeded');
              return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
          }
        }
      });

      redisClient.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        isRedisAvailable = false;
      });

      redisClient.on('connect', () => {
        logger.info('✅ Redis client connected');
        isRedisAvailable = true;
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis client ready');
        isRedisAvailable = true;
      });

      redisClient.on('end', () => {
        logger.warn('Redis client connection ended');
        isRedisAvailable = false;
      });

      await redisClient.connect();
    } else {
      logger.info('⚠️  Redis URL not provided. OAuth sessions will use in-memory storage (not suitable for production with multiple instances)');
    }
  } catch (error) {
    logger.error('Redis initialization error:', error);
    isRedisAvailable = false;
    redisClient = null;
  }
};

/**
 * Store OAuth session data in Redis
 * @param {string} code - Session code
 * @param {object} data - Session data
 * @param {number} ttl - Time to live in milliseconds
 */
const storeOAuthSession = async (code, data, ttl = 60000) => {
  if (!isRedisAvailable || !redisClient) {
    // Fallback to in-memory storage
    return { code, data, ttl, storedIn: 'memory' };
  }

  try {
    const ttlSeconds = Math.floor(ttl / 1000);
    await redisClient.setEx(code, ttlSeconds, JSON.stringify(data));
    return { code, data, ttl, storedIn: 'redis' };
  } catch (error) {
    logger.error('Redis store session error:', error);
    return { code, data, ttl, storedIn: 'memory' }; // Fallback
  }
};

/**
 * Get OAuth session data from Redis
 * @param {string} code - Session code
 * @returns {object|null} Session data or null
 */
const getOAuthSession = async (code) => {
  if (!isRedisAvailable || !redisClient) {
    return null; // Will be handled by in-memory fallback
  }

  try {
    const data = await redisClient.get(code);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get session error:', error);
    return null;
  }
};

/**
 * Delete OAuth session from Redis
 * @param {string} code - Session code
 */
const deleteOAuthSession = async (code) => {
  if (!isRedisAvailable || !redisClient) {
    return; // Fallback handled elsewhere
  }

  try {
    await redisClient.del(code);
  } catch (error) {
    logger.error('Redis delete session error:', error);
  }
};

/**
 * Close Redis connection gracefully
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Redis close error:', error);
    }
  }
};

// Graceful shutdown
process.on('SIGTERM', closeRedis);
process.on('SIGINT', closeRedis);

module.exports = {
  initRedis,
  storeOAuthSession,
  getOAuthSession,
  deleteOAuthSession,
  closeRedis,
  isRedisAvailable,
  redisClient
};

