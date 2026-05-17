import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import pool from './config/database.js';
import CleanupService from './services/CleanupService.js';
import { initializeFirebase } from './services/NotificationService.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import activityRoutes from './routes/activity.js';
import propertyRoutes from './routes/properties.js';
import enquiryRoutes from './routes/enquiries.js';
import interestRoutes from './routes/interests.js';
import blogRoutes from './routes/blogs.js';
import userRegistrationRoutes from './routes/user-registrations.js';
import notificationRoutes from './routes/notifications.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://dreambidp.netlify.app',
  'https://dreambidp.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin matches allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all *.netlify.app domains
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    
    // Allow localhost variants
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Middleware - order matters!
// CORS must come before routes but after helmet for proper preflight handling
app.use(helmet({
  contentSecurityPolicy: false, // Allow external resources
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));

// Explicit OPTIONS handler for all routes (catch-all preflight)
app.options('*', cors(corsOptions));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parse error:', err);
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  next();
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Run migrations
async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'migrations_add_property_fields.sql');
    
    // Check if migration file exists
    if (!fs.existsSync(migrationPath)) {
      console.log('ℹ️  No pending migrations');
      return;
    }
    
    console.log('🔄 Running migrations...');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute entire migration as one transaction for idempotency
    try {
      await pool.query(migrationSql);
      console.log('✅ Migrations completed successfully');
    } catch (err) {
      // Log but don't fail - migrations are idempotent
      console.log('ℹ️  Migration notice:', err.message.split('\n')[0]);
    }
  } catch (error) {
    console.error('⚠️  Migration error:', error.message);
    // Don't fail startup on migration errors
  }
}

// Helper to read SQL file safely - executes schema/seed files
async function executeSqlFile(filePath, isSchema = false) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`ℹ️  No SQL file found at ${filePath}`);
      return;
    }
    
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    if (isSchema) {
      // For schema files, execute as a single transaction for consistency
      // This handles interdependent statements better
      try {
        await pool.query(sql);
        console.log(`✅ Schema file executed successfully`);
      } catch (err) {
        // If it's a fresh database, the DROP statements will pass but CREATE might have issues
        // Try to recover by executing statement by statement with better error handling
        console.log(`ℹ️  Full transaction failed, attempting statement-by-statement execution...`);
        
        const statements = sql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        let successCount = 0;
        for (const statement of statements) {
          try {
            await pool.query(statement);
            successCount++;
          } catch (execErr) {
            // Log but continue for schema files
            if (!(execErr.message.includes('already exists') || 
                  execErr.message.includes('duplicate key') ||
                  execErr.message.includes('does not exist'))) {
              console.warn(`⚠️  Statement error: ${execErr.message.split('\n')[0]}`);
            }
          }
        }
        console.log(`✅ Completed ${successCount}/${statements.length} statements`);
      }
    } else {
      // For seed files, execute statement by statement
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (err) {
          if (!(err.message.includes('duplicate key') || err.message.includes('already exists'))) {
            throw err;
          }
        }
      }
    }
  } catch (error) {
    console.error(`⚠️  Error executing SQL file ${filePath}:`, error.message);
    throw error;
  }
}

// Initialize database on startup
async function initializeDatabase() {
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      console.log('🔄 Checking/initializing database...');
      
      // Test connection first
      await pool.query('SELECT 1');
      console.log('✅ Database connection established');
      
      // Check if users table exists
      const tableCheck = await pool.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')"
      );
      
      if (!tableCheck.rows[0].exists) {
        console.log('📝 Creating database schema from clean-db.sql...');
        // Use clean-db.sql which has comprehensive schema with proper constraints
        // This will throw if it fails, which we'll catch
        await executeSqlFile(path.join(__dirname, 'clean-db.sql'), true);
        console.log('✅ Schema created successfully');
        
        // Verify the users table was actually created
        const verifyTable = await pool.query(
          "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')"
        );
        
        if (!verifyTable.rows[0].exists) {
          throw new Error('Users table creation failed - schema execution did not complete properly');
        }
      } else {
        console.log('✅ Database tables already exist');
      }
      
      // Verify admin user exists
      const adminCheck = await pool.query(
        "SELECT id FROM users WHERE email = 'admin@dreambid.com' LIMIT 1"
      );
      
      if (adminCheck.rows.length === 0) {
        console.log('📝 Creating admin user...');
        const adminPasswordHash = '$2a$10$53Do2hAKDxUAGWI8JDWAbu8B4gRgIJR0xM1MGXeyWgJiRYyF4QJlS'; // admin123456
        await pool.query(
          `INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
           VALUES ('admin@dreambid.com', $1, 'Admin User', '5551234567', 'admin', true)`
        , [adminPasswordHash]);
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
      
      return; // Success - exit function
    } catch (error) {
      retries++;
      console.error(`❌ Database initialization error (attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('⚠️  Max retries reached. Server will start with limited functionality.');
        // Don't throw - let the server continue
      }
    }
  }
}

// Initialize database before starting server
await initializeDatabase();

// Run migrations after database initialization
await runMigrations();

// Initialize cleanup service (scheduled jobs)
CleanupService.initSchedules();

// Initialize Firebase for notifications (non-blocking)
try {
  initializeFirebase();
} catch (error) {
  console.warn('⚠️  Firebase initialization skipped:', error.message);
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/user-registrations', userRegistrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check - simple and always available
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 DreamBid Unified Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;