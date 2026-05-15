# Railway + Netlify Connection Helper

## Your Credentials

```
DATABASE_PUBLIC_URL: postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@yamabiko.proxy.rlwy.net:41283/railway
DATABASE_URL (internal): postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@postgres.railway.internal:5432/railway
JWT_SECRET: dd1aa38a7fc52a02d18b3f50d9b1beb05e3bbc5683d213e7d8e50f3c84f48982
```

## Setup Steps

### 1. Initialize Database
Run this to create all tables:
```bash
export DATABASE_URL="postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@yamabiko.proxy.rlwy.net:41283/railway"
psql "$DATABASE_URL" -f clean-db.sql
```

### 2. Create Backend Service in Railway
- Go to https://railway.app
- Click your dreambidp project
- Click + New Service
- Select GitHub Repo
- Choose: xaayushhx/dreambid
- Railway will auto-deploy

### 3. Add Backend Environment Variables to Railway

In Railway → Backend Service → Variables:

```
DATABASE_URL=postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@postgres.railway.internal:5432/railway
JWT_SECRET=dd1aa38a7fc52a02d18b3f50d9b1beb05e3bbc5683d213e7d8e50f3c84f48982
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://dreambidp.netlify.app
MAX_FILE_SIZE=10485760
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account"...}
```

### 4. Get Backend URL from Railway
- Backend Service → Settings tab
- Copy the Railway Domain (e.g., https://dreambid-api.up.railway.app)

### 5. Update Netlify Environment Variables

Add/Update in Netlify (Site settings → Environment):

```
DATABASE_URL=postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@yamabiko.proxy.rlwy.net:41283/railway
JWT_SECRET=dd1aa38a7fc52a02d18b3f50d9b1beb05e3bbc5683d213e7d8e50f3c84f48982
VITE_API_URL=https://YOUR_RAILWAY_BACKEND_URL/api
FRONTEND_URL=https://dreambidp.netlify.app
VITE_WHATSAPP_NUMBER=917428264402
VITE_APP_VERSION=1.0.0
```

### 6. Test Everything
```bash
# Test database
psql "postgresql://postgres:deYRPfYDBbPkvJEHNqEqxPoSQCxgcyaT@yamabiko.proxy.rlwy.net:41283/railway" -c "SELECT COUNT(*) FROM users;"

# Test backend (once deployed)
curl https://YOUR_RAILWAY_BACKEND_URL/api/health

# Test frontend
open https://dreambidp.netlify.app
```

---

**IMPORTANT:** Once you get the Railway backend URL, update VITE_API_URL in Netlify with it!
