import pool from './config/database.js';

async function verify() {
  try {
    const result = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'map_embed_code'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ map_embed_code column exists in properties table');
    } else {
      console.log('✗ map_embed_code column NOT found in properties table');
    }
    
    // Also check the column type and properties
    const colDetails = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'map_embed_code'
    `);
    
    if (colDetails.rows.length > 0) {
      const col = colDetails.rows[0];
      console.log(`  Type: ${col.data_type}, Nullable: ${col.is_nullable}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

verify();
