import pool from '../config/database.js';

export const up = async () => {
  try {
    // Make image_url nullable in blog_images table
    await pool.query(`
      ALTER TABLE blog_images
      ALTER COLUMN image_url DROP NOT NULL;
    `);
    
    console.log('✓ Migration: Made blog_images.image_url nullable');
  } catch (error) {
    // If column doesn't exist or already nullable, continue
    if (error.message.includes('column') || error.message.includes('already')) {
      console.log('ℹ️ Migration notice: blog_images.image_url already handled');
    } else {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

export const down = async () => {
  try {
    await pool.query(`
      ALTER TABLE blog_images
      ALTER COLUMN image_url SET NOT NULL;
    `);
    
    console.log('✓ Migration rolled back: blog_images.image_url now NOT NULL');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
};
