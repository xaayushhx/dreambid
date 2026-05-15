# DreamBid Deployment Guide - Netlify + Railway

Complete guide to deploy DreamBid frontend to Netlify and backend to Railway with PostgreSQL.

---

## Part 1: Railway Setup (Database & Backend)

### Step 1.1: Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Click **Sign Up** (GitHub, Google, or Email)
3. Click **+ New Project**
4. Select **Provision PostgreSQL**
5. Name: `dreambid`
6. Click **Deploy** (wait 2-3 minutes)

### Step 1.2: Get Database Credentials

1. In Railway dashboard, click **PostgreSQL** service
2. Go to **Variables** tab
3. Copy `DATABASE_URL` value (format: `postgresql://postgres:password@host:5432/railway`)

### Step 1.3: Initialize Database Schema

**Option A: Using Railway's SQL Editor**

1. In Railway, click **PostgreSQL** → **Data**
2. Open **Query Editor**
3. Copy entire content of `/clean-db.sql`
4. Paste into Query Editor
5. Click **Execute**

**Option B: Local Machine (using psql)**

```bash
# Set your DATABASE_URL from Railway
export DATABASE_URL="postgresql://postgres:password@host:5432/railway"

# Run schema
psql "$DATABASE_URL" -f clean-db.sql

# Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

### Step 1.4: Create Railway Backend Service

1. In Railway dashboard, click **+ New Service**
2. Select **GitHub Repo**
3. Choose your `unified-dreambid` repository
4. Click **Deploy**

### Step 1.5: Configure Backend Environment Variables

In Railway dashboard for your backend service:

**Click Variables → Edit Variables**

Add these environment variables:

```env
# Database (auto-linked from PostgreSQL)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# JWT & Security
JWT_SECRET=<generate-random-string>
NODE_ENV=production

# Firebase (for push notifications)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Server
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=https://your-netlify-domain.netlify.app

# File Upload
MAX_FILE_SIZE=10485760

# Environment
API_URL=https://your-railway-backend.up.railway.app
```

**To Generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 1.6: Deploy Backend

```bash
# Push to main branch
git add -A
git commit -m "Deploy to Railway"
git push origin main

# Railway auto-deploys on push
# Monitor in Railway dashboard → Deployments
```

Monitor deployment:
- Check **Logs** for any errors
- Look for: `Server running on port 3000`
- Wait for **Deployment Successful** status

### Step 1.7: Get Backend URL

In Railway dashboard:
- Click your backend service
- Go to **Settings**
- Copy **Railway Domain** (e.g., `https://dreambid-api.up.railway.app`)

---

## Part 2: Netlify Setup (Frontend)

### Step 2.1: Connect GitHub to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **Log in** → **GitHub**
3. Click **New site from Git**
4. Select **GitHub**
5. Choose your `unified-dreambid` repository
6. Click **Deploy**

### Step 2.2: Configure Build Settings

In Netlify **Site settings → Build & deploy:**

**Build command:**
```bash
npm install && npm run build
```

**Publish directory:**
```
dist
```

**Node version:** 18.x

### Step 2.3: Set Environment Variables

In Netlify **Site settings → Environment:**

Click **Edit variables** and add:

```env
# API Configuration
VITE_API_URL=https://your-railway-backend.up.railway.app/api
FRONTEND_URL=https://your-netlify-site.netlify.app

# App Config
VITE_WHATSAPP_NUMBER=917428264402
VITE_APP_VERSION=1.0.0
VITE_JWT_EXPIRY=3600
VITE_SECURE_STORAGE=true
VITE_ENABLE_HTTPS_ONLY=true
```

**IMPORTANT:** Replace `your-railway-backend.up.railway.app` with your actual Railway domain!

### Step 2.4: Configure Netlify Functions

Create `/netlify/functions/api.js` to proxy requests:

```javascript
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

app.use(
  '/api',
  createProxyMiddleware({
    target: process.env.VITE_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': ''
    }
  })
);

export default app;
```

### Step 2.5: Deploy Frontend

**Option A: Automatic (Recommended)**

```bash
git add -A
git commit -m "Update environment for deployment"
git push origin main

# Netlify auto-deploys on push
# Monitor at netlify.com → Deploys
```

**Option B: Manual Trigger**

1. Go to Netlify dashboard
2. Click **Deploys**
3. Click **Trigger deploy** → **Deploy site**

### Step 2.6: Get Frontend URL

After deployment completes:
- In Netlify dashboard, look for **Site URL** (e.g., `https://dreambid.netlify.app`)
- Update this in:
  - Railway backend `FRONTEND_URL` env var
  - `/api` CORS settings

---

## Part 3: File Upload Configuration

### File Upload Limits

- **Max file size:** 10MB per file
- **Max files per upload:** 20 images (properties)
- **Allowed image formats:** JPG, PNG, GIF, WebP
- **Allowed document formats:** PDF

### Enable File Uploads in Netlify Functions

Ensure your Netlify build supports file uploads:

