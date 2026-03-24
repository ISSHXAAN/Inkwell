const Post = require('../models/Post');

// @desc    Get all posts with pagination, search, and filters
// @route   GET /api/posts
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;

        // Build filter query
        let filter = { published: true };

        // Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Tag filter
        if (req.query.tag) {
            filter.tags = { $in: [req.query.tag.toLowerCase()] };
        }

        // Search
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        const total = await Post.countDocuments(filter);
        const posts = await Post.find(filter)
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            posts,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get featured posts
// @route   GET /api/posts/featured
const getFeaturedPosts = async (req, res) => {
    try {
        const posts = await Post.find({ featured: true, published: true })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single post by slug
// @route   GET /api/posts/:slug
const getPost = async (req, res) => {
    try {
        const post = await Post.findOne({ slug: req.params.slug, published: true })
            .populate('author', 'username avatar bio socialLinks');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, coverImage, featured } = req.body;

        const post = await Post.create({
            title,
            content,
            excerpt,
            category,
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            coverImage: coverImage || '',
            featured: featured || false,
            author: req.user._id
        });

        const populated = await Post.findById(post._id).populate('author', 'username avatar');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create post error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
const updatePost = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check ownership
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const { title, content, excerpt, category, tags, coverImage, featured, published } = req.body;

        post.title = title || post.title;
        post.content = content || post.content;
        post.excerpt = excerpt || post.excerpt;
        post.category = category || post.category;
        post.coverImage = coverImage !== undefined ? coverImage : post.coverImage;
        post.featured = featured !== undefined ? featured : post.featured;
        post.published = published !== undefined ? published : post.published;

        if (tags) {
            post.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }

        await post.save();
        const populated = await Post.findById(post._id).populate('author', 'username avatar');

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user._id;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json({ likes: post.likes.length, liked: index === -1 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Toggle bookmark on a post
// @route   POST /api/posts/:id/bookmark
const toggleBookmark = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user._id;
        const index = post.bookmarks.indexOf(userId);

        if (index === -1) {
            post.bookmarks.push(userId);
        } else {
            post.bookmarks.splice(index, 1);
        }

        await post.save();
        res.json({ bookmarked: index === -1 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all unique tags
// @route   GET /api/posts/tags
const getAllTags = async (req, res) => {
    try {
        const tags = await Post.distinct('tags', { published: true });
        res.json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPosts, getFeaturedPosts, getPost, createPost,
    updatePost, deletePost, toggleLike, toggleBookmark, getAllTags
};
