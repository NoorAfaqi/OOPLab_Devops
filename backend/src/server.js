const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { logger } = require('./middleware/errorHandler');

// Log environment setup (safe information only)
logger.info('Environment setup initialized');
if (process.env.NODE_ENV !== 'production') {
  logger.debug(`Server starting in ${process.env.NODE_ENV || 'development'} mode`);
}

const config = require('./config');
const { testConnection } = require('./config/database');
const { setupMiddleware } = require('./middleware');
const { passport } = require('./middleware/auth');
const { requireHTTPS, addSecurityHeaders, checkProductionConfig, addRequestId, csrfProtection, generateCSRFToken } = require('./middleware/security');
const cookieParser = require('cookie-parser');
const { initRedis, isRedisAvailable } = require('./config/redis');
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const blogsRoutes = require('./routes/blogs');
const subscribersRoutes = require('./routes/subscribers');
const contactRoutes = require('./routes/contact');

// Create Express app
const app = express();
app.set('trust proxy', 1);

// Create logs directory if it doesn't exist (asynchronous for better performance)
const logsDir = path.join(__dirname, '..', 'logs');
fs.mkdir(logsDir, { recursive: true }, (err) => {
  if (err) {
    logger.error('Error creating logs directory:', err);
  }
});

// Test database connection
testConnection();

// Initialize Redis (gracefully falls back if not available)
initRedis().then(() => {
  if (isRedisAvailable) {
    logger.info('Redis enabled for distributed sessions');
  } else {
    logger.info('Using in-memory session storage (single instance only)');
  }
}).catch(error => {
  logger.error('Redis initialization failed, using fallback:', error);
});

// Setup middleware
setupMiddleware(app);

// Add cookie parser for CSRF tokens
app.use(cookieParser());

// Add request ID for tracking
app.use(addRequestId);

// Production security checks
app.use(checkProductionConfig);

// Add custom security headers
app.use(addSecurityHeaders);

// Force HTTPS in production
app.use(requireHTTPS);

// Add CSRF protection to state-changing methods (middleware order important)
app.use(csrfProtection);

// Initialize Passport
app.use(passport.initialize());

// API routes
app.use('/api/products', productsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/contact', contactRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OOP Lab Products API Server',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      blogs: '/api/blogs',
      subscribers: '/api/subscribers',
      contact: '/api/contact',
      health: '/api/health'
    },
    features: {
      redis: isRedisAvailable,
      csrf: true,
      requestTracking: true
    }
  });
});

// CSRF token endpoint (for frontend to get CSRF token)
app.get('/api/csrf-token', (req, res) => {
  const token = generateCSRFToken();
  res.cookie('_csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  res.json({
    success: true,
    csrfToken: token,
    message: 'CSRF token generated. Include X-CSRF-Token header in subsequent requests.'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    redis: isRedisAvailable ? 'connected' : 'not available',
    features: {
      csrf: true,
      requestTracking: true,
      rateLimit: true
    }
  });
});

// Error handling middleware (must be last)
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`
🚀 OOP Lab Products API Server Started!
📍 Server running on port ${PORT}
🌍 Environment: ${config.nodeEnv}
  `);
  
  if (config.nodeEnv === 'production') {
    logger.info('✅ Production mode: Enhanced security enabled');
  } else {
    logger.info(`📦 API: http://localhost:${PORT}/api`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