1. **Install dependencies:**
```bash
npm install multer dotenv
```

2. **Configure in `.env.production`:**
```env
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp
```

3. **Test file upload:**
```bash
curl -X POST https://your-api.com/api/properties \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title=Test Property" \
  -F "address=123 Main St" \
  -F "city=New York" \
  -F "reserve_price=500000" \
  -F "auction_date=2026-06-01" \
  -F "images=@/path/to/image.jpg"
```

---

## Part 4: Database Migrations & Backups

### Run Migrations

After database initialization:

```bash
# Run all migrations
npm run migrate

# Or manually:
node scripts/init-db.js
```

### Create Database Backup

```bash
# Export database
pg_dump "$DATABASE_URL" > dreambid_backup.sql

# Store safely (Git LFS, S3, etc.)
```

### Restore Database

```bash
# Restore from backup
psql "$DATABASE_URL" -f dreambid_backup.sql
```

---

## Part 5: Testing Deployments

### Test Backend API

```bash
# Health check
curl https://your-railway-backend.up.railway.app/api/health

# Expected: {"status":"ok"}

# Test authentication
curl -X POST https://your-railway-backend.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"5551234567","password":"admin123456"}'

# Expected: JWT token in response
```

### Test Frontend

1. Visit `https://your-netlify-site.netlify.app`
2. Try login with admin credentials:
   - **Phone:** 5551234567
   - **Password:** admin123456
3. Test property creation with file upload
4. Check browser console for any errors

### Test Push Notifications

1. Go to admin dashboard
2. Register device token:
   ```bash
   curl -X POST https://your-api.com/api/notifications/register-token \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"deviceToken":"abc123...","platform":"ios"}'
   ```
3. Submit an enquiry (should trigger notification)

### Test Contact Form

1. Go to public site → Contact
2. Fill form with file attachment
3. Submit
4. Check admin notifications

---

## Part 6: Monitoring & Maintenance

### View Logs

**Railway:**
```bash
railway login
railway logs -s backend
```

**Netlify:**
- Dashboard → Deploys → Click deploy → View Deploy Log
- Dashboard → Functions → View logs

### Database Health

```bash
# Check connection
psql "$DATABASE_URL" -c "SELECT version();"

# Monitor active connections
psql "$DATABASE_URL" -c "SELECT * FROM pg_stat_activity;"

# Check disk usage
psql "$DATABASE_URL" -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database ORDER BY pg_database_size(pg_database.datname) DESC;"
```

### Performance Monitoring

**Enable slow query logs:**
```sql
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
SELECT pg_reload_conf();
```

### Update Backend

```bash
git add -A
git commit -m "Update features"
git push origin main

# Railway auto-deploys
# Check Deployments tab
```

---

## Part 7: Environment Variables Reference

### Frontend (.env.production)
```env
VITE_API_URL=https://dreambid-api.up.railway.app/api
FRONTEND_URL=https://dreambid.netlify.app
VITE_WHATSAPP_NUMBER=917428264402
VITE_APP_VERSION=1.0.0
VITE_JWT_EXPIRY=3600
VITE_SECURE_STORAGE=true
VITE_ENABLE_HTTPS_ONLY=true
```

### Backend (.env.production)
```env
DATABASE_URL=postgresql://postgres:password@host:5432/railway
JWT_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://dreambid.netlify.app
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
MAX_FILE_SIZE=10485760
API_URL=https://dreambid-api.up.railway.app
```

---

## Part 8: Troubleshooting

### Common Issues

**"Cannot POST /api/properties"**
- Check `FRONTEND_URL` in Railway env vars
- Verify CORS headers in Express

**"Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL service is running
- Test with: `psql "$DATABASE_URL" -c "SELECT 1;"`

**"File upload failed"**
- Check `MAX_FILE_SIZE` is set
- Ensure `multer` middleware is loaded
- Verify `/tmp` directory exists

**"Push notifications not working"**
- Check `FIREBASE_SERVICE_ACCOUNT_JSON` is set
- Verify Firebase project is correct
- Test with curl command above

**"Frontend shows 404"**
- Check `VITE_API_URL` in Netlify env vars
- Verify Railway backend is running
- Check browser Network tab for actual URL

### Debug Mode

**Enable debug logs:**

Backend:
```bash
DEBUG=* railway logs -s backend
```

Frontend:
```bash
localStorage.setItem('debug', '*')
```

---

## Part 9: Production Checklist

Before going live, verify:

- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Firebase service account configured
- [ ] File upload tested with images
- [ ] Contact form tested with attachments
- [ ] Push notifications tested
- [ ] Backend and frontend URLs connected
- [ ] CORS properly configured
- [ ] SSL/HTTPS enabled (automatic on both)
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] File size limits enforced

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Netlify Docs:** https://docs.netlify.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Express.js:** https://expressjs.com/
- **React Vite:** https://vitejs.dev/
- **Firebase Admin:** https://firebase.google.com/docs/admin/setup

---

**Last Updated:** May 15, 2026  
**Status:** Production Ready ✅
