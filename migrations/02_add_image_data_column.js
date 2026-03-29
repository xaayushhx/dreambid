import pool from '../config/database.js';

export const up = async () => {
  try {
    // Add image_data column to store base64 encoded images
    await pool.query(`
      ALTER TABLE property_images 
      ADD COLUMN IF NOT EXISTS image_data BYTEA,
      ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR(50) DEFAULT 'image/jpeg';
    `);
    
    console.log('✓ Migration: Added image_data and image_mime_type columns to property_images');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};

export const down = async () => {
  try {
    await pool.query(`
      ALTER TABLE property_images 
      DROP COLUMN IF EXISTS image_data,
      DROP COLUMN IF EXISTS image_mime_type;
    `);
    
    console.log('✓ Migration rolled back: Removed image_data and image_mime_type columns');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
};
