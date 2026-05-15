# DreamBid Railway + Netlify Setup Guide

Complete step-by-step guide to deploy your DreamBid app to production.

---

## Part 1: Railway Setup (5-10 minutes)

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **Sign Up**
3. Choose: **GitHub** (recommended) → Authorize
4. Create account

### Step 2: Create New Project

1. In Railway dashboard, click **+ New Project**
2. Select **Provision PostgreSQL**
3. Wait 2-3 minutes for database to be ready
4. You should see a **PostgreSQL** box in the project

### Step 3: Get Database URL

1. Click on **PostgreSQL** service
2. Go to **Variables** tab
3. **Copy** the `DATABASE_URL` value

Format looks like:
```
postgresql://postgres:abc123@containers.railway.app:5432/railway
```

**Save this somewhere** - you'll need it soon.

### Step 4: Initialize Database Schema

#### Option A: Using Railway SQL Editor (Easiest)

1. Still in PostgreSQL service, click **Data** tab
2. Click **Query Editor** (top right)
3. Open file: `/clean-db.sql` from your project
4. **Copy entire file content**
5. **Paste** into Query Editor
6. Click **Execute**
7. Wait for completion ✓

#### Option B: Using Terminal (Advanced)

```bash
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@containers.railway.app:5432/railway"
psql "$DATABASE_URL" -f clean-db.sql
```

### Step 5: Create Backend Service

1. In Railway project, click **+ New Service**
2. Select **GitHub Repo**
3. Choose your **xaayushhx/dreambid** repository
4. Click **Deploy**
5. Wait 2-3 minutes for deployment

### Step 6: Configure Backend Environment Variables

1. Click on the **Backend** service (or your Node.js service)
2. Go to **Variables** tab
3. Click **Edit Variables** (or Raw Editor for JSON)

**Add these variables:**

```env
DATABASE_URL=postgresql://postgres:PASSWORD@containers.railway.app:5432/railway
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://dreambid.netlify.app
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
MAX_FILE_SIZE=10485760
```

**How to generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 7: Get Backend URL

1. Click on **Backend** service
2. Go to **Settings** tab
3. Copy **Railway Domain** (looks like `https://dreambid-api-prod.up.railway.app`)

**Save this** - you need it for Netlify.

### Step 8: Verify Backend is Running

```bash
# Test your backend
curl https://your-railway-domain.up.railway.app/api/health

# Should return: {"status":"ok"}
```

If it doesn't work, check:
- Logs: Backend service → Logs tab
- Environment variables are set
- PostgreSQL is connected

---

## Part 2: Netlify Setup (5-10 minutes)

### Step 1: Connect GitHub to Netlify

1. Go to **https://app.netlify.com**
2. Click **Sign up** (or **Log in**)
3. Choose **GitHub** → Authorize
4. Click **+ Add new site** → **Import an existing project**
5. Choose **GitHub** provider
6. Search for and select **xaayushhx/dreambid**
7. Click **Deploy site**

### Step 2: Configure Build Settings

1. In Netlify, go to **Site settings** → **Build & deploy** → **Build settings**

**Set these values:**

| Setting | Value |
|---------|-------|
| **Build command** | `npm install && npm run build` |
| **Publish directory** | `dist` |
| **Node version** | 18.x (or latest) |

2. Click **Save**

### Step 3: Set Environment Variables

1. Go to **Site settings** → **Environment**
2. Click **Edit variables**

**Add these variables:**

```env
VITE_API_URL=https://your-railway-backend.up.railway.app/api
FRONTEND_URL=https://your-netlify-site.netlify.app
VITE_WHATSAPP_NUMBER=917428264402
VITE_APP_VERSION=1.0.0
```

⚠️ **IMPORTANT:** Replace `your-railway-backend.up.railway.app` with your actual Railway domain from Step 1.7!

3. Click **Save**

### Step 4: Trigger Deploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait 5-10 minutes for build to complete
4. Check **Deploy log** for any errors

### Step 5: Get Netlify URL

Once deployment succeeds:
- Look for **Site URL** (e.g., `https://dreambid-xy1234.netlify.app`)
- This is your public frontend!

### Step 6: Update Backend FRONTEND_URL

1. Go back to Railway
2. Click **Backend** service
3. Go to **Variables** tab
4. Update `FRONTEND_URL` with your Netlify URL
5. This triggers a redeploy automatically

---

## Part 3: Testing Deployment

### Test 1: Frontend Works

1. Visit your Netlify URL: `https://your-site.netlify.app`
2. You should see the DreamBid homepage
3. Check browser console for errors (F12 → Console)

