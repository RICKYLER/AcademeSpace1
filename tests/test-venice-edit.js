// Using native fetch (Node.js 18+)
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Venice AI API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function testVeniceEdit() {
  console.log('🎨 Venice AI Image Edit (Inpaint) Test');
  console.log('========================================\n');

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
        prompt: 'A simple landscape with mountains and sky',
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
    console.log(`📊 Original image size: ${Math.round(base64Image.length / 1024)} KB`);

    // Save the original image
    const originalFilename = `generated-photos/original-test-${Date.now()}.webp`;
    if (!fs.existsSync('generated-photos')) {
      fs.mkdirSync('generated-photos');
    }
    fs.writeFileSync(originalFilename, Buffer.from(base64Image, 'base64'));
    console.log(`💾 Original image saved as: ${originalFilename}`);

    // Now edit the image
    console.log('\n🚀 Step 2: Editing image with color enhancement...');
    
    const editResponse = await fetch('https://api.venice.ai/api/v1/image/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'Add vibrant colors and enhance the sunset',
        image: base64Image
      }),
    });

    if (!editResponse.ok) {
      const errorText = await editResponse.text();
      throw new Error(`Image edit failed: ${errorText}`);
    }

    // Get the edited image as binary data
    const editedImageBuffer = await editResponse.arrayBuffer();
    console.log('✅ Image edited successfully!');
    console.log(`📊 Edited image size: ${Math.round(editedImageBuffer.byteLength / 1024)} KB`);

    // Save the edited image
    const editedFilename = `generated-photos/edited-test-${Date.now()}.png`;
    fs.writeFileSync(editedFilename, Buffer.from(editedImageBuffer));
    console.log(`💾 Edited image saved as: ${editedFilename}`);

    console.log('\n🎉 Image edit test completed successfully!');
    console.log('📋 Summary:');
    console.log('   • Original image: Generated landscape');
    console.log('   • Edit prompt: "Add vibrant colors and enhance the sunset"');
    console.log('   • Technology: Venice AI Image Edit (Inpaint)');
    console.log('   • Format: PNG (high quality)');

  } catch (error) {
    console.error('❌ Image edit test failed:', error.message);
    if (error.message.includes('401')) {
      console.log('🔑 Authentication error - check your API token');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit exceeded - try again later');
    } else if (error.message.includes('500')) {
      console.log('🔧 Server error - try again in a few moments');
    }
  }
}

testVeniceEdit();