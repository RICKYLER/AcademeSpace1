// Venice AI API Configuration
export const VENICE_CONFIG = {
  // Image Generation API
  IMAGE_GENERATION: {
    API_TOKEN: process.env.VITE_VENICE_IMAGE_API_KEY || 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1',
    ENDPOINT: 'https://api.venice.ai/api/v1/image/generate',
    DESCRIPTION: 'Venice AI Image Generation API'
  },
  
  // Chat API
  CHAT: {
    API_TOKEN: process.env.VITE_VENICE_CHAT_API_KEY || 'utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB',
    ENDPOINT: 'https://api.venice.ai/api/v1/chat/completions',
    DESCRIPTION: 'Venice AI Chat API'
  }
};

// Helper function to get API config
export function getVeniceConfig(type) {
  return VENICE_CONFIG[type.toUpperCase()] || null;
}

// Helper function to validate API token
export function validateApiToken(type) {
  const config = getVeniceConfig(type);
  return config && config.API_TOKEN && config.API_TOKEN !== 'YOUR_API_TOKEN_HERE';
} 