#!/bin/bash

# Initialize Neon database with schema and migrations

DB_URL="postgresql://neondb_owner:npg_71eqQvbLzVwU@ep-polished-cherry-aeocc1g8-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "Initializing Neon database schema..."

# Run clean-db.sql to create initial schema
psql "$DB_URL" -f clean-db.sql

echo "✅ Database schema initialized!"
echo ""
echo "Running migrations..."

# Run all migration files
for migration in migrations/*.js; do
  echo "Running: $migration"
  node "$migration"
done

echo "✅ All migrations completed!"
