import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function testAPI(provider, apiToken, prompt) {
  console.log(`\n🧪 Testing ${provider.toUpperCase()} API...`);
  
  try {
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        prompt,
        size: '512x512',
        style: 'vivid',
        apiProvider: provider
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ ${provider.toUpperCase()} API Error:`, error);
      return false;
    }

    const data = await response.json();
    console.log(`✅ ${provider.toUpperCase()} API Success!`);
    console.log(`🖼️  Image URL: ${data.url}`);
    return true;
    
  } catch (error) {
    console.log(`❌ ${provider.toUpperCase()} API Failed:`, error.message);
    return false;
  }
}

async function runAPITests() {
  console.log('🧪 AI Image Generator API Test');
  console.log('===============================\n');
  
  console.log('📋 This test will check your API tokens for different providers');
  console.log('🔑 You can test: OpenAI, Stability AI, Venice AI\n');
  
  // Test OpenAI
  const openaiToken = await askQuestion('Enter OpenAI API token (or press Enter to skip): ');
  if (openaiToken && openaiToken.trim() !== '') {
    await testAPI('openai', openaiToken, 'A cute robot cat playing with a ball of yarn');
  }
  
  // Test Stability AI
  const stabilityToken = await askQuestion('Enter Stability AI API token (or press Enter to skip): ');
  if (stabilityToken && stabilityToken.trim() !== '') {
    await testAPI('stability', stabilityToken, 'A majestic dragon flying over a medieval castle');
  }
  
  // Test Venice AI
  const veniceToken = await askQuestion('Enter Venice AI API token (or press Enter to skip): ');
  if (veniceToken && veniceToken.trim() !== '') {
    await testAPI('venice', veniceToken, 'A beautiful Venetian gondola on the Grand Canal');
  }
  
  console.log('\n🎯 API Test Summary:');
  console.log('===================');
  console.log('✅ Working APIs will show image URLs above');
  console.log('❌ Failed APIs will show error messages');
  console.log('\n💡 To generate images with working APIs:');
  console.log('   node generate-image.js');
  console.log('\n🌐 Or use the web interface:');
  console.log('   http://localhost:3001/ai-image-generator');
  
  rl.close();
}

// Check if server is running
fetch('http://localhost:3001/api/health')
  .then(response => {
    if (response.ok) {
      console.log('✅ Server is running');
      runAPITests();
    } else {
      console.log('❌ Server is not responding properly');
      console.log('💡 Make sure to run: node server.js');
      rl.close();
    }
  })
  .catch(() => {
    console.log('❌ Server is not running');
    console.log('💡 Start the server first: node server.js');
    rl.close();
  }); 