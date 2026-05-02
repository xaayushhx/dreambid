/**
 * Database retry utility for handling transient connection errors
 * Implements exponential backoff and retry logic for Neon DB on Netlify
 */

export const isRetryableError = (error) => {
  const retryableErrorCodes = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'ECONNRESET',
    'EPIPE',
  ];

  const retryableErrorMessages = [
    'timeout',
    'connection',
    'FATAL',
    'pool',
    'client',
    'acquire',
    'socket hang up',
    'read ECONNRESET',
    'write ECONNRESET',
    'Connection rejected',
  ];

  // Check error code
  if (retryableErrorCodes.includes(error.code)) {
    return true;
  }

  // Check error message (case-insensitive)
  const errorMessage = (error.message || '').toLowerCase();
  return retryableErrorMessages.some(msg => errorMessage.includes(msg.toLowerCase()));
};

export const getRetryDelay = (attempt, maxDelay = 5000) => {
  // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, etc.
  const delay = Math.min(100 * Math.pow(2, attempt - 1), maxDelay);
  // Add small random jitter to prevent thundering herd
  const jitter = Math.random() * 50;
  return delay + jitter;
};

export const executeWithRetry = async (
  queryFn,
  maxRetries = 2,
  onRetry = null
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await queryFn();
      if (attempt > 1) {
        console.log(
          `✅ Operation succeeded on attempt ${attempt}/${maxRetries + 1}`
        );
      }
      return result;
    } catch (err) {
      lastError = err;
      const isRetryable = isRetryableError(err);

      if (isRetryable && attempt <= maxRetries) {
        const delay = getRetryDelay(attempt);
        console.warn(
          `⚠️  Attempt ${attempt}/${maxRetries + 1} failed (retryable): ${err.message}. Retrying in ${delay.toFixed(0)}ms...`
        );

        if (onRetry) {
          onRetry(attempt, delay, err);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        const errorType = isRetryable ? 'retryable but max retries reached' : 'non-retryable';
        console.error(
          `❌ Operation failed on attempt ${attempt}/${maxRetries + 1} (${errorType}): ${err.message}`
        );
        throw lastError;
      }
    }
  }

  throw lastError;
};
