import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error(`❌ Redis Client Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info('🔌 Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis Client Ready');
    });

    redisClient.on('reconnecting', () => {
      logger.warn('⚠️  Redis Client Reconnecting...');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error(`❌ Failed to connect to Redis: ${error.message}`);
    // Redis is optional, so we don't exit the process
    return null;
  }
};

// Cache helper functions
export const cacheGet = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Cache get error for key ${key}: ${error.message}`);
    return null;
  }
};

export const cacheSet = async (key, value, expireSeconds = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, expireSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Cache set error for key ${key}: ${error.message}`);
    return false;
  }
};

export const cacheDel = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Cache delete error for key ${key}: ${error.message}`);
    return false;
  }
};

export const cacheFlush = async () => {
  if (!redisClient) return false;
  try {
    await redisClient.flushAll();
    return true;
  } catch (error) {
    logger.error(`Cache flush error: ${error.message}`);
    return false;
  }
};

export { redisClient };
export default connectRedis;
