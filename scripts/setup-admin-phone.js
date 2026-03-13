import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function setupAdminWithPhone() {
  try {
    const phone = '9876543210';
    const email = 'admin@dreambid.com';
    const fullName = 'Admin';
    const password = 'admin123';

    // Generate password hash
    const hash = await bcrypt.hash(password, 10);

    // Try to update existing admin
    const updateRes = await pool.query(
      "UPDATE users SET password_hash = $1, phone = $2, full_name = $3 WHERE role = 'admin' RETURNING id, email, phone",
      [hash, phone, fullName]
    );

    if (updateRes.rows.length > 0) {
      console.log('✅ Admin user updated successfully');
      console.log('Email:', updateRes.rows[0].email);
      console.log('Phone:', updateRes.rows[0].phone);
    } else {
      // Create new admin if doesn't exist
      const insertRes = await pool.query(
        "INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES ($1, $2, $3, $4, 'admin', true) RETURNING id, email, phone",
        [email, hash, fullName, phone]
      );

      if (insertRes.rows.length > 0) {
        console.log('✅ Admin user created successfully');
        console.log('Email:', insertRes.rows[0].email);
        console.log('Phone:', insertRes.rows[0].phone);
      }
    }

    console.log('\n📱 Admin Login Credentials:');
    console.log('Phone: 9876543210');
    console.log('Password: admin123');
    console.log('\n✨ You can now login as admin using the phone number!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message || error);
    process.exit(1);
  }
}

setupAdminWithPhone();
