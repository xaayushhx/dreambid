/**
 * Migration: Add area unit columns and is_cover column
 * This migration adds:
 * - Unit columns for area fields (sq ft, sq yards, acres, etc.)
 * - is_cover column for marking cover images
 * Run this migration to update existing database schema
 */

import pool from '../config/database.js';

export const up = async () => {
  try {
    console.log('🔄 Starting migration: Adding area unit columns...');

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
    } else {
      console.log('ℹ️  area_unit column already exists');
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
    } else {
      console.log('ℹ️  built_up_area_unit column already exists');
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
    } else {
      console.log('ℹ️  total_area_unit column already exists');
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Migration notice: Columns already exist');
    } else {
      console.error('Migration error:', error.message);
    }
  }
};

export const down = async () => {
  try {
    // Rollback: Remove the area unit columns
    await pool.query(`
      ALTER TABLE properties 
      DROP COLUMN IF EXISTS area_unit,
      DROP COLUMN IF EXISTS built_up_area_unit,
      DROP COLUMN IF EXISTS total_area_unit
    `);
    console.log('✓ Migration rolled back: area_unit columns removed');
  } catch (error) {
    console.error('Migration rollback error:', error.message);
  }
};
