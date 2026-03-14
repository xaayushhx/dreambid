# Cloudinary Setup Guide for Image Storage

Your app currently stores images locally in `/tmp/uploads`, but on Netlify Functions, these files are **not persistent** and will be deleted after each request. To fix this, you need to use **Cloudinary** for cloud-based image storage.

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Sign up for a **FREE account** (generous free tier: 25GB storage, 25K transformations/month)
3. Verify your email

## Step 2: Get Your Credentials

1. After logging in, go to the **Dashboard**
2. You'll see your **Cloud Name** at the top
3. Scroll down to find your **API Key** and **API Secret**

## Step 3: Set Environment Variables on Netlify

1. Go to your **Netlify Site** (dreambid-p)
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Add these three environment variables:
   - `CLOUDINARY_CLOUD_NAME` = your_cloud_name (from dashboard)
   - `CLOUDINARY_API_KEY` = your_api_key (from dashboard)
   - `CLOUDINARY_API_SECRET` = your_api_secret (from dashboard)
4. Click **Save**

## Step 4: Deploy

1. Go to the **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

## Step 5: Test Image Upload

After deployment, try uploading a property with an image in the admin panel. The image should now be:
- Stored persistently on Cloudinary ✅
- Accessible from your app ✅
- Served from Cloudinary's CDN (fast) ✅

## Troubleshooting

If images still don't show:

1. **Check Netlify environment variables:**
   - Go to Site settings → Environment
   - Verify all three Cloudinary variables are set

2. **Check Cloudinary dashboard:**
   - Log in to Cloudinary
   - Go to Media Library → Images
   - Your uploaded images should appear here

3. **Check browser console:**
   - Open DevTools (F12)
   - Check if there are any network errors
   - The image URLs should start with `https://res.cloudinary.com/`

4. **Redeploy:**
   - Go to Netlify → Deploys
   - Click "Clear cache and redeploy"

## How It Works

- **Before:** Images → Local filesystem (`/tmp/uploads`) → Lost after function execution ❌
- **After:** Images → Cloudinary Cloud Storage → Persistent, CDN-served ✅

Cloudinary automatically:
- Stores your images securely
- Serves them from a fast CDN
- Optimizes images for different devices
- Provides easy management and analytics