### Test 2: Login Works

1. Go to login page
2. Enter credentials:
   - **Phone:** 5551234567 (or your test user)
   - **Password:** admin123456
3. Should successfully login

### Test 3: API Works

```bash
# Test API endpoint
curl https://your-railway-backend.up.railway.app/api/health

# Should return:
# {"status":"ok"}
```

### Test 4: Database Works

```bash
# Check if users exist
curl https://your-railway-backend.up.railway.app/api/users/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test 5: File Upload Works

1. Go to admin dashboard
2. Create new property with images
3. Should upload without errors
4. Images should display correctly

### Test 6: Push Notifications Work

1. Go to admin panel
2. Register device token
3. Submit contact form or enquiry
4. Admin should receive push notification

---

## Part 4: Troubleshooting

### Common Issues

#### **"Cannot connect to database"**

Check:
```bash
# Test connection
psql "postgresql://postgres:PASSWORD@containers.railway.app:5432/railway" -c "SELECT 1;"

# Should return: 1
```

If fails:
- Go to Railway → PostgreSQL → Variables
- Copy DATABASE_URL again
- Make sure it's exactly in Backend variables

#### **"Frontend shows API errors"**

Check:
- Netlify env var `VITE_API_URL` is correct
- Railway backend service is running (check Logs)
- Backend and frontend CORS are configured

```bash
# Test from terminal
curl https://your-api.up.railway.app/api/health
```

#### **"File upload fails"**

Check:
- Backend has `MAX_FILE_SIZE` set to 10485760
- Multer middleware is in routes
- PostgreSQL has disk space

#### **"Deploy takes too long"**

Check:
- Netlify build log: Site → Deploys → Click deploy → View deploy log
- Railway logs: Backend service → Logs tab
- Dependencies installing correctly

#### **"Push notifications not working"**

Check:
- `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON
- Firebase project exists and is active
- Device tokens are being registered

---

## Part 5: Environment Variables Checklist

### Railway Backend

```env
✓ DATABASE_URL=postgresql://...
✓ JWT_SECRET=<40-char hex>
✓ NODE_ENV=production
✓ PORT=3000
✓ FRONTEND_URL=https://your-netlify-domain
✓ FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
✓ MAX_FILE_SIZE=10485760
```

### Netlify Frontend

```env
✓ VITE_API_URL=https://your-railway-api/api
✓ FRONTEND_URL=https://your-netlify-domain
✓ VITE_WHATSAPP_NUMBER=917428264402
```

---

## Part 6: Post-Deployment Tasks

### 1. Monitor Logs

**Railway:**
```bash
# Watch backend logs
railway login
railway logs -s backend --follow
```

**Netlify:**
- Dashboard → Deploys → Click latest → View Deploy Log

### 2. Test All Features

- [ ] Login with admin account
- [ ] Create property with images
- [ ] Submit contact form
- [ ] Check admin notifications
- [ ] Test mobile app (if applicable)
- [ ] Verify push notifications

### 3. Set Up Monitoring

- Railway: Set up alerts for crashes
- Netlify: Enable analytics
- Database: Monitor connections and disk usage

### 4. Backup Database

```bash
# Create backup
pg_dump "postgresql://..." > dreambid_backup.sql

# Store securely (not in Git!)
```

### 5. Update Documentation

- Update README with Netlify & Railway links
- Document any custom setup steps
- Add team members to both platforms

---

## Part 7: Quick Reference

### URLs to Remember

| Service | URL |
|---------|-----|
| Railway Dashboard | https://railway.app |
| Netlify Dashboard | https://app.netlify.com |
| Your API | `https://your-api.up.railway.app` |
| Your Site | `https://your-site.netlify.app` |

### Commands

```bash
# Check Railway logs
railway login && railway logs -s backend

# Test API health
curl https://your-api.up.railway.app/api/health

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test database
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

---

## Need Help?

**Railway Support:** https://discord.gg/railway  
**Netlify Support:** https://community.netlify.com  
**PostgreSQL Docs:** https://www.postgresql.org/docs/

**If you get stuck, check:**
1. Browser console (F12)
2. Railway logs → Backend → Logs tab
3. Netlify logs → Deploys → View Deploy Log
4. Database connection with `psql`

---

**Status:** Ready to Deploy! 🚀

Once you complete these steps, your DreamBid app will be live in production with:
- ✅ PostgreSQL database on Railway
- ✅ Backend API running on Railway
- ✅ Frontend running on Netlify
- ✅ Automatic HTTPS & SSL
- ✅ File uploads working
- ✅ Push notifications ready
