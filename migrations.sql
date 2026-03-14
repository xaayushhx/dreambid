-- DreamBid Database Migrations
-- This file contains migration scripts for schema changes
-- Each migration should be idempotent (safe to run multiple times)

-- Migration 1: Add profile_photo column to users table (if missing)
-- Status: COMPLETED - Run if upgrading from older versions
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);

-- Migration 2: Ensure all indexes exist
-- Status: COMPLETED
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_auction_status ON properties(auction_status);
CREATE INDEX IF NOT EXISTS idx_properties_auction_date ON properties(auction_date);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_property_id ON enquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_property_interests_property_id ON property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_user_id ON property_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_type ON property_interests(interest_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_date ON user_activity(user_id, created_at DESC);

-- Migration 3: Update admin user password hash and add phone
-- Status: COMPLETED - Use bcrypt hashed password with phone number support
UPDATE users 
SET password_hash = '$2b$10$tQK8F/KvFdx3VqI0u4VY2eKZ8rVQXEH5L9vHqJ6m8K3r9L4M2N6Zu',
    phone = '5551234567'
WHERE email = 'admin@dreambid.com' AND role = 'admin';

-- Future migrations should be added below with clear status and description
-- Example template:
-- -- Migration X: Description of change
-- -- Status: PENDING / COMPLETED
-- -- Reason: Why this change was needed
-- ALTER TABLE table_name ADD COLUMN column_name DATA_TYPE;
