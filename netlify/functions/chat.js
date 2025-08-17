const https = require('https');
const querystring = require('querystring');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, stream = false } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const apiKey = process.env.VENICE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const requestData = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: message }],
      max_tokens: 1000,
      stream: stream
    });

    const options = {
      hostname: 'api.venice.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    if (stream) {
      // Handle streaming response
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk.toString();
          });
          
          res.on('end', () => {
            try {
              // Parse streaming response
              const lines = responseData.split('\n').filter(line => line.trim());
              let fullContent = '';
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') break;
                  
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                      fullContent += parsed.choices[0].delta.content;
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
              
              resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                  choices: [{ 
                    message: { 
                      role: 'assistant', 
                      content: fullContent || 'No response generated' 
                    } 
                  }] 
                })
              });
            } catch (error) {
              resolve({
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to parse streaming response' })
              });
            }
          });
        });
        
        req.on('error', (error) => {
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Request failed: ' + error.message })
          });
        });
        
        req.write(requestData);
        req.end();
      });
    } else {
      // Handle non-streaming response
      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk.toString();
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(responseData);
              resolve({
                statusCode: 200,
                headers,
                body: JSON.stringify(response)
              });
            } catch (error) {
              resolve({
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to parse response' })
              });
            }
          });
        });
        
        req.on('error', (error) => {
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Request failed: ' + error.message })
          });
        });
        
        req.write(requestData);
        req.end();
      });
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};