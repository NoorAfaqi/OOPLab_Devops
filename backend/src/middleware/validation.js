// Product validation rules (only what's actually used)
const validateProduct = (req, res, next) => {
  const { NAME, P_URL, DESCRIPTION, LOGO, features } = req.body;
  const errors = [];

  // Validate product name
  if (!NAME || typeof NAME !== 'string' || NAME.trim().length < 3) {
    errors.push('Product name must be at least 3 characters long');
  }

  // Validate product URL
  if (!P_URL || typeof P_URL !== 'string') {
    errors.push('Product URL is required');
  } else {
    try {
      new URL(P_URL);
    } catch {
      errors.push('Product URL must be a valid URL');
    }
  }

  // Validate description
  if (!DESCRIPTION || typeof DESCRIPTION !== 'string' || DESCRIPTION.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  // Validate logo URL (optional)
  if (LOGO && typeof LOGO === 'string') {
    try {
      new URL(LOGO);
    } catch {
      errors.push('Logo must be a valid URL');
    }
  }

  // Validate features (optional)
  if (features && !Array.isArray(features)) {
    errors.push('Features must be an array');
  } else if (features && Array.isArray(features)) {
    features.forEach((feature, index) => {
      if (!feature.DESCRIPTION || typeof feature.DESCRIPTION !== 'string' || feature.DESCRIPTION.trim().length < 3) {
        errors.push(`Feature ${index + 1} description must be at least 3 characters long`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Blog ID parameter validation
const validateBlogId = (req, res, next) => {
  const { blogId } = req.params;

  if (!blogId || isNaN(parseInt(blogId)) || parseInt(blogId) < 1) {
    return res.status(400).json({
      success: false,
      message: 'Blog ID must be a positive integer'
    });
  }

  next();
};

// Comment ID parameter validation
const validateCommentId = (req, res, next) => {
  const { commentId } = req.params;
  
  if (!commentId || isNaN(parseInt(commentId)) || parseInt(commentId) < 1) {
    return res.status(400).json({
      success: false,
      message: 'Comment ID must be a positive integer'
    });
  }

  next();
};

// ID parameter validation
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
    return res.status(400).json({
      success: false,
      message: 'ID must be a positive integer'
    });
  }

  next();
};

// User registration validation
const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, email, username, password, dateOfBirth, nationality, phoneNumber, profilePicture } = req.body;
  const errors = [];

  // Validate first name
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  // Validate last name
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long');
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email address');
    }
  }

  // Validate username
  if (!username || typeof username !== 'string') {
    errors.push('Username is required');
  } else {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    } else if (username.length < 3 || username.length > 50) {
      errors.push('Username must be between 3 and 50 characters long');
    }
  }

  // Validate password - Strong password requirements
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Validate date of birth (optional)
  if (dateOfBirth && typeof dateOfBirth === 'string') {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      errors.push('Date of birth must be a valid date');
    } else if (date > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }
  }

  // Validate nationality (optional)
  if (nationality && typeof nationality !== 'string') {
    errors.push('Nationality must be a string');
  }

  // Validate phone number (optional)
  if (phoneNumber && typeof phoneNumber !== 'string') {
    errors.push('Phone number must be a string');
  }

  // Validate profile picture URL (optional)
  if (profilePicture && typeof profilePicture === 'string') {
    try {
      new URL(profilePicture);
    } catch {
      errors.push('Profile picture must be a valid URL');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// User login validation
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Please provide a valid email address');
    }
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// User profile update validation
const validateUserUpdate = (req, res, next) => {
  const { firstName, lastName, username, dateOfBirth, nationality, phoneNumber, profilePicture } = req.body;
  const errors = [];

  // Validate first name (optional)
  if (firstName && (typeof firstName !== 'string' || firstName.trim().length < 2)) {
    errors.push('First name must be at least 2 characters long');
  }

  // Validate last name (optional)
  if (lastName && (typeof lastName !== 'string' || lastName.trim().length < 2)) {
    errors.push('Last name must be at least 2 characters long');
  }

  // Validate username (optional)
  if (username && typeof username === 'string') {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    } else if (username.length < 3 || username.length > 50) {
      errors.push('Username must be between 3 and 50 characters long');
    }
  }

  // Validate date of birth (optional)
  if (dateOfBirth && typeof dateOfBirth === 'string') {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      errors.push('Date of birth must be a valid date');
    } else if (date > new Date()) {
      errors.push('Date of birth cannot be in the future');
    }
  }

  // Validate nationality (optional)
  if (nationality && typeof nationality !== 'string') {
    errors.push('Nationality must be a string');
  }

  // Validate phone number (optional)
  if (phoneNumber && typeof phoneNumber !== 'string') {
    errors.push('Phone number must be a string');
  }

  // Validate profile picture URL (optional)
  if (profilePicture && typeof profilePicture === 'string') {
    try {
      new URL(profilePicture);
    } catch {
      errors.push('Profile picture must be a valid URL');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Change password validation
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  // Validate current password
  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.push('Current password is required');
  }

  // Validate new password - Strong password requirements
  if (!newPassword || typeof newPassword !== 'string') {
    errors.push('New password is required');
  } else if (newPassword.length < 8) {
    errors.push('New password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(newPassword)) {
    errors.push('New password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(newPassword)) {
    errors.push('New password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(newPassword)) {
    errors.push('New password must contain at least one number');
  }

  // Check if passwords are different
  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Blog validation
const validateBlog = (req, res, next) => {
  const { title, content, coverImage, published } = req.body;
  const errors = [];

  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  } else if (title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  // Validate content with strict limits
  if (!content || typeof content !== 'string' || content.trim().length < 10) {
    errors.push('Content must be at least 10 characters long');
  } else if (content.length > 100000) { // Max 100KB per blog content
    errors.push('Content exceeds maximum length of 100KB');
  }

  // Validate cover image URL (optional)
  if (coverImage && typeof coverImage === 'string') {
    try {
      new URL(coverImage);
    } catch {
      errors.push('Cover image must be a valid URL');
    }
  }

  // Validate published status (optional)
  if (published !== undefined && typeof published !== 'boolean') {
    errors.push('Published must be a boolean value');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Comment validation
const validateComment = (req, res, next) => {
  const { content, parentId } = req.body;
  const errors = [];

  // Validate content with strict limits
  if (!content || typeof content !== 'string' || content.trim().length < 1) {
    errors.push('Comment content is required');
  } else if (content.length > 5000) { // Increased but still safe limit
    errors.push('Comment must be less than 5000 characters');
  }

  // Validate parent ID (optional)
  if (parentId && (isNaN(parseInt(parentId)) || parseInt(parentId) < 1)) {
    errors.push('Parent ID must be a positive integer');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Username validation
const validateUsername = (req, res, next) => {
  const { username } = req.params;
  
  if (!username || typeof username !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Username is required'
    });
  }

  // Check if username contains only alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: 'Username can only contain letters, numbers, and underscores'
    });
  }

  next();
};

// Slug validation
const validateSlug = (req, res, next) => {
  const { slug } = req.params;
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Slug is required'
    });
  }

  // Check if slug contains only alphanumeric characters and hyphens
  const slugRegex = /^[a-z0-9-]+$/i;
  if (!slugRegex.test(slug)) {
    return res.status(400).json({
      success: false,
      message: 'Slug can only contain letters, numbers, and hyphens'
    });
  }

  next();
};

module.exports = {
  validateProduct,
  validateId,
  validateBlogId,
  validateCommentId,
  validateUsername,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateChangePassword,
  validateBlog,
  validateComment,
  validateSlug
};
