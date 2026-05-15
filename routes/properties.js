import express from 'express';
import { body, validationResult, query } from 'express-validator';
import pool, { queryWithRetry } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadImages, uploadPdf, getFileUrl } from '../middleware/upload.js';
import { executeWithRetry } from '../utils/dbRetry.js';

const router = express.Router();

// Helper function to update auction status
const updateAuctionStatus = async () => {
  const now = new Date();
  try {
    // Check if properties table exists first
    const tableExists = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties')"
    );

    if (!tableExists.rows[0].exists) {
      console.log('⚠️  properties table does not exist yet, skipping auction status update');
      return;
    }

    // Update using status column
    await pool.query(
      `UPDATE properties 
       SET status = CASE 
         WHEN status = 'upcoming' AND auction_date <= $1 THEN 'active'
         WHEN status = 'active' AND auction_date < $1 THEN 'expired'
         ELSE status
       END
       WHERE (status = 'upcoming' AND auction_date <= $1)
          OR (status = 'active' AND auction_date < $1)`,
      [now]
    );
  } catch (err) {
    // Log and continue - don't crash the server if DB is unavailable during dev
    console.warn('updateAuctionStatus: database unavailable or query failed', err && err.message ? err.message : err);
  }
};

// Run status update on server start and periodically
// Delay initial run by 5 seconds to allow database initialization
setTimeout(updateAuctionStatus, 5000);
setInterval(updateAuctionStatus, 60000); // Every minute

