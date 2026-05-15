/**
 * Migration: Add area unit columns and is_cover column
 * This migration adds:
 * - Unit columns for area fields (sq ft, sq yards, acres, etc.)
 * - is_cover column for marking cover images
 * Run this migration to update existing database schema
 */

import pool from '../config/database.js';

const migrate = async () => {
  try {
    console.log('🔄 Starting migration: Adding area unit columns and image cover support...');

    // Check if area_unit column already exists
    const checkAreaUnit = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='area_unit'
      )
    `);

    if (!checkAreaUnit.rows[0].exists) {
      await pool.query(`
        ALTER TABLE properties 
        ADD COLUMN area_unit VARCHAR(50) DEFAULT 'sq ft'
      `);
      console.log('✅ Added area_unit column');
    }

    // Check if built_up_area_unit column already exists
    const checkBuiltUpUnit = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='built_up_area_unit'
      )
    `);

    if (!checkBuiltUpUnit.rows[0].exists) {
      await pool.query(`
        ALTER TABLE properties 
        ADD COLUMN built_up_area_unit VARCHAR(50) DEFAULT 'sq ft'
      `);
      console.log('✅ Added built_up_area_unit column');
    }

    // Check if total_area_unit column already exists
    const checkTotalUnit = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='properties' AND column_name='total_area_unit'
      )
    `);

    if (!checkTotalUnit.rows[0].exists) {
      await pool.query(`
        ALTER TABLE properties 
        ADD COLUMN total_area_unit VARCHAR(50) DEFAULT 'sq ft'
      `);
      console.log('✅ Added total_area_unit column');
    }

    // Check if is_cover column already exists in property_images table
    const checkIsCover = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='property_images' AND column_name='is_cover'
      )
    `);

    if (!checkIsCover.rows[0].exists) {
      await pool.query(`
        ALTER TABLE property_images 
        ADD COLUMN is_cover BOOLEAN DEFAULT false
      `);
      console.log('✅ Added is_cover column to property_images table');
    }

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migration
migrate();
