// Using native fetch (Node.js 18+)

// Venice AI Chat API token
const VENICE_CHAT_API_TOKEN = process.env.VITE_VENICE_CHAT_API_KEY || 'utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB';

async function testVeniceChat() {
  try {
    console.log('💬 Venice AI Chat API Test');
    console.log('===========================\n');
    
    if (!VENICE_CHAT_API_TOKEN) {
      console.log('❌ Venice AI Chat API token is required');
      return;
    }
    
    console.log('🚀 Testing Venice AI chat...');
    
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VENICE_CHAT_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you tell me a short story about a magical forest?'
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error in chat:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Venice AI chat response received!');
    console.log('🆔 Request ID:', data.id);
    console.log('📝 Response:');
    console.log('='.repeat(50));
    console.log(data.choices[0].message.content);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Failed to get chat response:', error.message);
  }
}

testVeniceChat();