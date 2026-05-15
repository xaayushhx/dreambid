# Railway Complete Setup Guide

Complete guide to set up Railway for database and backend hosting.

## Part 1: Railway Account & Project Setup

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app/)
2. Click **Sign Up** 
3. Choose: GitHub, Google, or Email
4. Complete verification

### Step 2: Create New Railway Project

1. In Railway dashboard, click **+ New Project**
2. Select **Provision PostgreSQL**
3. Name it: `dreambid`
4. Click **Deploy**
5. Wait 2-3 minutes for database to be ready

## Part 2: PostgreSQL Database Setup

## Part 2: PostgreSQL Database Setup

### Step 1: Copy PostgreSQL Connection String

1. In Railway dashboard, click the **PostgreSQL** service
2. Go to the **Variables** tab
3. Find **`DATABASE_URL`** and copy the entire value

Format:
```
postgresql://postgres:password@hostname:5432/railway
```

### Step 2: Update Local .env

Set your Railway DATABASE_URL:

```env
# Railway PostgreSQL
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers.railway.app:YOUR_PORT/railway
```

### Step 3: Test Local Connection

```bash
cd /home/kazuha/work/dreambid/unified-dreambid

# Test database connection
node -e "
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW() as current_time', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Successfully connected to Railway PostgreSQL');
    console.log('Database time:', res.rows[0].current_time);
    process.exit(0);
  }
});
"
```

Expected output:
```
✓ Successfully connected to Railway PostgreSQL
Database time: 2026-05-15T10:30:45.123Z
```

## Part 3: Deploy Backend to Railway

## Part 3: Deploy Backend to Railway

### Option A: Using Railway CLI (Recommended)

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login to Railway

```bash
railway login
```

Browser opens. Authorize and return to terminal.

#### Step 3: Link Your Project

```bash
cd /home/kazuha/work/dreambid/unified-dreambid
railway link
```

Select your `dreambid` project from the list.

#### Step 4: Deploy

```bash
railway up
```

Watch the logs. When complete, you'll see your public domain.

### Option B: Using GitHub Integration (Auto-Deploy)

#### Step 1: Push Code to GitHub

```bash
cd /home/kazuha/work/dreambid/unified-dreambid
git add .
git commit -m "Deploy to Railway"
git push origin main
```

#### Step 2: Connect in Railway

1. In Railway dashboard, click **+ New Service**
2. Select **GitHub Repo**
3. Connect your GitHub account
4. Select `unified-dreambid` repository
5. Click **Deploy**

Railway auto-detects Node.js and deploys!

### Option C: Using Dockerfile

In your Railway project:

1. Click on your **application service** (not the database)
2. Go to **Variables** tab
3. Add all your environment variables:

```
DATABASE_URL=postgresql://postgres:...@db.railway.internal:5432/railway
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"dreambid-247b5",...}
JWT_SECRET=0f447cc9c8ded8b201ae40e91bb580cf907b70f4b1d4d9952405217507ede22c
JWT_EXPIRE=24h
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-railway-domain.up.railway.app/
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
SESSION_TIMEOUT=86400000
ACTIVITY_RETENTION_DAYS=90
CLEANUP_CRON=0 2 * * *
```

## Step 7: Configure Domains

1. In your Railway project, click on your **application service**
2. Go to **Settings**
3. Look for **Domains**
4. Click **+ Generate Domain** or use a **Custom Domain**

This will give you a URL like: `https://dreambid-app.up.railway.app`

## Step 8: Run Database Migrations

### Option C: Using Dockerfile

If you want more control, create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app code
COPY . .

# Build (if needed)
RUN npm run build || true

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
```

Then deploy:
```bash
railway up
```

## Part 4: Configure Environment Variables on Railway

### Step 1: Access Variables in Railway

1. In Railway dashboard, click your **Node.js service**
2. Go to **Variables** tab
3. Click **Add Variable** or **Raw Editor**

### Step 2: Add All Environment Variables

If using **Raw Editor**, paste:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers.railway.app:YOUR_PORT/railway
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"YOUR_PROJECT_ID",...}
JWT_SECRET=<generate-with-openssl-rand-hex-32>
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-netlify-domain.netlify.app/
MAX_FILE_SIZE=10485760
```

⚠️ **SECURITY:** Never commit actual credentials. Use Railway environment variables dashboard.

### Step 3: Set Build & Start Commands

In your **Node.js service Settings**:

**Build Command:**
```
npm install
```

**Start Command:**
```
node server.js
```

## Part 5: Run Database Migrations

## Part 5: Run Database Migrations

### Option A: Automatic (Recommended)

