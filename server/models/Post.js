const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters']
    },
    coverImage: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    readTime: {
        type: Number,
        default: 1
    },
    featured: {
        type: Boolean,
        default: false
    },
    published: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for comment count
postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'post',
    count: true
});

// Generate slug before saving
postSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        // Add timestamp to ensure uniqueness
        this.slug += '-' + Date.now().toString(36);
    }
    // Calculate read time (average 200 words per minute)
    if (this.isModified('content')) {
        const text = this.content.replace(/<[^>]*>/g, '');
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    // Generate excerpt if not provided
    if (this.isModified('content') && !this.excerpt) {
        const text = this.content.replace(/<[^>]*>/g, '');
        this.excerpt = text.substring(0, 200).trim() + (text.length > 200 ? '...' : '');
    }

});

// Index for search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ slug: 1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1 });

module.exports = mongoose.model('Post', postSchema);
