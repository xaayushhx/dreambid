import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import UserActivity from '../models/UserActivity.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

class AuthController {
  // Register a new user
  static async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, full_name, phone } = req.body;

      // Check if user exists by email
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Check if phone number is already registered (if provided)
      if (phone) {
        const existingPhone = await User.findByPhone(phone);
        if (existingPhone) {
          return res.status(409).json({ message: 'Phone number already registered' });
        }
      }

      // Create user with bcrypt hashing
      const user = await User.create(email, password, full_name, phone, 'user');

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Log user activity
      await UserActivity.log(
        user.id,
        'user_registered',
        'authentication',
        { email, full_name },
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.message === 'Email already exists') {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Handle unique constraint violations from database
      if (error.code === '23505') {
        if (error.constraint === 'users_email_key') {
          return res.status(409).json({ message: 'Email already registered' });
        } else if (error.constraint === 'users_phone_key') {
          return res.status(409).json({ message: 'Phone number already registered' });
        }
      }

      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { phone, password } = req.body;

      // Find user by phone
      const user = await User.findByPhone(phone);

      if (!user) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({ message: 'Account is inactive' });
      }

      // Verify password using bcrypt
      const isPasswordValid = await User.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        // Log failed login attempt
        await UserActivity.log(
          user.id,
          'login_failed',
          'authentication',
          { reason: 'invalid_password' },
          req.ip,
          req.get('user-agent')
        );
        return res.status(401).json({ message: 'Invalid phone number or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRE }
      );

      // Log successful login
      await UserActivity.log(
        user.id,
        'user_login',
        'authentication',
        { phone },
        req.ip,
        req.get('user-agent')
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  }

  // Get current authenticated user
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          is_active: user.is_active
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      // Log logout event
      await UserActivity.log(
        req.userId,
        'user_logout',
        'authentication',
        {},
        req.ip,
        req.get('user-agent')
      );

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed', error: error.message });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { current_password, new_password } = req.body;

      // Get user with password
      const user = await User.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await User.verifyPassword(current_password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Change password
      const updatedUser = await User.changePassword(req.userId, new_password);

      // Log password change
      await UserActivity.log(
        req.userId,
        'password_changed',
        'authentication',
        {},
        req.ip,
        req.get('user-agent')
      );

      res.json({
        message: 'Password changed successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  }

  // Verify token
  static async verifyToken(req, res) {
    try {
      res.json({
        valid: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ message: 'Token verification failed', error: error.message });
    }
  }
}

export default AuthController;
