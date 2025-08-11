# Venice AI Integration

This project now includes full integration with both Venice AI APIs:
- **Image Generation API** - Create stunning images from text prompts
- **Chat API** - Generate text responses and conversations

## 🎨 Features

- **Dual API Support**: Both Image Generation and Chat APIs
- **Direct API Integration**: Test both APIs directly
- **Server Integration**: Use both APIs through the Express server
- **Image Saving**: Automatically save generated images to files
- **Text Saving**: Save chat responses to text files
- **Multiple Formats**: Support for WebP format with base64 encoding
- **Customizable Parameters**: Full control over both APIs

## 🔑 API Keys Setup

Your Venice AI API keys are configured:

### Image Generation API
```
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
```

### Chat API
```
VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB
```

## 📁 Files

### Core Integration Files
- `venice-config.js` - Centralized configuration for both APIs
- `server.js` - Main server with both Venice AI endpoints
- `test-venice-direct.js` - Direct Image API testing
- `test-venice-chat.js` - Direct Chat API testing
- `save-venice-image.js` - Generate and save images
- `venice-demo.js` - Image generation demo
- `venice-dual-demo.js` - Combined Image + Chat demo

### API Endpoints

#### Image Generation API
```
POST https://api.venice.ai/api/v1/image/generate
```

#### Chat API
```
POST https://api.venice.ai/api/v1/chat/completions
```

#### Server Endpoints
```
POST http://localhost:3001/api/generate-image
POST http://localhost:3001/api/chat
```

## 🚀 Usage

### 1. Image Generation Testing
```bash
node test-venice-direct.js
```

### 2. Chat API Testing
```bash
node test-venice-chat.js
```

### 3. Generate and Save Image
```bash
node save-venice-image.js
```

### 4. Image Generation Demo
```bash
node venice-demo.js
```

### 5. Dual API Demo (Image + Chat)
```bash
node venice-dual-demo.js
```

### 6. Server-based Generation
```bash
# Start the server
node server.js

# Test Image Generation via curl
curl -X POST http://localhost:3001/api/generate-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "size": "1024x1024",
    "style": "vivid",
    "apiProvider": "venice"
  }'

# Test Chat via curl
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB" \
  -d '{
    "message": "Tell me a story about a magical forest",
    "model": "venice-1"
  }'
```

## ⚙️ API Parameters

### Image Generation Parameters
- `prompt` - Text description of the image
- `width` - Image width (e.g., 1024)
- `height` - Image height (e.g., 1024)
- `negative_prompt` - What to avoid in the image
- `steps` - Number of generation steps (default: 20)
- `cfg_scale` - Guidance scale (default: 7.5)
- `model` - AI model to use (default: 'hidream')
- `format` - Output format (default: 'webp')
- `style_preset` - Style preset (e.g., '3D Model', 'Photographic')
- `seed` - Random seed for reproducible results
- `lora_strength` - LoRA strength (default: 50)

### Chat Parameters
- `message` - User's message
- `model` - Chat model (default: 'venice-1')
- `max_tokens` - Maximum response length (default: 1000)
- `temperature` - Response creativity (default: 0.7)

## 📊 Response Formats

### Image Generation Response
```json
{
  "id": "generate-image-1234567890",
  "images": ["base64_encoded_image_data"],
  "timing": {
    "inferenceDuration": 123,
    "inferencePreprocessingTime": 123,
    "inferenceQueueTime": 123,
    "total": 123
  }
}
```

### Chat Response
```json
{
  "id": "chat-1234567890",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Generated response text..."
      }
    }
  ]
}
```

### Server Responses
```json
// Image Generation
{
  "url": "data:image/webp;base64,base64_encoded_image_data"
}

// Chat
{
  "id": "chat-1234567890",
  "choices": [...]
}
```

## 🎯 Example Use Cases

### Image Generation
- **Scenic Landscapes**: "A beautiful Venetian gondola floating on the Grand Canal at sunset"
- **Artistic Styles**: "A cyberpunk cityscape with neon lights and flying cars"
- **Fantasy Scenes**: "A majestic fantasy castle floating in the clouds"

### Chat Applications
- **Creative Writing**: "Write a short story about a magical forest"
- **Travel Advice**: "Give me travel tips for visiting Venice, Italy"
- **Technical Explanations**: "Explain artificial intelligence in simple terms"

### Combined Use Cases
- Generate a story and create an image based on it
- Get travel advice and see the destination
- Explain a concept and visualize it

## 🔧 Configuration

### Environment Variables
```bash
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB
```

### Server Configuration
The server runs on port 3001 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 node server.js
```

## 📈 Performance

### Image Generation
- **Generation Time**: ~6-10 seconds per image
- **Image Quality**: High-quality WebP format
- **Resolution**: Up to 1024x1024 pixels
- **Queue Time**: Varies based on server load

### Chat API
- **Response Time**: ~1-3 seconds per response
- **Token Limit**: Up to 1000 tokens per response
- **Model**: Venice-1 (latest model)

## 🛠️ Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure your API keys are valid
   - Check the key format and permissions
   - Verify you're using the correct key for each API

2. **Network Errors**
   - Verify internet connection
   - Check if Venice AI service is available

3. **Image Generation Failures**
   - Try different prompts
   - Adjust generation parameters
   - Check for inappropriate content

4. **Chat Response Issues**
   - Check message length
   - Adjust temperature and max_tokens
   - Verify model availability

### Error Messages

- `"API token is required"` - Missing or invalid API key
- `"Prompt is required"` - No prompt provided for image generation
- `"Message is required"` - No message provided for chat
- `"Unsupported API provider"` - Invalid provider specified

## 🔗 Links

- [Venice AI Documentation](https://docs.venice.ai/api-reference/endpoint/image/generate)
- [Venice AI Website](https://venice.ai/)
- [API Reference](https://docs.venice.ai/api-reference)

## 📝 Notes

- Images are returned as base64-encoded WebP format
- Chat responses support markdown formatting
- Both APIs support various models and parameters
- Generation time varies based on complexity and server load
- All generated content is saved with timestamps for easy identification

## 🎉 Success!

Your Venice AI integration is now fully functional with both APIs! You can:
- Generate images directly via API
- Get chat responses for text-based interactions
- Use both APIs through the server endpoints
- Save images and text responses automatically
- Customize all generation parameters
- Combine both APIs for rich multimedia experiences

The integration follows the official Venice AI API specification and provides a robust foundation for AI-powered applications. 