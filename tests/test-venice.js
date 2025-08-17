// Using native fetch (Node.js 18+)

// Venice AI API token
const VENICE_API_TOKEN = 'utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB';

async function testVeniceGeneration() {
  try {
    console.log('🎨 Venice AI Image Generator Test');
    console.log('================================\n');
    
    if (!VENICE_API_TOKEN || VENICE_API_TOKEN === 'YOUR_VENICE_API_TOKEN_HERE') {
      console.log('⚠️  Please replace YOUR_VENICE_API_TOKEN_HERE with your actual Venice AI API token');
      console.log('🔑 Get your Venice AI token from: https://venice.ai/');
      console.log('📝 Edit the test-venice.js file and update the VENICE_API_TOKEN variable');
      return;
    }
    
    console.log('🚀 Testing Venice AI image generation...');
    
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'A beautiful Venetian gondola floating on the Grand Canal at sunset, with historic buildings in the background, photorealistic style',
        size: '1024x1024',
        style: 'vivid',
        apiProvider: 'venice'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error generating image:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Venice AI image generated successfully!');
    console.log('🖼️  Image URL:', data.url);
    console.log('📋 You can view the image by opening the URL in your browser');
    
  } catch (error) {
    console.error('❌ Failed to generate image:', error.message);
  }
}

// Check if server is running
fetch('http://localhost:3001/api/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ Server is running');
      testVeniceGeneration();
    } else {
      console.log('❌ Server is not responding properly');
      console.log('💡 Make sure to run: node server.js');
    }
  })
  .catch(() => {
    console.log('❌ Server is not running');
    console.log('💡 Start the server first: node server.js');
  });