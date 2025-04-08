const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Initialize Express
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many requests, try again later'
});
app.use('/api/auth', authLimiter);

// Database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Simple query to verify DB connection
    const noteCount = await mongoose.model('Note').estimatedDocumentCount();
    res.json({ 
      status: 'OK',
      database: 'connected',
      noteCount,
      timestamp: new Date() 
    });
  } catch (err) {
    res.status(500).json({
      status: 'DB_ERROR',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Error handling
app.use((req, res, next) => {
  res.apiSuccess = (data, message = '') => {
    res.json({
      success: true,
      data,
      message
    });
  };
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});