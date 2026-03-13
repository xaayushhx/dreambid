import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

// Minimal imports to avoid errors
let authRoutes, userRoutes, activityRoutes, propertyRoutes, enquiryRoutes, interestRoutes, blogRoutes, userRegistrationRoutes;

try {
  const routes = await Promise.all([
    import('../routes/auth.js').then(m => m.default),
    import('../routes/user.js').then(m => m.default),
    import('../routes/activity.js').then(m => m.default),
    import('../routes/properties.js').then(m => m.default),
    import('../routes/enquiries.js').then(m => m.default),
    import('../routes/interests.js').then(m => m.default),
    import('../routes/blogs.js').then(m => m.default),
    import('../routes/user-registrations.js').then(m => m.default),
  ]);
  [authRoutes, userRoutes, activityRoutes, propertyRoutes, enquiryRoutes, interestRoutes, blogRoutes, userRegistrationRoutes] = routes;
} catch (err) {
  console.error('Route import error:', err);
}

// Configuration
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
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize on first request (async, non-blocking)
let initialized = false;

app.use((req, res, next) => {
  // Start initialization in background if not done
  if (!initialized) {
    initialized = true;
    console.log('Initialization started in background');
  }
  next();
});

// API Routes - load only if available
if (authRoutes) app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/user', userRoutes);
if (activityRoutes) app.use('/api/activity', activityRoutes);
if (propertyRoutes) app.use('/api/properties', propertyRoutes);
if (enquiryRoutes) app.use('/api/enquiries', enquiryRoutes);
if (interestRoutes) app.use('/api/interests', interestRoutes);
if (blogRoutes) app.use('/api/blogs', blogRoutes);
if (userRegistrationRoutes) app.use('/api/user-registrations', userRegistrationRoutes);

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
