import readline from 'readline';
// Using native fetch (Node.js 18+)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function generateImage() {
  try {
    console.log('🎨 AI Image Generator');
    console.log('=====================\n');
    
    // Get API token
    const apiToken = await askQuestion('Enter your API token: ');
    if (!apiToken || apiToken.trim() === '') {
      console.log('❌ API token is required');
      rl.close();
      return;
    }
    
    // Get prompt
    const prompt = await askQuestion('Enter your image prompt: ');
    if (!prompt || prompt.trim() === '') {
      console.log('❌ Prompt is required');
      rl.close();
      return;
    }
    
    // Get size
    const size = await askQuestion('Enter image size (1024x1024, 512x512, etc.) [default: 1024x1024]: ') || '1024x1024';
    
    // Get style
    const style = await askQuestion('Enter style (natural/vivid) [default: vivid]: ') || 'vivid';
    
    // Get provider
    const provider = await askQuestion('Enter provider (openai/stability) [default: openai]: ') || 'openai';
    
    console.log('\n🚀 Generating image...');
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`📏 Size: ${size}`);
    console.log(`🎨 Style: ${style}`);
    console.log(`🔧 Provider: ${provider}\n`);
    
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        prompt,
        size,
        style,
        apiProvider: provider
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error generating image:', error);
      rl.close();
      return;
    }

    const data = await response.json();
    console.log('✅ Image generated successfully!');
    console.log('🖼️  Image URL:', data.url);
    console.log('\n📋 You can view the image by opening the URL in your browser');
    console.log('💾 To download, right-click the image and save it');
    
  } catch (error) {
    console.error('❌ Failed to generate image:', error.message);
  } finally {
    rl.close();
  }
}

// Check if server is running
fetch('http://localhost:3001/api/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ Server is running');
      generateImage();
    } else {
      console.log('❌ Server is not responding properly');
      console.log('💡 Make sure to run: node server.js');
    }
  })
  .catch(() => {
    console.log('❌ Server is not running');
    console.log('💡 Start the server first: node server.js');
  });