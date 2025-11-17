const crypto = require('crypto');
const { logger } = require('./errorHandler');

/**
 * Add unique request ID for tracking and security monitoring
 */
const addRequestId = (req, res, next) => {
  // Generate or use existing request ID
  req.id = req.headers['x-request-id'] || crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.id);
  
  // Add to logger context
  req.logContext = {
    requestId: req.id,
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent']
  };
  
  next();
};

/**
 * Force HTTPS in production environment
 */
const requireHTTPS = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Check if request is over HTTPS
    // In production behind proxy (Heroku, AWS, etc.), trust proxy headers
    const isSecure = req.secure || 
                     req.headers['x-forwarded-proto'] === 'https' ||
                     req.headers['x-forwarded-ssl'] === 'on';
    
    if (!isSecure) {
      // Allow health checks over HTTP to avoid platform restarts
      if (req.path === '/api/health' || req.path === '/') {
        return next();
      }
      logger.warn(`HTTP request blocked (requires HTTPS): ${req.method} ${req.path} [Request ID: ${req.id}]`);
      return res.status(403).json({
        success: false,
        message: 'Please use HTTPS to access this API'
      });
    }
  }
  next();
};

/**
 * Add security headers middleware
 */
const addSecurityHeaders = (req, res, next) => {
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

/**
 * Sanitize request ID for logging (remove sensitive data from headers)
 */
const sanitizeRequestForLogging = (req) => {
  const sanitized = { ...req };
  
  // Remove sensitive headers from logging
  if (sanitized.headers) {
    const headers = { ...sanitized.headers };
    delete headers.authorization;
    delete headers.cookie;
    delete headers['x-api-key'];
    sanitized.headers = headers;
  }
  
  // Remove sensitive body fields
  if (sanitized.body) {
    const body = { ...sanitized.body };
    delete body.password;
    delete body.currentPassword;
    delete body.newPassword;
    sanitized.body = body;
  }
  
  return sanitized;
};

/**
 * Production environment checker
 */
const checkProductionConfig = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    // Ensure critical environment variables are set
    const requiredVars = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      logger.error(`Missing required environment variables in production: ${missing.join(', ')}`);
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. Please contact support.'
      });
    }
  }
  next();
};

/**
 * CSRF Protection - Double Submit Cookie Pattern
 * Generates CSRF token and validates it on state-changing requests
 * Note: Only enabled in production environment
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF in development for easier testing
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Only apply to state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (!stateChangingMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF for public endpoints, analytics, and OAuth callback
  const publicEndpoints = [
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/google', 
    '/api/auth/google/callback',
    '/api/auth/oauth/exchange', // OAuth code exchange
    '/api/blogs/',
    '/api/health'
  ];
  
  // Check if path starts with any public endpoint
  if (publicEndpoints.some(endpoint => {
    // For /api/blogs/, check if it's a view tracking or analytics endpoint
    if (endpoint === '/api/blogs/' && req.path.includes('/track-view')) {
      return true;
    }
    return req.path.startsWith(endpoint);
  })) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['_csrf'];

  if (!token || !cookieToken || token !== cookieToken) {
    logger.warn(`CSRF validation failed: ${req.method} ${req.path} [Request ID: ${req.id}]`);
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * Generate CSRF token
 */
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  requireHTTPS,
  addSecurityHeaders,
  sanitizeRequestForLogging,
  checkProductionConfig,
  addRequestId,
  csrfProtection,
  generateCSRFToken
};

