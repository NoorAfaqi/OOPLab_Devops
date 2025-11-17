const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../models');
const config = require('../config');
const { logger } = require('./errorHandler');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret
}, async (payload, done) => {
  try {
    if (!payload.id) {
      logger.debug('JWT Strategy - No user ID in payload');
      return done(null, false);
    }
    
    const user = await User.findByPk(payload.id);
    
    if (user && user.isActive) {
      logger.debug(`JWT Strategy - Authentication successful for user ${user.id}`);
      return done(null, user);
    }
    
    logger.debug('JWT Strategy - user not found or inactive');
    return done(null, false);
  } catch (error) {
    logger.error('JWT Strategy error:', error);
    return done(error, false);
  }
}));

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (user) {
        // Update last login
        await user.update({ lastLogin: new Date() });
        return done(null, user);
      }

      // Check if user exists with same email
      user = await User.findOne({ where: { email: profile.emails[0].value } });
      
      if (user) {
        // Link Google account to existing user
        await user.update({ 
          googleId: profile.id,
          profilePicture: profile.photos[0]?.value,
          lastLogin: new Date()
        });
        return done(null, user);
      }

      // Create new user
      const baseUsername = `${profile.name.givenName.toLowerCase()}${profile.name.familyName.toLowerCase()}`;
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        username: username,
        googleId: profile.id,
        profilePicture: profile.photos[0]?.value,
        isEmailVerified: true, // Google emails are verified
        lastLogin: new Date()
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
} else {
  logger.info('⚠️  Google OAuth credentials not found. Google OAuth will be disabled.');
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user'
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Authentication middleware
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      logger.error('Authentication error:', err);
      return next(err);
    }
    
    if (!user) {
      logger.debug('Authentication failed - no user found');
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please log in again.'
      });
    }
    
    // Fetch fresh user data from database to include role
    User.findByPk(user.id).then(freshUser => {
      if (freshUser && freshUser.isActive) {
        req.user = freshUser; // Use fresh user data with role
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. User not found or inactive.'
        });
      }
    }).catch(error => {
      logger.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    });
  })(req, res, next);
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    req.user = user; // Set user if token is valid, otherwise undefined
    next();
  })(req, res, next);
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Check if user has one of the required roles
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Check if user owns resource or is admin
const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user.id === parseInt(resourceUserId) || req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own resources.'
  });
};

module.exports = {
  passport,
  generateToken,
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwnerOrAdmin,
  adminOnly
};
