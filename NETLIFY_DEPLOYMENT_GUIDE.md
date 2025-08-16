# 🚀 Netlify Deployment Guide for AcademeSpace

## Quick Deploy Links

### 🌐 **Main Netlify Links**
- **Netlify Dashboard**: https://app.netlify.com/
- **New Site Deployment**: https://app.netlify.com/start
- **Deploy from Git**: https://app.netlify.com/start/deploy?repository=

### 📦 **One-Click Deploy Options**

#### Option 1: Deploy from GitHub (Recommended)
1. **Connect Repository**: https://app.netlify.com/start/deploy
2. **Select your GitHub repository**: `AcademeSpace1`
3. **Auto-deploy on push**: Enabled by default

#### Option 2: Manual Deploy
1. **Drag & Drop**: https://app.netlify.com/drop
2. Upload your `dist` folder after running `npm run build`

#### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from project root
netlify deploy --prod --dir=dist
```

## 🔧 Pre-Deployment Setup

### 1. Build Configuration ✅
Your `netlify.toml` is already optimized with:
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js version: 18
- Security headers
- Performance optimizations

### 2. Environment Variables Setup

**⚠️ IMPORTANT**: You need to set these environment variables in Netlify:

#### In Netlify Dashboard:
1. Go to: **Site Settings** → **Environment Variables**
2. Add these variables:

```env
VITE_VENICE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_CHAT_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_PHOTO_API_ENDPOINT=https://api.openai.com/v1/images/generations
VITE_WALLETCONNECT_PROJECT_ID=demo-project-id
VITE_SOCKET_URL=https://your-backend-url.com
```

**📝 Note**: Update `VITE_SOCKET_URL` with your actual backend URL after deployment.

## 🚀 Deployment Steps

### Method 1: GitHub Integration (Recommended)

1. **Visit**: https://app.netlify.com/start
2. **Connect GitHub**: Click "GitHub" button
3. **Select Repository**: Choose your `AcademeSpace1` repository
4. **Configure Build**:
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `dist` (auto-detected)
5. **Add Environment Variables** (see section above)
6. **Deploy Site**: Click "Deploy Site"

### Method 2: Manual Upload

1. **Build locally**:
   ```bash
   npm run build
   ```
2. **Visit**: https://app.netlify.com/drop
3. **Drag & Drop**: Upload the `dist` folder
4. **Add Environment Variables** in site settings

### Method 3: Netlify CLI

1. **Install CLI**:
   ```bash
   npm install -g netlify-cli
   ```
2. **Login**:
   ```bash
   netlify login
   ```
3. **Initialize site**:
   ```bash
   netlify init
   ```
4. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

## 🔗 Post-Deployment

### 1. Custom Domain (Optional)
- **Domain Settings**: https://app.netlify.com/sites/[your-site]/settings/domain
- **Add Custom Domain**: Click "Add custom domain"
- **DNS Configuration**: Follow Netlify's DNS instructions

### 2. HTTPS & Security
- **SSL Certificate**: Auto-enabled by Netlify
- **Force HTTPS**: Enabled in domain settings
- **Security Headers**: Already configured in `netlify.toml`

### 3. Performance Monitoring
- **Analytics**: https://app.netlify.com/sites/[your-site]/analytics
- **Core Web Vitals**: Monitor in Netlify dashboard
- **Build Performance**: Check build logs for optimization tips

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check Node.js version (should be 18)
   - Verify all dependencies in `package.json`
   - Check build logs in Netlify dashboard

2. **Environment Variables Not Working**:
   - Ensure variables start with `VITE_`
   - Redeploy after adding variables
   - Check variable names match exactly

3. **404 Errors on Refresh**:
   - Already handled by redirect rule in `netlify.toml`
   - Verify `[[redirects]]` section exists

4. **API Calls Failing**:
   - Update `VITE_SOCKET_URL` to production backend
   - Check CORS settings on your backend
   - Verify API keys are correctly set

## 📊 Optimization Tips

1. **Bundle Size**: Your build shows large chunks (>500kB)
   - Consider code splitting
   - Use dynamic imports for heavy components
   - Enable tree shaking

2. **Caching**: Already optimized in `netlify.toml`
   - Static assets cached for 1 year
   - Immutable caching for JS/CSS

3. **Performance**:
   - Enable Netlify's asset optimization
   - Use Netlify's CDN for global distribution
   - Monitor Core Web Vitals

## 🎯 Quick Links Summary

| Action | Link |
|--------|------|
| **Deploy Now** | https://app.netlify.com/start |
| **Manual Upload** | https://app.netlify.com/drop |
| **Dashboard** | https://app.netlify.com/ |
| **Documentation** | https://docs.netlify.com/ |
| **Status Page** | https://www.netlifystatus.com/ |

---

## ✅ Deployment Checklist

- [ ] Repository connected to Netlify
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible via Netlify URL
- [ ] All API endpoints working
- [ ] Wallet connection functional
- [ ] Image generation working
- [ ] Chat functionality operational
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

**🎉 Your AcademeSpace application is ready for production!**