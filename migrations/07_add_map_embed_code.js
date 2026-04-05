import pool from '../config/database.js';

export const up = async () => {
  try {
    // Add map_embed_code column to properties table
    await pool.query(`
      ALTER TABLE properties
      ADD COLUMN map_embed_code TEXT;
    `);
    
    console.log('✓ Migration: Added map_embed_code column to properties table');
  } catch (error) {
    // If column already exists, continue
    if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
      console.log('ℹ️ Migration notice: map_embed_code column already exists');
    } else {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

export const down = async () => {
  try {
    await pool.query(`
      ALTER TABLE properties
      DROP COLUMN map_embed_code;
    `);
    
    console.log('✓ Migration rolled back: map_embed_code column removed');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
};
