# Netlify Deployment Update Guide

## Your Current Deployment
🌐 **Live Site**: https://academespace.netlify.app/algebrain

## Quick Update Methods

### Method 1: GitHub Auto-Deploy (Recommended)
If your site is connected to GitHub:
1. Push your changes to the connected repository
2. Netlify will automatically rebuild and deploy

```bash
git add .
git commit -m "Update application"
git push origin main
```

### Method 2: Manual Drag & Drop Update
1. Go to your [Netlify Dashboard](https://app.netlify.com/)
2. Find your "AcademeSpace" site
3. Go to the "Deploys" tab
4. Drag and drop the `dist` folder to trigger a new deployment

### Method 3: Netlify CLI Update
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from your project directory
netlify deploy --prod --dir=dist
```

## Environment Variables Check
Make sure these are set in your Netlify dashboard:
- `VITE_VENICE_API_KEY_CHAT`
- `VITE_VENICE_API_KEY_IMAGE`
- `VITE_PHOTO_GENERATION_API_ENDPOINT`
- `VITE_WALLETCONNECT_PROJECT_ID`
- `VITE_SOCKET_IO_SERVER_URL`

## Build Status
✅ **Latest Build**: Successful (49.62s)
✅ **Build Output**: `dist` folder ready for deployment
⚠️ **Note**: Some chunks are larger than 500 kB - consider code splitting for better performance

## Post-Update Verification
After deployment, verify:
1. Visit https://academespace.netlify.app/algebrain
2. Test key features:
   - AI Image Generator
   - Chat functionality
   - Wallet connections
   - Navigation between pages

## Troubleshooting
- **Build fails**: Check environment variables in Netlify dashboard
- **Features not working**: Verify API keys are correctly set
- **Slow loading**: Consider implementing code splitting for large chunks

---
*Last updated: $(Get-Date)*