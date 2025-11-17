const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/subscribers/send-newsletter
 * @desc    Send newsletter to all subscribers (ADMIN ONLY)
 * @access  Private - Admin Authentication Required
 * @security Requires valid JWT token AND admin role
 * @body    { subject: string, html: string }
 */
router.post('/send-newsletter', authenticate, adminOnly, subscriberController.sendNewsletterToSubscribers);

/**
 * @route   POST /api/v1/subscribers
 * @desc    Subscribe to OOPLab newsletter
 * @access  Public
 * @body    { email: string }
 */
router.post('/', subscriberController.subscribe);

/**
 * @route   GET /api/v1/subscribers
 * @desc    Get all subscribers (admin only)
 * @access  Private (Admin only)
 * @query   page, limit, sortBy, sortOrder
 */
router.get('/', authenticate, adminOnly, subscriberController.getAllSubscribers);

/**
 * @route   POST /api/v1/subscribers/unsubscribe
 * @desc    Unsubscribe from newsletter
 * @access  Public
 * @body    { email: string }
 */
router.post('/unsubscribe', subscriberController.unsubscribe);

module.exports = router;

