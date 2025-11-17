const { Comment, Blog, User } = require('../models');
const { logger } = require('../middleware/errorHandler');

// Get comments for a blog
const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user ? req.user.id : null;

    const offset = (page - 1) * limit;

    // Check if blog exists
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user can view comments for unpublished blog
    if (!blog.published && (!userId || userId !== blog.authorId)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot view comments for unpublished blog'
      });
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { 
        blogId,
        parentId: null // Only top-level comments
      },
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        comments,
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
    logger.error('Get blog comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create comment (authenticated users only)
const createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user.id;

    // Check if blog exists and is published
    const blog = await Blog.findByPk(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (!blog.published) {
      return res.status(403).json({
        success: false,
        message: 'Cannot comment on unpublished blog'
      });
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment || parentComment.blogId !== parseInt(blogId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    const comment = await Comment.create({
      blogId: parseInt(blogId),
      userId,
      content,
      parentId: parentId ? parseInt(parentId) : null
    });

    // Fetch the created comment with author info
    const createdComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
            }
          ]
        }
      ]
    });

    logger.info(`New comment created on blog ${blogId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment: createdComment }
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update comment (only by author)
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own comments.'
      });
    }

    await comment.update({ content });

    logger.info(`Comment updated: ${commentId} by user ${userId}`);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete comment (only by author)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own comments.'
      });
    }

    await comment.destroy();

    logger.info(`Comment deleted: ${commentId} by user ${userId}`);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get comment by ID
const getCommentById = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Blog,
          as: 'blog',
          attributes: ['id', 'title', 'slug', 'published']
        },
        {
          model: Comment,
          as: 'parent',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
            }
          ]
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
            }
          ]
        }
      ]
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if blog is published (unless user is author)
    if (!comment.blog.published && (!req.user || req.user.id !== comment.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Blog is not published.'
      });
    }

    res.json({
      success: true,
      data: { comment }
    });
  } catch (error) {
    logger.error('Get comment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getBlogComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentById
};
