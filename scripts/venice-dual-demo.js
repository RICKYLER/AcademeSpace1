// Using native fetch (Node.js 18+)
import fs from 'fs';
import { VENICE_CONFIG, getVeniceConfig, validateApiToken } from './venice-config.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Image generation function
async function generateImage(prompt, style = '3D Model') {
  const config = getVeniceConfig('IMAGE_GENERATION');
  
  if (!validateApiToken('IMAGE_GENERATION')) {
    throw new Error('Invalid Image Generation API token');
  }

  const response = await fetch(config.ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.API_TOKEN}`,
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
    throw new Error(`Image generation failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

// Chat completion function
async function chatWithVenice(message, model = 'gpt-3.5-turbo') {
  const config = getVeniceConfig('CHAT');
  
  if (!validateApiToken('CHAT')) {
    throw new Error('Invalid Chat API token');
  }

  const response = await fetch(config.ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.API_TOKEN}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Chat failed: ${error}`);
  }

  const data = await response.json();
  return data;
}

// Save image function
function saveImage(base64Data, filename) {
  fs.writeFileSync(filename, Buffer.from(base64Data, 'base64'));
  return fs.statSync(filename).size;
}

// Demo scenarios
const demoScenarios = [
  {
    name: 'Creative Writing + Image',
    description: 'Generate a story and create an image based on it',
    chatPrompt: 'Write a short creative story about a magical forest with glowing mushrooms and fairy lights. Make it vivid and descriptive.',
    imagePrompt: 'A magical forest with glowing mushrooms and fairy lights, ethereal atmosphere, fantasy art style',
    style: '3D Model'
  },
  {
    name: 'Travel Guide + Destination',
    description: 'Get travel advice and see the destination',
    chatPrompt: 'Give me travel tips for visiting Venice, Italy. Include the best time to visit and must-see attractions.',
    imagePrompt: 'Beautiful Venetian canals with gondolas, historic architecture, golden hour lighting, travel photography',
    style: 'Photographic'
  },
  {
    name: 'Tech Explanation + Visualization',
    description: 'Explain a concept and visualize it',
    chatPrompt: 'Explain artificial intelligence in simple terms. What are the main types of AI?',
    imagePrompt: 'Futuristic AI visualization with neural networks, digital particles, cyberpunk aesthetic, technology art',
    style: '3D Model'
  }
];

async function runDualDemo() {
  console.log('🎨 Venice AI Dual API Demo');
  console.log('===========================\n');
  console.log('🖼️  Image Generation API:', VENICE_CONFIG.IMAGE_GENERATION.DESCRIPTION);
  console.log('💬 Chat API:', VENICE_CONFIG.CHAT.DESCRIPTION);
  console.log('');

  // Validate both API tokens
  if (!validateApiToken('IMAGE_GENERATION')) {
    console.log('❌ Image Generation API token is invalid');
    return;
  }
  
  if (!validateApiToken('CHAT')) {
    console.log('❌ Chat API token is invalid');
    return;
  }

  console.log('✅ Both API tokens are valid');
  console.log('🚀 Starting dual API demo...\n');

  let successCount = 0;
  const totalScenarios = demoScenarios.length;

  for (let i = 0; i < demoScenarios.length; i++) {
    const scenario = demoScenarios[i];
    console.log(`\n--- Scenario ${i + 1}/${totalScenarios}: ${scenario.name} ---`);
    console.log(`📝 ${scenario.description}\n`);

    try {
      // Step 1: Generate chat response
      console.log('💬 Generating chat response...');
      const chatResponse = await chatWithVenice(scenario.chatPrompt);
      const chatContent = chatResponse.choices[0].message.content;
      console.log('✅ Chat response generated');
      console.log('📄 Response preview:', chatContent.substring(0, 150) + '...\n');

      // Step 2: Generate image based on the scenario
      console.log('🎨 Generating image...');
      const imageResponse = await generateImage(scenario.imagePrompt, scenario.style);
      console.log('✅ Image generated');
      console.log('🆔 Request ID:', imageResponse.id);
      console.log('⏱️  Total time:', imageResponse.timing.total, 'ms');

      // Step 3: Save the image
      if (imageResponse.images && imageResponse.images.length > 0) {
        const filename = `generated-photos/dual-demo-${i + 1}-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.webp`;
        
        // Create directory if it doesn't exist
        if (!fs.existsSync('generated-photos')) {
          fs.mkdirSync('generated-photos');
        }
        
        const fileSize = saveImage(imageResponse.images[0], filename);
        console.log('💾 Image saved:', filename);
        console.log('📁 File size:', fileSize, 'bytes');
        successCount++;
      }

      // Step 4: Save chat response to text file
      const chatFilename = `dual-demo-${i + 1}-${scenario.name.replace(/\s+/g, '-').toLowerCase()}-chat.txt`;
      fs.writeFileSync(chatFilename, `Scenario: ${scenario.name}\n\nPrompt: ${scenario.chatPrompt}\n\nResponse:\n${chatContent}`);
      console.log('📄 Chat saved:', chatFilename);

    } catch (error) {
      console.error(`❌ Error in scenario ${i + 1}:`, error.message);
    }

    // Add delay between scenarios
    if (i < demoScenarios.length - 1) {
      console.log('⏳ Waiting 3 seconds before next scenario...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log('\n🎉 Dual API Demo Complete!');
  console.log(`✅ Successfully completed: ${successCount}/${totalScenarios} scenarios`);
  
  console.log('\n📁 Generated files:');
  const files = fs.readdirSync('generated-photos').filter(file => file.startsWith('dual-demo-'));
  files.forEach(file => {
    const stats = fs.statSync(`generated-photos/${file}`);
    console.log(`   📄 ${file} (${stats.size} bytes)`);
  });

  console.log('\n💡 You now have both text responses and generated images!');
  console.log('🔗 This demonstrates the power of combining Venice AI\'s text and image capabilities.');
}

// Run the demo
runDualDemo().catch(console.error);