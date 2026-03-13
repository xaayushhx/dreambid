import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

// @route   GET /api/blogs/config/meta
// @desc    Get blog configuration (categories and statuses)
// @access  Public
router.get('/config/meta', async (req, res) => {
  try {
    const config = {
      categories: [
        { value: 'buying', label: 'Buying Tips' },
        { value: 'investment', label: 'Investment' },
        { value: 'market', label: 'Market Analysis' },
        { value: 'legal', label: 'Legal Aspects' }
      ],
      statuses: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' }
      ]
    };

    res.json({
      message: 'Blog config fetched successfully',
      data: config
    });
  } catch (error) {
    console.error('Error fetching blog config:', error);
    res.status(500).json({ message: 'Failed to fetch blog config', error: error.message });
  }
});

// @route   GET /api/blogs
// @desc    Get all blogs (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = 'SELECT * FROM blogs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // Only show published blogs for public
    if (!req.user) {
      query += ' AND status = $1';
      params.push('published');
      paramCount = 2;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    res.json({
      message: 'Blogs fetched successfully',
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Failed to fetch blogs', error: error.message });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get a single blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM blogs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      message: 'Blog fetched successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog (admin only)
// @access  Admin
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const { title, excerpt, content, category, author, image, readTime, status } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category || !author) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO blogs (title, excerpt, content, category, author, image, read_time, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [title, excerpt, content, category, author, image || null, readTime || null, status || 'draft', req.user.userId]
    );

    res.status(201).json({
      message: 'Blog created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog', error: error.message });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog (admin only)
// @access  Admin
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const { id } = req.params;
    const { title, excerpt, content, category, author, image, readTime, status } = req.body;

    // Check if blog exists
    const blogExists = await pool.query('SELECT id FROM blogs WHERE id = $1', [id]);
    if (blogExists.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const result = await pool.query(
      `UPDATE blogs 
       SET title = COALESCE($2, title),
           excerpt = COALESCE($3, excerpt),
           content = COALESCE($4, content),
           category = COALESCE($5, category),
           author = COALESCE($6, author),
           image = COALESCE($7, image),
           read_time = COALESCE($8, read_time),
           status = COALESCE($9, status),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, title, excerpt, content, category, author, image || null, readTime || null, status]
    );

    res.json({
      message: 'Blog updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog (admin only)
// @access  Admin
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).json({ message: 'Unauthorized - Admin access required' });
    }

    const { id } = req.params;

    // Check if blog exists
    const blogExists = await pool.query('SELECT id FROM blogs WHERE id = $1', [id]);
    if (blogExists.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await pool.query('DELETE FROM blogs WHERE id = $1', [id]);

    res.json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog', error: error.message });
  }
});

export default router;
