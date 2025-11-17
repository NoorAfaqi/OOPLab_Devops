const express = require('express');
const router = express.Router();
const { blogCreationLimiter } = require('../middleware');
const {
  getAllBlogs,
  getBlogByUsernameAndSlug,
  getBlogsByUsername,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogLike,
  getRandomBlogs
} = require('../controllers/blogController');
const {
  getBlogComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentById
} = require('../controllers/commentController');
const {
  trackBlogView,
  getBlogAnalytics,
  getUserBlogsAnalytics,
  getAdminBlogAnalytics,
  getAdminTrends
} = require('../controllers/analyticsController');
const {
  validateBlog,
  validateComment,
  validateId,
  validateBlogId,
  validateCommentId,
  validateUsername,
  validateSlug
} = require('../middleware/validation');
const { authenticate, optionalAuth, adminOnly } = require('../middleware/auth');

// Base blogs route - show available endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OOP Lab Blogs API',
    version: '1.0.0',
    endpoints: {
      getAllBlogs: 'GET /api/blogs/list',
      getRandomBlogs: 'GET /api/blogs/random',
      getBlogsByUsername: 'GET /api/blogs/:username',
      getBlogByUsernameAndSlug: 'GET /api/blogs/:username/:slug',
      getBlogById: 'GET /api/blogs/id/:id',
      createBlog: 'POST /api/blogs (authenticated)',
      updateBlog: 'PUT /api/blogs/:id (authenticated, author only)',
      deleteBlog: 'DELETE /api/blogs/:id (authenticated, author only)',
      toggleBlogLike: 'POST /api/blogs/:id/like (authenticated)',
      getBlogComments: 'GET /api/blogs/:blogId/comments',
      createComment: 'POST /api/blogs/:blogId/comments (authenticated)',
      updateComment: 'PUT /api/blogs/comments/:commentId (authenticated, author only)',
      deleteComment: 'DELETE /api/blogs/comments/:commentId (authenticated, author only)',
      getCommentById: 'GET /api/blogs/comments/:commentId',
      trackBlogView: 'POST /api/blogs/:blogId/track-view',
      getBlogAnalytics: 'GET /api/blogs/:blogId/analytics (authenticated, author only)',
      getUserBlogsAnalytics: 'GET /api/blogs/analytics/user (authenticated)'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Public routes (no authentication required)
// GET /api/blogs/list - Get all published blogs with pagination, search, sorting
router.get('/list', getAllBlogs);

// GET /api/blogs/random - Get random blogs - MUST come before any parameterized routes
router.get('/random', getRandomBlogs);

// GET /api/blogs/comments/:commentId - Get comment by ID - MUST come before /:blogId/comments
router.get('/comments/:commentId', validateCommentId, optionalAuth, getCommentById);

// GET /api/blogs/id/:id - Get blog by ID (for admin/author use) - MUST come before /:username/:slug
router.get('/id/:id', validateId, optionalAuth, getBlogById);

// Analytics routes - MUST come before /:username routes to avoid conflicts
// GET /api/blogs/analytics - Get admin analytics for all blogs (admin only)
router.get('/analytics', authenticate, adminOnly, getAdminBlogAnalytics);

// GET /api/blogs/analytics/trends - Get historical trends data (admin only)
router.get('/analytics/trends', authenticate, adminOnly, getAdminTrends);

// GET /api/blogs/analytics/user - Get analytics for all user's blogs (authenticated)
router.get('/analytics/user', authenticate, getUserBlogsAnalytics);

// GET /api/blogs/:blogId/comments - Get comments for a blog
router.get('/:blogId/comments', validateBlogId, optionalAuth, getBlogComments);

// GET /api/blogs/:blogId/analytics - Get analytics for specific blog (authenticated, author only)
// IMPORTANT: This route must come BEFORE /:username to avoid route conflicts
router.get('/:blogId/analytics', authenticate, validateBlogId, getBlogAnalytics);

// POST /api/blogs/:blogId/track-view - Track a blog view (public) - MUST come before /:username
router.post('/:blogId/track-view', validateBlogId, trackBlogView);

// GET /api/blogs/:username - Get all blogs by username - MUST come before /:username/:slug
router.get('/:username', validateUsername, optionalAuth, getBlogsByUsername);

// GET /api/blogs/:username/:slug - Get blog by username and slug (for SSR URL structure) - MUST come last
router.get('/:username/:slug', validateSlug, optionalAuth, getBlogByUsernameAndSlug);

// Protected routes (require authentication)
// POST /api/blogs - Create new blog (rate limited)
router.post('/', authenticate, blogCreationLimiter, validateBlog, createBlog);

// POST /api/blogs/:blogId/comments - Create comment (MUST come before /:id/like)
router.post('/:blogId/comments', authenticate, validateBlogId, validateComment, createComment);

// POST /api/blogs/:id/like - Like/Unlike blog
router.post('/:id/like', authenticate, validateId, toggleBlogLike);

// PUT /api/blogs/comments/:commentId - Update comment (author only) - MUST come before /:id
router.put('/comments/:commentId', authenticate, validateCommentId, validateComment, updateComment);

// DELETE /api/blogs/comments/:commentId - Delete comment (author only) - MUST come before /:id
router.delete('/comments/:commentId', authenticate, validateCommentId, deleteComment);

// PUT /api/blogs/:id - Update blog (author only)
router.put('/:id', authenticate, validateId, validateBlog, updateBlog);

// DELETE /api/blogs/:id - Delete blog (author only)
router.delete('/:id', authenticate, validateId, deleteBlog);


module.exports = router;
