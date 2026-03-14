# Netlify Environment Variables Guide

## Required Environment Variables

Set these in **Netlify Build & Deploy Settings → Environment**

### 1. DATABASE CONNECTION (Required)
```
NETLIFY_DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```
- **Where to get it:** Neon, Railway, or any PostgreSQL provider
- **Format:** Full PostgreSQL connection string
- **Example:** `postgresql://neondb_owner:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### 2. JWT AUTHENTICATION (Required)
```
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```
- **What it is:** Secret key for signing JWT tokens
- **Requirements:** Minimum 32 characters for production
- **How to generate:** `openssl rand -base64 32`
- **Example:** `0f447cc9c8ded8b201ae40e91bb580cf907b70f4b1d4d9952405217507ede22c`

```
JWT_EXPIRE=24h
```
- **What it is:** JWT token expiration time
- **Default:** `24h`
- **Options:** `1h`, `7d`, `30d`, etc.

### 3. FRONTEND CONFIGURATION (Required)
```
FRONTEND_URL=https://your-frontend-domain.netlify.app
```
- **What it is:** Frontend URL for CORS configuration
- **Example:** `https://dreambidapp.netlify.app`
- **Note:** Update this to match your actual frontend URL

### 4. NODE ENVIRONMENT (Required)
```
NODE_ENV=production
```
- **Options:** `production`, `development`
- **For Netlify:** Always use `production`

### 5. FILE UPLOAD SETTINGS (Optional)
```
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
```
- **UPLOAD_DIR:** Directory for file uploads (Netlify uses `/tmp/` for temporary storage)
- **MAX_FILE_SIZE:** Maximum file size in bytes (default: 10MB = 10485760)

### 6. ADDITIONAL (Optional)
```
PORT=5000
```
- **What it is:** Server port (Netlify manages this, but kept for compatibility)

---

## How to Set Netlify Environment Variables

### Step 1: Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Select your site
3. Go to **Site Settings** → **Build & Deploy** → **Environment**

### Step 2: Add Variables
1. Click **Add environment variable**
2. Enter **Key** (e.g., `NETLIFY_DATABASE_URL`)
3. Enter **Value** (your actual database URL)
4. Click **Save**

### Step 3: Complete Setup
Repeat for all required variables above

### Step 4: Trigger Deploy
- Go to **Deploys** → **Trigger deploy**
- Select **Deploy site** to redeploy with new variables

---

## Environment Variables Checklist

```
✓ NETLIFY_DATABASE_URL       (PostgreSQL connection string)
✓ JWT_SECRET                 (32+ character secret)
✓ JWT_EXPIRE                 (default: 24h)
✓ FRONTEND_URL               (your frontend domain)
✓ NODE_ENV                   (production)
```

---

## Example Complete Setup

| Key | Value |
|-----|-------|
| `NETLIFY_DATABASE_URL` | `postgresql://neondb_owner:abc123@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | `0f447cc9c8ded8b201ae40e91bb580cf907b70f4b1d4d9952405217507ede22c` |
| `JWT_EXPIRE` | `24h` |
| `FRONTEND_URL` | `https://dreambidapp.netlify.app` |
| `NODE_ENV` | `production` |
| `UPLOAD_DIR` | `/tmp/uploads` |
| `MAX_FILE_SIZE` | `10485760` |

---

## Testing Variables

After setting environment variables, test the connection:

```bash
# Check API health
curl https://your-domain.netlify.app/api/health

# Should return:
# {"status":"OK","timestamp":"2026-03-14T...","message":"DreamBid API running on Netlify Functions"}
```

---

## Troubleshooting

**Issue: "Database connection refused"**
- ✓ Check `NETLIFY_DATABASE_URL` is correct
- ✓ Verify database is accessible from Netlify IPs
- ✓ Ensure `sslmode=require` in connection string

**Issue: "Invalid token" or auth errors**
- ✓ Regenerate `JWT_SECRET`
- ✓ Redeploy after updating variables
- ✓ Clear browser cache

**Issue: "CORS blocked"**
- ✓ Verify `FRONTEND_URL` matches your actual frontend domain
- ✓ Ensure no trailing slashes: `https://domain.com` not `https://domain.com/`

---

## Admin Login Test

After deployment with correct variables:

```bash
curl -X POST https://your-api.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"5551234567","password":"admin123456"}'
```

Should return JWT token if successful.

---

## Notes

- Environment variables are **case-sensitive**
- Netlify automatically makes these available to Netlify Functions
- Changes take effect on next deploy
- Never commit `.env` files with real credentials to git
- Rotate `JWT_SECRET` occasionally for security

