const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT from cookie
const protect = async (req, res, next) => {
    try {
        let token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, please login' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
};

// Optional auth - attach user if token exists, but don't block
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (error) {
        // Token invalid, continue without user
    }
    next();
};

module.exports = { protect, optionalAuth };
