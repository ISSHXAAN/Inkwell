const User = require('../models/User');
const { generateToken, sendTokenCookie } = require('../utils/token');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(400).json({ message: `${field} already exists` });
        }

        // Create user
        const user = await User.create({ username, email, password });

        // Generate token and set cookie
        const token = generateToken(user._id);
        sendTokenCookie(res, token);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            role: user.role
        });
    } catch (error) {
        console.error('Register error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Find user with password field
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token and set cookie
        const token = generateToken(user._id);
        sendTokenCookie(res, token);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            role: user.role
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: 'Logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { register, login, logout, getMe };
