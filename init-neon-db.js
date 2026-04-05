import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Neon database URL from environment variable
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_71eqQvbLzVwU@ep-polished-cherry-aeocc1g8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing Neon database...');
    
    // Read and execute clean-db.sql
    const cleanDbPath = path.join(__dirname, 'clean-db.sql');
    const schemaSql = fs.readFileSync(cleanDbPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    const statements = schemaSql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
        } catch (err) {
          // Ignore "already exists" errors
          if (!err.message.includes('already exists')) {
            console.error('Error executing statement:', err.message);
          }
        }
      }
    }
    
    console.log('✅ Schema created successfully!');
    
    // Get migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();
    
    console.log(`\n🔄 Running ${migrationFiles.length} migrations...`);
    
    for (const file of migrationFiles) {
      try {
        console.log(`  Running: ${file}`);
        const migration = await import(path.join(migrationsDir, file));
        if (migration.default) {
          await migration.default(pool);
        }
      } catch (err) {
        // Ignore errors if migrations already ran
        if (!err.message.includes('already exists')) {
          console.warn(`  ⚠️  ${file}: ${err.message}`);
        }
      }
    }
    
    console.log('✅ All migrations completed!');
    console.log('\n✨ Database initialization successful!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
