import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import serverless from 'serverless-http';
import pool from '../config/database.js';
import CleanupService from '../services/CleanupService.js';

// Import routes
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import activityRoutes from '../routes/activity.js';
import propertyRoutes from '../routes/properties.js';
import enquiryRoutes from '../routes/enquiries.js';
import interestRoutes from '../routes/interests.js';
import blogRoutes from '../routes/blogs.js';
import userRegistrationRoutes from '../routes/user-registrations.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://dreambidp.vercel.app',
  'https://dreambidp.vercel.app',
  'https://dreambid.netlify.app',
  'https://dreambid-new.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database (non-blocking for serverless)
async function initializeDatabase() {
  let retries = 0;
  const maxRetries = 2;
  
  while (retries < maxRetries) {
    try {
      console.log('🔄 Checking database...');
      
      const tableCheck = await pool.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')"
      );
      
      if (!tableCheck.rows[0].exists) {
        console.log('📝 Database tables need to be created');
        // Skip auto-creation in serverless - should be done manually
        return;
      }
      
      console.log('✅ Database tables exist');
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Database check error (attempt ${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('⚠️  Could not verify database - continuing anyway');
}

// Initialize on first request (async, non-blocking)
let initialized = false;

app.use((req, res, next) => {
  // Start initialization in background if not done
  if (!initialized) {
    initialized = true;
    initializeDatabase().catch(err => console.error('Init error:', err));
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/user-registrations', userRegistrationRoutes);

// Health check endpoint - respond immediately without DB
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

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

export default serverless(app);
