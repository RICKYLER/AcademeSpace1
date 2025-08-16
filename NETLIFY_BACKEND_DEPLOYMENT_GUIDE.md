# 🚀 AcademeSpace Backend Deployment Guide for Netlify Functions

## Overview

This guide explains how to deploy your AcademeSpace backend using **Netlify Functions**, which provides serverless backend functionality for your React frontend.

## 🏗️ Architecture

### What We've Built

**Frontend**: React application (deployed to Netlify static hosting)  
**Backend**: Netlify Functions (serverless API endpoints)  
**Database**: Firebase Firestore  
**Real-time**: Firebase (replaces Socket.IO for serverless compatibility)

### API Endpoints Converted

✅ **Health Check**: `/.netlify/functions/health`  
✅ **AI Chat**: `/.netlify/functions/chat`  
✅ **Image Generation**: `/.netlify/functions/generate-image`

## 📁 Project Structure

```
AcademeSpace1/
├── netlify/
│   └── functions/
│       ├── package.json          # Functions dependencies
│       ├── health.js            # Health check endpoint
│       ├── chat.js              # Venice AI chat endpoint
│       └── generate-image.js    # AI image generation
├── netlify.toml                 # Netlify configuration
├── dist/                        # Built frontend
└── ...
```

## 🔧 Environment Variables

### Required Variables in Netlify Dashboard

Go to **Site Settings > Environment Variables** and add:

```bash
# Venice AI API Keys
VITE_VENICE_CHAT_API_KEY=your_venice_chat_api_key
VITE_VENICE_IMAGE_API_KEY=your_venice_image_api_key

# OpenAI API Key (for image generation)
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration (if needed for server-side)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id

# Other API Keys
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🚀 Deployment Steps

### Method 1: Netlify CLI (Recommended)

1. **Install dependencies for functions**:
   ```bash
   cd netlify/functions
   npm install
   cd ../..
   ```

2. **Build your frontend**:
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**:
   ```bash
   # Deploy to preview first
   netlify deploy --dir=dist
   
   # Deploy to production
   netlify deploy --prod --dir=dist
   ```

### Method 2: Git-based Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Netlify Functions backend"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to Netlify Dashboard
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify will automatically detect `netlify.toml`

### Method 3: Manual Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Drag and drop**:
   - Drag the entire project folder to Netlify
   - Netlify will detect the `netlify.toml` and deploy functions

## 🔗 API Endpoints

After deployment, your API endpoints will be available at:

```
https://your-site-name.netlify.app/.netlify/functions/health
https://your-site-name.netlify.app/.netlify/functions/chat
https://your-site-name.netlify.app/.netlify/functions/generate-image
```

But thanks to redirects in `netlify.toml`, you can also access them as:

```
https://your-site-name.netlify.app/api/health
https://your-site-name.netlify.app/api/chat
https://your-site-name.netlify.app/api/generate-image
```

## 🧪 Testing Your Backend

### 1. Test Health Endpoint

```bash
curl https://your-site-name.netlify.app/api/health
```

**Expected Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "AcademeSpace Backend Functions"
}
```

### 2. Test Chat Endpoint

```bash
curl -X POST https://your-site-name.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VENICE_API_KEY" \
  -d '{"message": "Hello, how are you?"}'
```

### 3. Test Image Generation

```bash
curl -X POST https://your-site-name.netlify.app/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"prompt": "A beautiful sunset", "apiProvider": "openai"}'
```

## 🔄 Frontend Integration

### Update API Base URL

In your React app, update API calls to use the deployed functions:

```javascript
// Before (local development)
const API_BASE = 'http://localhost:3001/api';

// After (production)
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/api'  // Uses Netlify redirects
  : 'http://localhost:3001/api';

// Example usage
const response = await fetch(`${API_BASE}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

## 🚨 Important Notes

### Socket.IO Limitations

⚠️ **Socket.IO doesn't work with Netlify Functions** (serverless limitation)

**Solutions**:
1. **Use Firebase Realtime Database** for real-time features
2. **Use Pusher** or **Ably** for real-time messaging
3. **Deploy Socket.IO server separately** (Heroku, Railway, etc.)

### Function Limitations

- **Execution time**: 10 seconds max (15 seconds for Pro plans)
- **Memory**: 1008 MB max
- **Cold starts**: First request may be slower
- **No persistent connections**: Each request is independent

## 🔧 Troubleshooting

### Functions Not Working

1. **Check function logs**:
   ```bash
   netlify functions:list
   netlify logs
   ```

2. **Verify environment variables**:
   - Go to Site Settings > Environment Variables
   - Ensure all required variables are set

3. **Check function syntax**:
   ```bash
   netlify dev  # Test locally
   ```

### CORS Issues

- All functions include CORS headers
- If issues persist, check browser console
- Verify API calls use correct URLs

### Build Failures

1. **Check build logs** in Netlify dashboard
2. **Verify dependencies** in `netlify/functions/package.json`
3. **Test locally**:
   ```bash
   netlify dev
   ```

## 📈 Monitoring & Analytics

### Function Analytics

- **Netlify Dashboard**: View function invocations, errors, duration
- **Function logs**: Monitor real-time function execution
- **Error tracking**: Set up error monitoring (Sentry, etc.)

### Performance Optimization

1. **Minimize function size**: Only import necessary dependencies
2. **Use environment variables**: Avoid hardcoding values
3. **Implement caching**: Cache API responses when possible
4. **Monitor cold starts**: Consider function warming strategies

## 🎯 Next Steps

1. **✅ Deploy your backend functions**
2. **🧪 Test all API endpoints**
3. **🔄 Update frontend API calls**
4. **📱 Test the complete application**
5. **🚀 Go live!**

## 📚 Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify CLI Documentation](https://cli.netlify.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Venice AI API Documentation](https://docs.venice.ai/)

---

**🎉 Your AcademeSpace backend is now ready for serverless deployment!**

The functions provide the same API endpoints as your Express server, but in a scalable, serverless architecture that integrates perfectly with Netlify hosting.