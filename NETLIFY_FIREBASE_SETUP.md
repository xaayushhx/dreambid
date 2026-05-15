# Netlify Deployment Guide - Firebase Setup

## Adding Firebase Credentials to Netlify

Your DreamBid Firebase project is now configured. To deploy to Netlify with push notifications working, follow these steps:

### Step 1: Access Netlify Site Settings

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your **DreamBid** site
3. Click **Site settings** → **Build & deploy** → **Environment**

### Step 2: Add Environment Variables

Click **Edit variables** and add:

**Variable Name:** `FIREBASE_SERVICE_ACCOUNT_JSON`

**Value:** Get from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

```json
{
  "type": "service_account",
  "project_id": "YOUR_PROJECT_ID",
  "private_key_id": "YOUR_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@YOUR_PROJECT.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

⚠️ **SECURITY:** Never commit actual Firebase credentials to Git. Use environment variables only.

### Step 3: Verify Other Variables

Make sure these variables are also set in Netlify:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@host:port/database
JWT_SECRET=<your-secret-key>
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://dreambidp.netlify.app
VITE_API_URL=https://dreambid-production.up.railway.app/api
```

⚠️ **SECURITY:** Replace DATABASE_URL with your actual Railway database URL, never hardcode credentials in documentation.

### Step 4: Trigger a Redeploy

1. In Netlify, go to **Deploys**
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete

### Step 5: Verify Firebase is Working

Visit your deployed site and check the logs:

1. In Netlify, click **Deploys** → latest deploy
2. Click **Deploy log**
3. Look for: `✓ Firebase initialized for push notifications`

If you see this, Firebase is working! ✅

### Troubleshooting Netlify Firebase Issues

**Issue: "Cannot parse FIREBASE_SERVICE_ACCOUNT_JSON"**
- Make sure the entire JSON is on ONE line
- No line breaks or extra spaces

**Issue: "Firebase initialization failed"**
- Check the environment variable is correctly set
- Verify it starts with `{"type":"service_account"`
- Make sure it ends with `"universe_domain":"googleapis.com"}`

**Issue: Notifications still not working after Netlify deployment**
- Make sure the database migration has been run
- Verify admin users have registered their devices
- Check admin users have `role = 'admin'` in the database

## Your Project Credentials Summary

**Project ID:** `dreambid-247b5`
**Service Account Email:** `firebase-adminsdk-fbsvc@dreambid-247b5.iam.gserviceaccount.com`
**Region:** US (Neon Database)

## Next Steps

1. ✅ .env file configured locally
2. ⏳ Add environment variables to Netlify (see above)
3. ⏳ Trigger Netlify redeploy
4. ⏳ Verify deployment logs show Firebase initialized
5. ⏳ Test notifications on mobile device

## Security Reminder

**IMPORTANT:** Do NOT commit the `.env` file with credentials to GitHub!

Check that `.gitignore` includes:
```
.env
.env.local
.env.*.local
node_modules/
dist/
builds/
```

If you accidentally committed it, regenerate the Firebase service account key in the Firebase Console.
