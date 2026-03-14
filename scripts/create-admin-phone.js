import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function run() {
  try {
    const phone = '1234567890';
    const password = 'admin123';
    const email = `admin-${phone}@dreambid.com`;
    const fullName = 'Admin';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Check if user with this phone already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      console.log('User with phone', phone, 'already exists. Updating password...');
      const res = await pool.query(
        'UPDATE users SET password_hash = $1, is_active = true WHERE phone = $2 RETURNING id, email, phone',
        [passwordHash, phone]
      );
      console.log('✅ Password updated for user:', res.rows[0]);
    } else {
      // Create new admin user
      const res = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, email, full_name, phone, role`,
        [email, passwordHash, fullName, phone, 'admin', true]
      );
      console.log('✅ Admin user created:', res.rows[0]);
    }

    console.log('\nYou can now login with:');
    console.log('Phone:', phone);
    console.log('Password:', password);
  } catch (err) {
    console.error('Error:', err.message || err);
  } finally {
    await pool.end();
  }
}

run();
