-- Sample properties for DreamBid
-- This file contains sample property data for demonstration

INSERT INTO properties (title, description, property_type, price, currency, location, bedrooms, bathrooms, area, area_unit, status, created_at)
VALUES 
  (
    'Modern Downtown Apartment',
    'Spacious 2-bedroom apartment in the heart of downtown with stunning city views.',
    'Apartment',
    250000,
    'USD',
    'Downtown',
    2,
    2,
    1200,
    'sqft',
    'active',
    CURRENT_TIMESTAMP
  ),
  (
    'Cozy Suburban House',
    'Beautiful 3-bedroom family home in a quiet suburban neighborhood with large backyard.',
    'House',
    350000,
    'USD',
    'Suburbs',
    3,
    2,
    2000,
    'sqft',
    'active',
    CURRENT_TIMESTAMP
  ),
  (
    'Luxury Penthouse',
    'Exclusive penthouse with panoramic views, premium finishes, and exclusive amenities.',
    'Apartment',
    800000,
    'USD',
    'Upper District',
    3,
    3,
    3500,
    'sqft',
    'active',
    CURRENT_TIMESTAMP
  )
ON CONFLICT (id) DO NOTHING;
