const Subscriber = require('../models/Subscriber');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribe
const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already subscribed' });
        }

        await Subscriber.create({ email });
        res.status(201).json({ message: 'Subscribed successfully!' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Please enter a valid email' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { subscribe };
