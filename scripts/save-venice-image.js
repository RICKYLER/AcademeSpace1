// Using native fetch (Node.js 18+)
import fs from 'fs';

// Venice AI Image Generation API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function generateAndSaveImage() {
  try {
    console.log('🎨 Venice AI Image Generator & Saver');
    console.log('=====================================\n');
    
    if (!VENICE_API_TOKEN) {
      console.log('❌ Venice AI API token is required');
      return;
    }
    
    console.log('🚀 Generating image with Venice AI...');
    
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: 'A beautiful Venetian gondola floating on the Grand Canal at sunset, with historic buildings in the background, photorealistic style',
        negative_prompt: 'Clouds, Rain, Snow',
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

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error generating image:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Venice AI image generated successfully!');
    console.log('🆔 Request ID:', data.id);
    
    if (data.images && data.images.length > 0) {
      const base64Data = data.images[0];
      const filename = `generated-photos/venice-generated-${Date.now()}.webp`;
      
      // Create directory if it doesn't exist
      if (!fs.existsSync('generated-photos')) {
        fs.mkdirSync('generated-photos');
      }
      
      // Save the base64 image to a file
      fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
      
      console.log('💾 Image saved as:', filename);
      console.log('📁 File size:', fs.statSync(filename).size, 'bytes');
      console.log('🎉 Image generation and saving completed successfully!');
    } else {
      console.log('❌ No image data received');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate or save image:', error.message);
  }
}

generateAndSaveImage();