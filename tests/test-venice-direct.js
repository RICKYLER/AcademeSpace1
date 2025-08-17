// Using native fetch (Node.js 18+)

// Venice AI Image Generation API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function testVeniceDirect() {
  try {
    console.log('🎨 Venice AI Direct API Test');
    console.log('=============================\n');
    
    if (!VENICE_API_TOKEN) {
      console.log('❌ Venice AI API token is required');
      return;
    }
    
    console.log('🚀 Testing Venice AI image generation directly...');
    
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
    console.log('⏱️  Timing:', data.timing);
    console.log('🖼️  Number of images:', data.images ? data.images.length : 0);
    
    if (data.images && data.images.length > 0) {
      console.log('📋 Image generated! The image is base64 encoded and ready to display');
      console.log('💡 You can save this base64 data as a webp file');
    }
    
  } catch (error) {
    console.error('❌ Failed to generate image:', error.message);
  }
}

testVeniceDirect();