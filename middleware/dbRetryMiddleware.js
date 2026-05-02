/**
 * Express middleware wrapper for database retry logic
 * Wraps route handlers to retry on transient DB errors
 */

import { executeWithRetry } from '../utils/dbRetry.js';

/**
 * Wraps a route handler with retry logic for database operations
 * @param {Function} handler - The route handler function
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Function} Wrapped handler
 */
export const withDatabaseRetry = (handler, maxRetries = 2) => {
  return async (req, res, next) => {
    try {
      // Wrap the handler in retry logic
      await executeWithRetry(
        () => handler(req, res, next),
        maxRetries,
        (attempt, delay, err) => {
          // Optional callback for logging retry attempts
          req.retryAttempt = attempt;
        }
      );
    } catch (error) {
      // If all retries failed, pass to error handler
      next(error);
    }
  };
};

/**
 * Global error handler middleware for database errors
 * Should be used as the last middleware in Express
 */
export const databaseErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDatabaseError = err.code || err.message?.includes('database');

  console.error('Error Handler:', {
    message: err.message,
    code: err.code,
    statusCode,
    isDatabaseError: isDatabaseError,
    url: req.url,
    method: req.method,
  });

  if (isDatabaseError) {
    return res.status(statusCode).json({
      error: 'Database operation failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later',
      code: err.code,
    });
  }

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code,
  });
};
