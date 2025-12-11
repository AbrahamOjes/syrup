import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { config } from '../config';

// Create Redis client for rate limiting
const redisClient = createClient({
  url: config.redis.url,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.connect().catch(console.error);

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: false, // We'll add custom headers
  legacyHeaders: false,
  store: new RedisStore({
    // @ts-expect-error - RedisStore types don't match latest redis client
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  handler: (req, res) => {
    const retryAfter = Math.ceil(config.rateLimit.windowMs / 1000);
    res.setHeader('X-RateLimit-RetryAfter', retryAfter.toString());
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please retry after ${retryAfter} seconds.`,
    });
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Middleware to add rate limit headers to all responses
export const addRateLimitHeaders = (req: any, res: any, next: any) => {
  const limit = config.rateLimit.maxRequests;
  const remaining = res.getHeader('X-RateLimit-Remaining') || limit;
  const resetTime = Math.ceil(Date.now() / 1000) + Math.ceil(config.rateLimit.windowMs / 1000);

  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetTime.toString());

  next();
};
