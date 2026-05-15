import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { notifyAdminsOfRegistration } from '../services/NotificationService.js';

const router = express.Router();

// @route   POST /api/user-registrations
// @desc    Save user property requirements registration
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, contactNumber, requirements } = req.body;

    if (!name || !contactNumber) {
      return res.status(400).json({ message: 'Name and contact number are required' });
    }

    // Validate contact number - must be 10 digits
    const cleanedNumber = contactNumber.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanedNumber)) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits' });
    }

    // Create table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_registrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        requirements JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert registration
    const result = await pool.query(
      `INSERT INTO user_registrations (name, contact_number, requirements)
       VALUES ($1, $2, $3)
       RETURNING id, name, contact_number, requirements, created_at`,
      [name, contactNumber, JSON.stringify(requirements)]
    );

    // Send notification to admins (async, don't wait)
    notifyAdminsOfRegistration({
      name,
      email: 'Not provided',
      phone: contactNumber,
      registrationType: 'property requirement',
    }).catch(error => {
      console.error('Failed to send registration notification to admins:', error);
      // Don't fail the request if notification fails
    });

    res.status(201).json({
      message: 'Registration saved successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user-registrations
// @desc    Get all user registrations (admin only)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin - req.user is populated by authenticate middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;

    // Get registrations
    const result = await pool.query(
      `SELECT id, name, contact_number, requirements, created_at
       FROM user_registrations
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM user_registrations');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      registrations: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/user-registrations/:id
// @desc    Get single user registration
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, contact_number, requirements, created_at
       FROM user_registrations
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    res.json({
      registration: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
