const express = require('express');
const router = express.Router();
const {
    getPosts, getFeaturedPosts, getPost, createPost,
    updatePost, deletePost, toggleLike, toggleBookmark, getAllTags
} = require('../controllers/postController');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, getPosts);
router.get('/featured', getFeaturedPosts);
router.get('/tags', getAllTags);
router.get('/:slug', optionalAuth, getPost);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

// Comment routes (nested under posts)
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', protect, addComment);

module.exports = router;
