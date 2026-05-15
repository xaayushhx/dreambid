# DreamBid - Complete Website Rebuild Guide

**A comprehensive guide to rebuilding the DreamBid property auction platform from scratch**

**Last Updated:** April 5, 2026  
**Version:** 1.0.0

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Color Scheme & Design System](#color-scheme--design-system)
5. [Installation & Setup](#installation--setup)
6. [Database Schema](#database-schema)
7. [Frontend Structure](#frontend-structure)
8. [Backend API Routes](#backend-api-routes)
9. [Authentication System](#authentication-system)
10. [Key Features](#key-features)
11. [Deployment](#deployment)

---

## Project Overview

DreamBid is a **unified property auction platform** that combines frontend, backend, and admin panel into a single monolithic application. The platform allows users to:

- Browse and bid on properties
- Submit enquiries about properties
- Register their property requirements
- Read real estate blogs
- Access an admin dashboard for property management
- Track user activity and engagement

### Key Characteristics

- **Monolithic Architecture**: Single repository with frontend and backend
- **Role-Based Access**: Public users, admin, and staff roles
- **Real-time Updates**: Live auction status and notifications
- **Mobile-First Design**: Responsive layout using Tailwind CSS
- **JWT Authentication**: Secure token-based authentication
- **PostgreSQL Database**: Robust data persistence with 8 tables and 42 indexes

---

## Technology Stack

### Frontend
- **React 18.2**: UI library with hooks
- **Vite 5.0**: Fast build tool and dev server
- **Tailwind CSS 3.3**: Utility-first CSS framework
- **React Router 6.20**: Client-side routing
- **React Query 3.39**: Data fetching and caching
- **Axios 1.6**: HTTP client for API calls
- **React Hook Form 7.48**: Form state management
- **React Hot Toast 2.4**: Toast notifications
- **Heroicons React 2.2**: SVG icon library
- **Capacitor 8.1**: Mobile app framework (iOS/Android)

### Backend
- **Express 4.18**: Node.js web framework
- **PostgreSQL**: Relational database
- **Node-PG 8.11**: PostgreSQL client
- **JWT**: Token-based authentication
- **Bcryptjs 2.4**: Password hashing
- **Multer 1.4**: File upload middleware
- **Morgan 1.10**: HTTP request logging
- **Helmet 7.1**: Security headers
- **CORS 2.8**: Cross-origin resource sharing
- **Node-Cron 3.0**: Scheduled tasks
- **Dotenv 16.3**: Environment variables

### Development Tools
- **Concurrently 8.2**: Run frontend and backend simultaneously
- **Nodemon 3.0**: Auto-restart server on changes
- **PostCSS 8.4**: CSS transformation
- **Autoprefixer 10.4**: Browser prefix automation

---

## Project Architecture

### Directory Structure

```
dreambid-unified/
├── src/                              # Frontend React application
│   ├── components/                   # Shared React components
│   │   ├── AdminBottomNavigation.jsx # Admin mobile nav
│   │   ├── AdminLayout.jsx          # Admin page wrapper
│   │   ├── AdminNavbar.jsx          # Admin navbar
│   │   ├── BottomNavigation.jsx     # Public mobile nav
│   │   ├── Navbar.jsx               # Public navbar
│   │   ├── ProfileDropdown.jsx      # User profile menu
│   │   ├── PropertyTypeDropdown.jsx # Property filter
│   │   ├── ProtectedRoute.jsx       # Admin route protection
│   │   ├── PublicLayout.jsx         # Public page wrapper
│   │   ├── UserProtectedRoute.jsx   # User route protection
│   │   └── WhatsAppFloat.jsx        # WhatsApp floating button
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.jsx          # Authentication state
│   │   └── ShortlistContext.jsx     # Shortlisted properties
│   ├── pages/                        # Page components
│   │   ├── public/                  # Public-facing pages
│   │   │   ├── Home.jsx             # Homepage
│   │   │   ├── Properties.jsx       # Property listing
│   │   │   ├── PropertyDetail.jsx   # Single property view
│   │   │   ├── Register.jsx         # User registration
│   │   │   ├── Contact.jsx          # Contact form
│   │   │   ├── SignUp.jsx           # Sign up page
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── Profile.jsx          # User profile
│   │   │   ├── Settings.jsx         # User settings
│   │   │   ├── Shortlisted.jsx      # Saved properties
│   │   │   ├── Blogs.jsx            # Blog listing
│   │   │   └── BlogDetail.jsx       # Single blog view
│   │   └── admin/                   # Admin panel pages
│   │       ├── Dashboard.jsx        # Admin dashboard
│   │       ├── AdminProperties.jsx  # Manage properties
│   │       ├── PropertyForm.jsx     # Add/edit property
│   │       ├── FeaturedProperties.jsx # Featured list
│   │       ├── Enquiries.jsx        # Manage enquiries
│   │       ├── Users.jsx            # User management
│   │       ├── AdminBlogs.jsx       # Manage blogs
│   │       └── UserRegistrations.jsx # View registrations
│   ├── services/                     # API service files
│   │   ├── api.js                  # General API calls
│   │   ├── admin-api.js            # Admin API calls
│   │   └── [...other services]
│   ├── utils/                        # Utility functions
│   │   ├── imageUrl.js             # Image URL helpers
│   │   └── [...other utilities]
│   ├── styles/                       # Global CSS
│   │   └── [...stylesheets]
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global styles
│
├── api/                              # Backend API code
│   ├── app.js                        # API middleware setup
│   └── handler.js                    # Netlify serverless handler
│
├── routes/                           # Express route definitions
│   ├── auth.js                       # Authentication endpoints
│   ├── user.js                       # User management endpoints
│   ├── properties.js                 # Property CRUD endpoints
│   ├── enquiries.js                  # Enquiry management endpoints
│   ├── blogs.js                      # Blog management endpoints
│   ├── activity.js                   # Activity tracking endpoints
│   ├── interests.js                  # Property interest endpoints
│   └── user-registrations.js         # Registration submissions
│
├── controllers/                      # Business logic
│   ├── AuthController.js             # Auth logic
│   ├── UserController.js             # User logic
│   └── ActivityController.js         # Activity logic
│
├── config/                           # Configuration
│   └── database.js                   # PostgreSQL pool connection
│
├── middleware/                       # Express middleware
│   ├── auth.js                       # JWT authentication
│   └── upload.js                     # File upload handling
│
├── models/                           # Database models
│   ├── User.js                       # User model
│   ├── UserActivity.js               # Activity model
│   └── [...other models]
│
├── services/                         # Business services
│   ├── ActivityService.js            # Activity tracking
│   ├── CleanupService.js             # Scheduled cleanup
│   └── [...other services]
│
├── migrations/                       # Database migrations
│   ├── 01_create_blogs_table.js
│   ├── 02_add_image_data_column.js
│   └── 04_make_blog_images_url_nullable.js
│
├── scripts/                          # Utility scripts
│   ├── init-db.js                    # Database initialization
│   ├── seed-database.js              # Seed sample data
│   ├── reset-admin-password.js       # Admin reset utility
│   └── security-check.sh             # Security verification
│
├── uploads/                          # File storage directory
│
├── public/                           # Static files
│
├── server.js                         # Express server entry
├── package.json                      # Dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.js                 # PostCSS configuration
├── capacitor.config.json             # Mobile app config
├── index.html                        # HTML entry point
└── .env                              # Environment variables
```

---

## Color Scheme & Design System

### Color Palette

#### Primary Colors (Dark Theme)
```javascript
// Tailwind Configuration
colors: {
  // Midnight - Dark background colors
  'midnight': {
    950: '#0B1423',  // Top gradient background
    900: '#0E1A2B',  // Bottom gradient background
    800: '#111C2E',  // Card backgrounds
    700: '#1F2A3D',  // Card borders
  },
  
  // Gold - Accent color
  'gold': {
    DEFAULT: '#CBA135',
    hover: '#D4AF37',  // Brighter on hover
  },
  
  // Status Colors
  'status': {
    live: '#22C55E',  // Green for live auctions
  },
  
  // Text Colors
  'text': {
    primary: '#FFFFFF',      // Main text
    soft: '#E6EDF7',         // Lighter text
    muted: '#A9B7C9',        // Muted text
    secondary: '#94A3B8',    // Secondary text
    nav: '#C7D2E0',          // Navigation text
  }
}
```

#### Color Usage Examples

| Color | Usage | Example |
|-------|-------|---------|
| `midnight-950` | Hero sections, page backgrounds | Hero banners |
| `midnight-900` | Body background, card backgrounds | Main content area |
| `midnight-800` | Card surface, hover states | Property cards |
| `midnight-700` | Borders, dividers | Card borders |
| `gold` | Buttons, accents, highlights | CTA buttons, links |
| `text-primary` | Main text on dark backgrounds | Headers, body text |
| `status-live` | Live auction indicators | "Bidding Live" badge |

### Typography

```javascript
// Font Families
fontFamily: {
  serif: ['Playfair Display', 'serif'],    // Elegant serif font
  sans: ['Inter', 'system-ui', ...],       // Clean sans-serif
}

// Font Sizes (Responsive)
fontSize: {
  'h1-hero': ['72px', { lineHeight: '82px', fontWeight: '700' }],
  'h2': ['48px', { lineHeight: '58px', fontWeight: '700' }],
  'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
  'h4': ['22px', { lineHeight: '30px', fontWeight: '600' }],
  'body-lg': ['20px', { lineHeight: '1.6', fontWeight: '400' }],
  'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
  'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
}
```

### Border Radius

```javascript
borderRadius: {
  'btn': '12px',          // Button border radius
  'card': '16px',         // Card border radius
  'input': '10px',        // Input field radius
}
```

### Spacing System

```javascript
spacing: {
  'section-gap': '120px',    // Space between sections
  'title-gap': '56px',       // Space below titles
  'card-gap': '40px',        // Space between cards
  'hero-margin': '80px',     // Hero section margins
  'trust-margin': '110px',   // Trust section margins
  'safe': 'max(0px, env(safe-area-inset-top))',  // Notch safe area
}
```

### Shadow Effects

```javascript
boxShadow: {
  'dark-elevation': '0 10px 30px rgba(0, 0, 0, 0.35)',
  'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}
```

### Design Principles

- **Dark Mode**: Premium feel with midnight colors
- **Gold Accents**: Luxury and elegance
- **High Contrast**: White text on dark backgrounds for readability
- **Consistent Spacing**: Predictable layout and rhythm
- **Mobile-First**: Responsive design from the ground up

---

## Installation & Setup

### Prerequisites

- **Node.js 18+** with npm
- **PostgreSQL 12+** (local or cloud-hosted)
- **Git** for version control
- **Code Editor** (VS Code recommended)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd dreambid-unified
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create `.env.local` for development:

```env
# Frontend URLs
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173

# Backend Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database Configuration (Option 1: Local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dreambid
DB_USER=postgres
DB_PASSWORD=your_password

# OR Database Configuration (Option 2: Cloud Database)
# DATABASE_URL=postgresql://user:password@host:port/database
# NETLIFY_DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret
JWT_SECRET=your_jwt_secret_key_min_32_chars

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Third-party Services
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
GOOGLE_MAPS_API_KEY=your_maps_key
```

### Step 4: Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb dreambid

# Initialize schema
psql -d dreambid -f init.sql

# Seed sample data (optional)
npm run seed
```

#### Option B: Cloud Database (Railway, Render)

1. Create a PostgreSQL instance on your cloud provider
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Run migrations:
   ```bash
   # This can be done through the cloud provider's SQL editor
   # Copy contents of init.sql and run in the SQL editor
   ```

### Step 5: Start Development Server

```bash
# Start both frontend and backend
npm run dev

# OR start individually
npm run dev:client    # Frontend on http://localhost:5173
npm run dev:server    # Backend on http://localhost:5000
```

### Step 6: Access Application

- **Homepage**: http://localhost:5173
- **Admin Login**: http://localhost:5173/admin/login
- **Default Admin Credentials**:
  - Phone: `5551234567`
  - Password: `admin123456`

---

## Database Schema

### 1. Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  profile_photo VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user' 
    CHECK (role IN ('admin', 'staff', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Purpose**: Store user accounts for authentication and profile management  
**Key Fields**: Email, phone (primary login), password hash, role-based access

### 2. Properties Table

```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(100),
  
  -- Location
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(9, 6),
  longitude DECIMAL(10, 6),
  
  -- Measurements
  area_sqft DECIMAL(10, 2),
  built_up_area DECIMAL(10, 2),
  total_area DECIMAL(10, 2),
  
  -- Features
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  
  -- Pricing
  reserve_price DECIMAL(15, 2) NOT NULL,
  estimated_market_value DECIMAL(15, 2),
  emd DECIMAL(15, 2),
  
  -- Auction Details
  auction_date TIMESTAMP NOT NULL,
  auction_time TIME,
  application_end_date TIMESTAMP,
  possession_type VARCHAR(100),
  
  -- Status
  status VARCHAR(50) DEFAULT 'upcoming' 
    CHECK (status IN ('upcoming', 'active', 'expired', 'sold', 'cancelled')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Media
  cover_image_url VARCHAR(500),
  pdf_url VARCHAR(500),
  
  -- Statistics
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  enquiries_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Key Indexes
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_auction_date ON properties(auction_date);
CREATE INDEX idx_properties_is_featured ON properties(is_featured);
```

**Purpose**: Store property listings with complete auction details  
**Key Features**: Auction scheduling, status tracking, location mapping

### 3. Property Images Table

```sql
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_data BYTEA,
  image_mime_type VARCHAR(50) DEFAULT 'image/jpeg',
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store multiple images per property

### 4. Enquiries Table

```sql
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  enquiry_type VARCHAR(50) DEFAULT 'general' 
    CHECK (enquiry_type IN ('general', 'bid', 'inspection', 'complaint')),
  status VARCHAR(50) DEFAULT 'new' 
    CHECK (status IN ('new', 'contacted', 'resolved', 'closed', 
                      'not_interested', 'unable_to_connect', 'call_later')),
  property_title VARCHAR(255),
  property_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_enquiries_property_id ON enquiries(property_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_email ON enquiries(email);
```

**Purpose**: Manage user inquiries and contact submissions about properties  
**Statuses**: new, contacted, resolved, closed, not_interested, unable_to_connect, call_later

### 5. Property Interests Table

```sql
CREATE TABLE property_interests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  interest_type VARCHAR(50) NOT NULL 
    CHECK (interest_type IN ('view', 'share', 'contact', 'save')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_property_interests_property_id ON property_interests(property_id);
CREATE INDEX idx_property_interests_user_id ON property_interests(user_id);
CREATE INDEX idx_property_interests_type ON property_interests(interest_type);
```

**Purpose**: Track user engagement (views, shares, saves, contacts)  
**Interest Types**: view, share, contact, save

### 6. User Activity Table

```sql
CREATE TABLE user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  action_category VARCHAR(50),
  data JSONB DEFAULT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_action ON user_activity(action);
CREATE INDEX idx_user_activity_user_date ON user_activity(user_id, created_at DESC);
```

**Purpose**: Audit trail for all user actions (login, property views, etc.)

### 7. Blogs Table

```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL 
    CHECK (category IN ('buying', 'investment', 'market', 'legal', 'news', 'tips')),
  author VARCHAR(255) NOT NULL,
  image TEXT,
  read_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft' 
    CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_is_featured ON blogs(is_featured);
```

**Purpose**: Publish blog articles about real estate  
**Categories**: buying, investment, market, legal, news, tips

### 8. User Registrations Table

```sql
CREATE TABLE user_registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_registrations_created_at ON user_registrations(created_at DESC);
CREATE INDEX idx_user_registrations_contact ON user_registrations(contact_number);
```

**Purpose**: Store property requirement submissions from homepage  
**Data Structure**: Flexible JSON for various requirement types

---

## Frontend Structure

### Component Hierarchy

```
App.jsx (Router & Providers)
├── QueryClientProvider
├── AuthProvider
├── ShortlistProvider
├── Toaster (Toast notifications)
│
├── Public Routes
│   ├── PublicLayout
│   │   ├── Navbar
│   │   ├── BottomNavigation (mobile)
│   │   ├── WhatsAppFloat
│   │   └── [Page Component]
│   ├── Home.jsx
│   ├── Properties.jsx
│   ├── PropertyDetail.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Contact.jsx
│   ├── SignUp.jsx
│   ├── Blogs.jsx
│   ├── BlogDetail.jsx
│   └── UserProtectedRoute (for authenticated users)
│       ├── Dashboard.jsx
│       ├── Profile.jsx
│       ├── Settings.jsx
│       └── Shortlisted.jsx
│
└── Admin Routes
    └── ProtectedRoute (requires admin role)
        ├── AdminLayout
        │   ├── AdminNavbar
        │   ├── AdminBottomNavigation (mobile)
        │   └── [Admin Page Component]
        ├── Dashboard.jsx
        ├── AdminProperties.jsx
        ├── PropertyForm.jsx
        ├── FeaturedProperties.jsx
        ├── Enquiries.jsx
        ├── Users.jsx
        ├── AdminBlogs.jsx
        └── UserRegistrations.jsx
```

### Context Providers

#### AuthContext.jsx
- Manages authentication state globally
- Stores user info, JWT token, login/logout
- Provides: `useAuth()` hook
- Values: `user`, `isAuthenticated`, `login()`, `logout()`, `isAdmin()`

```javascript
const { user, isAuthenticated, login, logout, isAdmin } = useAuth();
```

#### ShortlistContext.jsx
- Manages shortlisted/saved properties
- Local storage persistence
- Provides: `useShortlist()` hook
- Values: `shortlisted`, `addToShortlist()`, `removeFromShortlist()`

### Key Components

#### Public Components

**Navbar.jsx**
- Responsive navigation bar
- Toggles between mobile hamburger and desktop menu
- Links: Home, Properties, Blogs, Dashboard, Profile
- Logo and brand identity
- Login/Logout options

**BottomNavigation.jsx**
- Mobile-only bottom navigation
- Quick access to main sections
- Icons for each section
- Active state highlighting

**PublicLayout.jsx**
- Wraps all public pages
- Includes Navbar, BottomNavigation, WhatsAppFloat
- Responsive padding and margins

**WhatsAppFloat.jsx**
- Floating WhatsApp button
- Quick contact via WhatsApp
- Fixed position on screen

#### Admin Components

**AdminNavbar.jsx**
- Admin-specific navigation
- Dashboard, Properties, Featured, Enquiries, Users, Blogs links
- Admin info and logout
- Mobile hamburger menu

**AdminBottomNavigation.jsx**
- Mobile admin navigation
- Quick access to admin functions
- Icon-based navigation

**AdminLayout.jsx**
- Wraps all admin pages
- Includes AdminNavbar, AdminBottomNavigation
- Sidebar or top navigation options

#### Route Protection Components

**ProtectedRoute.jsx**
- Wraps admin-only routes
- Checks authentication and admin role
- Redirects to login if not authenticated
- Redirects to home if not admin

**UserProtectedRoute.jsx**
- Wraps user-only routes (Dashboard, Profile, etc.)
- Checks authentication (any user)
- Redirects admin/staff to admin dashboard
- Redirects non-authenticated to login

### Form Handling

React Hook Form is used for efficient form state management:

```javascript
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = async (data) => {
    // Submit logic
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('phone', { required: 'Phone required' })} />
      {errors.phone && <span>{errors.phone.message}</span>}
    </form>
  );
}
```

### API Service Structure

**services/api.js** - General API calls
```javascript
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  delete: (id) => api.delete(`/properties/${id}`),
};

export const enquiriesAPI = {
  create: (data) => api.post('/enquiries', data),
  getAll: () => api.get('/enquiries'),
};

export const blogsAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
};
```

**services/admin-api.js** - Admin-specific API calls
```javascript
export const usersAPI = {
  getAll: (limit, offset) => api.get('/user/all', { 
    params: { limit, offset } 
  }),
  updateStatus: (userId, isActive) => api.put(`/user/${userId}/status`, 
    { is_active: isActive }
  ),
  updateRole: (userId, role) => api.put(`/user/${userId}/role`, 
    { role }
  ),
};
```

### Data Fetching with React Query

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Fetching data
const { data, isLoading, error } = useQuery('properties', () => 
  propertiesAPI.getAll()
);

// Mutating data
const queryClient = useQueryClient();
const { mutate } = useMutation(
  (data) => propertiesAPI.create(data),
  {
    onSuccess: () => {
      queryClient.invalidateQueries('properties');
    }
  }
);
```

---

## Backend API Routes

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

#### Login
```
POST /auth/login
Headers: Content-Type: application/json
Body: {
  "phone": "5551234567",
  "password": "password123"
}
Response: {
  "user": { id, email, full_name, phone, role },
  "token": "jwt_token_here"
}
```

#### Register
```
POST /auth/register
Headers: Content-Type: application/json
Body: {
  "phone": "5551234567",
  "password": "password123",
  "full_name": "John Doe"
}
Response: {
  "user": { id, email, full_name, phone, role },
  "token": "jwt_token_here"
}
```

#### Verify Token
```
GET /auth/verify
Headers: Authorization: Bearer {token}
Response: { valid: true, user: {...} }
```

### User Endpoints (Requires Auth)

#### Get Current User
```
GET /user/me
Headers: Authorization: Bearer {token}
Response: { id, email, full_name, phone, profile_photo, role }
```

#### Update Profile
```
PUT /user/profile
Headers: Authorization: Bearer {token}
Body: {
  "full_name": "New Name",
  "phone": "new_phone"
}
```

#### Change Password
```
POST /user/change-password
Headers: Authorization: Bearer {token}
Body: {
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

#### Get User Activity
```
GET /user/activity?limit=10&offset=0
Headers: Authorization: Bearer {token}
Response: {
  "activities": [ {...} ],
  "stats": { logins: 5, propertyViews: 20, ... }
}
```

### Admin User Management Endpoints

#### Get All Users
```
GET /user/all?limit=50&offset=0
Headers: Authorization: Bearer {token}
Response: {
  "data": [ {...users} ],
  "total": 150
}
```

#### Get User Details
```
GET /user/{userId}
Headers: Authorization: Bearer {token}
Response: {
  "user": {...},
  "activities": [...],
  "stats": {...}
}
```

#### Update User Status
```
PUT /user/{userId}/status
Headers: Authorization: Bearer {token}
Body: { "is_active": true }
```

#### Update User Role
```
PUT /user/{userId}/role
Headers: Authorization: Bearer {token}
Body: { "role": "admin" }  // or "user"
```

### Property Endpoints

#### Get All Properties (Paginated)
```
GET /properties?page=1&limit=12&status=active&city=Mumbai
Response: {
  "properties": [ {...} ],
  "total": 250,
  "page": 1,
  "pages": 21
}
```

#### Get Property by ID
```
GET /properties/{id}
Response: { 
  "id": 1, 
  "title": "...", 
  "description": "...",
  "images": [ {...} ],
  "enquiries_count": 5,
  ...
}
```

#### Create Property (Admin Only)
```
POST /properties
Headers: Authorization: Bearer {token}
Body: {
  "title": "2BHK Apartment",
  "description": "...",
  "property_type": "Apartment",
  "address": "123 Main St",
  "city": "Mumbai",
  "reserve_price": 500000,
  "auction_date": "2026-05-15T10:00:00",
  ...
}
Response: { "property": {...}, "message": "Property created" }
```

#### Update Property (Admin Only)
```
PUT /properties/{id}
Headers: Authorization: Bearer {token}
Body: { same fields as create }
```

#### Delete Property (Admin Only)
```
DELETE /properties/{id}
Headers: Authorization: Bearer {token}
```

#### Upload Property Image
```
POST /properties/{id}/images
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
Body: FormData with file
```

#### Set Featured Properties (Admin Only)
```
PUT /properties/{id}/featured
Headers: Authorization: Bearer {token}
Body: { "is_featured": true }
```

### Enquiry Endpoints

#### Create Enquiry
```
POST /enquiries
Headers: Content-Type: application/json
Body: {
  "property_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "5559876543",
  "message": "Interested in this property",
  "enquiry_type": "general"  // general, bid, inspection, complaint
}
```

#### Get All Enquiries (Admin Only)
```
GET /enquiries?status=new&limit=50&offset=0
Headers: Authorization: Bearer {token}
Response: {
  "enquiries": [ {...} ],
  "total": 100
}
```

#### Update Enquiry Status (Admin Only)
```
PUT /enquiries/{id}
Headers: Authorization: Bearer {token}
Body: { "status": "contacted" }
Statuses: new, contacted, resolved, closed, not_interested, unable_to_connect, call_later
```

#### Delete Enquiry (Admin Only)
```
DELETE /enquiries/{id}
Headers: Authorization: Bearer {token}
```

### Blog Endpoints

#### Get All Blogs
```
GET /blogs?status=published&category=buying&limit=10&offset=0
Response: {
  "blogs": [ {...} ],
  "total": 50
}
```

#### Get Blog by ID
```
GET /blogs/{id}
Response: { "blog": {...}, "relatedBlogs": [...] }
```

#### Create Blog (Admin Only)
```
POST /blogs
Headers: Authorization: Bearer {token}
Body: {
  "title": "How to Buy Property",
  "excerpt": "Short summary",
  "content": "Full blog content",
  "category": "buying",
  "author": "Admin",
  "image": "image_url",
  "read_time": "5 min read",
  "status": "draft"  // draft, published, archived
}
```

#### Update Blog (Admin Only)
```
PUT /blogs/{id}
Headers: Authorization: Bearer {token}
Body: { same fields as create }
```

#### Delete Blog (Admin Only)
```
DELETE /blogs/{id}
Headers: Authorization: Bearer {token}
```

#### Set Featured Blog (Admin Only)
```
PUT /blogs/{id}/featured
Headers: Authorization: Bearer {token}
Body: { "is_featured": true }
```

### Interest Tracking Endpoints

#### Record Interest
```
POST /interests
Headers: Content-Type: application/json
Body: {
  "property_id": 1,
  "interest_type": "view"  // view, share, contact, save
}
Response: { "recorded": true }
```

#### Get Property Interests
```
GET /interests/property/{propertyId}
Response: {
  "views": 150,
  "shares": 25,
  "contacts": 10,
  "saves": 30
}
```

### Activity Endpoints

#### Get User Activity (Admin Only)
```
GET /activity/user/{userId}
Response: [ 
  { id: 1, action: "property_view", created_at: "2026-04-05T10:00:00", ... }
]
```

#### Get Activity Stats (Admin Only)
```
GET /activity/stats
Response: {
  "totalUsers": 150,
  "totalLogins": 500,
  "totalPropertyViews": 2000,
  ...
}
```

### User Registrations Endpoints

#### Create Registration
```
POST /user-registrations
Headers: Content-Type: application/json
Body: {
  "name": "John Doe",
  "contact_number": "5559876543",
  "requirements": {
    "property_type": "apartment",
    "budget_min": 500000,
    "budget_max": 1000000,
    "city": "Mumbai"
  }
}
```

#### Get All Registrations (Admin Only)
```
GET /user-registrations
Headers: Authorization: Bearer {token}
Response: { "registrations": [ {...} ], "total": 50 }
```

---

## Authentication System

### JWT Authentication Flow

```
1. User logs in with phone + password
        ↓
2. Backend verifies credentials against password_hash
        ↓
3. Backend generates JWT token containing user ID and role
        ↓
4. Frontend stores token in localStorage
        ↓
5. Frontend includes token in all API requests: Authorization: Bearer {token}
        ↓
6. Backend middleware verifies token on protected routes
        ↓
7. Token expires after set duration (typically 7 days)
        ↓
8. User must login again to get new token
```

### Authentication Middleware

**middleware/auth.js**
```javascript
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

### Role-Based Access Control (RBAC)

**Three User Roles**:

1. **admin**
   - Full access to all features
   - Manage properties, users, enquiries, blogs
   - View activity and analytics
   - Can create staff accounts

2. **staff**
   - Limited access to admin panel
   - Manage properties and enquiries
   - No user or role management access
   - Cannot access admin settings

3. **user**
   - Browse properties
   - Submit enquiries
   - View personal dashboard
   - Save/shortlist properties
   - Cannot access admin panel

### Frontend Auth Context

**src/contexts/AuthContext.jsx**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);

  const login = async (phone, password) => {
    const response = await api.post('/auth/login', { phone, password });
    setUser(response.data.user);
    setToken(response.data.token);
    localStorage.setItem('token', response.data.token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const isAdmin = () => user?.role === 'admin' || user?.role === 'staff';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## Key Features

### 1. Property Management

**Admin Features**:
- Add, edit, delete properties
- Upload multiple images per property
- Set property details (beds, baths, area, price)
- Configure auction dates and times
- Mark properties as featured
- Track property views and enquiries
- Set property status (upcoming, active, expired, sold, cancelled)

**User Features**:
- Browse properties with filters
- View detailed property information
- See high-resolution images
- Check auction status and dates
- Shortlist favorite properties
- Submit inquiries

### 2. Auction System

**Features**:
- Auction date scheduling
- Auction time display in property
- Live/Active status tracking
- Automatic status updates based on dates
- Reserve price enforcement
- EMD (Earnest Money Deposit) tracking

**Status Workflow**:
```
upcoming → active (on auction_date) → expired (after) → sold/cancelled
```

### 3. User Management

**Admin Dashboard**:
- View all users
- Search and filter users
- Change user roles (user ↔ admin)
- Activate/Deactivate users
- View user activity history
- View user statistics

**User Features**:
- Update profile information
- Change password
- Upload profile photo
- View activity history
- Manage preferences

### 4. Enquiry Management

**Enquiry Types**:
- General inquiry
- Bidding inquiry
- Inspection request
- Complaint

**Enquiry Statuses**:
- new: Unresponded
- contacted: Admin has responded
- resolved: Issue resolved
- closed: Permanently closed
- not_interested: User not interested
- unable_to_connect: Cannot reach user
- call_later: Scheduled callback

**Admin Features**:
- View all enquiries
- Filter by status, property, date
- Update enquiry status
- Export enquiries
- Track response rates

### 5. Blog System

**Blog Categories**:
- Buying: Tips on buying properties
- Investment: Investment strategies
- Market: Market updates
- Legal: Legal information
- News: Industry news
- Tips: General tips and tricks

**Admin Features**:
- Create, edit, delete blogs
- Set blog status (draft, published, archived)
- Mark as featured
- Upload blog images
- Track blog views
- Auto-generate read time

**User Features**:
- Read published blogs
- Filter by category
- View featured blogs
- Related blog recommendations

### 6. Property Interest Tracking

**Tracked Actions**:
- **View**: User opens property details
- **Share**: User shares property
- **Contact**: User inquires about property
- **Save**: User shortlists property

**Analytics**:
- Total views per property
- Total shares per property
- Total inquiries per property
- Saves/Shortlists per property
- Engagement metrics

### 7. User Activity Logging

**Tracked Actions**:
- Login/Logout
- Property viewed
- Property shared
- Property saved
- Enquiry submitted
- Profile updated
- Document downloaded

**Purpose**:
- Audit trail for security
- User behavior analytics
- Activity-based recommendations
- Compliance reporting

### 8. User Registrations (Requirements)

**Form Submission**:
- Name
- Contact number
- Property requirements (JSON flexible format)

**Use Case**:
- Collect property requirements from homepage visitors
- Admin can follow up with matching properties
- Lead generation

### 9. Responsive Design

**Breakpoints**:
- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

**Components**:
- Mobile: Bottom navigation, hamburger menu
- Tablet: Touch-friendly spacing, larger buttons
- Desktop: Sidebar navigation, multi-column layouts

### 10. Notifications

**Toast Notifications** (using React Hot Toast):
- Success messages: Green
- Error messages: Red
- Info messages: Blue
- Warning messages: Yellow

**Use Cases**:
- Login success/failure
- Property created/updated/deleted
- Form submission status
- Error handling
- Action confirmations

---

## Deployment

### Development to Production Checklist

- [ ] Environment variables set correctly (.env file)
- [ ] Database migrations run successfully
- [ ] All API endpoints tested
- [ ] Frontend build completes without errors
- [ ] Mobile app builds complete
- [ ] Security headers configured
- [ ] CORS settings verified
- [ ] File upload limits set
- [ ] JWT secret configured
- [ ] Password requirements enforced
- [ ] Admin credentials secured
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] API rate limiting configured
- [ ] SSL certificate installed

### Build for Production

```bash
# Build frontend
npm run build

# This creates dist/ directory with optimized assets
# Build size is typically 200-400KB

# Build mobile app (if needed)
# iOS
npm run build:ios

# Android
npm run build:android
```

### Deployment Options

#### Option 1: Netlify (Frontend) + Netlify Functions (Backend)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Or connect GitHub for auto-deployment
# Push to main branch → auto-deploys to production
```

**Netlify Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  functions = "api"
  publish = "dist"

[dev]
  framework = "vite"
  port = 3000
```

#### Option 2: Vercel (Frontend) + Your Backend

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
vercel

# Deploy backend separately to your server or serverless platform
```

#### Option 3: Traditional VPS/Server

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repo-url>
cd dreambid-unified

# Install dependencies
npm install

# Build frontend
npm run build

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name dreambid

# Setup reverse proxy with Nginx
# Point domain to server
# Configure SSL with Let's Encrypt
```

**Nginx Configuration** (for reverse proxy):
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    
    # Frontend (static files)
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Option 4: Docker

**Dockerfile**:
```dockerfile
FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/dreambid
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: dreambid
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: dreambid
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Database Migration for Production

```bash
# Backup existing database
pg_dump dreambid > backup.sql

# Run migrations
psql -d dreambid -f init.sql

# Or using cloud provider's SQL editor:
# 1. Copy init.sql contents
# 2. Paste into SQL editor
# 3. Execute
```

### Environment Variables for Production

```env
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database (Use cloud database)
DATABASE_URL=postgresql://user:password@cloud-host:5432/dreambid

# Security
JWT_SECRET=your_very_long_random_secret_key_min_32_chars

# File Upload
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=10485760

# Cloudinary (Optional - for image hosting)
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Performance Optimization

1. **Frontend**:
   - Gzip compression enabled
   - Minification of CSS/JS
   - Image optimization
   - Code splitting for lazy loading
   - Caching headers set correctly

2. **Backend**:
   - Database connection pooling
   - Query optimization with indexes
   - Redis caching (optional)
   - Rate limiting
   - Input validation

3. **Database**:
   - Regular backups
   - Query optimization
   - Index maintenance
   - Archive old data

---

## Additional Resources

### File Upload Configuration

**Multer Middleware** (`middleware/upload.js`):
```javascript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

### Security Best Practices

1. **Password Security**:
   - Hash with bcryptjs (10 rounds)
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers

2. **JWT Tokens**:
   - Use strong secret key (min 32 chars)
   - Expiration: 7 days recommended
   - Refresh token: Implement if needed

3. **CORS**:
   - Whitelist trusted origins only
   - Restrict HTTP methods
   - Validate headers

4. **Input Validation**:
   - Validate all inputs server-side
   - Use express-validator
   - Sanitize user data

5. **Environment Variables**:
   - Never commit .env files
   - Use .env.example template
   - Rotate secrets regularly

---

## Troubleshooting Common Issues

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# OR use different port
PORT=5001 npm run dev:server
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U postgres -d dreambid

# Check credentials in .env.local
```

### CORS Error
```javascript
// In server.js, verify corsOptions
// Check FRONTEND_URL matches client domain
// Ensure credentials: true if sending auth headers
```

### JWT Token Invalid
```bash
# Regenerate JWT_SECRET
# Users must login again after JWT_SECRET change
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## Support & Documentation

- **GitHub Issues**: Report bugs and feature requests
- **API Documentation**: See Backend API Routes section
- **Component Documentation**: Check component JSDoc comments
- **Database Schema**: Refer to Database Schema section

---

**End of Complete Rebuild Guide**

*This document provides everything needed to rebuild DreamBid from scratch, including architecture, features, colors, and all technical specifications.*
