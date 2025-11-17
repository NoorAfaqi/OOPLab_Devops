const { Blog, BlogView, BlogAnalytics, User, Comment, BlogLike, sequelize } = require('../models');
const { Op } = require('sequelize');
const { logger } = require('../middleware/errorHandler');

// Track a blog view
const trackBlogView = async (req, res) => {
  try {
    const { blogId } = req.params;
    
    // Convert blogId to number if it's a string
    const numericBlogId = parseInt(blogId);
    if (isNaN(numericBlogId) || numericBlogId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID'
      });
    }
    
    const { userId } = req.user || {};
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');
    const sessionId = req.sessionID || req.headers['x-session-id'];


    // Check if this is a unique view (same session, same IP, or same user)
    const orConditions = [
      { ipAddress },
      ...(userId ? [{ userId }] : [])
    ];
    
    // Only add sessionId condition if it's not undefined
    if (sessionId) {
      orConditions.unshift({ sessionId });
    }
    
    const existingView = await BlogView.findOne({
      where: {
        blogId: numericBlogId,
        [Op.or]: orConditions
      },
      order: [['createdAt', 'DESC']]
    });


    // If view exists within last 30 minutes, don't count as new view
    if (existingView) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      if (existingView.createdAt > thirtyMinutesAgo) {
        return res.json({ success: true, message: 'View already tracked' });
      }
    }

    // Create new view record
    const view = await BlogView.create({
      blogId: numericBlogId,
      userId: userId || null,
      ipAddress,
      userAgent,
      referrer,
      sessionId
    });


    // Parse user agent for device info
    view.parseUserAgent();
    await view.save();

    // Update or create analytics record
    let analytics = await BlogAnalytics.findOne({ where: { blogId: numericBlogId } });
    if (!analytics) {
      analytics = await BlogAnalytics.create({ blogId: numericBlogId });
    }

    await analytics.incrementView(userAgent, referrer, ipAddress);

    res.json({ success: true, message: 'View tracked successfully' });
  } catch (error) {
    logger.error('Error tracking blog view:', error);
    res.status(500).json({ success: false, message: 'Failed to track view', error: error.message });
  }
};

