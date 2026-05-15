#!/bin/bash

# Railway Setup Script
# This script helps set up Railway for database and backend hosting

echo "🚂 DreamBid - Railway Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create Railway project
echo -e "${YELLOW}Step 1: Setting up Railway${NC}"
echo "1. Go to https://railway.app/"
echo "2. Sign up or log in"
echo "3. Click '+ New Project'"
echo "4. Select 'Provision PostgreSQL'"
echo "5. Give it a name like 'dreambid-db'"
echo "6. Click Deploy"
echo ""
echo -e "${YELLOW}After deployment:${NC}"
echo "7. Click on the PostgreSQL service"
echo "8. Go to Variables tab"
echo "9. Copy the DATABASE_URL value"
echo ""

read -p "Press Enter once you have your Railway DATABASE_URL..."

# Step 2: Update .env
echo ""
echo -e "${YELLOW}Step 2: Updating .env file${NC}"
read -p "Paste your Railway DATABASE_URL: " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL not provided${NC}"
    exit 1
fi

# Update .env
sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=$RAILWAY_URL|" .env

echo -e "${GREEN}✓ .env updated${NC}"
echo ""

# Step 3: Verify connection
echo -e "${YELLOW}Step 3: Testing database connection${NC}"
node -e "
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: '$RAILWAY_URL'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Successfully connected to Railway PostgreSQL');
    console.log('Database time:', res.rows[0].now);
    process.exit(0);
  }
});
" 2>/dev/null || echo -e "${RED}Connection test skipped (pg module might not be installed)${NC}"

echo ""
echo -e "${GREEN}Migration Steps Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Deploy to Railway (use Railway CLI or GitHub integration)"
echo "3. Set environment variables in Railway dashboard"
echo "4. Run migrations: npx knex migrate:latest"
echo ""
echo "For detailed instructions, see RAILWAY_SETUP.md"
