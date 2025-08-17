// Test Forge API for Algebrain AI
import dotenv from 'dotenv';
// Using native fetch (Node.js 18+)

// Load environment variables
dotenv.config();

const FORGE_API_KEY = process.env.VITE_FORGE_KEY || process.env.FORGE_KEY;

if (!FORGE_API_KEY) {
  console.error('❌ FORGE_KEY not found in environment variables');
  process.exit(1);
}

async function testForgeAPI() {
  console.log('🧮 Testing Forge API for Algebrain...');
  console.log('🔑 Using API Key:', FORGE_API_KEY.substring(0, 20) + '...');
  
  // Test multiple potential endpoints
  const endpoints = [
    'https://api.forgecode.dev/v1/chat/completions',
    'https://api.forgecode.dev/chat/completions',
    'https://forgecode.dev/api/v1/chat/completions'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FORGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful math tutor. Provide clear, step-by-step explanations for mathematical problems.'
            },
            {
              role: 'user',
              content: 'Solve this equation: 2x + 5 = 13'
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
          stream: false
        }),
      });

      console.log(`📊 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Forge API Response received!');
        console.log('📝 Response:', data.choices[0].message.content);
        console.log('🎯 Forge API is working correctly!');
        return; // Success, exit function
      } else {
        const errorText = await response.text();
        console.log(`❌ Error ${response.status}: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n⚠️  All endpoints failed. The Forge API may not be publicly accessible or may require different authentication.');
  console.log('💡 Note: ForgeCode appears to be designed for their CLI tool, not external API access.');
}

testForgeAPI();