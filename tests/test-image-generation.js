import fetch from 'node-fetch';

// Replace this with your actual API token
const API_TOKEN = 'YOUR_API_TOKEN_HERE'; // Replace with your OpenAI or Stability AI token
// Example: const API_TOKEN = 'sk-1234567890abcdef...'; // OpenAI token
// Example: const API_TOKEN = 'sk-1234567890abcdef...'; // Stability AI token

async function generateImage() {
  try {
    console.log('🚀 Starting image generation...');
    
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains with a lake reflection, digital art style',
        size: '1024x1024',
        style: 'vivid',
        apiProvider: 'openai' // or 'stability' for Stability AI
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error generating image:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Image generated successfully!');
    console.log('🖼️  Image URL:', data.url);
    console.log('📋 You can view the image by opening the URL in your browser');
    
  } catch (error) {
    console.error('❌ Failed to generate image:', error.message);
  }
}

// Check if API token is provided
if (API_TOKEN === 'YOUR_API_TOKEN_HERE') {
  console.log('⚠️  Please replace YOUR_API_TOKEN_HERE with your actual API token');
  console.log('📝 Edit the test-image-generation.js file and update the API_TOKEN variable');
  console.log('🔑 Get your API token from:');
  console.log('   - OpenAI: https://platform.openai.com/api-keys');
  console.log('   - Stability AI: https://platform.stability.ai/');
} else {
  generateImage();
}