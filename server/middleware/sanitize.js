const mongoSanitize = require('express-mongo-sanitize');

// Sanitize middleware to prevent NoSQL injection and XSS
const sanitize = (req, res, next) => {
    // Sanitize request data against NoSQL injection
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.query);
    mongoSanitize.sanitize(req.params);
    next();
};

module.exports = sanitize;
