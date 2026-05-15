import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import activityRoutes from '../routes/activity.js';
import propertyRoutes from '../routes/properties.js';
import enquiryRoutes from '../routes/enquiries.js';
import interestRoutes from '../routes/interests.js';
import blogRoutes from '../routes/blogs.js';
import userRegistrationRoutes from '../routes/user-registrations.js';
import notificationRoutes from '../routes/notifications.js';
import { initializeFirebase } from '../services/NotificationService.js';

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://dreambidp.netlify.app',
  'https://dreambidp.netlify.app',
  'https://dreambid.netlify.app',
  'https://dreambid-new.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow no origin (mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check exact matches
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

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase for notifications
try {
  initializeFirebase();
  console.log('✓ Firebase initialized for push notifications');
} catch (error) {
  console.warn('⚠️  Firebase initialization failed - push notifications disabled:', error.message);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

export default app;
