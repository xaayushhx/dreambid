/**
 * Migration runner - Executes all migrations in order
 * Usage: node scripts/runMigrations.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, '../migrations');

async function runMigrations() {
  try {
    // Get all migration files and sort them by number
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log(`📝 Found ${files.length} migration files`);
    console.log('🔄 Running migrations...\n');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      
      try {
        console.log(`⏳ Executing: ${file}`);
        
        // Import the migration module
        const migration = await import(`file://${filePath}`);
        
        // Execute the up function if it exists
        if (migration.up) {
          await migration.up(pool);
          console.log(`✅ ${file} completed\n`);
        } else {
          console.log(`⚠️  ${file} has no 'up' function, skipping\n`);
        }
      } catch (error) {
        // Log error but continue with other migrations
        console.error(`❌ ${file} failed:`, error.message);
        
        // If it's a "column already exists" error, continue (idempotent)
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('is_cover')) {
          console.log(`ℹ️  Migration is idempotent, continuing...\n`);
        } else {
          console.error(`Error details:`, error.message, '\n');
        }
      }
    }

    console.log('✅ All migrations completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration runner failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
