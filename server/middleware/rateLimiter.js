const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { message: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { generalLimiter, authLimiter };
