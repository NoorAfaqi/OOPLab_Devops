const express = require('express');
const router = express.Router();
const passport = require('passport');
const { strictAuthLimiter, strictRegisterLimiter } = require('../middleware');
const {
  register,
  login,
  googleCallback,
  exchangeOAuthCode,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  deactivateAccount,
  getUserStats
} = require('../controllers/userController');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateChangePassword,
  validateId
} = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

// Base auth route - show available endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OOP Lab Authentication API',
    version: '1.0.0',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      google: 'GET /api/auth/google',
      profile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile',
      changePassword: 'POST /api/auth/change-password',
      deactivate: 'POST /api/auth/deactivate',
      users: 'GET /api/auth/users (admin only)',
      userById: 'GET /api/auth/users/:id (admin only)'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Public routes
// POST /api/auth/register - Register new user (strict rate limiting)
router.post('/register', strictRegisterLimiter, validateUserRegistration, register);

// POST /api/auth/login - Login user (strict rate limiting)
router.post('/login', strictAuthLimiter, validateUserLogin, login);

// POST /api/auth/oauth/exchange - Exchange OAuth session code for token (secure)
router.post('/oauth/exchange', exchangeOAuthCode);

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // GET /api/auth/google - Initiate Google OAuth
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // GET /api/auth/google/callback - Google OAuth callback
  router.get('/google/callback', 
    passport.authenticate('google', { session: false }),
    googleCallback
  );
} else {
  // Fallback routes when Google OAuth is not configured
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured.'
    });
  });
}

// Protected routes (require authentication)
// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile - Update current user profile
router.put('/profile', authenticate, validateUserUpdate, updateProfile);

// POST /api/auth/change-password - Change password
router.post('/change-password', authenticate, validateChangePassword, changePassword);

// POST /api/auth/deactivate - Deactivate account
router.post('/deactivate', authenticate, deactivateAccount);

// Admin routes (require authentication and admin role)
// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), getAllUsers);

// GET /api/auth/users/stats - Get user statistics (admin only)
router.get('/users/stats', authenticate, authorize('admin'), getUserStats);

// GET /api/auth/users/:id - Get user by ID (admin only)
router.get('/users/:id', authenticate, authorize('admin'), validateId, getUserById);

module.exports = router;
