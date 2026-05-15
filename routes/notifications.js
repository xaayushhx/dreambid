import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '../services/NotificationService.js';

const router = express.Router();

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register device token for push notifications
 * @access  Private
 */
router.post(
  '/register-token',
  authenticate,
  [
    body('deviceToken').trim().notEmpty().withMessage('Device token is required'),
    body('platform')
      .isIn(['ios', 'android'])
      .withMessage('Platform must be either ios or android'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deviceToken, platform } = req.body;
      const userId = req.user.userId;

      const result = await registerDeviceToken(userId, deviceToken, platform);

      res.status(200).json({
        message: 'Device token registered successfully',
        token: result,
      });
    } catch (error) {
      console.error('Register token error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

/**
 * @route   POST /api/notifications/unregister-token
 * @desc    Unregister device token (on logout)
 * @access  Private
 */
router.post(
  '/unregister-token',
  authenticate,
  [body('deviceToken').trim().notEmpty().withMessage('Device token is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { deviceToken } = req.body;

      await unregisterDeviceToken(deviceToken);

      res.status(200).json({
        message: 'Device token unregistered successfully',
      });
    } catch (error) {
      console.error('Unregister token error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

export default router;
