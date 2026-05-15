# Railway Deployment Checklist

## Pre-Deployment

- [ ] Created Railway account at [railway.app](https://railway.app/)
- [ ] Created PostgreSQL database on Railway
- [ ] Copied `DATABASE_URL` from Railway
- [ ] Updated `.env` file with Railway `DATABASE_URL`
- [ ] Tested local connection: `npm run dev`
- [ ] All tests pass locally
- [ ] `.env` file is in `.gitignore` (DON'T commit it)
- [ ] Firebase credentials are set in `.env`
- [ ] All dependencies installed: `npm install`

## Environment Variables Ready

Before deploying, prepare all these variables:

```
✓ DATABASE_URL=postgresql://...@db.railway.internal:5432/railway
✓ FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
✓ JWT_SECRET=0f447cc9c8ded8b201ae40e91bb580cf907b70f4b1d4d9952405217507ede22c
✓ PORT=3000
✓ NODE_ENV=production
✓ FRONTEND_URL=https://dreambid-p.netlify.app/
✓ JWT_EXPIRE=24h
✓ UPLOAD_PATH=./uploads
✓ MAX_FILE_SIZE=10485760
✓ SESSION_TIMEOUT=86400000
✓ ACTIVITY_RETENTION_DAYS=90
✓ CLEANUP_CRON=0 2 * * *
```

## Deployment Steps

### Option A: Deploy Using Railway CLI

1. [ ] Install Railway CLI: `npm install -g @railway/cli`
2. [ ] Login: `railway login`
3. [ ] Link project: `railway link`
4. [ ] Add environment variables: `railway variables`
5. [ ] Deploy: `railway up`
6. [ ] Check deploy status in Railway dashboard

### Option B: Deploy Using GitHub Integration

1. [ ] Push code to GitHub
2. [ ] In Railway, create new project
3. [ ] Select "Deploy from GitHub repo"
4. [ ] Authorize GitHub
5. [ ] Select `dreambid-unified` repository
6. [ ] Railway auto-detects `package.json`
7. [ ] Add environment variables to Railway project
8. [ ] Wait for automatic deployment

## Post-Deployment

- [ ] Check deployment logs for errors
- [ ] Look for: `✓ Firebase initialized for push notifications`
- [ ] Generate domain in Railway (or use custom domain)
- [ ] Test API health endpoint: `https://your-domain/api/health`
- [ ] Verify database is connected
- [ ] Test login functionality
- [ ] Test enquiry submission (should trigger admin notification)
- [ ] Check admin receives push notification on mobile

## Database Setup

- [ ] Ensure migrations have run
- [ ] Verify `users` table exists
- [ ] Verify `notification_tokens` table exists
- [ ] Check all required tables are present

## Frontend Configuration

- [ ] Update Netlify environment variables with Railway API URL
- [ ] Or update frontend code to point to Railway backend
- [ ] Redeploy frontend to Netlify
- [ ] Test API calls from frontend to backend

## Security Checklist

- [ ] Enable 2FA on Railway account
- [ ] .env file NOT committed to Git
- [ ] Environment variables set in Railway (not hardcoded)
- [ ] Firebase credentials stored as environment variable
- [ ] Database password is strong
- [ ] SSL enabled for connections

## Monitoring & Maintenance

- [ ] Set up deploy notifications
- [ ] Monitor application logs regularly
- [ ] Check database metrics
- [ ] Review backup strategy
- [ ] Plan for scaling if needed

## Rollback Plan

If something goes wrong:

1. [ ] Check Railway logs for errors
2. [ ] Verify DATABASE_URL is set correctly
3. [ ] Redeploy to Railway
4. [ ] Check database connectivity

## Cost Monitoring

- [ ] Check Railway billing section monthly
- [ ] Monitor database size
- [ ] Monitor bandwidth usage
- [ ] Set up budget alerts if available

## Success Criteria

✅ All checks pass when:
- Application deploys without errors
- `/api/health` returns success
- Can login to admin panel
- Can submit enquiry and receive notification on admin phone
- Database is responsive
- No error logs in Railway dashboard

## Troubleshooting

If deployment fails:

1. Check Railway deploy logs
2. Verify all environment variables are set
3. Test `DATABASE_URL` is correct
4. Check if migrations need to be run
5. Verify port 3000 is configured
6. Look for specific error messages in logs

## Next Steps After Successful Deployment

1. [ ] Remove old Neon database (after confirming everything works)
2. [ ] Update documentation with Railway info
3. [ ] Brief team on new infrastructure
4. [ ] Update deployment scripts if any
5. [ ] Plan for future scaling/optimization

## Timeline

- **Day 1:** Create Railway account, set up database, test locally
- **Day 2:** Deploy to Railway, configure environment variables
- **Day 3:** Test all functionality, monitor for issues
- **Day 4+:** Keep Neon as backup, monitor Railway performance
- **Week 2:** If all stable, deprecate Neon database

---

**Need help?** Check [RAILWAY_SETUP.md](RAILWAY_SETUP.md) for detailed instructions.
