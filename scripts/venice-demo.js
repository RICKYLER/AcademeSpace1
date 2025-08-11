import fetch from 'node-fetch';
import fs from 'fs';

// Venice AI Image Generation API token
const VENICE_API_TOKEN = process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

// Demo prompts
const demoPrompts = [
  {
    name: 'Venetian Sunset',
    prompt: 'A beautiful Venetian gondola floating on the Grand Canal at sunset, with historic buildings in the background, photorealistic style',
    style: 'Photographic'
  },
  {
    name: 'Cyberpunk City',
    prompt: 'A futuristic cyberpunk cityscape with neon lights, flying cars, and towering skyscrapers, cinematic lighting',
    style: '3D Model'
  },
  {
    name: 'Fantasy Castle',
    prompt: 'A majestic fantasy castle floating in the clouds, surrounded by magical mist and golden light, epic fantasy art style',
    style: '3D Model'
  },
  {
    name: 'Mountain Landscape',
    prompt: 'A serene mountain landscape with snow-capped peaks, crystal clear lake, and golden hour lighting, nature photography',
    style: 'Photographic'
  }
];

async function generateImage(prompt, style, filename) {
  try {
    console.log(`🎨 Generating: ${filename}`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🎭 Style: ${style}`);
    
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt: prompt,
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
        style_preset: style,
        lora_strength: 50
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Error generating ${filename}:`, error);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Generated: ${filename}`);
    console.log(`🆔 Request ID: ${data.id}`);
    console.log(`⏱️  Total time: ${data.timing.total}ms`);
    
          if (data.images && data.images.length > 0) {
        const base64Data = data.images[0];
        
        // Create directory if it doesn't exist
        if (!fs.existsSync('generated-photos')) {
          fs.mkdirSync('generated-photos');
        }
        
        fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
        console.log(`💾 Saved: ${filename}`);
        console.log(`📁 File size: ${fs.statSync(filename).size} bytes`);
        return true;
      }
    
    return false;
  } catch (error) {
    console.error(`❌ Failed to generate ${filename}:`, error.message);
    return false;
  }
}

async function runDemo() {
  console.log('🎨 Venice AI Demo - Image Generation Showcase');
  console.log('==============================================\n');
  
  if (!VENICE_API_TOKEN) {
    console.log('❌ Venice AI API token is required');
    return;
  }
  
  console.log('🚀 Starting Venice AI demo...\n');
  
  let successCount = 0;
  const totalPrompts = demoPrompts.length;
  
  for (let i = 0; i < demoPrompts.length; i++) {
    const demo = demoPrompts[i];
          const filename = `generated-photos/demo-${i + 1}-${demo.name.replace(/\s+/g, '-').toLowerCase()}.webp`;
    
    console.log(`\n--- Demo ${i + 1}/${totalPrompts} ---`);
    
    const success = await generateImage(demo.prompt, demo.style, filename);
    if (success) {
      successCount++;
    }
    
    // Add a small delay between requests
    if (i < demoPrompts.length - 1) {
      console.log('⏳ Waiting 2 seconds before next generation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 Demo Complete!');
  console.log(`✅ Successfully generated: ${successCount}/${totalPrompts} images`);
  console.log('\n📁 Generated files:');
  
  const files = fs.readdirSync('generated-photos').filter(file => file.startsWith('demo-') && file.endsWith('.webp'));
  files.forEach(file => {
    const stats = fs.statSync(`generated-photos/${file}`);
    console.log(`   📄 ${file} (${stats.size} bytes)`);
  });
  
  console.log('\n💡 You can view these images in any web browser or image viewer that supports WebP format.');
  console.log('🔗 The images are high-quality and ready for use in your projects!');
}

// Run the demo
runDemo().catch(console.error); 