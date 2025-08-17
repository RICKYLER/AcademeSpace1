// Using native fetch (Node.js 18+)
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Venice AI API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function testVeniceUpscale() {
  console.log('🔍 Venice AI Upscale & Enhance Test');
  console.log('=====================================\n');

  if (!VENICE_API_TOKEN || VENICE_API_TOKEN === 'YOUR_VENICE_API_TOKEN_HERE') {
    console.log('⚠️  Please replace YOUR_VENICE_API_TOKEN_HERE with your actual Venice AI API token');
    console.log('💡 Add VITE_VENICE_IMAGE_API_KEY to your .env file');
    return;
  }

  try {
    // First, generate a test image
    console.log('🚀 Step 1: Generating test image...');
    
    const generateResponse = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains with golden light',
        negative_prompt: 'blurry, low quality, distorted',
        width: 1024,
        height: 1024,
        steps: 20,
        cfg_scale: 7.5,
        model: 'hidream',
        format: 'webp',
        return_binary: false,
        embed_exif_metadata: false,
        hide_watermark: false,
        safe_mode: false,
        seed: Math.floor(Math.random() * 1000000000),
        style_preset: '3D Model',
        lora_strength: 50
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const generateData = await generateResponse.json();
    console.log('✅ Test image generated successfully!');
    console.log(`🆔 Request ID: ${generateData.id}`);
    
    if (!generateData.images || generateData.images.length === 0) {
      throw new Error('No image received from generation API');
    }

    const base64Image = generateData.images[0];
    console.log(`📊 Image size: ${Math.round(base64Image.length / 1024)} KB`);

    // Now upscale and enhance the image
    console.log('\n🚀 Step 2: Upscaling and enhancing image...');
    
    const upscaleResponse = await fetch('https://api.venice.ai/api/v1/image/upscale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        image: base64Image,
        scale: 2,
        enhance: true,
        enhanceCreativity: 0.5,
        enhancePrompt: 'enhance quality, improve details, sharpen, increase clarity'
      }),
    });

    if (!upscaleResponse.ok) {
      const errorText = await upscaleResponse.text();
      throw new Error(`Upscale failed: ${errorText}`);
    }

    // Get the upscaled image as binary data
    const upscaledImageBuffer = await upscaleResponse.arrayBuffer();
    console.log('✅ Image upscaled and enhanced successfully!');
    console.log(`📊 Upscaled image size: ${Math.round(upscaledImageBuffer.byteLength / 1024)} KB`);
    console.log(`📈 Size increase: ${Math.round((upscaledImageBuffer.byteLength / (base64Image.length * 0.75)) * 100)}%`);

    // Save the upscaled image
    const filename = `generated-photos/upscaled-test-${Date.now()}.png`;
    if (!fs.existsSync('generated-photos')) {
      fs.mkdirSync('generated-photos');
    }
    fs.writeFileSync(filename, Buffer.from(upscaledImageBuffer));
    console.log(`💾 Upscaled image saved as: ${filename}`);

    console.log('\n🎉 Upscale test completed successfully!');
    console.log('📋 Summary:');
    console.log('   • Original image: 1024x1024 pixels');
    console.log('   • Upscaled image: 2048x2048 pixels');
    console.log('   • Enhancement: Quality, details, and sharpness improved');
    console.log('   • Format: PNG (high quality)');

  } catch (error) {
    console.error('❌ Upscale test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('🔑 Authentication error - check your API token');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit exceeded - try again later');
    } else if (error.message.includes('500')) {
      console.log('🔧 Server error - try again in a few moments');
    }
  }
}

testVeniceUpscale();