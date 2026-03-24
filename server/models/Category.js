const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#6366f1'
    }
}, {
    timestamps: true
});

categorySchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
});

module.exports = mongoose.model('Category', categorySchema);
