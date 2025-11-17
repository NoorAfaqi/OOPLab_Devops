const { Subscriber } = require('../models');
const { sendSubscriptionConfirmationEmail, sendNewsletter } = require('../utils/emailService');
const { logger } = require('../middleware/errorHandler');

// Subscribe to newsletter
const subscribe = async (req, res) => {
  try {
    // Accept email from body or query parameters
    const email = req.body.email || req.query.email;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    // Create new subscriber
    const subscriber = await Subscriber.create({
      email: email.toLowerCase().trim(),
      subscribedAt: new Date()
    });

    // Send confirmation email
    try {
      await sendSubscriptionConfirmationEmail(email);
    } catch (emailError) {
      logger.error('Email sending failed:', emailError);
      // Continue even if email fails - subscription is still created
    }

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to OOPLab newsletter',
      data: {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });

  } catch (error) {
    logger.error('Subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all subscribers (admin only - you may want to add auth middleware)
const getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'subscribedAt', sortOrder = 'DESC' } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Subscriber.findAndCountAll({
      limit: parseInt(limit),
      offset: offset,
      order: [[sortBy, sortOrder]]
    });

    return res.status(200).json({
      success: true,
      data: {
        subscribers: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Unsubscribe
const unsubscribe = async (req, res) => {
  try {
    // Accept email from body or query parameters
    const email = req.body.email || req.query.email;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Subscriber.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in subscribers list'
      });
    }

    await subscriber.destroy();

    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from OOPLab newsletter'
    });

  } catch (error) {
    logger.error('Unsubscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send newsletter to all subscribers (admin only)
const sendNewsletterToSubscribers = async (req, res) => {
  try {
    // Additional admin check (middleware already checks, but belt-and-suspenders approach)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { subject, html } = req.body;

    // Validate required fields
    if (!subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Subject and HTML content are required'
      });
    }

    // Get all subscribers
    const subscribers = await Subscriber.findAll({
      attributes: ['email']
    });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No subscribers found'
      });
    }

    // Extract emails for BCC
    const subscriberEmails = subscribers.map(s => s.email);

    // Send newsletter
    const result = await sendNewsletter(subject, html, subscriberEmails);

    return res.status(200).json({
      success: true,
      message: `Newsletter sent successfully to ${result.sentCount || subscriberEmails.length} of ${subscriberEmails.length} subscribers`,
      data: {
        recipients: subscriberEmails.length,
        sent: result.sentCount || subscriberEmails.length,
        errors: result.errors || []
      }
    });

  } catch (error) {
    logger.error('Newsletter sending error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send newsletter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  subscribe,
  getAllSubscribers,
  unsubscribe,
  sendNewsletterToSubscribers
};

