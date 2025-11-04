const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('./config/passport');
const errorMiddleware = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logRequest(req, res, duration);
  });
  next();
});

// Initialize passport
app.use(passport.initialize());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Ping test route (Milestone 1 requirement)
app.get('/ping', (req, res) => {
  res.status(200).send('Server OK');
});

// API routes
app.use('/api/auth', authRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Meeting Room Management API - Milestone 1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth'
    },
    note: 'Room API will be available in Milestone 2'
  });
});

// 404 handler
app.use(errorMiddleware.notFound);

// Global error handler
app.use(errorMiddleware.errorHandler);

module.exports = app;

