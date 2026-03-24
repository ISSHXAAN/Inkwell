const Comment = require('../models/Comment');

// @desc    Get comments for a post (with nested replies)
// @route   GET /api/posts/:postId/comments
const getComments = async (req, res) => {
    try {
        // Get top-level comments
        const comments = await Comment.find({
            post: req.params.postId,
            parentComment: null
        })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .lean();

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('author', 'username avatar')
                    .sort({ createdAt: 1 })
                    .lean();
                return { ...comment, replies };
            })
        );

        res.json(commentsWithReplies);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add a comment
// @route   POST /api/posts/:postId/comments
const addComment = async (req, res) => {
    try {
        const { content, parentComment } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const comment = await Comment.create({
            content: content.trim(),
            author: req.user._id,
            post: req.params.postId,
            parentComment: parentComment || null
        });

        const populated = await Comment.findById(comment._id)
            .populate('author', 'username avatar');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Delete replies as well
        await Comment.deleteMany({ parentComment: comment._id });
        await Comment.findByIdAndDelete(req.params.id);

        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getComments, addComment, deleteComment };
