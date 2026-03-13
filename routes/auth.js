import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user with bcrypt password hashing
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number')
], AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user and receive JWT token (accepts phone or email)
// @access  Public
router.post('/login', [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  // Custom validation to check either phone or email
  body().custom((value, { req }) => {
    if (!req.body.phone && !req.body.email) {
      throw new Error('Phone number or email is required');
    }
    // If email is provided, validate it
    if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      throw new Error('Valid email is required');
    }
    // If phone is provided, validate it
    if (req.body.phone && !/^\d{10}$/.test(req.body.phone.replace(/\D/g, ''))) {
      throw new Error('Valid 10-digit phone number is required');
    }
    return true;
  })
], AuthController.login);

// @route   GET /api/auth/me
// @desc    Get current authenticated user
// @access  Private
router.get('/me', authenticate, AuthController.getCurrentUser);

// @route   POST /api/auth/logout
// @desc    Logout user and log the event
// @access  Private
router.post('/logout', authenticate, AuthController.logout);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
], AuthController.changePassword);

// @route   POST /api/auth/verify
// @desc    Verify JWT token validity
// @access  Private
router.post('/verify', authenticate, AuthController.verifyToken);

export default router;