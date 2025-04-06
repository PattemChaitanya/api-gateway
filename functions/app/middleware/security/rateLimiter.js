const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_WINDOW_MS, MAX_REQUESTS_PER_WINDOW } = require("../../config");

/**
 * Creates a rate limiter middleware with configurable options
 * @param {Object} options - Rate limiter options
 * @param {number} options.windowMs - The time window in milliseconds
 * @param {number} options.max - Max number of requests per window
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes default
    max: options.max || MAX_REQUESTS_PER_WINDOW || 100, // 100 requests per window default
    message: {
      status: "error",
      code: 429,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for whitelisted IPs
    skip: (req) => {
      const whitelistedIPs = process.env.RATE_LIMIT_WHITELIST?.split(",") || [];
      return whitelistedIPs.includes(req.ip);
    },
    // Custom handler for when rate limit is exceeded
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        code: 429,
        message: "Too many requests from this IP, please try again later.",
        retryAfter: res.getHeader("Retry-After"),
      });
    },
  });
};

// Export different rate limiter configurations
module.exports = {
  // Default rate limiter
  defaultLimiter: createRateLimiter(),

  // Strict rate limiter for sensitive endpoints
  strictLimiter: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 requests per window
  }),

  // Custom rate limiter factory
  createRateLimiter,
};
