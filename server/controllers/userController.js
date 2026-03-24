const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by username
// @route   GET /api/users/:username
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's posts
        const posts = await Post.find({ author: user._id, published: true })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
    try {
        const { username, bio, avatar, socialLinks } = req.body;
        const user = await User.findById(req.user._id);

        if (username && username !== user.username) {
            const existing = await User.findOne({ username });
            if (existing) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;
        if (socialLinks) {
            user.socialLinks = { ...user.socialLinks.toObject(), ...socialLinks };
        }

        await user.save();
        res.json(user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getUserProfile, updateProfile };