// @route   GET /api/properties
// @desc    Get all properties (with filters)
// @access  Public
router.get('/', [
  query('status').optional().custom((value) => {
    // Allow empty string for "all properties" or valid status values
    if (value === '' || !value || ['upcoming', 'active', 'expired', 'sold', 'cancelled'].includes(value)) {
      return true;
    }
    throw new Error('Invalid status value');
  }),
  query('city').optional().trim(),
  query('property_type').optional().trim(),
  query('min_price').optional().custom((value) => {
    if (!value || value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }),
  query('max_price').optional().custom((value) => {
    if (!value || value === '') return true;
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
  }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 1000 }), // Increased max for dashboard
  query('sort_by').optional().custom((value) => {
    if (!value || ['created_at', 'reserve_price', 'auction_date'].includes(value)) {
      return true;
    }
    throw new Error('Invalid sort_by value');
  }),
], async (req, res) => {
  try {
    await updateAuctionStatus(); // Update status before fetching

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      status,
      city,
      property_type,
      min_price,
      max_price,
      sort_by,
      page = 1,
      limit = 20,
      is_featured
    } = req.query;

    // By default, exclude expired properties unless explicitly requested
    // But if status is empty string, show all (for admin dashboard)
    let query = 'SELECT * FROM properties WHERE is_active = true';
    const params = [];
    let paramCount = 0;
    
    // Handle featured filter
    if (is_featured === 'true') {
      query += ` AND is_featured = true`;
    }

    // Handle status filter
    if (status === '') {
      // Empty string means "show all including expired" (for admin dashboard)
      // Don't add any status filter - show everything
    } else if (status) {
      // Specific status requested
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    } else {
      // No status filter - exclude expired by default (for public website)
      query += ` AND status != 'expired'`;
    }

    if (city) {
      // Handle multiple cities separated by comma
      const cities = city.split(',').map(c => c.trim()).filter(c => c);
      if (cities.length > 0) {
        if (cities.length === 1) {
          paramCount++;
          query += ` AND city ILIKE $${paramCount}`;
          params.push(`%${cities[0]}%`);
        } else {
          // Multiple cities - use OR conditions
          const cityConditions = cities.map((_, idx) => `city ILIKE $${paramCount + idx + 1}`).join(' OR ');
          query += ` AND (${cityConditions})`;
          cities.forEach(c => params.push(`%${c}%`));
          paramCount += cities.length;
        }
      }
    }

    if (property_type) {
      // Handle multiple property types separated by comma
      const types = property_type.split(',').map(t => t.trim()).filter(t => t);
      if (types.length > 0) {
        if (types.length === 1) {
          paramCount++;
          query += ` AND property_type = $${paramCount}`;
          params.push(types[0]);
        } else {
          // Multiple types - use IN clause
          const placeholders = types.map((_, idx) => `$${paramCount + idx + 1}`).join(',');
          query += ` AND property_type IN (${placeholders})`;
          types.forEach(type => params.push(type));
          paramCount += types.length;
        }
      }
    }

    if (min_price) {
      paramCount++;
      query += ` AND reserve_price >= $${paramCount}`;
      params.push(min_price);
    }

    if (max_price) {
      paramCount++;
      query += ` AND reserve_price <= $${paramCount}`;
      params.push(max_price);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add pagination with sorting
    let orderBy = 'created_at DESC';
    if (sort_by === 'reserve_price') {
      orderBy = 'reserve_price ASC';
    } else if (sort_by === 'reserve_price_desc') {
      orderBy = 'reserve_price DESC';
    } else if (sort_by === 'auction_date') {
      orderBy = 'auction_date ASC';
    }
    
    paramCount++;
    query += ` ORDER BY ${orderBy} LIMIT $${paramCount}`;
    params.push(limit);
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push((page - 1) * limit);

    const result = await pool.query(query, params);

    // Get images for each property
    for (let property of result.rows) {
      const imagesResult = await pool.query(
        'SELECT id, image_url, image_data, image_mime_type, image_order, is_cover FROM property_images WHERE property_id = $1 ORDER BY CASE WHEN is_cover = true THEN 0 ELSE 1 END, image_order',
        [property.id]
      );
      // Convert image data to base64 if available
      property.images = imagesResult.rows.map(img => ({
        id: img.id,
        image_url: img.image_url,
        image_data: img.image_data ? 'data:' + (img.image_mime_type || 'image/jpeg') + ';base64,' + img.image_data.toString('base64') : null,
        image_order: img.image_order,
        is_cover: img.is_cover
      }));

      // Set cover image to the marked cover image or first uploaded image if no URL or placeholder
      if (!property.cover_image_url || property.cover_image_url === 'data:image/stored') {
        const coverImage = property.images.find(img => img.is_cover) || property.images.find(img => img.image_data || img.image_url);
        if (coverImage) {
          property.cover_image_url = coverImage.image_data || coverImage.image_url;
        }
      }
    }

    res.json({
      message: 'Properties fetched successfully',
      data: {
        properties: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private (Admin/Staff)
router.post('/', authenticate, authorize('admin', 'staff'), uploadImages, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('address').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('property_type').optional().trim(),
  body('reserve_price').isFloat({ min: 0 }),
  body('auction_date').isISO8601(),
  body('zip_code').optional().matches(/^\d{6}$/).withMessage('Zip code must be exactly 6 digits'),
], async (req, res) => {
  try {
    console.log('🔍 Property creation request received');
    console.log('📋 Body keys:', Object.keys(req.body));
    console.log('📷 Files:', req.files ? Object.keys(req.files) : 'none');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('❌ Express validator errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      property_type,
      address,
      city,
      state,
      zip_code,
      country,
      area_sqft,
      bedrooms,
      bathrooms,
      floors,
      reserve_price,
      auction_date,
      auction_time,
      estimated_market_value,
      built_up_area,
      total_area,
      emd,
      possession_type,
      application_end_date,
      map_embed_code,
      coverImage
    } = req.body;

    console.log('📝 Form data received - reserve_price:', reserve_price, 'type:', typeof reserve_price);

    // Get uploaded files from multer
    const uploadedImages = req.files?.images || [];
    console.log('📸 Images count:', uploadedImages.length);
    
    let coverImageData = null;
    if (req.body.coverImage) {
      try {
        coverImageData = JSON.parse(req.body.coverImage);
      } catch (e) {
        // coverImage might be invalid JSON, ignore
      }
    }

    // Validate numeric fields before database insert to prevent NaN/invalid values
    console.log('🔢 Validating numeric fields...');
    
    const validatedReservePrice = parseFloat(reserve_price);
    if (isNaN(validatedReservePrice) || validatedReservePrice < 0) {
      console.warn('❌ Invalid reserve price:', reserve_price);
      return res.status(400).json({ 
        message: 'Invalid reserve price. Must be a valid positive number.' 
      });
    }
    console.log('✅ Reserve price valid:', validatedReservePrice);

    // Validate optional numeric fields
    const validatedAreaSqft = area_sqft ? parseFloat(area_sqft) : null;
    if (area_sqft && (isNaN(validatedAreaSqft) || validatedAreaSqft < 0)) {
      console.warn('❌ Invalid area:', area_sqft);
      return res.status(400).json({ 
        message: 'Invalid area. Must be a valid positive number.' 
      });
    }

    const validatedBedrooms = bedrooms ? parseInt(bedrooms) : null;
    if (bedrooms && (isNaN(validatedBedrooms) || validatedBedrooms < 0)) {
      console.warn('❌ Invalid bedrooms:', bedrooms);
      return res.status(400).json({ 
        message: 'Invalid bedrooms. Must be a valid non-negative number.' 
      });
    }

    const validatedBathrooms = bathrooms ? parseInt(bathrooms) : null;
    if (bathrooms && (isNaN(validatedBathrooms) || validatedBathrooms < 0)) {
      console.warn('❌ Invalid bathrooms:', bathrooms);
      return res.status(400).json({ 
        message: 'Invalid bathrooms. Must be a valid non-negative number.' 
      });
    }

    const validatedFloors = floors ? parseInt(floors) : null;
    if (floors && (isNaN(validatedFloors) || validatedFloors < 0)) {
      console.warn('❌ Invalid floors:', floors);
      return res.status(400).json({ 
        message: 'Invalid floors. Must be a valid non-negative number.' 
      });
    }

    const validatedEstimatedMarketValue = estimated_market_value ? parseFloat(estimated_market_value) : null;
    if (estimated_market_value && (isNaN(validatedEstimatedMarketValue) || validatedEstimatedMarketValue < 0)) {
      console.warn('❌ Invalid estimated market value:', estimated_market_value);
      return res.status(400).json({ 
        message: 'Invalid estimated market value. Must be a valid positive number.' 
      });
    }

    const validatedBuiltUpArea = built_up_area ? parseFloat(built_up_area) : null;
    if (built_up_area && (isNaN(validatedBuiltUpArea) || validatedBuiltUpArea < 0)) {
      console.warn('❌ Invalid built-up area:', built_up_area);
      return res.status(400).json({ 
        message: 'Invalid built-up area. Must be a valid positive number.' 
      });
    }

    const validatedTotalArea = total_area ? parseFloat(total_area) : null;
    if (total_area && (isNaN(validatedTotalArea) || validatedTotalArea < 0)) {
      console.warn('❌ Invalid total area:', total_area);
      return res.status(400).json({ 
        message: 'Invalid total area. Must be a valid positive number.' 
      });
    }

    const validatedEmd = emd ? parseFloat(emd) : null;
    if (emd && (isNaN(validatedEmd) || validatedEmd < 0)) {
      return res.status(400).json({ 
        message: 'Invalid EMD. Must be a valid positive number.' 
      });
    }

    // Validate auction date
    const auctionDate = new Date(auction_date);
    if (isNaN(auctionDate.getTime())) {
      console.warn('❌ Invalid auction date:', auction_date);
      return res.status(400).json({ 
        message: 'Invalid auction date. Must be a valid ISO8601 date.' 
      });
    }
    console.log('✅ All validations passed. Starting property creation...');

    // Wrap entire operation in retry logic for transient DB errors
    const property = await executeWithRetry(async () => {
      // Determine cover image - store as reference, not full base64 data
      let coverImageUrl = null;
      let coverImageIndex = null;
      if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
        if (coverImageData && coverImageData.type === 'new' && coverImageData.index !== undefined) {
          // Use the selected new image as cover
          coverImageIndex = coverImageData.index;
          coverImageUrl = null; // Will be set after images are saved
        } else {
          // Use first image as cover by default
          coverImageIndex = 0;
          coverImageUrl = null;
        }
      }

      // Determine status based on auction_date
      const now = new Date();
      const propertyStatus = auctionDate <= now ? 'active' : 'upcoming';

      // Create property with retry - use pre-validated numeric values
      const propertyResult = await queryWithRetry(
        `INSERT INTO properties (
          title, description, property_type, address, city, state, zip_code, country,
          area_sqft, area_unit, bedrooms, bathrooms, floors,
          reserve_price, auction_date, auction_time, cover_image_url, created_by,
          estimated_market_value, built_up_area, built_up_area_unit, total_area, total_area_unit, emd, possession_type, application_end_date,
          map_embed_code, is_active, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        RETURNING *`,
        [
          title, description || null, property_type || null, address, city,
          state || null, zip_code || null, country || 'India',
          validatedAreaSqft, req.body.area_unit || 'sq ft',
          validatedBedrooms, validatedBathrooms,
          validatedFloors,
          validatedReservePrice, auctionDate, auction_time || null, coverImageUrl, req.user.id,
          validatedEstimatedMarketValue,
          validatedBuiltUpArea, req.body.built_up_area_unit || 'sq ft',
          validatedTotalArea, req.body.total_area_unit || 'sq ft',
          validatedEmd,
          possession_type || null,
          application_end_date ? new Date(application_end_date) : null,
          map_embed_code || null,
          true, // is_active = true
          propertyStatus // status = 'active' or 'upcoming'
        ]
      );

      const property = propertyResult.rows[0];

      // Save images sequentially to avoid connection pool exhaustion and statement timeouts
      let savedImageCount = 0;
      if (uploadedImages && Array.isArray(uploadedImages) && uploadedImages.length > 0) {
        console.log(`📷 Starting to save ${uploadedImages.length} images for property ${property.id}`);
        
        for (let imageIndex = 0; imageIndex < uploadedImages.length; imageIndex++) {
          const file = uploadedImages[imageIndex];
          
          try {
            // File buffer is already from multer, no base64 conversion needed
            await queryWithRetry(
              'INSERT INTO property_images (property_id, image_data, image_mime_type, image_url, image_order, is_cover) VALUES ($1, $2, $3, $4, $5, $6)',
              [
                property.id, 
                file.buffer, // Use buffer directly from multer
                file.mimetype, // Use mimetype from multer
                file.originalname,
                imageIndex,
                imageIndex === coverImageIndex ? true : false // Mark cover image
              ],
              3 // Retry up to 3 times per image
            );
            savedImageCount++;
            console.log(`✅ Image ${imageIndex + 1}/${uploadedImages.length} saved`);
          } catch (err) {
            console.error(`❌ Failed to save image ${imageIndex + 1}/${uploadedImages.length}: ${err.message}`);
            // Delete the property if we can't save images - rollback
            await queryWithRetry('DELETE FROM properties WHERE id = $1', [property.id], 2).catch(() => {});
            throw new Error(`Failed to save image ${imageIndex + 1} of ${uploadedImages.length}: ${err.message}`);
          }
        }
        
        console.log(`✅ All ${savedImageCount} images saved successfully`);

        // Update property with cover image marker
        await queryWithRetry(
          'UPDATE properties SET cover_image_url = $1 WHERE id = $2',
          ['data:image/stored', property.id],
          2
        );
      }

      // Fetch complete property with images for response
      const propertyWithImages = await queryWithRetry(
        `SELECT p.*, 
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'image_order', pi.image_order,
              'is_cover', pi.is_cover
            ) ORDER BY pi.image_order
          ) FILTER (WHERE pi.id IS NOT NULL) as images
        FROM properties p
        LEFT JOIN property_images pi ON p.id = pi.property_id
        WHERE p.id = $1
        GROUP BY p.id`,
        [property.id],
        2
      );

      return propertyWithImages.rows[0];
    }, 3); // Retry up to 3 times for property creation

    res.status(201).json({ message: 'Property created successfully', data: { property } });
  } catch (error) {
    console.error('Create property error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      message: error.message
    });
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ 
      message: 'Failed to create property', 
      error: error.message || 'Database operation failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        detail: error.detail,
        hint: error.hint
      } : undefined
    });
  }
});

