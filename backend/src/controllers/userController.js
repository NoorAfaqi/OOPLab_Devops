const { User } = require('../models');
const { logger } = require('../middleware/errorHandler');
const { generateToken, authenticate } = require('../middleware/auth');
const { Op } = require('sequelize');

// Register new user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, dateOfBirth, nationality, phoneNumber, profilePicture } = req.body;

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or try logging in.'
      });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findOne({ where: { username } });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.'
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      password,
      dateOfBirth,
      nationality,
      phoneNumber,
      profilePicture
    });

    // Generate token
    const token = generateToken(user);

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('User registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    logger.error('User login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Exchange OAuth session code for token (secure token exchange)
const exchangeOAuthCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Session code is required'
      });
    }

    // Try to get session from Redis first
    let session = null;
    try {
      const { getOAuthSession } = require('../config/redis');
      session = await getOAuthSession(code);
    } catch (redisError) {
      logger.debug('Redis not available, trying in-memory storage');
    }

    // Fallback to in-memory storage if Redis failed
    if (!session) {
      session = req.app.locals?.oauthSessions?.[code];
    }

    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired session code'
      });
    }

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      // Clean up expired session
      try {
        const { deleteOAuthSession } = require('../config/redis');
        await deleteOAuthSession(code);
      } catch (redisError) {
        if (req.app.locals?.oauthSessions) {
          delete req.app.locals.oauthSessions[code];
        }
      }
      
      return res.status(400).json({
        success: false,
        message: 'Session code has expired'
      });
    }

    // Get token and user data
    const { token, user } = session;

    // Delete used session code (one-time use only)
    try {
      const { deleteOAuthSession } = require('../config/redis');
      await deleteOAuthSession(code);
    } catch (redisError) {
      if (req.app.locals?.oauthSessions) {
        delete req.app.locals.oauthSessions[code];
      }
    }

    logger.info(`OAuth session code exchanged for user: ${user.email} [Request ID: ${req.id}]`);

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Exchange OAuth code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to exchange session code',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Google OAuth callback - Using secure session storage instead of URL parameters
const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = generateToken(user);

    logger.info(`Google OAuth login: ${user.email}`);

    // Create a one-time session code (secure alternative to passing token in URL)
    const sessionCode = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60000; // 1 minute expiry
    
    const sessionData = {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture
      },
      expiresAt
    };

    // Try Redis first, fallback to in-memory
    try {
      const { storeOAuthSession } = require('../config/redis');
      await storeOAuthSession(sessionCode, sessionData, 60000);
      logger.debug('OAuth session stored in Redis');
    } catch (redisError) {
      // Fallback to in-memory storage
      req.app.locals = req.app.locals || {};
      req.app.locals.oauthSessions = req.app.locals.oauthSessions || {};
      req.app.locals.oauthSessions[sessionCode] = sessionData;
      logger.debug('OAuth session stored in memory (Redis not available)');
    }

    // Redirect to frontend with secure session code (not the actual token)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/google/callback?code=${sessionCode}`);
  } catch (error) {
    logger.error('Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/signin?error=google_auth_failed`);
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // Get fresh user data from database to ensure role is included
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, username, dateOfBirth, nationality, phoneNumber, profilePicture } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and already exists
    if (username && username !== user.username) {
      const existingUserByUsername = await User.findOne({ 
        where: { username, id: { [Op.ne]: userId } } 
      });
      
      if (existingUserByUsername) {
        return res.status(400).json({
          success: false,
          message: 'Update failed. Please try again or contact support.'
        });
      }
    }

    // Update user
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      username: username || user.username,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      nationality: nationality || user.nationality,
      phoneNumber: phoneNumber || user.phoneNumber,
      profilePicture: profilePicture || user.profilePicture
    });

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await user.update({ password: newPassword });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] } // Exclude password from results
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Deactivate user account
const deactivateAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: false });

    logger.info(`Account deactivated: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    logger.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate account',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const now = new Date();
    
    // Calculate date ranges
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);
    
    // Calculate previous period for comparison (30 days ago)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users (current and previous)
    const total = await User.count();
    const previousTotal = await User.count({
      where: {
        createdAt: {
          [Op.lt]: thirtyDaysAgo
        }
      }
    });

    // Get new users by period
    const newToday = await User.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    const newThisWeek = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thisWeek
        }
      }
    });

    const newThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thisMonth
        }
      }
    });

    const newThisYear = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thisYear
        }
      }
    });

    // Calculate total visits (sum of lastLogin counts or use a separate tracking)
    // For now, we'll count users who have logged in at least once
    const totalVisits = await User.count({
      where: {
        lastLogin: {
          [Op.ne]: null
        }
      }
    });

    // Calculate percentage change for total users
    const totalChange = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

    const stats = {
      total,
      newToday,
      newThisWeek,
      newThisMonth,
      newThisYear,
      totalVisits,
      changes: {
        total: {
          current: total,
          previous: previousTotal,
          change: totalChange,
          period: 'last 30 days'
        }
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
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
};
