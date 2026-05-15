import express from 'express';
import { body, validationResult, query } from 'express-validator';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { notifyAdminsOfEnquiry } from '../services/NotificationService.js';

const router = express.Router();

// @route   POST /api/enquiries
// @desc    Create new enquiry
// @access  Public
router.post('/', [
  body('property_id').isInt(),
  body('name').trim().notEmpty(),
  body('email')
    .if((value) => value && value.trim() !== '')
    .isEmail()
    .normalizeEmail()
    .optional({ checkFalsy: true }),
  body('phone').trim().notEmpty().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('message').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_id, name, email, phone, message, enquiry_type = 'general' } = req.body;

    // Check if property exists and fetch its details
    const propertyCheck = await pool.query('SELECT id, title, address FROM properties WHERE id = $1 AND is_active = true', [property_id]);
    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const propertyData = propertyCheck.rows[0];

    // Get user ID if authenticated
    let userId = null;
    if (req.header('Authorization')) {
      try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Not authenticated, continue as guest
      }
    }

    // Create enquiry with property details
    const result = await pool.query(
      `INSERT INTO enquiries (property_id, user_id, name, email, phone, message, enquiry_type, property_title, property_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [property_id, userId, name, email, phone, message || null, enquiry_type, propertyData.title, propertyData.address]
    );

    // Increment enquiries count
    await pool.query('UPDATE properties SET enquiries_count = enquiries_count + 1 WHERE id = $1', [property_id]);

    // Send notification to admins/staff (async, don't wait)
    notifyAdminsOfEnquiry(property_id, {
      name,
      email: email || 'Not provided',
      phone,
      property_title: propertyData.title,
      message,
    }).catch(error => {
      console.error('Failed to send notification to admins:', error);
      // Don't fail the request if notification fails
    });

    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry: result.rows[0] });
  } catch (error) {
    console.error('Create enquiry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/enquiries
// @desc    Get all enquiries (admin/staff only)
// @access  Private (Admin/Staff)
router.get('/', authenticate, authorize('admin', 'staff'), [
  query('status').optional().isIn(['new', 'contacted', 'resolved', 'closed', 'not_interested', 'unable_to_connect', 'call_later']),
  query('property_id').optional().isInt(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 1000 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, property_id, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT e.*,
             COALESCE(e.property_title, p.title) as property_title,
             COALESCE(e.property_address, p.address) as property_address
      FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND e.status = $${paramCount}`;
      params.push(status);
    }

    if (property_id) {
      paramCount++;
      query += ` AND e.property_id = $${paramCount}`;
      params.push(property_id);
    }

    // Get total count - use proper count query
    const countQuery = `
      SELECT COUNT(*) FROM enquiries e
      LEFT JOIN properties p ON e.property_id = p.id
      WHERE 1=1
      ${status ? `AND e.status = $1` : ''}
      ${property_id ? `AND e.property_id = $${status ? 2 : 1}` : ''}
    `;
    const countParams = [];
    if (status) countParams.push(status);
    if (property_id) countParams.push(property_id);
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination
    paramCount++;
    query += ` ORDER BY e.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((page - 1) * limit);

    const result = await pool.query(query, params);

    res.json({
      enquiries: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/enquiries/:id/status
// @desc    Update enquiry status
// @access  Private (Admin/Staff)
router.put('/:id/status', authenticate, authorize('admin', 'staff'),
  body('status').isIn(['new', 'contacted', 'resolved', 'closed', 'not_interested', 'unable_to_connect', 'call_later']),
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }

    res.json({ message: 'Enquiry status updated', enquiry: result.rows[0] });
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/contact
// @desc    Handle contact form submissions with optional file attachment
// @access  Public
router.post('/contact', uploadImage, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('contactNumber').trim().notEmpty().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('message').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, contactNumber, contactingAs, message } = req.body;
    const attachmentData = req.file?.buffer || null;
    const attachmentMimeType = req.file?.mimetype || null;
    const attachmentName = req.file?.originalname || null;

    // Store contact form submission in database
    const result = await pool.query(
      `INSERT INTO enquiries (name, email, phone, message, enquiry_type, property_title, property_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, created_at`,
      [name, email, contactNumber, message || null, 'contact', contactingAs || 'Contact Form', 'General Inquiry']
    );

    // If there's an attachment, you might store it separately or create a contacts table
    // For now, just log it
    if (attachmentData) {
      console.log(`Contact form attachment: ${attachmentName} (${attachmentMimeType}) - ${attachmentData.length} bytes`);
    }

    // Notify admins about new contact
    try {
      const notifyAdminsOfContact = async (contactData) => {
        const adminResult = await pool.query(
          `SELECT DISTINCT u.id FROM users u
           INNER JOIN notification_tokens nt ON u.id = nt.user_id
           WHERE u.role IN ('admin', 'staff') 
           AND u.is_active = true
           AND nt.is_active = true`
        );

        if (adminResult.rows.length > 0) {
          const { initializeFirebase, sendNotificationToUser } = await import('../services/NotificationService.js');
          initializeFirebase();
          
          for (const admin of adminResult.rows) {
            await sendNotificationToUser(admin.id, {
              title: 'New Contact Form Submission',
              body: `${contactData.name} sent a message`,
              data: {
                type: 'contact',
                senderEmail: contactData.email,
                senderPhone: contactData.phone,
                action: 'open_messages'
              }
            }).catch(err => console.error('Failed to notify admin:', err));
          }
        }
      };

      await notifyAdminsOfContact({ name, email, phone: contactNumber });
    } catch (notifyError) {
      console.error('Failed to notify admins:', notifyError);
    }

    res.status(201).json({ 
      message: 'Contact form submitted successfully', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

