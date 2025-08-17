const fetch = require('node-fetch');

const handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, messages, model = 'default', max_tokens = 1000, temperature = 0.7, stream = false } = JSON.parse(event.body);
    const apiToken = event.headers.authorization?.replace('Bearer ', '') || process.env.VITE_VENICE_CHAT_API_KEY;

    if (!apiToken) {
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'API token is required. Please set VITE_VENICE_CHAT_API_KEY in your environment variables.' })
      };
    }

    // Support both simple message and complex messages array
    let requestMessages;
    if (messages) {
      requestMessages = messages;
    } else if (message) {
      requestMessages = [{ role: 'user', content: message }];
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message or messages array is required' })
      };
    }

    const requestBody = {
      model: model,
      messages: requestMessages,
      max_tokens: max_tokens,
      temperature: temperature
    };

    if (stream) {
      requestBody.stream = true;
    }

    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: `Venice Chat API error: ${error}` })
      };
    }

    if (stream) {
      // For streaming responses, we need to handle differently in serverless
      // For now, we'll disable streaming in Netlify Functions
      const data = await response.json();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    } else {
      const data = await response.json();
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
    }
  } catch (error) {
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to get chat response' })
    }
  }
};

module.exports = { handler };