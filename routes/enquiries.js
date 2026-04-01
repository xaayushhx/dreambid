import express from 'express';
import { body, validationResult, query } from 'express-validator';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/enquiries
// @desc    Create new enquiry
// @access  Public
router.post('/', [
  body('property_id').isInt(),
  body('name').trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
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

    // Get total count
    const countQuery = query.replace('SELECT e.*, p.title as property_title, p.address as property_address', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
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

export default router;

