const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 * @body    { name: string, email: string, company?: string, subject: string, message: string }
 */
router.post('/', contactController.submitContact);

/**
 * @route   GET /api/contact
 * @desc    Get all contacts (admin only)
 * @access  Private (Admin only)
 * @query   page, limit, status, sortBy, sortOrder
 */
router.get('/', authenticate, adminOnly, contactController.getAllContacts);

/**
 * @route   GET /api/contact/:id
 * @desc    Get contact by ID (admin only)
 * @access  Private (Admin only)
 */
router.get('/:id', authenticate, adminOnly, contactController.getContactById);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update contact status (admin only)
 * @access  Private (Admin only)
 * @body    { status: 'pending' | 'read' | 'replied' | 'archived' }
 */
router.patch('/:id/status', authenticate, adminOnly, contactController.updateContactStatus);

module.exports = router;

