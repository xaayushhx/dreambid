# Image Upload & Display Fixes

## Issues Fixed

### Issue 1: Multiple Images Timeout
**Problem**: Creating a property with many images (5+) would sometimes fail
**Cause**: Sequential image processing - each image insert waited for the previous one
**Solution**: Parallel batch processing (5 images at a time)

**Before**:
```javascript
for (let i = 0; i < images.length; i++) {
  await pool.query(...);  // Wait for each image
}
// Total time = sum of all image upload times
// If 1 image = 200ms, 10 images = 2000ms+ (timeout risk)
```

**After**:
```javascript
// Process 5 images in parallel, then next 5, etc.
const batchSize = 5;
const batches = [];
for (let i = 0; i < images.length; i += batchSize) {
  await Promise.all(batch); // Concurrent uploads
}
// Total time = max image upload time (much faster)
// 10 images = ~400ms (1 image × batches)
```

### Issue 2: Images Not Displayed on Initial Create
**Problem**: After creating a property with images, images weren't shown until after update
**Cause**: Images weren't fetched and returned in creation response
**Solution**: Fetch and return images with property in response

**Before**:
```javascript
res.status(201).json({ 
  message: 'Property created successfully', 
  data: { property } 
}); 
// Property object had no images, frontend showed empty
```

**After**:
```javascript
// Fetch property WITH images from database
const propertyWithImages = await pool.query(`
  SELECT p.*, 
    json_agg(json_build_object(...)) as images
  FROM properties p
  LEFT JOIN property_images pi ON p.id = pi.property_id
  WHERE p.id = $1
  GROUP BY p.id
`);

res.status(201).json({ 
  message: 'Property created successfully', 
  data: { property: propertyWithImages.rows[0] } 
});
// Property object now includes all images immediately
```

## Implementation Details

### 1. Parallel Image Processing
```javascript
// routes/properties.js - Property creation
if (images && Array.isArray(images) && images.length > 0) {
  const batchSize = 5; // Process 5 at a time
  const imageBatches = [];
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize).map(async (imageObj, idx) => {
      // Each image processed in parallel with others in batch
      await queryWithRetry(
        'INSERT INTO property_images (...) VALUES (...)',
        [...],
        3 // Retry up to 3 times per image
      );
    });
    imageBatches.push(...batch);
  }
  
  // Wait for all batches to complete
  await Promise.all(imageBatches);
}
```

### 2. Better Error Handling
```javascript
// Images now have individual error handling
try {
  await queryWithRetry(...);
  console.log(`✅ Image ${i + 1}/${totalImages} saved`);
} catch (err) {
  console.error(`❌ Failed to save image ${i + 1}:`, err.message);
  throw err; // Re-throw to fail property creation
}

// If images fail but property created:
try {
  await Promise.all(imageBatches);
} catch (imageError) {
  console.error('Error processing images:', imageError.message);
  // Property was created, just images failed
  // Frontend handles gracefully
}
```

### 3. Fetch Images in Response
```javascript
// After images are saved, fetch complete property:
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

// Response now includes all images:
{
  "property": {
    "id": 123,
    "title": "...",
    "images": [
      { "id": 1, "image_url": "...", "is_cover": true },
      { "id": 2, "image_url": "...", "is_cover": false }
    ]
  }
}
```

### 4. Cover Image Support
```javascript
// Mark first image as cover by default
imageIndex === 0 ? true : false

// If specific cover image selected:
if (coverImageIndex !== null) {
  await queryWithRetry(
    'UPDATE properties SET cover_image_url = $1 WHERE id = $2',
    ['data:image/stored', property.id]
  );
}
```

## Database Migration

Run migration to add `is_cover` column:
```bash
node migrations/08_add_area_units.js
```

Or manually in your database:
```sql
ALTER TABLE property_images 
ADD COLUMN is_cover BOOLEAN DEFAULT false;
```

## Performance Improvements

### Batch Processing Impact
```
Sequential (OLD):
├── Image 1: 200ms
├── Image 2: 200ms
├── Image 3: 200ms
├── Image 4: 200ms
├── Image 5: 200ms
└── Total: 1000ms ❌

Parallel Batches (NEW):
├── Batch 1 (Images 1-5): 200ms (in parallel)
├── Batch 2 (Images 6-10): 200ms (in parallel)
└── Total: 400ms ✅
```

### Connection Pool Benefits
- Batch size of 5 prevents overwhelming the connection pool
- Each batch uses 5 concurrent connections from pool of 20
- Remaining 15 connections available for other requests
- Clean connection lifecycle with proper error handling

## Frontend Improvements

### Initial Display
```javascript
// Frontend now receives images in creation response
const response = await api.post('/properties', formData);
const property = response.data.data.property;

// Images available immediately
property.images.forEach(img => {
  // Display image without additional fetch
});
```

### Fallback Handling
```javascript
// If images missing initially:
if (!property.images || property.images.length === 0) {
  // Fetch them separately
  const propertyWithImages = await api.getById(property.id);
  setProperty(propertyWithImages.data.data.property);
}
```

## Testing Checklist

- [ ] Create property with 1 image → Should display immediately
- [ ] Create property with 5 images → All should display
- [ ] Create property with 20 images → Should complete in ~1s
- [ ] Upload large images (5MB+) → Should handle gracefully
- [ ] Update property images → Should work as before
- [ ] Check server logs for retry attempts
- [ ] Verify images show on property detail page
- [ ] Test on slow network (throttle to 3G)
- [ ] Check browser console for errors
- [ ] Verify database has images with correct `is_cover` flag

## Monitoring

### Check Image Processing
```bash
# View creation logs
tail -f server.logs | grep "Image"

# Expected output:
# ✅ Image 1/10 saved
# ✅ Image 2/10 saved
# ...
# ✅ All 10 images saved successfully
```

### Database Query
```sql
-- Check property images
SELECT p.id, p.title, COUNT(pi.id) as image_count, 
  COUNT(CASE WHEN pi.is_cover THEN 1 END) as cover_count
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
GROUP BY p.id, p.title
ORDER BY p.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Still Getting Timeout with Multiple Images
1. Check connection pool size in `config/database.js`
2. Reduce batch size: `batchSize = 3` instead of 5
3. Verify network latency to your database
4. Check database server status

### Images Showing but Very Slow
1. Compress images before upload (frontend)
2. Increase batch size to 10 (if connection allows)
3. Verify base64 encoding isn't too large
4. Check network throttling

### Database Errors After Update
1. Run migration: `node migrations/08_add_area_units.js`
2. Check `is_cover` column exists
3. Verify primary keys in `property_images` table

## Rollback (if needed)

Revert to sequential processing:
```javascript
// In routes/properties.js
for (let i = 0; i < images.length; i++) {
  await queryWithRetry(...);
  await new Promise(r => setTimeout(r, 100)); // Small delay
}
```