// Get analytics for a specific blog (author only)
const getBlogAnalytics = async (req, res) => {
  try {
    logger.debug(`getBlogAnalytics - req.user: ${req.user ? req.user.id : 'none'}`);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    const { blogId } = req.params;
    const { id: userId } = req.user;

    // Verify the user is the author of the blog
    const blog = await Blog.findOne({
      where: { id: blogId, authorId: userId },
      include: [{ model: BlogAnalytics, as: 'analytics' }]
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found or access denied' });
    }

    // Validate timeFilter parameter to prevent injection
    const validFilters = ['24h', '7d', '1m', '1y', 'total'];
    const timeFilter = validFilters.includes(req.query.timeFilter) 
      ? req.query.timeFilter 
      : 'total';
    
    // Calculate date range based on filter
    let startDate = null;
    switch (timeFilter) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = null; // Total lifetime
    }

    // Build where clause for date filtering
    const dateFilter = startDate ? { createdAt: { [Op.gte]: startDate } } : {};

    // Get view statistics
    const totalViews = await BlogView.count({
      where: { blogId, ...dateFilter }
    });

    const uniqueViews = await BlogView.count({
      where: { blogId, ...dateFilter },
      distinct: true,
      col: 'ip_address'
    });

    // Get views over time (for charts)
    const viewsOverTime = await BlogView.findAll({
      where: { blogId, ...dateFilter },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'views']
      ],
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Get referral data
    const referralData = await BlogView.findAll({
      where: { 
        blogId, 
        ...dateFilter,
        referrer: { [Op.ne]: null }
      },
      attributes: [
        'referrer',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['referrer'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });

    // Get device data
    const deviceData = await BlogView.findAll({
      where: { blogId, ...dateFilter },
      attributes: [
        'device_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['device_type'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Get browser data
    const browserData = await BlogView.findAll({
      where: { blogId, ...dateFilter },
      attributes: [
        'browser',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['browser'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Get OS data
    const osData = await BlogView.findAll({
      where: { blogId, ...dateFilter },
      attributes: [
        'os',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['os'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      raw: true
    });

    // Get top countries
    const countryData = await BlogView.findAll({
      where: { 
        blogId, 
        ...dateFilter,
        country: { [Op.ne]: null }
      },
      attributes: [
        'country',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['country'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      raw: true
    });


    // Calculate engagement metrics
    const commentsCount = await blog.countComments();
    const likesCount = await blog.countLikes();

    const analytics = {
      blog: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        createdAt: blog.createdAt
      },
      timeFilter,
      overview: {
        totalViews,
        uniqueViews,
        commentsCount,
        likesCount,
        engagementRate: totalViews > 0 ? ((commentsCount + likesCount) / totalViews * 100).toFixed(2) : 0
      },
      viewsOverTime,
      referralData: referralData.map(item => ({
        domain: extractDomain(item.referrer),
        url: item.referrer,
        count: parseInt(item.count)
      })),
      deviceData: deviceData.map(item => ({
        type: item.device_type || 'Unknown',
        count: parseInt(item.count)
      })),
      browserData: browserData.map(item => ({
        browser: item.browser || 'Unknown',
        count: parseInt(item.count)
      })),
      osData: osData.map(item => ({
        os: item.os || 'Unknown',
        count: parseInt(item.count)
      })),
      countryData: countryData.map(item => ({
        country: item.country || 'Unknown',
        count: parseInt(item.count)
      }))
    };

    res.json({ success: true, data: analytics });
  } catch (error) {
    logger.error('Error getting blog analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};

// Get analytics for all user's blogs
const getUserBlogsAnalytics = async (req, res) => {
  try {
    logger.debug(`getUserBlogsAnalytics - req.user: ${req.user ? req.user.id : 'none'}`);
    
    if (!req.user || !req.user.id) {
      logger.debug('getUserBlogsAnalytics - User not authenticated');
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated. Please log in again.' 
      });
    }
    
    const { id: userId } = req.user;
    logger.debug(`getUserBlogsAnalytics - User ID: ${userId}`);
    
    // Validate timeFilter parameter to prevent injection
    const validFilters = ['24h', '7d', '1m', '1y', 'total'];
    const timeFilter = validFilters.includes(req.query.timeFilter) 
      ? req.query.timeFilter 
      : 'total';

    // Calculate date range
    let startDate = null;
    switch (timeFilter) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const dateFilter = startDate ? { createdAt: { [Op.gte]: startDate } } : {};

    // Get all user's blogs with analytics
    const blogs = await Blog.findAll({
      where: { authorId: userId },
      include: [
        { model: BlogAnalytics, as: 'analytics' },
        { model: BlogView, as: 'views', where: dateFilter, required: false }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate summary statistics
    const summaryStats = await BlogView.findAll({
      where: { 
        blogId: { [Op.in]: blogs.map(blog => blog.id) },
        ...dateFilter
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalViews'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('ip_address'))), 'uniqueViews']
      ],
      raw: true
    });

    // Get total comments and likes across all user's blogs
    const totalComments = await Comment.count({
      where: {
        blogId: { [Op.in]: blogs.map(blog => blog.id) }
      }
    });

    const totalLikes = await BlogLike.count({
      where: {
        blogId: { [Op.in]: blogs.map(blog => blog.id) }
      }
    });

    // OPTIMIZATION: Fetch all comment counts in a single query (was N+1 problem)
    const commentCounts = await Comment.findAll({
      where: {
        blogId: { [Op.in]: blogs.map(blog => blog.id) }
      },
      attributes: [
        'blogId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['blogId'],
      raw: true
    });

    // OPTIMIZATION: Fetch all like counts in a single query (was N+1 problem)
    const likeCounts = await BlogLike.findAll({
      where: {
        blogId: { [Op.in]: blogs.map(blog => blog.id) }
      },
      attributes: [
        'blogId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['blogId'],
      raw: true
    });

    // Create lookup maps for fast access
    const commentCountMap = new Map(commentCounts.map(item => [item.blogId, parseInt(item.count)]));
    const likeCountMap = new Map(likeCounts.map(item => [item.blogId, parseInt(item.count)]));

    // Process blogs with counts from maps (no additional queries needed!)
    const blogsAnalytics = blogs.map((blog) => {
      const views = blog.views || [];
      const totalViews = views.length;
      const uniqueViews = new Set(views.map(v => v.ip_address)).size;

      return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        coverImage: blog.coverImage,
        createdAt: blog.createdAt,
        published: blog.published,
        stats: {
          totalViews,
          uniqueViews,
          commentsCount: commentCountMap.get(blog.id) || 0,
          likesCount: likeCountMap.get(blog.id) || 0
        }
      };
    });

    res.json({
      success: true,
      data: {
        timeFilter,
        summary: {
          totalBlogs: blogs.length,
          totalViews: summaryStats[0]?.totalViews || 0,
          uniqueViews: summaryStats[0]?.uniqueViews || 0,
          totalComments,
          totalLikes
        },
        blogs: blogsAnalytics
      }
    });
  } catch (error) {
    logger.error('Error getting user blogs analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};

// Helper function to extract domain from URL
const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
};

// Get admin-level analytics for all blogs (admin only)
const getAdminBlogAnalytics = async (req, res) => {
  try {
    logger.debug('getAdminBlogAnalytics - Admin request');
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Get time filter from query parameter
    const validFilters = ['24h', '7d', '30d', '1y', 'total'];
    const timeFilter = validFilters.includes(req.query.timeFilter) 
      ? req.query.timeFilter 
      : 'total';
    
    // Calculate date range based on filter
    let startDate = null;
    let periodLabel = 'all time';
    
    switch (timeFilter) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        periodLabel = 'last 24 hours';
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = 'last 7 days';
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = 'last 30 days';
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        periodLabel = 'last year';
        break;
      default:
        startDate = null; // Total lifetime
        periodLabel = 'all time';
    }

    // Get filtered views based on time range
    const totalViews = await BlogView.count(
      startDate ? { where: { createdAt: { [Op.gte]: startDate } } } : {}
    );

    // Get filtered likes based on time range
    let totalLikes = await BlogLike.count();
    if (startDate) {
      try {
        totalLikes = await BlogLike.count({
          where: sequelize.literal(`created_at >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}'`)
        });
      } catch (error) {
        totalLikes = await BlogLike.count();
      }
    }

    // Get total blogs count
    const totalBlogs = await Blog.count();

    // Calculate average views per blog
    const averageViewsPerBlog = totalBlogs > 0 ? Math.round(totalViews / totalBlogs) : 0;

    // Get historical data for comparison (previous period)
    let previousStartDate;
    let previousEndDate;
    switch (timeFilter) {
      case '24h':
        previousEndDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
        break;
      case '7d':
        previousEndDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        previousEndDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        previousEndDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
        break;
      default:
        previousStartDate = null;
    }
    
    // Get previous period data for comparison
    let previousViews = 0;
    let previousLikesCount = 0;
    
    if (previousStartDate && previousEndDate) {
      previousViews = await BlogView.count({
        where: {
          createdAt: {
            [Op.gte]: previousStartDate,
            [Op.lt]: previousEndDate
          }
        }
      });
      
      try {
        previousLikesCount = await BlogLike.count({
          where: sequelize.literal(
            `created_at >= '${previousStartDate.toISOString().slice(0, 19).replace('T', ' ')}' 
             AND created_at < '${previousEndDate.toISOString().slice(0, 19).replace('T', ' ')}'`
          )
        });
      } catch (error) {
        logger.debug('blog_likes.created_at column not found, using default value');
        previousLikesCount = 0;
      }
    }
    
    const viewsChange = previousViews > 0 ? ((totalViews - previousViews) / previousViews) * 100 : 0;
    const likesChange = previousLikesCount > 0 ? ((totalLikes - previousLikesCount) / previousLikesCount) * 100 : 0;

    const analytics = {
      totalViews,
      totalLikes,
      averageViewsPerBlog,
      totalBlogs,
      timeFilter,
      periodLabel,
      changes: {
        views: {
          current: totalViews,
          previous: previousViews,
          change: viewsChange,
          period: periodLabel
        },
        likes: {
          current: totalLikes,
          previous: previousLikesCount,
          change: likesChange,
          period: periodLabel
        }
      }
    };

    res.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    logger.error('Error getting admin blog analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get historical trends for admin dashboard (admin only)
const getAdminTrends = async (req, res) => {
  try {
    logger.debug('getAdminTrends - Admin request');
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Get time range from query parameter
    const timeRange = req.query.range || 'week'; // day, week, month, year, all
    
    // Calculate date range based on time range
    const now = new Date();
    let startDate;
    let days;
    let periodLabel;
    
    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        days = 24;
        periodLabel = 'last 24 hours';
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        days = 7;
        periodLabel = 'last 7 days';
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        days = 30;
        periodLabel = 'last 30 days';
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        days = 12; // 12 data points for 12 months
        periodLabel = 'last 12 months';
        break;
      case 'all':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        days = 12;
        periodLabel = 'last 12 months';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        days = 7;
        periodLabel = 'last 7 days';
    }
    
    // Get views data based on time range
    const viewsData = await BlogView.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        timeRange === 'day' 
          ? [sequelize.fn('HOUR', sequelize.col('created_at')), 'date']
          : (timeRange === 'year' || timeRange === 'all')
            ? [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'date']
            : [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [timeRange === 'day' 
        ? sequelize.fn('HOUR', sequelize.col('created_at'))
        : (timeRange === 'year' || timeRange === 'all')
          ? sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')
          : sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[timeRange === 'day' 
        ? sequelize.fn('HOUR', sequelize.col('created_at'))
        : (timeRange === 'year' || timeRange === 'all')
          ? sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')
          : sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Get likes data based on time range (handle if created_at column doesn't exist)
    let likesData = [];
    try {
      likesData = await sequelize.query(
        `SELECT 
          ${timeRange === 'day' 
            ? 'HOUR(created_at)' 
            : (timeRange === 'year' || timeRange === 'all')
              ? "DATE_FORMAT(created_at, '%Y-%m')"
              : 'DATE(created_at)'} AS date,
          COUNT(id) AS count 
         FROM blog_likes 
         WHERE created_at >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}' 
         GROUP BY ${timeRange === 'day' 
            ? 'HOUR(created_at)' 
            : (timeRange === 'year' || timeRange === 'all')
              ? "DATE_FORMAT(created_at, '%Y-%m')"
              : 'DATE(created_at)'}
         ORDER BY date ASC`,
        { type: sequelize.QueryTypes.SELECT }
      );
    } catch (error) {
      // If created_at column doesn't exist, return empty data
      logger.debug('blog_likes.created_at column not found, returning empty trends');
      likesData = [];
    }

    // Get new users data based on time range
    const usersData = await User.findAll({
      where: {
        createdAt: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        timeRange === 'day' 
          ? [sequelize.fn('HOUR', sequelize.col('created_at')), 'date']
          : (timeRange === 'year' || timeRange === 'all')
            ? [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'date']
            : [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [timeRange === 'day' 
        ? sequelize.fn('HOUR', sequelize.col('created_at'))
        : (timeRange === 'year' || timeRange === 'all')
          ? sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')
          : sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[timeRange === 'day' 
        ? sequelize.fn('HOUR', sequelize.col('created_at'))
        : (timeRange === 'year' || timeRange === 'all')
          ? sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')
          : sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
      raw: true
    });

    // Get new subscribers data based on time range
    let subscribersData = [];
    try {
      const { Subscriber } = require('../models');
      subscribersData = await Subscriber.findAll({
        where: sequelize.literal(`SUBSCRIBED_AT >= '${startDate.toISOString().slice(0, 19).replace('T', ' ')}'`),
        attributes: [
          timeRange === 'day' 
            ? [sequelize.fn('HOUR', sequelize.literal('SUBSCRIBED_AT')), 'date']
            : (timeRange === 'year' || timeRange === 'all')
              ? [sequelize.fn('DATE_FORMAT', sequelize.literal('SUBSCRIBED_AT'), '%Y-%m'), 'date']
              : [sequelize.fn('DATE', sequelize.literal('SUBSCRIBED_AT')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [timeRange === 'day' 
          ? sequelize.fn('HOUR', sequelize.literal('SUBSCRIBED_AT'))
          : (timeRange === 'year' || timeRange === 'all')
            ? sequelize.fn('DATE_FORMAT', sequelize.literal('SUBSCRIBED_AT'), '%Y-%m')
            : sequelize.fn('DATE', sequelize.literal('SUBSCRIBED_AT'))],
        order: [[timeRange === 'day' 
          ? sequelize.fn('HOUR', sequelize.literal('SUBSCRIBED_AT'))
          : (timeRange === 'year' || timeRange === 'all')
            ? sequelize.fn('DATE_FORMAT', sequelize.literal('SUBSCRIBED_AT'), '%Y-%m')
            : sequelize.fn('DATE', sequelize.literal('SUBSCRIBED_AT')), 'ASC']],
        raw: true
      });
    } catch (err) {
      logger.debug('Subscriber model not available');
    }

    // Convert to arrays based on time range
    const formatData = (data, points = 7) => {
      const result = Array(points).fill(0);
      
      if (!data || data.length === 0) return result;
      
      // For day range (hours), data comes as { date: hour, count: number }
      if (timeRange === 'day') {
        data.forEach(item => {
          const hour = parseInt(item.date) || 0;
          if (hour >= 0 && hour < points) {
            result[hour] = parseInt(item.count) || 0;
          }
        });
      } 
      // For year range (months), data comes as { date: 'YYYY-MM', count: number }
      else if (timeRange === 'year' || timeRange === 'all') {
        // Get current month (0-indexed)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        data.forEach(item => {
          try {
            // item.date is in format 'YYYY-MM'
            const parts = item.date.split('-');
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // 0-indexed month
            
            // Calculate how many months ago this was
            const monthsAgo = (currentYear - year) * 12 + (currentMonth - month);
            
            // Map to array index (0 = oldest, points-1 = current)
            if (monthsAgo >= 0 && monthsAgo < points) {
              result[points - 1 - monthsAgo] = parseInt(item.count) || 0;
            }
          } catch (e) {
            logger.debug('Error parsing date in formatData:', item.date, e);
          }
        });
      }
      // For week/month range (days), data comes as { date: 'YYYY-MM-DD', count: number }
      else {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        data.forEach(item => {
          try {
            let itemDate;
            if (typeof item.date === 'string') {
              // Parse date string (could be 'YYYY-MM-DD' or just date number)
              if (item.date.includes('-')) {
                itemDate = new Date(item.date);
              } else {
                // If date is a number (day of month, etc.)
                itemDate = new Date();
                itemDate.setDate(parseInt(item.date));
              }
            } else {
              itemDate = new Date(item.date);
            }
            itemDate.setHours(0, 0, 0, 0);
            
            const diffInMs = now.getTime() - itemDate.getTime();
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            
            if (diffInDays >= 0 && diffInDays < points) {
              result[points - 1 - diffInDays] = parseInt(item.count) || 0;
            }
          } catch (e) {
            logger.debug('Error parsing date in formatData:', item.date, e);
          }
        });
      }
      
      return result;
    };

    const trends = {
      views: formatData(viewsData, days),
      likes: formatData(likesData, days),
      users: formatData(usersData, days),
      subscribers: formatData(subscribersData, days),
      period: periodLabel,
      range: timeRange
    };

    res.json({ 
      success: true, 
      data: trends 
    });
  } catch (error) {
    logger.error('Error getting admin trends:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  trackBlogView,
  getBlogAnalytics,
  getUserBlogsAnalytics,
  getAdminBlogAnalytics,
  getAdminTrends
};
