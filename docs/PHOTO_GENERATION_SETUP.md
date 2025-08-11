# Photo Generation Setup Guide

## Overview
The Algebrain AI assistant now supports photo generation using various AI image generation services. This guide will help you set up the photo generation feature.

## Supported Services

### 1. OpenAI DALL-E
- **API Endpoint**: `https://api.openai.com/v1/images/generations`
- **Get API Key**: https://platform.openai.com/account/api-keys
- **Cost**: ~$0.02 per image

### 2. Stability AI
- **API Endpoint**: `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`
- **Get API Key**: https://platform.stability.ai/account/keys
- **Cost**: Free tier available

### 3. Other Services
The system is designed to be extensible and can work with other image generation APIs.

## Setup Instructions

### Step 1: Get an API Key
1. Choose one of the supported services above
2. Create an account and get your API key
3. Copy the API key to your clipboard

### Step 2: Configure Environment Variables
1. Open your `.env` file in the project root
2. Add your API key:
   ```env
   # Photo Generation API Key
   VITE_PHOTO_API_KEY=your_api_key_here
   
   # Photo Generation API Endpoint (optional - will auto-detect)
   VITE_PHOTO_API_ENDPOINT=https://api.openai.com/v1/images/generations
   ```

### Step 3: Restart Development Server
```bash
npm run dev
```

## Usage

### Method 1: Quick Actions
1. Click on any photo generation quick action in the sidebar
2. The system will switch to photo mode and show helpful instructions
3. Type your image description and press Enter

### Method 2: Manual Mode Switch
1. Click the "Photo" mode button in the sidebar
2. Type your image description
3. Press Enter to generate

### Method 3: Test Button
1. Click the camera icon in the input toolbar
2. This will test the photo generation with a sample prompt

## Example Prompts

### Landscapes
- "A beautiful sunset over mountains with vibrant orange and purple clouds"
- "A serene lake surrounded by pine trees in autumn"
- "A futuristic city skyline at night with neon lights"

### Characters
- "A wise old wizard with a long beard and blue robes"
- "A cyberpunk warrior with glowing armor"
- "A cute cartoon cat sitting in a garden"

### Objects
- "A vintage coffee shop interior with warm lighting"
- "A magical forest with glowing mushrooms and fairy lights"
- "A modern minimalist workspace with plants"

## Troubleshooting

### API Key Issues
- **Error**: "API key not configured"
  - **Solution**: Add your API key to the `.env` file
- **Error**: "Invalid API key"
  - **Solution**: Check that your API key is correct and active
- **Error**: "Unauthorized"
  - **Solution**: Verify your API key has the correct permissions

### Network Issues
- **Error**: "Connection failed"
  - **Solution**: Check your internet connection
- **Error**: "Timeout"
  - **Solution**: Try again, image generation can take 10-30 seconds

### Image Quality Issues
- **Blurry images**: Try more detailed prompts
- **Wrong style**: Be more specific about the artistic style
- **Missing elements**: Include all desired elements in your prompt

## Advanced Configuration

### Custom API Endpoints
If you're using a different image generation service, you can configure it by:

1. Adding your custom endpoint to the `.env` file:
   ```env
   VITE_PHOTO_API_ENDPOINT=https://your-api-endpoint.com/generate
   ```

2. The system will automatically try to use your custom endpoint

### Response Format
The system supports two response formats:
- **URL format**: `{"data": [{"url": "image_url"}]}`
- **Base64 format**: `{"artifacts": [{"base64": "image_data"}]}`

## Cost Considerations

### OpenAI DALL-E
- DALL-E 3: ~$0.04 per image (1024x1024)
- DALL-E 2: ~$0.02 per image (1024x1024)

### Stability AI
- Free tier: 25 images per month
- Paid plans: Varies by usage

## Security Notes

- Never commit your API keys to version control
- The `.env` file is already in `.gitignore`
- Consider using environment-specific keys for production

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your API key is correct
3. Test with the provided test script: `node test-photo-generation.js`
4. Check the service's status page for any outages 