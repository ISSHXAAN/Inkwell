const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// @desc    Upload an image
// @route   POST /api/upload
router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed' });
    }
});

module.exports = router;
