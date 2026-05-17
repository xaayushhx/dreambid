import pool from '../config/database.js';

export const up = async () => {
  try {
    // Check if table exists
    const tableExists = await pool.query(
      `SELECT EXISTS(
        SELECT FROM information_schema.tables 
        WHERE table_name = 'blogs'
      )`
    );

    if (tableExists.rows[0].exists) {
      console.log('✓ Blogs table already exists');
      return;
    }

    // Create blogs table
    await pool.query(`
      CREATE TABLE blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL CHECK (category IN ('buying', 'investment', 'market', 'legal')),
        author VARCHAR(255) NOT NULL,
        image TEXT,
        read_time VARCHAR(50),
        status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
        views_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_featured BOOLEAN DEFAULT false
      );
    `);

    // Create indexes
    await pool.query('CREATE INDEX idx_blogs_status ON blogs(status)');
    await pool.query('CREATE INDEX idx_blogs_category ON blogs(category)');
    await pool.query('CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC)');
    await pool.query('CREATE INDEX idx_blogs_created_by ON blogs(created_by)');

    console.log('✓ Migration: Blogs table created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Migration notice: Blogs table already exists');
    } else {
      console.error('Migration error:', error.message);
    }
  }
};

export const down = async () => {
  try {
    await pool.query('DROP TABLE IF EXISTS blogs CASCADE');
    console.log('✓ Migration rolled back: Blogs table removed');
  } catch (error) {
    console.error('Migration rollback error:', error.message);
  }
};
