-- Immediate fix for missing area_unit columns in properties table
-- This adds the missing columns that are required by the application

-- Add area_unit column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS area_unit VARCHAR(50) DEFAULT 'sq ft';

-- Add built_up_area_unit column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS built_up_area_unit VARCHAR(50) DEFAULT 'sq ft';

-- Add total_area_unit column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS total_area_unit VARCHAR(50) DEFAULT 'sq ft';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('area_unit', 'built_up_area_unit', 'total_area_unit')
ORDER BY column_name;
