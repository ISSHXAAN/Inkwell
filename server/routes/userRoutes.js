const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:username', getUserProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
