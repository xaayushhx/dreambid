# Deployment Roadmap - Quick Checklist

Follow these exact steps in order to deploy DreamBid.

---

## 🚀 STEP 1: RAILWAY DATABASE (5 minutes)

### ☐ Create Railway Account
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Create new project → Provision PostgreSQL

### ☐ Get Database Connection
- [ ] Wait for PostgreSQL to be ready (2-3 min)
- [ ] Click PostgreSQL service
- [ ] Go to Variables tab
- [ ] **COPY** `DATABASE_URL` (looks like: `postgresql://postgres:password@...`)
- [ ] **SAVE THIS** somewhere safe!

### ☐ Initialize Database
- [ ] In PostgreSQL → Data tab → Query Editor
- [ ] Open file: `clean-db.sql` from your project
- [ ] Copy all content
- [ ] Paste into Query Editor
- [ ] Click Execute
- [ ] Wait for success ✓

### ☐ Create Backend Service
- [ ] Back in Railway project
- [ ] Click + New Service
- [ ] Select GitHub Repo
- [ ] Choose: **xaayushhx/dreambid**
- [ ] Click Deploy
- [ ] Wait 2-3 minutes

### ☐ Configure Backend Variables
- [ ] Click Backend service
- [ ] Go to Variables tab
- [ ] Click Edit Variables
- [ ] Add:
  ```
  DATABASE_URL=<paste-from-above>
  JWT_SECRET=<generate-new-random>
  NODE_ENV=production
  PORT=3000
  FRONTEND_URL=https://dreambid.netlify.app
  FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
  MAX_FILE_SIZE=10485760
  ```

### ☐ Get Backend URL
- [ ] Click Backend service
- [ ] Go to Settings tab
- [ ] **COPY** Railway Domain (looks like: `https://dreambid-api.up.railway.app`)
- [ ] **SAVE THIS** for Netlify!

### ☐ Test Backend
```bash
curl https://YOUR_RAILWAY_DOMAIN/api/health
# Should return: {"status":"ok"}
```

---

## 🌐 STEP 2: NETLIFY FRONTEND (5 minutes)

### ☐ Connect GitHub
- [ ] Go to https://app.netlify.com
- [ ] Click Sign up → GitHub → Authorize
- [ ] Click + Add new site → Import existing project
- [ ] Select GitHub
- [ ] Search: **xaayushhx/dreambid**
- [ ] Click Deploy site

### ☐ Configure Build
- [ ] Go to Site settings → Build & deploy → Build settings
- [ ] Set:
  - Build command: `npm install && npm run build`
  - Publish directory: `dist`
  - Node version: 18.x
- [ ] Save

### ☐ Set Frontend Variables
- [ ] Go to Site settings → Environment
- [ ] Click Edit variables
- [ ] Add:
  ```
  VITE_API_URL=https://YOUR_RAILWAY_DOMAIN/api
  FRONTEND_URL=https://YOUR_NETLIFY_DOMAIN
  VITE_WHATSAPP_NUMBER=917428264402
  VITE_APP_VERSION=1.0.0
  ```
- [ ] **IMPORTANT:** Replace YOUR_RAILWAY_DOMAIN!
- [ ] Save

### ☐ Trigger Deploy
- [ ] Go to Deploys tab
- [ ] Click Trigger deploy → Deploy site
- [ ] Wait 5-10 minutes for build
- [ ] Check for green checkmark ✓

### ☐ Get Netlify URL
- [ ] Copy Site URL (looks like: `https://dreambid-xyz.netlify.app`)
- [ ] **SAVE THIS**

### ☐ Update Backend FRONTEND_URL
- [ ] Go back to Railway
- [ ] Backend service → Variables
- [ ] Update `FRONTEND_URL=https://YOUR_NETLIFY_URL`
- [ ] Save (auto-redeploys)

---

## ✅ STEP 3: TEST EVERYTHING (5 minutes)

### ☐ Test Frontend
- [ ] Visit https://YOUR_NETLIFY_DOMAIN
- [ ] Homepage loads ✓
- [ ] No errors in console (F12)

### ☐ Test Login
- [ ] Click Login
- [ ] Phone: 5551234567
- [ ] Password: admin123456
- [ ] Should login successfully ✓

### ☐ Test API
```bash
curl https://YOUR_RAILWAY_DOMAIN/api/health
# Returns: {"status":"ok"}
```

### ☐ Test File Upload
- [ ] Go to admin dashboard
- [ ] Create new property
- [ ] Add images
- [ ] Should upload without errors ✓

### ☐ Test Database
```bash
# Get DATABASE_URL from Railway
psql "postgresql://postgres:PASSWORD@containers.railway.app:5432/railway" -c "SELECT COUNT(*) FROM users;"
# Should return: number > 0
```

---

## 🎯 SUMMARY

| Step | Service | Time | Status |
|------|---------|------|--------|
| 1a | Railway Account | 2 min | ☐ |
| 1b | Database Setup | 5 min | ☐ |
| 1c | Backend Deploy | 5 min | ☐ |
| 2a | Netlify Setup | 2 min | ☐ |
| 2b | Frontend Deploy | 10 min | ☐ |
| 3 | Testing | 5 min | ☐ |
| **TOTAL** | | **~30 min** | |

---

## 🔑 Environment Variables You'll Need

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Firebase Credentials (if using push notifications)
Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

---

## 📝 Saving Important URLs

When you get these URLs, **save them** in a safe place:

1. **Railway Dashboard:** https://railway.app
2. **Railway Database URL:** `postgresql://postgres:...`
3. **Railway Backend Domain:** `https://dreambid-api.up.railway.app`
4. **Netlify Dashboard:** https://app.netlify.com
5. **Netlify Frontend URL:** `https://dreambid-xyz.netlify.app`

---

## 🆘 If Something Goes Wrong

### Issue: "Cannot connect to database"
- Check DATABASE_URL in Railway variables
- Verify PostgreSQL service is running
- Try: `psql "$DATABASE_URL" -c "SELECT 1;"`

### Issue: "Frontend shows API errors"
- Check VITE_API_URL in Netlify variables is correct
- Test backend: `curl https://YOUR_API/api/health`
- Check build log in Netlify

### Issue: "Deploy fails"
- Railway: Check Backend → Logs tab
- Netlify: Check Deploys → View Deploy Log
- Check all environment variables are set

### Issue: "Can't see Netlify site"
- Wait 5-10 minutes after deploy
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check build log for errors

---

## ✨ When Everything Works

You should be able to:

✓ Visit https://your-site.netlify.app  
✓ See the DreamBid homepage  
✓ Login with admin credentials  
✓ Create properties with images  
✓ Submit contact forms  
✓ Receive admin notifications  
✓ Access API at https://your-api.up.railway.app/api  

---

**Time Estimate:** 30 minutes total  
**Difficulty:** Easy  
**Help Available:** RAILWAY_NETLIFY_SETUP.md (detailed guide)
