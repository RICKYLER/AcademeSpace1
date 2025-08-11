import fetch from 'node-fetch';

// DEMO: Replace this with your actual API token
const DEMO_API_TOKEN = 'sk-your-actual-api-token-here';

async function demoGenerate() {
  console.log('🎨 AI Image Generator Demo');
  console.log('==========================\n');
  
  console.log('📋 To generate an image, you need:');
  console.log('1. A valid API token from OpenAI or Stability AI');
  console.log('2. A text prompt describing the image you want');
  console.log('3. Image size and style preferences\n');
  
  console.log('🔑 Get your API token from:');
  console.log('   - OpenAI: https://platform.openai.com/api-keys');
  console.log('   - Stability AI: https://platform.stability.ai/');
  console.log('   - Venice AI: https://venice.ai/\n');
  
  console.log('💡 Example prompts:');
  console.log('   - "A cute cat sitting in a garden with flowers"');
  console.log('   - "A majestic dragon flying over a medieval castle"');
  console.log('   - "A futuristic cityscape at sunset with flying cars"');
  console.log('   - "A serene mountain landscape with a crystal clear lake"');
  console.log('   - "A magical forest with glowing mushrooms and fairy lights"\n');
  
  console.log('🎯 To generate an image:');
  console.log('   node generate-image.js');
  console.log('   Then enter your API token and prompt when prompted\n');
  
  console.log('🌐 Or use the web interface:');
  console.log('   Open http://localhost:3001/ai-image-generator in your browser');
}

demoGenerate(); 