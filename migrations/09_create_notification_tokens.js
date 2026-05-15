/**
 * Migration: Create notification_tokens table
 * This table stores device tokens for push notifications on mobile apps
 */
export const up = async (pool) => {
  try {
    // Create notification_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        device_token VARCHAR(255) NOT NULL UNIQUE,
        platform VARCHAR(20) CHECK (platform IN ('ios', 'android')) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for faster queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id 
      ON notification_tokens(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notification_tokens_device_token 
      ON notification_tokens(device_token);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notification_tokens_is_active 
      ON notification_tokens(is_active);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_active 
      ON notification_tokens(user_id, is_active);
    `);

    console.log('✓ notification_tokens table created successfully');
  } catch (error) {
    if (error.code !== 'DUPLICATE_SCHEMA' && !error.message.includes('already exists')) {
      throw error;
    }
    console.log('✓ notification_tokens table already exists');
  }
};

export const down = async (pool) => {
  try {
    await pool.query('DROP TABLE IF EXISTS notification_tokens CASCADE;');
    console.log('✓ notification_tokens table dropped');
  } catch (error) {
    console.error('Error dropping notification_tokens table:', error);
    throw error;
  }
};

export default { up, down };
