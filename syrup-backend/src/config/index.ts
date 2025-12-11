import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || '1.0.0',
  providerName: process.env.PROVIDER_NAME || 'Autospend-Syrup',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/syrup_db',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  apiKey: {
    required: process.env.API_KEY_REQUIRED === 'true',
    validKeys: process.env.VALID_API_KEYS?.split(',') || [],
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },

  cache: {
    couponsTTL: parseInt(process.env.CACHE_COUPONS_TTL || '300', 10),
    merchantsTTL: parseInt(process.env.CACHE_MERCHANTS_TTL || '3600', 10),
  },
};
