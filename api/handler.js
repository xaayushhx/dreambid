import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';

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

// Load routes dynamically
async function setupRoutes() {
  try {
    const [authRoutes, userRoutes, activityRoutes, propertyRoutes, enquiryRoutes, interestRoutes, blogRoutes, userRegistrationRoutes] = await Promise.all([
      import('../routes/auth.js').then(m => m.default),
      import('../routes/user.js').then(m => m.default),
      import('../routes/activity.js').then(m => m.default),
      import('../routes/properties.js').then(m => m.default),
      import('../routes/enquiries.js').then(m => m.default),
      import('../routes/interests.js').then(m => m.default),
      import('../routes/blogs.js').then(m => m.default),
      import('../routes/user-registrations.js').then(m => m.default),
    ]);
    
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/activity', activityRoutes);
    app.use('/api/properties', propertyRoutes);
    app.use('/api/enquiries', enquiryRoutes);
    app.use('/api/interests', interestRoutes);
    app.use('/api/blogs', blogRoutes);
    app.use('/api/user-registrations', userRegistrationRoutes);
  } catch (err) {
    console.error('Route import error:', err);
  }
}

// Initialize routes on first request
let routesLoaded = false;
app.use((req, res, next) => {
  if (!routesLoaded) {
    routesLoaded = true;
    setupRoutes().catch(err => console.error('Setup routes error:', err));
  }
  next();
});

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
