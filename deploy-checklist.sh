#!/bin/bash

# DreamBid Deployment Pre-Flight Checklist
# Run this before deploying to production

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}  DreamBid Deployment Checklist${NC}"
echo -e "${BLUE}==================================${NC}\n"

# Counter
CHECKS_PASSED=0
CHECKS_FAILED=0

check_item() {
  local name=$1
  local command=$2
  local expected=$3
  
  echo -n "Checking: $name... "
  
  if eval "$command" &>/dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((CHECKS_FAILED++))
  fi
}

# === Environment Checks ===
echo -e "${YELLOW}Environment Setup${NC}"
check_item "Node.js installed (v18+)" "node --version | grep -qE 'v(18|19|20)'"
check_item "npm installed" "npm --version"
check_item "Git installed" "git --version"
check_item ".env.production exists" "test -f .env.production"
check_item "DATABASE_URL set" "grep -q 'DATABASE_URL' .env.production"
check_item "JWT_SECRET set" "grep -q 'JWT_SECRET' .env.production"
check_item "FIREBASE_SERVICE_ACCOUNT_JSON set" "grep -q 'FIREBASE_SERVICE_ACCOUNT_JSON' .env.production"
echo ""

# === Dependencies Check ===
echo -e "${YELLOW}Dependencies${NC}"
check_item "package.json exists" "test -f package.json"
check_item "node_modules installed" "test -d node_modules"
check_item "Required packages installed" "npm list express pg react react-query"
echo ""

# === Code Quality ===
echo -e "${YELLOW}Code Quality${NC}"
check_item "No syntax errors in routes" "node -c routes/properties.js"
check_item "No syntax errors in middleware" "node -c middleware/upload.js"
check_item "No syntax errors in services" "node -c services/NotificationService.js"
echo ""

# === Database ===
echo -e "${YELLOW}Database Setup${NC}"
if [ -z "$DATABASE_URL" ] && grep -q "DATABASE_URL" .env.production; then
  export $(cat .env.production | grep DATABASE_URL | xargs)
fi

check_item "DATABASE_URL format valid" "echo '$DATABASE_URL' | grep -qE 'postgresql://'"
echo ""

# === File Upload ===
echo -e "${YELLOW}File Upload Configuration${NC}"
check_item "Multer middleware imported" "grep -q 'import.*multer' middleware/upload.js"
check_item "Upload middleware in properties route" "grep -q 'uploadImages' routes/properties.js"
check_item "FormData in PropertyForm" "grep -q 'new FormData' src/pages/admin/PropertyForm.jsx"
check_item "Contact form submits files" "grep -q 'contactAPI' src/pages/public/Contact.jsx"
echo ""

# === Git Status ===
echo -e "${YELLOW}Git Status${NC}"
check_item "On main/master branch" "git branch --show-current | grep -qE '(main|master)'"
check_item "No uncommitted changes" "test -z \"\$(git status --porcelain)\""
check_item "Remote configured" "git remote -v | grep -q 'origin'"
echo ""

# === Build Check ===
echo -e "${YELLOW}Build${NC}"
echo -n "Checking: Frontend build... "
if npm run build &>/dev/null; then
  echo -e "${GREEN}✓ PASS${NC}"
  ((CHECKS_PASSED++))
else
  echo -e "${RED}✗ FAIL${NC}"
  ((CHECKS_FAILED++))
fi
echo ""

# === Summary ===
TOTAL=$((CHECKS_PASSED + CHECKS_FAILED))
echo -e "${BLUE}==================================${NC}"
echo -e "Results: ${GREEN}$CHECKS_PASSED passed${NC} / ${RED}$CHECKS_FAILED failed${NC} (out of $TOTAL)"
echo -e "${BLUE}==================================${NC}\n"

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
  echo ""
  echo -e "Next steps:"
  echo -e "1. Run: ${BLUE}git push origin main${NC}"
  echo -e "2. Monitor Railway deployment at: https://railway.app"
  echo -e "3. Monitor Netlify deployment at: https://app.netlify.com"
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Fix issues before deploying.${NC}"
  exit 1
fi
