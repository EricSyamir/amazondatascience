# Deployment Guide - Amazon Sales Dashboard

This guide will help you deploy the dashboard to Vercel for free.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - sign up at [vercel.com](https://vercel.com)

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your Code

1. Make sure all files are in the `dashboard` folder
2. Ensure `dashboard_data` folder is copied to `dashboard/public/dashboard_data`

### Step 2: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `amazon-sales-dashboard`
4. Choose "Public" (required for free Vercel)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 3: Push Code to GitHub

Open PowerShell/Terminal in the `dashboard` folder:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Amazon Sales Dashboard"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/amazon-sales-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Via Vercel Website (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub to sign in)
2. Click "Add New..." → "Project"
3. Import your `amazon-sales-dashboard` repository
4. Vercel will auto-detect Next.js settings:
   - Framework Preset: Next.js
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
5. Click "Deploy"
6. Wait 2-3 minutes for deployment
7. Your dashboard will be live at: `https://your-project-name.vercel.app`

#### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Navigate to dashboard folder
cd dashboard

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? amazon-sales-dashboard (or your choice)
# - Directory? ./
# - Override settings? No
```

### Step 5: Verify Deployment

1. Visit your Vercel dashboard URL
2. Check that all charts load correctly
3. Verify data is displaying properly

## Troubleshooting

### Issue: Build fails with "Cannot find module"

**Solution:** Make sure all dependencies are in `package.json` and run `npm install` locally first.

### Issue: Charts not loading

**Solution:** 
1. Verify `dashboard_data` folder exists in `public/dashboard_data`
2. Check browser console for errors
3. Ensure JSON files are valid

### Issue: 404 errors for data files

**Solution:** 
1. Make sure files are in `public/dashboard_data/` folder
2. Files should be accessible at `/dashboard_data/filename.json`
3. Rebuild and redeploy

### Issue: TypeScript errors

**Solution:**
1. Run `npm install` to ensure all types are installed
2. Check `tsconfig.json` is correct
3. Run `npm run build` locally to catch errors before deploying

## Updating Your Dashboard

After making changes:

1. **Commit changes:**
```powershell
git add .
git commit -m "Update dashboard"
git push
```

2. **Vercel will automatically redeploy** (if connected to GitHub)
   - Or manually trigger: Vercel Dashboard → Your Project → Deployments → Redeploy

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Free Tier Limits

Vercel's free tier includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Serverless functions (limited)

Perfect for hosting this dashboard!

## Support

If you encounter issues:
1. Check Vercel deployment logs in the dashboard
2. Check browser console for errors
3. Verify all files are committed to GitHub
4. Ensure `next.config.js` has `output: 'export'` for static export

---

**Happy Deploying! 🚀**
