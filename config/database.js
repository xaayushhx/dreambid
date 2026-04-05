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

// Use DATABASE_URL if available (Neon/Railway/Render), otherwise use NETLIFY_DATABASE_URL, otherwise use individual env vars
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

if (databaseUrl) {
  dbConfig = {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }, // Neon requires SSL
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dreambid',
    user: process.env.DB_USER || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // Only add password if it's provided (allows empty string for no password)
  if (process.env.DB_PASSWORD !== undefined) {
    dbConfig.password = process.env.DB_PASSWORD;
  }
}

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

export default pool;

