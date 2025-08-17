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
    const { prompt, size = '1024x1024' } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    const apiKey = process.env.VITE_VENICE_IMAGE_API_KEY || process.env.VITE_VENICE_API_KEY || process.env.VENICE_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    const requestData = JSON.stringify({
      model: 'flux-schnell',
      prompt: prompt,
      n: 1,
      size: size,
      response_format: 'url'
    });

    const options = {
      hostname: 'api.venice.ai',
      port: 443,
      path: '/api/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk.toString();
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            
            if (res.statusCode !== 200) {
              resolve({
                statusCode: res.statusCode,
                headers,
                body: JSON.stringify({ error: response.error || 'API request failed' })
              });
              return;
            }
            
            resolve({
              statusCode: 200,
              headers,
              body: JSON.stringify(response)
            });
          } catch (error) {
            resolve({
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to parse response: ' + error.message })
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
      
      req.setTimeout(30000, () => {
        req.destroy();
        resolve({
          statusCode: 408,
          headers,
          body: JSON.stringify({ error: 'Request timeout' })
        });
      });
      
      req.write(requestData);
      req.end();
    });
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + error.message })
    };
  }
};