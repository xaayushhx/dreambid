#!/bin/bash

# DreamBid Production Environment Setup
# This script sets up environment variables for production deployment

set -e

echo "🚀 DreamBid Production Setup"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running interactively
if [ ! -t 0 ]; then
  echo "This script must be run interactively"
  exit 1
fi

# Create .env.production if doesn't exist
if [ ! -f ".env.production" ]; then
  echo "Creating .env.production..."
  cat > .env.production << 'EOF'
# Production Environment Variables

# ===== DATABASE =====
DATABASE_URL=postgresql://postgres:PASSWORD@host:5432/railway

# ===== AUTHENTICATION =====
JWT_SECRET=
NODE_ENV=production
JWT_EXPIRY=3600

# ===== FIREBASE (Push Notifications) =====
FIREBASE_SERVICE_ACCOUNT_JSON=

# ===== SERVER =====
PORT=3000
API_URL=https://your-railway-backend.up.railway.app

# ===== FRONTEND =====
FRONTEND_URL=https://your-netlify-domain.netlify.app

# ===== FILE UPLOAD =====
MAX_FILE_SIZE=10485760

# ===== APP CONFIG =====
APP_NAME=DreamBid
APP_VERSION=1.0.0
VITE_WHATSAPP_NUMBER=917428264402
EOF
  echo -e "${GREEN}✓ Created .env.production${NC}"
fi

echo ""
echo -e "${YELLOW}Enter Production Configuration${NC}"
echo ""

# 1. Database URL
echo -e "${BLUE}1. Railway Database URL${NC}"
echo "Get this from Railway dashboard → PostgreSQL → Variables → DATABASE_URL"
read -p "DATABASE_URL: " db_url
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$db_url|" .env.production

# 2. JWT Secret
echo ""
echo -e "${BLUE}2. JWT Secret (Random key for token signing)${NC}"
jwt_secret=$(openssl rand -hex 32)
echo "Generated: $jwt_secret"
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$jwt_secret|" .env.production
echo -e "${GREEN}✓ JWT_SECRET set${NC}"

# 3. Firebase Service Account
echo ""
echo -e "${BLUE}3. Firebase Service Account JSON${NC}"
echo "Get this from Firebase Console → Project Settings → Service Accounts"
echo "Copy the entire JSON as ONE line (no line breaks)"
read -p "FIREBASE_SERVICE_ACCOUNT_JSON: " firebase_json
firebase_json_escaped=$(echo "$firebase_json" | sed 's/"/\\"/g')
sed -i "s|^FIREBASE_SERVICE_ACCOUNT_JSON=.*|FIREBASE_SERVICE_ACCOUNT_JSON=$firebase_json_escaped|" .env.production
echo -e "${GREEN}✓ Firebase credentials set${NC}"

# 4. Railway Backend URL
echo ""
echo -e "${BLUE}4. Railway Backend URL${NC}"
echo "Get this from Railway dashboard → Backend Service → Settings → Railway Domain"
read -p "API_URL (e.g., https://dreambid-api.up.railway.app): " api_url
sed -i "s|^API_URL=.*|API_URL=$api_url|" .env.production

# 5. Netlify Frontend URL
echo ""
echo -e "${BLUE}5. Netlify Frontend URL${NC}"
echo "Get this from Netlify dashboard → Site settings → General → Site URL"
read -p "FRONTEND_URL (e.g., https://dreambid.netlify.app): " frontend_url
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=$frontend_url|" .env.production

# 6. WhatsApp Number
echo ""
echo -e "${BLUE}6. WhatsApp Business Number${NC}"
read -p "VITE_WHATSAPP_NUMBER (e.g., 917428264402): " whatsapp_number
sed -i "s|^VITE_WHATSAPP_NUMBER=.*|VITE_WHATSAPP_NUMBER=$whatsapp_number|" .env.production

echo ""
echo -e "${GREEN}✓ Configuration complete!${NC}"
echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "======================"
grep -v "^#" .env.production | grep -v "^$" | while read line; do
  key=$(echo $line | cut -d= -f1)
  if [[ "$key" == "FIREBASE_SERVICE_ACCOUNT_JSON" ]] || [[ "$key" == "JWT_SECRET" ]]; then
    value=$(echo $line | cut -d= -f2 | cut -c1-20)...
  else
    value=$(echo $line | cut -d= -f2)
  fi
  echo "$key = $value"
done

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review .env.production: cat .env.production"
echo "2. Run pre-flight checklist: bash deploy-checklist.sh"
echo "3. Deploy to Railway: git push origin main"
echo "4. Deploy to Netlify: git push origin main (auto-deploys)"
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
