import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Find user by email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Find user by phone
  static async findByPhone(phone) {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  }

  // Find user by id
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, profile_photo, role, is_active, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Find user by id including password hash (for password verification only)
  static async findByIdWithPassword(id) {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, profile_photo, role, is_active, password_hash, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Create a new user with bcrypt hashed password
  static async create(email, password, fullName, phone = null, role = 'user') {
    try {
      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING id, email, full_name, phone, role, created_at`,
        [email, passwordHash, fullName, phone, role, true]
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const { full_name, phone, role, is_active, profile_photo } = updates;
    
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($2, full_name),
           phone = COALESCE($3, phone),
           role = COALESCE($4, role),
           is_active = COALESCE($5, is_active),
           profile_photo = COALESCE($6, profile_photo),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, phone, profile_photo, role, is_active, updated_at`,
      [id, full_name, phone, role, is_active, profile_photo]
    );

    return result.rows[0];
  }

  // Change password
  static async changePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, role`,
      [id, passwordHash]
    );

    return result.rows[0];
  }

  // Update password (alias for changePassword)
  static async updatePassword(id, newPassword) {
    return this.changePassword(id, newPassword);
  }

  // Get all users (admin only)
  static async getAll(limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // Deactivate user
  static async deactivate(id) {
    const result = await pool.query(
      `UPDATE users 
       SET is_active = false, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, is_active`,
      [id]
    );
    return result.rows[0];
  }

  // Activate user
  static async activate(id) {
    const result = await pool.query(
      `UPDATE users 
       SET is_active = true, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, is_active`,
      [id]
    );
    return result.rows[0];
  }
}

export default User;
