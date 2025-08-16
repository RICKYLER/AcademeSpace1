// AI Image Generation API endpoint for Netlify Functions
import fetch from 'node-fetch';

// Venice AI Image Generation
async function generateWithVenice(prompt, size, style, apiToken) {
  const response = await fetch('https://api.venice.ai/api/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      size: size || '1024x1024',
      style: style || 'vivid',
      n: 1
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Venice API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// OpenAI DALL-E Image Generation
async function generateWithOpenAI(prompt, size, style, apiToken) {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      size: size || '1024x1024',
      style: style || 'vivid',
      n: 1
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

// Stability AI Image Generation
async function generateWithStability(prompt, size, style, apiToken) {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: parseInt(size?.split('x')[1]) || 1024,
      width: parseInt(size?.split('x')[0]) || 1024,
      steps: 30,
      samples: 1
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability API error: ${error}`);
  }

  const data = await response.json();
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

// Midjourney API (placeholder)
async function generateWithMidjourney(prompt, size, style, apiToken) {
  throw new Error('Midjourney API not implemented yet');
}

export const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

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
    const { prompt, size, style, apiProvider = 'openai' } = JSON.parse(event.body);
    const apiToken = event.headers.authorization?.replace('Bearer ', '');

    if (!apiToken) {
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