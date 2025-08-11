# Environment Variables Setup Guide

## 🔐 Secure API Token Configuration

To secure your Venice AI API tokens, you need to create a `.env` file in your project root directory.

### 📁 Create .env File

Create a file named `.env` in your project root directory with the following content:

```bash
# Venice AI API Keys
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB

# Photo Generation API Key (for web application)
VITE_PHOTO_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1

# Server Configuration
PORT=3001
```

### 🔑 API Token Security

**Important Security Notes:**

1. **Never commit your `.env` file to version control**
2. **The `.env` file is already in `.gitignore`**
3. **Keep your API tokens private and secure**
4. **Rotate your tokens regularly for security**

### 📋 Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_VENICE_IMAGE_API_KEY` | Venice AI Image Generation API | ✅ Yes |
| `VITE_VENICE_CHAT_API_KEY` | Venice AI Chat API | ✅ Yes |
| `VITE_PHOTO_API_KEY` | Photo Generation (fallback) | ✅ Yes |
| `PORT` | Server port (default: 3001) | ❌ No |

### 🚀 How to Set Up

1. **Create the .env file:**
   ```bash
   touch .env
   ```

2. **Add your API tokens:**
   ```bash
   echo "VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1" >> .env
   echo "VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB" >> .env
   echo "VITE_PHOTO_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1" >> .env
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

### 🔍 Verification

To verify your environment variables are working:

1. **Test Image Generation:**
   ```bash
   node test-venice-direct.js
   ```

2. **Test Chat API:**
   ```bash
   node test-venice-chat.js
   ```

3. **Test Photo Generation in Web App:**
   - Open your AlgebrAI Assistant
   - Switch to Photo mode
   - Try generating an image

### 🛡️ Security Best Practices

1. **Environment Variable Security:**
   - ✅ Use `.env` files for local development
   - ✅ Use environment variables in production
   - ✅ Never hardcode API keys in source code
   - ✅ Rotate API keys regularly

2. **File Security:**
   - ✅ `.env` is in `.gitignore`
   - ✅ Don't share your `.env` file
   - ✅ Use different keys for development and production

3. **Production Deployment:**
   - ✅ Set environment variables in your hosting platform
   - ✅ Use secure key management services
   - ✅ Monitor API usage and costs

### 🔧 Troubleshooting

**If you get "API key not configured" errors:**

1. **Check your .env file exists:**
   ```bash
   ls -la .env
   ```

2. **Verify environment variables are loaded:**
   ```bash
   node -e "console.log('Image API Key:', process.env.VITE_VENICE_IMAGE_API_KEY ? 'Set' : 'Not Set')"
   ```

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

4. **Check for typos in variable names:**
   - Must start with `VITE_` for client-side access
   - Case sensitive
   - No spaces around `=`

### 📝 Example .env File

```bash
# Venice AI API Keys
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB

# Photo Generation API Key (for web application)
VITE_PHOTO_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1

# Server Configuration
PORT=3001
```

### ✅ Success Indicators

When properly configured, you should see:
- ✅ No "API key not configured" errors
- ✅ Successful image generation
- ✅ Successful chat responses
- ✅ Professional error messages with helpful guidance

Your API tokens are now securely stored in environment variables! 🔐 