Migrations run automatically on server start if configured in `server.js`.

### Option B: Manual via Railway Shell

```bash
# Connect to PostgreSQL
railway connect postgres

# In the PostgreSQL shell:
\dt  # List all tables

# Exit
\q
```

### Option C: Run from Node Script

```bash
cd /home/kazuha/work/dreambid/unified-dreambid
node scripts/init-db.js
```

This creates all tables:
- `users`
- `properties`
- `enquiries`
- `notification_tokens`
- `blogs`
- `interests`
- `activities`
- etc.

## Part 6: Verify Deployment

### Step 1: Check Deployment Status

In Railway dashboard, your **Node.js service** should show **"Running"** in green.

### Step 2: Get Your Public URL

1. Click your **Node.js service**
2. Go to **Settings** tab
3. Look for **Domains** section
4. Copy your public URL: `https://your-app.up.railway.app`

### Step 3: Test Health Check

```bash
curl https://your-app.up.railway.app/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"2026-05-15T10:30:45.123Z"}
```

### Step 4: Check Logs for Confirmation

Look for these messages in Railway logs:
```
✓ Database connected successfully
✓ Firebase initialized for push notifications
✓ Server running on port 3000
```

## Part 7: Connect Frontend to Backend

### Update Netlify Frontend

1. Go to [Netlify Dashboard](https://app.netlify.app)
2. Select your **DreamBid** site
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Add/Update variable:

```
VITE_API_URL=https://your-railway-app.up.railway.app
```

5. Trigger a redeploy

### Update Frontend Code

In `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.VITE_API_URL || 'https://your-railway-app.up.railway.app';

export default axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  }
});
```

## Part 8: Test Everything

### Database Connection Issues

**Error: "connect ECONNREFUSED"**
- Make sure `DATABASE_URL` is correct
- Check if PostgreSQL service is running in Railway
- Verify app can reach database (check firewall/networking)

**Error: "permission denied for schema public"**
- The user might not have proper permissions
- In Railway PostgreSQL shell: `GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;`

### Deployment Issues

**"Application keeps crashing"**
1. Check deploy logs in Railway dashboard
2. Look for specific error messages
3. Verify all environment variables are set
4. Check `npm install` completed successfully

**"Can't connect to database after deploy"**
1. Verify `DATABASE_URL` in Railway variables
2. Make sure PostgreSQL service is in the same project
3. Try using `db.railway.internal` instead of external hostname

### SSL/TLS Errors

If you get SSL errors:
```
Error: self signed certificate in certificate chain
```

Add this to your connection string:
```
?sslmode=disable
```

Or in your code:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

## Monitoring & Logs

### View Application Logs

1. Click your **application service**
2. Go to **Logs** tab
3. Real-time logs will appear here

### Monitor Database

1. Click your **PostgreSQL service**
2. Go to **Metrics** tab
3. See CPU, memory, and query metrics

## Cost Comparison

| Service | Database | Hosting | Total Monthly |
|---------|----------|---------|---------------|
| Neon | ~$20 | Netlify (Free) | ~$20+ |
| Railway | Included | ~$5-20/month | $5-20 |

Railway often has better overall pricing since database and hosting are on the same platform.

## Security on Railway

1. **Never commit .env files** - Railway provides secure variable storage
2. **Use strong passwords** - Railway generates secure database passwords
3. **Enable 2FA** - Enable two-factor authentication on your Railway account
4. **Monitor activity** - Check deployment logs for suspicious activity

## Backup & Recovery

Railway automatically backs up your PostgreSQL database. To restore:

1. Go to **PostgreSQL service** → **Settings**
2. Look for **Backups** section
3. You can restore from previous snapshots if needed

## Next Steps

1. ✅ Create Railway account
2. ✅ Create PostgreSQL database
3. ✅ Get DATABASE_URL
4. ✅ Update .env locally
5. ✅ Deploy application to Railway
6. ✅ Add environment variables to Railway
7. ✅ Verify deployment works
8. ✅ Update frontend to point to Railway backend
9. ✅ Test notifications work on production

## Useful Railway Commands (CLI)

```bash
# Login
railway login

# Link to existing project
railway link

# Deploy
railway up

# View variables
railway variables

# View logs
railway logs

# Open dashboard
railway open
```

## Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql)
- [Railway Deployment Guides](https://docs.railway.app/guides)
- [Railway Pricing](https://railway.app/pricing)

## Support

For issues:
1. Check [Railway Status](https://status.railway.app/)
2. Visit [Railway Discord](https://discord.gg/railway)
3. Check application logs in Railway dashboard
4. Review this guide's troubleshooting section