// @route   GET /api/properties/:id/images
// @desc    Get property images as base64
// @access  Public
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, image_data, image_mime_type, image_order 
       FROM property_images 
       WHERE property_id = $1 
       ORDER BY image_order`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ images: [] });
    }

    // Convert buffer to base64
    const images = result.rows.map(img => ({
      id: img.id,
      data: 'data:' + (img.image_mime_type || 'image/jpeg') + ';base64,' + img.image_data.toString('base64'),
      mimeType: img.image_mime_type,
      order: img.image_order
    }));

    res.json({ images });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private (Admin/Staff)
router.put('/:id', authenticate, authorize('admin', 'staff'), uploadImages, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const existing = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const {
      title, description, property_type, address, city, state, zip_code, country,
      latitude, longitude, area_sqft, bedrooms, bathrooms, floors,
      reserve_price, auction_date, auction_time, status, is_featured, is_active,
      estimated_market_value, built_up_area, total_area, emd, possession_type, application_end_date,
      map_embed_code, images, coverImageId, removeImageIds, coverImage
    } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (title !== undefined) {
      paramCount++;
      updates.push(`title = $${paramCount}`);
      values.push(title);
    }
    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }
    if (property_type !== undefined) {
      paramCount++;
      updates.push(`property_type = $${paramCount}`);
      values.push(property_type);
    }
    if (address !== undefined) {
      paramCount++;
      updates.push(`address = $${paramCount}`);
      values.push(address);
    }
    if (city !== undefined) {
      paramCount++;
      updates.push(`city = $${paramCount}`);
      values.push(city);
    }
    if (state !== undefined) {
      paramCount++;
      updates.push(`state = $${paramCount}`);
      values.push(state);
    }
    if (latitude !== undefined) {
      paramCount++;
      updates.push(`latitude = $${paramCount}`);
      values.push(latitude && latitude !== '' ? parseFloat(latitude) : null);
    }
    if (longitude !== undefined) {
      paramCount++;
      updates.push(`longitude = $${paramCount}`);
      values.push(longitude && longitude !== '' ? parseFloat(longitude) : null);
    }
    if (reserve_price !== undefined) {
      paramCount++;
      updates.push(`reserve_price = $${paramCount}`);
      values.push(parseFloat(reserve_price));
    }
    if (auction_date !== undefined) {
      paramCount++;
      updates.push(`auction_date = $${paramCount}`);
      values.push(new Date(auction_date));
    }
    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }
    if (is_featured !== undefined) {
      paramCount++;
      updates.push(`is_featured = $${paramCount}`);
      values.push(is_featured === 'true' || is_featured === true);
    }
    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active === 'true' || is_active === true);
    }
    if (auction_time !== undefined) {
      paramCount++;
      updates.push(`auction_time = $${paramCount}`);
      values.push(auction_time || null);
    }
    if (estimated_market_value !== undefined) {
      paramCount++;
      updates.push(`estimated_market_value = $${paramCount}`);
      values.push(estimated_market_value ? parseFloat(estimated_market_value) : null);
    }
    if (built_up_area !== undefined) {
      paramCount++;
      updates.push(`built_up_area = $${paramCount}`);
      values.push(built_up_area ? parseFloat(built_up_area) : null);
    }
    if (total_area !== undefined) {
      paramCount++;
      updates.push(`total_area = $${paramCount}`);
      values.push(total_area ? parseFloat(total_area) : null);
    }
    if (emd !== undefined) {
      paramCount++;
      updates.push(`emd = $${paramCount}`);
      values.push(emd ? parseFloat(emd) : null);
    }
    if (possession_type !== undefined) {
      paramCount++;
      updates.push(`possession_type = $${paramCount}`);
      values.push(possession_type || null);
    }
    if (application_end_date !== undefined) {
      paramCount++;
      updates.push(`application_end_date = $${paramCount}`);
      values.push(application_end_date ? new Date(application_end_date) : null);
    }
    if (map_embed_code !== undefined) {
      paramCount++;
      updates.push(`map_embed_code = $${paramCount}`);
      values.push(map_embed_code || null);
    }

    // Handle cover image based on coverImageId or coverImage
    if (coverImageId !== undefined && coverImageId !== null) {
      // Mark that images exist and should be fetched from property_images table
      paramCount++;
      updates.push(`cover_image_url = $${paramCount}`);
      values.push('data:image/stored');
      
      // Update is_cover flag in property_images
      await pool.query(
        'UPDATE property_images SET is_cover = false WHERE property_id = $1',
        [id]
      );
      await pool.query(
        'UPDATE property_images SET is_cover = true WHERE id = $1 AND property_id = $2',
        [coverImageId, id]
      );
    } else if (coverImage && coverImage.type === 'new' && coverImage.index !== undefined) {
      // Cover image is from newly added images - mark as stored
      if (images && images[coverImage.index]) {
        paramCount++;
        updates.push(`cover_image_url = $${paramCount}`);
        values.push('data:image/stored');
      }
    } else if (coverImage && coverImage.type === 'existing' && coverImage.id) {
      // Cover image is existing - mark as stored and update is_cover flag
      paramCount++;
      updates.push(`cover_image_url = $${paramCount}`);
      values.push('data:image/stored');
      
      await pool.query(
        'UPDATE property_images SET is_cover = false WHERE property_id = $1',
        [id]
      );
      await pool.query(
        'UPDATE property_images SET is_cover = true WHERE id = $1 AND property_id = $2',
        [coverImage.id, id]
      );
    }

    // Handle cover image

    if (req.files?.cover_image?.[0]) {
      paramCount++;
      updates.push(`cover_image_url = $${paramCount}`);
      const coverUrl = req.files.cover_image[0].secure_url || req.files.cover_image[0].path || `/uploads/images/${req.files.cover_image[0].filename}`;
      values.push(coverUrl);
    }

    if (updates.length === 0 && (!images || images.length === 0) && (!removeImageIds || removeImageIds.length === 0)) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    paramCount++;
    values.push(id);

    const query = `UPDATE properties SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    // Handle removed images
    if (removeImageIds && removeImageIds.length > 0) {
      for (const imageId of removeImageIds) {
        await pool.query(
          'DELETE FROM property_images WHERE id = $1 AND property_id = $2',
          [imageId, id]
        );
      }
    }

    // Handle new images (base64 from frontend)
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Check if it's a new image or existing
        if (image.id) {
          // Existing image - skip
          continue;
        }
        
        if (image.data) {
          // New image with base64 data
          const base64Data = image.data.split(',')[1] || image.data;
          const buffer = Buffer.from(base64Data, 'base64');
          const mimeType = image.mimeType || 'image/jpeg';
          
          const maxOrder = await pool.query(
            'SELECT COALESCE(MAX(image_order), -1) + 1 as next_order FROM property_images WHERE property_id = $1',
            [id]
          );
          
          // Check if this image should be the cover
          const isCover = coverImage && coverImage.type === 'new' && coverImage.index === i;
          
          await pool.query(
            'INSERT INTO property_images (property_id, image_url, image_data, image_mime_type, image_order, is_cover) VALUES ($1, $2, $3, $4, $5, $6)',
            [id, `property_${id}_image_${i}`, buffer, mimeType, maxOrder.rows[0].next_order, isCover]
          );
        }
      }
    }

    res.json({ message: 'Property updated successfully', data: { property: result.rows[0] } });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property (soft delete)
