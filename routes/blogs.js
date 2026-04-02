import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
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

    // Fetch associated images
    const imagesResult = await pool.query(
      'SELECT * FROM blog_images WHERE blog_id = $1 ORDER BY image_order ASC',
      [id]
    );

    res.json({
      message: 'Blog fetched successfully',
      data: {
        ...result.rows[0],
        images: imagesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog', error: error.message });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog (admin only)
// @access  Admin
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { title, excerpt, content, category, author, image, images, readTime, status } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category || !author) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Use first image from images array or fallback to single image
    const mainImage = (images && images.length > 0) ? images[0] : (image || null);

    const result = await pool.query(
      `INSERT INTO blogs (title, excerpt, content, category, author, image, read_time, status, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING *`,
      [title, excerpt, content, category, author, mainImage || null, readTime || null, status || 'draft', req.userId]
    );

    const blogId = result.rows[0].id;
    let blogImages = [];

    // Insert multiple images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageData = typeof images[i] === 'string' ? images[i] : images[i].data;
        const imageResult = await pool.query(
          `INSERT INTO blog_images (blog_id, image_data, image_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [blogId, imageData, i]
        );
        blogImages.push(imageResult.rows[0]);
      }
    }

    res.status(201).json({
      message: 'Blog created successfully',
      data: {
        ...result.rows[0],
        images: blogImages
      }
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to create blog', error: error.message });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog (admin only)
// @access  Admin
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, author, image, images, readTime, status } = req.body;

    // Check if blog exists
    const blogExists = await pool.query('SELECT id FROM blogs WHERE id = $1', [id]);
    if (blogExists.rows.length === 0) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Build dynamic update query - only update fields that are provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined && title !== null) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (excerpt !== undefined && excerpt !== null) {
      paramCount++;
      updates.push(`excerpt = $${paramCount}`);
      values.push(excerpt);
    }
    if (content !== undefined && content !== null) {
      paramCount++;
      updates.push(`content = $${paramCount}`);
      values.push(content);
    }
    if (category !== undefined && category !== null) {
      paramCount++;
      updates.push(`category = $${paramCount}`);
      values.push(category);
    }
    if (author !== undefined && author !== null) {
      paramCount++;
      updates.push(`author = $${paramCount}`);
      values.push(author);
    }
    
    // Handle image (use first from images array or the image field)
    const mainImage = (images && images.length > 0) ? images[0] : (image || null);
    if (mainImage !== null) {
      paramCount++;
      updates.push(`image = $${paramCount}`);
      values.push(mainImage);
    }
    
    if (readTime !== undefined && readTime !== null) {
      paramCount++;
      updates.push(`read_time = $${paramCount}`);
      values.push(readTime);
    }
    if (status !== undefined && status !== null) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }

    // Always update the updated_at timestamp
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    // If no updates, return error
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    // Add the id at the end
    paramCount++;
    values.push(id);

    const query = `UPDATE blogs 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`;

    const result = await pool.query(query, values);

    let blogImages = [];

    // Update images if provided
    if (images && images.length > 0) {
      // Delete old images
      await pool.query('DELETE FROM blog_images WHERE blog_id = $1', [id]);
      
      // Insert new images
      for (let i = 0; i < images.length; i++) {
        const imageData = typeof images[i] === 'string' ? images[i] : images[i].data;
        const imageResult = await pool.query(
          `INSERT INTO blog_images (blog_id, image_data, image_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [id, imageData, i]
        );
        blogImages.push(imageResult.rows[0]);
      }
    } else {
      // Fetch existing images if not updating
      const imagesResult = await pool.query(
        'SELECT * FROM blog_images WHERE blog_id = $1 ORDER BY image_order ASC',
        [id]
      );
      blogImages = imagesResult.rows;
    }

    res.json({
      message: 'Blog updated successfully',
      data: {
        ...result.rows[0],
        images: blogImages
      }
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog (admin only)
// @access  Admin
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {

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
