import pool from '../config/database.js';

export const up = async () => {
  try {
    // Make email nullable in enquiries table since it's optional
    await pool.query(`
      ALTER TABLE enquiries
      ALTER COLUMN email DROP NOT NULL;
    `);
    
    console.log('✓ Migration: Made enquiries.email nullable');
  } catch (error) {
    // If column doesn't exist or already nullable, continue
    if (error.message.includes('column') || error.message.includes('already')) {
      console.log('ℹ️ Migration notice: enquiries.email already nullable');
    } else {
      console.error('Migration error:', error);
      throw error;
    }
  }
};

export const down = async () => {
  try {
    await pool.query(`
      ALTER TABLE enquiries
      ALTER COLUMN email SET NOT NULL;
    `);
    
    console.log('✓ Migration rolled back: enquiries.email now NOT NULL');
  } catch (error) {
    console.error('Migration rollback error:', error);
    throw error;
  }
};
