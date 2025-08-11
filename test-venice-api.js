// Test script for Venice AI API
const API_KEY = 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1';

async function testVeniceAPI() {
  console.log('🧪 Testing Venice AI API...');
  
  try {
    const response = await fetch('https://api.venice.ai/api/v1/image/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: 'A beautiful sunset over mountains, digital art style',
        width: 512,
        height: 512,
        steps: 10,
        cfg_scale: 7.5,
        model: 'hidream',
        format: 'webp'
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Venice AI API Test Successful!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
      
      if (data.images && data.images.length > 0) {
        console.log('🖼️  Image generated successfully!');
        console.log('📏 Image size:', data.images[0].length, 'characters (base64)');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Venice AI API Test Failed');
      console.log('📊 Status:', response.status);
      console.log('📊 Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Venice AI API Test Failed');
    console.log('📊 Error:', error.message);
  }
}

// Test OKX API as well
async function testOKXAPI() {
  console.log('\n🧪 Testing OKX API...');
  
  try {
    const response = await fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OKX API Test Successful!');
      console.log('📊 BTC Price:', data.data?.[0]?.last || 'N/A');
    } else {
      console.log('❌ OKX API Test Failed');
      console.log('📊 Status:', response.status);
    }
  } catch (error) {
    console.log('❌ OKX API Test Failed');
    console.log('📊 Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  await testVeniceAPI();
  await testOKXAPI();
  
  console.log('\n✨ API Tests Complete!');
}

runTests(); 