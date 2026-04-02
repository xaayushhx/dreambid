-- ============================================================
-- DreamBid Master Database Schema
-- PostgreSQL setup script - Complete initialization
-- Updated: March 14, 2026
-- 
-- Usage: psql -h your_host -U your_user -d your_database -f init.sql
-- Or in Neon: Copy entire content and run in SQL Editor
-- ============================================================

-- ============================================================
-- 1. USERS TABLE - Admin, Staff, and Regular Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  profile_photo VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. PROPERTIES TABLE - Main property listings
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type VARCHAR(100),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(9, 6),
  longitude DECIMAL(10, 6),
  
  -- Area measurements
  area_sqft DECIMAL(10, 2),
  built_up_area DECIMAL(10, 2),
  total_area DECIMAL(10, 2),
  
  -- Building features
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  
  -- Pricing and auction details
  reserve_price DECIMAL(15, 2) NOT NULL,
  estimated_market_value DECIMAL(15, 2),
  emd DECIMAL(15, 2),
  
  -- Auction dates and times
  auction_date TIMESTAMP NOT NULL,
  auction_time TIME,
  application_end_date TIMESTAMP,
  
  -- Possession details
  possession_type VARCHAR(100),
  
  -- Status and visibility (using 'status' instead of 'auction_status' for consistency)
  status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'expired', 'sold', 'cancelled')),
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

-- ============================================================
-- 3. PROPERTY IMAGES TABLE - Multiple images per property
-- ============================================================
CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_data BYTEA,
  image_mime_type VARCHAR(50) DEFAULT 'image/jpeg',
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. ENQUIRIES TABLE - User inquiries about properties
-- ============================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT,
  enquiry_type VARCHAR(50) DEFAULT 'general' CHECK (enquiry_type IN ('general', 'bid', 'inspection', 'complaint')),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved', 'closed', 'not_interested', 'unable_to_connect', 'call_later')),
  property_title VARCHAR(255),
  property_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. PROPERTY INTERESTS TABLE - View, Share, Save tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS property_interests (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  interest_type VARCHAR(50) NOT NULL CHECK (interest_type IN ('view', 'share', 'contact', 'save')),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. USER ACTIVITY TABLE - Audit trail of user actions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  action_category VARCHAR(50),
  data JSONB DEFAULT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. BLOGS TABLE - Blog articles and content
-- ============================================================
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL CHECK (category IN ('buying', 'investment', 'market', 'legal', 'news', 'tips')),
  author VARCHAR(255) NOT NULL,
  image TEXT,
  read_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7B. BLOG IMAGES TABLE - Multiple images per blog
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_images (
  id SERIAL PRIMARY KEY,
  blog_id INTEGER NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  image_data TEXT,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. USER REGISTRATIONS TABLE - Register page submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  requirements JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES - Performance optimization
-- ============================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_auction_date ON properties(auction_date);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Property Images indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);

-- Blog Images indexes
CREATE INDEX IF NOT EXISTS idx_blog_images_blog_id ON blog_images(blog_id);

-- Enquiries indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_property_id ON enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON enquiries(phone);

-- Property Interests indexes
CREATE INDEX IF NOT EXISTS idx_property_interests_property_id ON property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_user_id ON property_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_type ON property_interests(interest_type);
CREATE INDEX IF NOT EXISTS idx_property_interests_created_at ON property_interests(created_at DESC);

-- User Activity indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at DESC);

-- Blogs indexes
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_created_by ON blogs(created_by);
CREATE INDEX IF NOT EXISTS idx_blogs_is_featured ON blogs(is_featured);

-- User Registrations indexes
CREATE INDEX IF NOT EXISTS idx_user_registrations_created_at ON user_registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_registrations_contact ON user_registrations(contact_number);

-- ============================================================
-- SAMPLE DATA - Admin User
-- ============================================================
-- Admin credentials:
-- Phone: 5551234567
-- Password: admin123456 (hashed with bcrypt $2b$10)
-- 
-- To login:
-- curl -X POST https://your-api.com/api/auth/login \
--   -H "Content-Type: application/json" \
--   -d '{"phone":"5551234567","password":"admin123456"}'

INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
VALUES ('admin@dreambid.com', '$2a$10$53Do2hAKDxUAGWI8JDWAbu8B4gRgIJR0xM1MGXeyWgJiRYyF4QJlS', 'Admin User', '5551234567', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SCHEMA SUMMARY
-- ============================================================
-- Tables: 8
-- - users (8 fields) - User accounts and authentication
-- - properties (32 fields) - Main property listings  
-- - property_images (4 fields) - Property images
-- - enquiries (11 fields) - User inquiries
-- - property_interests (6 fields) - User interactions (view/share/save)
-- - user_activity (7 fields) - Activity audit trail
-- - blogs (13 fields) - Blog articles
-- - user_registrations (5 fields) - Registration form submissions
--
-- Total Fields: 86 fields
-- Total Indexes: 42 performance indexes
--
-- Key Features:
-- ✓ Phone-based authentication (primary login method)
-- ✓ Email auto-generated from phone (user_{phone}@dreambid.com)
-- ✓ Role-based access control (admin/staff/user)
-- ✓ Comprehensive audit trail via user_activity table
-- ✓ Property status tracking (upcoming/active/expired/sold/cancelled)
-- ✓ Enquiry management system
-- ✓ Blog publishing platform
-- ✓ User engagement tracking (views/shares/saves)
-- ============================================================
