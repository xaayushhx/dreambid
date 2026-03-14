#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Hash the password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // First, check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist. Run database initialization first.');
      process.exit(1);
    }
    
    // Upsert admin user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, full_name, role, is_active, created_at)
      VALUES ('admin@dreambid.com', $1, 'Admin User', 'admin', true, NOW())
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $1,
        role = 'admin',
        is_active = true
      RETURNING id, email, role;
    `, [passwordHash]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Admin user set up successfully:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${user.role}`);
    }
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdmin();
