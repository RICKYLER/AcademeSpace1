# AI Image Generator

A modern React application for generating AI-powered images using various AI APIs. This application provides a beautiful, user-friendly interface for creating images from text prompts.

## Features

- 🎨 **Multiple AI Providers**: Support for OpenAI DALL-E, Stability AI, and Midjourney
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎯 **Customizable Options**: Choose image size, style, and generation parameters
- 💾 **Image Management**: Download generated images and regenerate with variations
- 🔒 **Secure API Handling**: Secure token management for API authentication
- ⚡ **Real-time Generation**: Live feedback during image generation process

## Supported AI Providers

### 1. OpenAI DALL-E
- **API Endpoint**: `https://api.openai.com/v1/images/generations`
- **Supported Sizes**: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792
- **Styles**: Natural, Vivid
- **Get API Key**: [OpenAI Platform](https://platform.openai.com/api-keys)

### 2. Stability AI
- **API Endpoint**: `https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image`
- **Supported Sizes**: Custom dimensions
- **Get API Key**: [Stability AI Platform](https://platform.stability.ai/)

### 3. Midjourney (Placeholder)
- Implementation ready for Midjourney API integration
- Contact Midjourney for API access

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Start the Server**
   ```bash
   npm run server
   ```

4. **Development Mode (Frontend + Backend)**
   ```bash
   npm run dev:full
   ```

## Usage

### Getting Started

1. **Access the Application**
   - Navigate to `http://localhost:3001/ai-image-generator`
   - Or visit `http://localhost:3001` and click on the AI Image Generator link

2. **Enter Your API Token**
   - Get your API token from your chosen AI provider
   - Enter it in the "API Token" field
   - Your token is stored securely and never sent to our servers

3. **Describe Your Image**
   - Enter a detailed description of the image you want to generate
   - Be specific about style, composition, colors, and mood
   - Example: "A serene landscape with snow-capped mountains reflected in a crystal-clear lake at golden hour"

4. **Choose Settings**
   - **Size**: Select from various dimensions (256x256 to 1792x1024)
   - **Style**: Choose between Natural, Vivid, Artistic, or Cinematic

5. **Generate Your Image**
   - Click "Generate Image" and wait for the AI to create your masterpiece
   - The process typically takes 10-30 seconds

### Advanced Features

#### Image Management
- **Download**: Click the download icon to save images to your device
- **Regenerate**: Use the refresh icon to create variations of existing images
- **History**: All generated images are displayed in chronological order

#### Best Practices for Prompts

**Good Prompts:**
- "A majestic dragon soaring over a medieval castle at sunset, digital art style"
- "Portrait of a wise old wizard with glowing blue eyes, fantasy illustration"
- "Minimalist geometric shapes in vibrant colors, modern abstract art"

**Tips:**
- Be specific about style, lighting, and composition
- Include artistic styles like "oil painting", "digital art", "photorealistic"
- Mention camera angles: "wide shot", "close-up", "aerial view"
- Specify lighting: "golden hour", "dramatic shadows", "soft lighting"

## API Configuration

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```env
PORT=3001
NODE_ENV=production
```

### Custom API Integration
To add support for additional AI providers:

1. **Update `server.js`**
   ```javascript
   // Add new provider case
   case 'your-provider':
     imageUrl = await generateWithYourProvider(prompt, size, style, apiToken);
     break;
   ```

2. **Implement the generation function**
   ```javascript
   async function generateWithYourProvider(prompt, size, style, apiToken) {
     // Your API implementation
   }
   ```

3. **Update the frontend component**
   - Add provider selection in the UI
   - Update the API call to include the provider parameter

## Troubleshooting

### Common Issues

**"Failed to generate image"**
- Check your API token is correct and has sufficient credits
- Verify your internet connection
- Ensure the prompt doesn't violate content policies

**"API token is required"**
- Make sure you've entered your API token in the designated field
- Check that the token hasn't expired

**"Image not found" error**
- The generated image URL may have expired
- Try regenerating the image

### API Rate Limits
- **OpenAI**: 50 requests per minute for free tier
- **Stability AI**: Varies by plan
- **Midjourney**: Depends on subscription

## Security Notes

- API tokens are stored only in your browser's memory
- No tokens are stored on our servers
- All API calls are made directly from your browser to the AI provider
- The server acts as a proxy to avoid CORS issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the AI provider's documentation
- Open an issue on the repository

---

**Happy Image Generating! 🎨✨** 