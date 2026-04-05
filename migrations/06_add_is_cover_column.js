import pool from '../config/database.js';

export const up = async () => {
  try {
    // Add is_cover column to property_images table to track cover image
    await pool.query(`
      ALTER TABLE property_images
      ADD COLUMN is_cover BOOLEAN DEFAULT false;
    `);
    
    console.log('✓ Migration: Added is_cover column to property_images table');
  } catch (error) {
    // If column already exists, continue
    if (error.message.includes('already exists') || error.message.includes('column')) {
      console.log('ℹ️ Migration notice: is_cover column already exists');
    } else {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

export const down = async () => {
  try {
    await pool.query(`
      ALTER TABLE property_images
      DROP COLUMN is_cover;
    `);
    
    console.log('✓ Migration rolled back: is_cover column removed from property_images');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
};
