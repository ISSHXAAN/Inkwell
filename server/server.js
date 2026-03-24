const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const sanitize = require('./middleware/sanitize');
const { generalLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
    origin: true,
    credentials: true
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Sanitize inputs
app.use(sanitize);

// Rate limiting
app.use('/api/', generalLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subscribe', subscriberRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend for all other routes (SPA)
app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ message: err.message });
    }

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    // Get local IP address for phone access
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = 'localhost';
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                localIP = iface.address;
                break;
            }
        }
    }
    console.log(`Server running on:`);
    console.log(`  → Local:   http://localhost:${PORT}`);
    console.log(`  → Network: http://${localIP}:${PORT}  (use this on your phone)`);
});
