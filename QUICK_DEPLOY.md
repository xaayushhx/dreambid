# DreamBid Deployment Quick Reference

## ⚡ Quick Start (5 minutes)

### 1. Setup Production Environment
```bash
chmod +x setup-production.sh
./setup-production.sh
```
Follow prompts to enter:
- Railway DATABASE_URL
- Firebase service account JSON
- Railway backend URL
- Netlify frontend URL
- WhatsApp number

### 2. Run Pre-Flight Checklist
```bash
chmod +x deploy-checklist.sh
./deploy-checklist.sh
```
All checks should pass ✓

### 3. Deploy
```bash
git add -A
git commit -m "Deploy to production"
git push origin main
```

### 4. Monitor Deployments
- **Railway:** https://railway.app (Deployments tab)
- **Netlify:** https://app.netlify.com (Deploys tab)

Both auto-deploy on push. Wait ~5-10 minutes.

---

## 🗂️ Environment Variables

### Required Variables

| Variable | Where to Get | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Railway → PostgreSQL → Variables | `postgresql://...` |
| `JWT_SECRET` | Generate with `openssl rand -hex 32` | 40-char hex string |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase → Project Settings → Service Accounts | JSON string |
| `API_URL` | Railway → Backend → Settings → Railway Domain | `https://dreambid-api.up.railway.app` |
| `FRONTEND_URL` | Netlify → Site settings → Site URL | `https://dreambid.netlify.app` |

### Optional Variables
- `PORT` - Default: 3000
- `NODE_ENV` - Default: production
- `MAX_FILE_SIZE` - Default: 10485760 (10MB)
- `VITE_WHATSAPP_NUMBER` - WhatsApp business number

---

## 🚀 Deployment Steps

### Step 1: Create Railway PostgreSQL Database
```bash
# At railway.app:
# 1. New Project → Provision PostgreSQL
# 2. Copy DATABASE_URL
# 3. Get your backend URL from settings
```

### Step 2: Initialize Database
```bash
export DATABASE_URL="your-connection-string"
psql "$DATABASE_URL" -f clean-db.sql
```

### Step 3: Configure Environment
```bash
./setup-production.sh
# Fill in all required variables
```

### Step 4: Deploy to Railway & Netlify
```bash
git push origin main
# Wait for both to deploy
```

### Step 5: Verify Deployment
```bash
# Test API
curl https://your-api.railway.app/api/health

# Test Frontend
open https://your-site.netlify.app
```

---

## 🔧 Troubleshooting

### Deployment Failed
- Check Railway logs: `railway logs -s backend`
- Check Netlify deploy log: Dashboard → Deploys → View log
- Ensure all env vars are set
- Run `deploy-checklist.sh` again

### File Upload Not Working
- Check `MAX_FILE_SIZE` is set
- Verify `uploadImages` middleware in route
- Ensure FormData in frontend
- Test with: `curl -F "images=@file.jpg" ...`

### Database Connection Error
- Verify `DATABASE_URL` format
- Check PostgreSQL is running: `psql "$DATABASE_URL" -c "SELECT 1;"`
- Ensure IP whitelisting if needed

### Push Notifications Not Working
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON
- Check Firebase project is correct
- Test with admin notification endpoint

---

## 📋 Pre-Deployment Checklist

Before deploying, verify:

- [ ] `.env.production` file exists
- [ ] All required env vars are set
- [ ] `deploy-checklist.sh` passes all checks
- [ ] Database migration completed
- [ ] Admin user created
- [ ] Tests pass locally
- [ ] No uncommitted changes
- [ ] On `main` branch

---

## 🔄 Redeployment

To redeploy after code changes:

```bash
git add -A
git commit -m "Update: [description]"
git push origin main

# Check deployment status
# Railway: https://railway.app → Deployments
# Netlify: https://app.netlify.com → Deploys
```

---

## 📊 Monitoring

### View Logs

**Railway Backend:**
```bash
railway login
railway logs -s backend
```

**Netlify Frontend:**
- Dashboard → Deploys → Click deploy → View Deploy Log
- Dashboard → Functions → View logs

### Database Health
```bash
psql "$DATABASE_URL" << EOF
SELECT version();
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as property_count FROM properties;
EOF
```

### API Health Check
```bash
curl https://your-api.railway.app/api/health
# Should return: {"status":"ok"}
```

---

## 🔑 Secrets & Credentials

### Store Securely
- Never commit `.env.production` with real credentials
- Use Railway/Netlify dashboard for secrets
- Regenerate JWT_SECRET every 6 months
- Rotate Firebase keys periodically

### Backup Credentials
```bash
# Backup to secure location (NOT Git)
cp .env.production ~/Backups/.env.dreambid.backup
chmod 600 ~/Backups/.env.dreambid.backup
```

---

## 📞 Support

- **Railway Issues:** https://discord.gg/railway
- **Netlify Issues:** https://community.netlify.com
- **Firebase Issues:** https://groups.google.com/g/firebase-talk
- **PostgreSQL Issues:** https://www.postgresql.org/support/

---

## ✅ Post-Deployment

After successful deployment:

1. ✓ Test login with admin credentials
2. ✓ Create a test property with images
3. ✓ Submit a test contact form
4. ✓ Verify push notifications
5. ✓ Check database size and backups
6. ✓ Monitor error logs
7. ✓ Set up uptime monitoring
8. ✓ Plan backup strategy

---

**Last Updated:** May 15, 2026  
**DreamBid Version:** 1.0.0
