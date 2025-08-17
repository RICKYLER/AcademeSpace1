// Using native fetch (Node.js 18+)
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Venice AI API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function testVeniceStyles() {
  console.log('🎭 Venice AI Image Styles Test');
  console.log('===============================\n');

  if (!VENICE_API_TOKEN || VENICE_API_TOKEN === 'YOUR_VENICE_API_TOKEN_HERE') {
    console.log('⚠️  Please replace YOUR_VENICE_API_TOKEN_HERE with your actual Venice AI API token');
    console.log('💡 Add VITE_VENICE_IMAGE_API_KEY to your .env file');
    return;
  }

  try {
    console.log('🚀 Fetching available image styles...');
    
    const response = await fetch('https://api.venice.ai/api/v1/image/styles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Styles API failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Styles fetched successfully!');
    console.log(`📊 Total styles available: ${data.data.length}`);
    
    console.log('\n🎨 Available Image Styles:');
    console.log('========================');
    data.data.forEach((style, index) => {
      console.log(`${index + 1}. ${style}`);
    });

    console.log('\n📋 Style Details:');
    console.log('================');
    console.log('• 3D Model: Realistic 3D rendered style');
    console.log('• Analog Film: Vintage film photography look');
    console.log('• Anime: Japanese animation style');
    console.log('• Cinematic: Movie-like dramatic style');
    console.log('• Comic Book: Graphic novel illustration style');

    console.log('\n💡 Usage:');
    console.log('=========');
    console.log('• Select a style from the dropdown in Photo mode');
    console.log('• Each style will give your images a unique artistic look');
    console.log('• Styles are applied automatically to all generated images');

  } catch (error) {
    console.error('❌ Styles test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('🔑 Authentication error - check your API token');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit exceeded - try again later');
    } else if (error.message.includes('500')) {
      console.log('🔧 Server error - try again in a few moments');
    }
  }
}

testVeniceStyles();