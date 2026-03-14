import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
// Netlify Functions will have NODE_PATH set, so just call config() without path
dotenv.config();

// Build connection config
let dbConfig;

// Use DATABASE_URL if available (Neon/Railway/Render), otherwise use individual env vars
if (process.env.DATABASE_URL) {
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
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

