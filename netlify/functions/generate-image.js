const fetch = require('node-fetch');

const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { prompt, size = '1024x1024', style = 'natural', apiProvider = 'venice' } = JSON.parse(event.body);
    const apiToken = event.headers.authorization?.replace('Bearer ', '');

    // Only require token for providers that don't have environment variables configured
    if (!apiToken && apiProvider !== 'venice') {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'API token is required' })
      };
    }

    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    let imageUrl;
    
    // Support for different AI providers
    switch (apiProvider) {
      case 'venice':
        imageUrl = await generateWithVenice(prompt, size, style, apiToken);
        break;
      case 'openai':
        imageUrl = await generateWithOpenAI(prompt, size, style, apiToken);
        break;
      case 'stability':
        imageUrl = await generateWithStability(prompt, size, style, apiToken);
        break;
      default:
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Unsupported API provider' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: imageUrl })
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to generate image' })
    };
  }
};

// Venice AI API
async function generateWithVenice(prompt, size, style, apiToken) {
  // Parse size to get width and height
  const [width, height] = size.split('x').map(Number);
  
  // Use environment variable if no token provided
  const token = apiToken || process.env.VITE_VENICE_IMAGE_API_KEY;
  
  if (!token) {
    throw new Error('Venice AI API key not configured. Please set VITE_VENICE_IMAGE_API_KEY in your environment variables.');
  }
  
  const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      negative_prompt: '',
      width: width,
      height: height,
      steps: 20,
      cfg_scale: 7.5,
      model: 'hidream',
      format: 'webp',
      return_binary: false,
      embed_exif_metadata: false,
      hide_watermark: false,
      safe_mode: false,
      seed: Math.floor(Math.random() * 1000000000),
      style_preset: style === 'vivid' ? '3D Model' : 'Photographic',
      lora_strength: 50
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Venice AI API error: ${error.error?.message || error.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  // Venice AI returns base64 encoded images in the images array
  if (data.images && data.images.length > 0) {
    return `data:image/webp;base64,${data.images[0]}`;
  }
  
  throw new Error('No image generated from Venice AI');
}

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

module.exports = { handler };