// @access  Private (Admin/Staff)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE properties SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/properties/:id/images
// @desc    Upload PDF for property
// @access  Private (Admin/Staff)
router.post('/:id/pdf', authenticate, authorize('admin', 'staff'), uploadPdf, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const pdfUrl = `/uploads/pdfs/${req.file.filename}`;

    await pool.query(
      'UPDATE properties SET pdf_url = $1 WHERE id = $2 RETURNING *',
      [pdfUrl, id]
    );

    res.json({ message: 'PDF uploaded successfully', pdf_url: pdfUrl });
  } catch (error) {
    console.error('Upload PDF error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/properties/:id/toggle-featured
// @desc    Toggle featured status of a property
// @access  Admin/Staff
router.put('/:id/toggle-featured', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const checkResult = await pool.query('SELECT is_featured FROM properties WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const currentFeatured = checkResult.rows[0].is_featured;
    const newFeatured = !currentFeatured;

    // Update featured status
    const result = await pool.query(
      'UPDATE properties SET is_featured = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [newFeatured, id]
    );

    res.json({
      message: `Property ${newFeatured ? 'added to' : 'removed from'} featured`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM properties WHERE id = $1 AND is_active = true', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const property = result.rows[0];

    // Get images
    const imagesResult = await pool.query(
      'SELECT id, image_url, image_data, image_mime_type, image_order, is_cover FROM property_images WHERE property_id = $1 ORDER BY CASE WHEN is_cover = true THEN 0 ELSE 1 END, image_order',
      [id]
    );
    property.images = imagesResult.rows.map(img => ({
      id: img.id,
      image_url: img.image_url,
      image_data: img.image_data ? 'data:' + (img.image_mime_type || 'image/jpeg') + ';base64,' + img.image_data.toString('base64') : null,
      image_order: img.image_order,
      is_cover: img.is_cover
    }));

    // Set cover image to the marked cover image or first image
    if (property.cover_image_url === 'data:image/stored' || !property.cover_image_url) {
      const coverImage = property.images.find(img => img.is_cover) || property.images[0];
      if (coverImage) {
        property.cover_image_url = coverImage.image_data || coverImage.image_url;
      }
    }

    // Increment view count
    await pool.query('UPDATE properties SET views_count = views_count + 1 WHERE id = $1', [id]);

    res.json({ message: 'Property fetched successfully', data: { property } });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/properties?is_featured=true
// @desc    Get featured properties
// @access  Public
// (This filtering is handled in the existing GET route)

export default router;


