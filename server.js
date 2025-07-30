import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// AI Image Generation API endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size, style, apiProvider = 'openai' } = req.body;
    const apiToken = req.headers.authorization?.replace('Bearer ', '');

    if (!apiToken) {
      return res.status(401).json({ error: 'API token is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let imageUrl;
    
    // Support for different AI providers
    switch (apiProvider) {
      case 'openai':
        imageUrl = await generateWithOpenAI(prompt, size, style, apiToken);
        break;
      case 'stability':
        imageUrl = await generateWithStability(prompt, size, style, apiToken);
        break;
      case 'venice':
        imageUrl = await generateWithVenice(prompt, size, style, apiToken);
        break;
      case 'midjourney':
        imageUrl = await generateWithMidjourney(prompt, size, style, apiToken);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported API provider' });
    }

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// OpenAI DALL-E API
async function generateWithOpenAI(prompt, size, style, apiToken) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size,
      style: style === 'vivid' ? 'vivid' : 'natural',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// Stability AI API
async function generateWithStability(prompt, size, style, apiToken) {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: prompt,
          weight: 1,
        },
      ],
      cfg_scale: 7,
      height: parseInt(size.split('x')[1]),
      width: parseInt(size.split('x')[0]),
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Stability AI API error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// Venice AI API
async function generateWithVenice(prompt, size, style, apiToken) {
  const response = await fetch('https://api.venice.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size,
      quality: 'standard',
      style_preset: style === 'vivid' ? 'vivid' : 'natural',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Venice AI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// Midjourney API (placeholder - you'll need to implement based on your Midjourney API)
async function generateWithMidjourney(prompt, size, style, apiToken) {
  // This is a placeholder implementation
  // You'll need to implement based on your specific Midjourney API
  throw new Error('Midjourney API not implemented yet');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 