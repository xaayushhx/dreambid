import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user with bcrypt password hashing
// @access  Public
router.post('/register', [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Phone number must be exactly 10 digits'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required')
], AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user with phone number and receive JWT token
// @access  Public
router.post('/login', [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\d{10}$/)
    .withMessage('Valid 10-digit phone number is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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