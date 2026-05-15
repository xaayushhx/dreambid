import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (handle both ESM and CommonJS environments)
let __filename;
let __dirname;

try {
  __filename = fileURLToPath(import.meta.url);
  __dirname = path.dirname(__filename);
} catch (e) {
  // In Netlify Functions or other CommonJS environments, use current directory
  __dirname = process.cwd();
}

// Load environment variables - check for .env.local first (development), then .env (production)
const envPath = process.env.NODE_ENV === 'development' 
  ? path.join(__dirname, '.env.local')
  : path.join(__dirname, '.env');

// Only try to load .env files if not in production or if the file exists
if (process.env.NODE_ENV !== 'production') {
  try {
    dotenv.config({ path: envPath });
  } catch (e) {
    // Silently fail if .env file doesn't exist in serverless environment
  }
}

// Build connection config
let dbConfig;

// Use DATABASE_URL if available (Railway/Render), otherwise use NETLIFY_DATABASE_URL, otherwise use individual env vars
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (databaseUrl) {
  dbConfig = {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Increased timeout for cold starts
    statement_timeout: 10000, // Statement timeout
    application_name: 'dreambid-app',
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dreambid',
    user: process.env.DB_USER || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    statement_timeout: 10000,
  };

  // Only add password if it's provided (allows empty string for no password)
  if (process.env.DB_PASSWORD !== undefined) {
    dbConfig.password = process.env.DB_PASSWORD;
  }
}

const pool = new Pool(dbConfig);

// Keep DB warm - ping every 30 seconds to prevent sleep/cold start
const keepAliveInterval = setInterval(async () => {
  try {
    await pool.query('SELECT 1');
  } catch (err) {
    console.warn('⚠️  Keep-alive ping failed:', err.message);
  }
}, 30000); // Every 30 seconds

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, just log the error
  process.exitCode = -1;
});

// Graceful shutdown
process.on('SIGINT', () => {
  clearInterval(keepAliveInterval);
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearInterval(keepAliveInterval);
  pool.end();
  process.exit(0);
});

// Retry wrapper function - retry DB query 2-3 times before failing
export const queryWithRetry = async (query, params, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await pool.query(query, params);
      if (attempt > 1) {
        console.log(`✅ Query succeeded on attempt ${attempt}/${maxRetries + 1}`);
      }
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️  Query attempt ${attempt}/${maxRetries + 1} failed:`, err.message);
      
      // Only retry on connection errors or timeout errors
      const isRetryableError = err.code === 'ECONNREFUSED' || 
                               err.code === 'ETIMEDOUT' ||
                               err.code === 'ENOTFOUND' ||
                               err.message.includes('timeout') ||
                               err.message.includes('connection') ||
                               err.message.includes('FATAL');
      
      if (!isRetryableError || attempt === maxRetries + 1) {
        throw lastError;
      }
      
      // Exponential backoff: 100ms, 200ms
      const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

export default pool;

