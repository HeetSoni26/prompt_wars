/**
 * @fileoverview Rate limiting middleware for CareerPilot API.
 * Limits users to 20 requests per minute to prevent abuse.
 */

const rateLimit = require('express-rate-limit');

/**
 * Creates a rate limiter for chat and AI endpoints.
 * 20 requests per minute per IP (keyed by uid when available).
 */
const chatRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: {
    error: 'RateLimitExceeded',
    message: 'Too many requests. You can send up to 20 messages per minute. Please wait before sending more.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * Lenient rate limiter for non-AI endpoints (memory, insights).
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.uid || req.ip,
  message: {
    error: 'RateLimitExceeded',
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

module.exports = { chatRateLimiter, apiRateLimiter };
