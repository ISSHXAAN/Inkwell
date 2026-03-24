const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
const createCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const category = await Category.create({ name, description, color });
        res.status(201).json(category);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getCategories, createCategory };
