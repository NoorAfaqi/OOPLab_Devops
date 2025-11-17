const { Blog, User, Comment, BlogLike } = require('../models');
const { sequelize } = require('../models');
const { logger } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const { parsePagination, parseSortParams } = require('../utils/pagination');

// Helper function to generate unique slug
const generateUniqueSlug = async (title, authorId, excludeId = null) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const whereClause = { slug };
    if (excludeId) {
      whereClause.id = { [Op.ne]: excludeId };
    }

    const existingBlog = await Blog.findOne({ where: whereClause });
    if (!existingBlog) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// Get all published blogs with pagination, search, and sorting
const getAllBlogs = async (req, res) => {
  try {
    const {
      search,
      authorId
    } = req.body;

    // Safe pagination with DoS protection
    const { page, limit, offset } = parsePagination(req.query.page, req.query.limit, {
      maxLimit: 50, // Max 50 blogs per request
      defaultLimit: 10
    });

    // Safe sort parameters
    const allowedSortFields = ['createdAt', 'updatedAt', 'title'];
    const { sortBy, sortOrder } = parseSortParams(
      req.query.sortBy || 'createdAt',
      req.query.sortOrder || 'DESC',
      allowedSortFields
    );
    const whereClause = { published: true };

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter by author
    if (authorId) {
      whereClause.authorId = authorId;
    }

    // Get blogs with associations (optimized single query)
    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'content', 'authorId', 'coverImage', 'published', 'createdAt', 'updatedAt'],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'], // We only need count
          duplicating: false // Optimize query
        },
        {
          model: BlogLike,
          as: 'likes',
          attributes: ['id'], // We only need count
          duplicating: false // Optimize query
        }
      ]
    });

    // Process blogs with counts (data already loaded)
    const blogsWithAuthors = blogs.map(blog => {
      const blogData = blog.toJSON();
      return {
        ...blogData,
        commentCount: blogData.comments?.length || 0,
        likeCount: blogData.likes?.length || 0,
        comments: undefined, // Remove full arrays
        likes: undefined // Remove full arrays
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        blogs: blogsWithAuthors,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all blogs by username
const getBlogsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const { search } = req.query;

    // Safe pagination with DoS protection
    const { page, limit, offset } = parsePagination(req.query.page, req.query.limit, {
      maxLimit: 50,
      defaultLimit: 10
    });

    // Safe sort parameters
    const allowedSortFields = ['createdAt', 'updatedAt', 'title'];
    const { sortBy, sortOrder } = parseSortParams(
      req.query.sortBy || 'createdAt',
      req.query.sortOrder || 'DESC',
      allowedSortFields
    );

    // First, find the user by username
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the authenticated user is viewing their own profile
    const isOwnProfile = req.user && req.user.id === user.id;
    
    const whereClause = { 
      authorId: user.id
    };
    
    // Only show published blogs unless user is viewing their own profile
    if (!isOwnProfile) {
      whereClause.published = true;
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get blogs with associations (optimized single query)
    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      attributes: ['id', 'title', 'slug', 'content', 'authorId', 'coverImage', 'published', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'],
          duplicating: false
        },
        {
          model: BlogLike,
          as: 'likes',
          attributes: ['id'],
          duplicating: false
        }
      ]
    });

    // Process blogs with counts (data already loaded, add user as author)
    const blogsWithCounts = blogs.map(blog => {
      const blogData = blog.toJSON();
      return {
        ...blogData,
        author: user,
        commentCount: blogData.comments?.length || 0,
        likeCount: blogData.likes?.length || 0,
        comments: undefined,
        likes: undefined
      };
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        author: user,
        blogs: blogsWithCounts,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get blogs by username error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get blog by username and slug (for SSR URL structure)
const getBlogByUsernameAndSlug = async (req, res) => {
  try {
    const { username, slug } = req.params;
    const userId = req.user ? req.user.id : null;

    // First, find the user by username
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the authenticated user is viewing their own blog
    const isOwnBlog = userId && userId === user.id;

    const whereClause = { 
      slug,
      authorId: user.id
    };
    
    // Only show published blogs unless user is viewing their own blog
    if (!isOwnBlog) {
      whereClause.published = true;
    }

    const blog = await Blog.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
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
          ],
          order: [['createdAt', 'ASC']]
        },
        {
          model: BlogLike,
          as: 'likes',
          attributes: ['id', 'userId']
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Add like count and check if current user liked it
    const likeCount = blog.likes.length;
    const userLiked = req.user ? blog.likes.some(like => like.userId === req.user.id) : false;

    res.json({
      success: true,
      data: {
        blog: {
          ...blog.toJSON(),
          likeCount,
          userLiked,
          commentCount: blog.comments.length
        }
      }
    });
  } catch (error) {
    logger.error('Get blog by username and slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get blog by ID (for admin/author use)
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const blog = await Blog.findByPk(id, {
      attributes: ['id', 'title', 'slug', 'content', 'authorId', 'coverImage', 'published', 'createdAt', 'updatedAt']
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user can view unpublished blog
    if (!blog.published && (!userId || userId !== blog.authorId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Blog is not published.'
      });
    }

    // Get author information
    const author = await User.findByPk(blog.authorId, {
      attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
    });

    // Get comments
    const comments = await Comment.findAll({
      where: { blogId: blog.id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Get likes
    const likes = await BlogLike.findAll({
      where: { blogId: blog.id },
      attributes: ['id', 'userId']
    });

    const likeCount = likes.length;
    const userLiked = userId ? likes.some(like => like.userId === userId) : false;

    res.json({
      success: true,
      data: {
        blog: {
          ...blog.toJSON(),
          author,
          comments,
          likeCount,
          userLiked,
          commentCount: comments.length
        }
      }
    });
  } catch (error) {
    logger.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new blog (authenticated users only)
const createBlog = async (req, res) => {
  try {
    const { title, content, coverImage, published = false } = req.body;
    const authorId = req.user.id;

    // Generate unique slug
    const slug = await generateUniqueSlug(title, authorId);

    const blog = await Blog.create({
      title,
      slug,
      content,
      authorId,
      coverImage,
      published
    });

    // Fetch the created blog with author info
    const createdBlog = await Blog.findByPk(blog.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        }
      ]
    });

    logger.info(`New blog created: ${blog.title} by user ${authorId}`);

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog: createdBlog }
    });
  } catch (error) {
    logger.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update blog (only by author)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, coverImage, published } = req.body;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is the author
    if (blog.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own blogs.'
      });
    }

    // Generate new slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = await generateUniqueSlug(title, userId, id);
    }

    await blog.update({
      title: title || blog.title,
      slug,
      content: content || blog.content,
      coverImage: coverImage !== undefined ? coverImage : blog.coverImage,
      published: published !== undefined ? published : blog.published
    });

    logger.info(`Blog updated: ${blog.title} by user ${userId}`);

    // Fetch the updated blog with author information
    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });
  } catch (error) {
    logger.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete blog (only by author)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if user is the author
    if (blog.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own blogs.'
      });
    }

    await blog.destroy();

    logger.info(`Blog deleted: ${blog.title} by user ${userId}`);

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    logger.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Like/Unlike blog (authenticated users only)
const toggleBlogLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blog = await Blog.findByPk(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published
    if (!blog.published) {
      return res.status(403).json({
        success: false,
        message: 'Cannot like unpublished blog'
      });
    }

    // Check if user already liked the blog
    const existingLike = await BlogLike.findOne({
      where: { blogId: id, userId }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      logger.info(`Blog unliked: ${blog.title} by user ${userId}`);
      
      res.json({
        success: true,
        message: 'Blog unliked successfully',
        data: { liked: false }
      });
    } else {
      // Like
      await BlogLike.create({ blogId: id, userId });
      logger.info(`Blog liked: ${blog.title} by user ${userId}`);
      
      res.json({
        success: true,
        message: 'Blog liked successfully',
        data: { liked: true }
      });
    }
  } catch (error) {
    logger.error('Toggle blog like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blog like',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get random blogs
const getRandomBlogs = async (req, res) => {
  try {
    // Safe pagination - limit to max 20 random blogs
    const { limit } = parsePagination(null, req.query.limit, {
      maxLimit: 20,
      defaultLimit: 5
    });
    
    // Get random published blogs with associations (optimized single query)
    const blogs = await Blog.findAll({
      where: {
        published: true
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'username', 'profilePicture']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id'],
          duplicating: false
        },
        {
          model: BlogLike,
          as: 'likes',
          attributes: ['id'],
          duplicating: false
        }
      ],
      order: sequelize.random(),
      limit: limit
    });

    // Process blogs with counts (data already loaded)
    const blogsWithCounts = blogs.map(blog => {
      const blogData = blog.toJSON();
      return {
        id: blogData.id,
        title: blogData.title,
        slug: blogData.slug,
        content: blogData.content,
        coverImage: blogData.coverImage,
        published: blogData.published,
        createdAt: blogData.createdAt,
        updatedAt: blogData.updatedAt,
        authorId: blogData.authorId,
        author: blogData.author,
        commentCount: blogData.comments?.length || 0,
        likeCount: blogData.likes?.length || 0
      };
    });

    logger.info(`Retrieved ${blogsWithCounts.length} random blogs`);

    res.json({
      success: true,
      message: 'Random blogs retrieved successfully',
      data: {
        blogs: blogsWithCounts,
        pagination: {
          total: blogsWithCounts.length,
          limit: limit
        }
      }
    });
  } catch (error) {
    logger.error('Get random blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve random blogs',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogsByUsername,
  getBlogByUsernameAndSlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogLike,
  getRandomBlogs
};
