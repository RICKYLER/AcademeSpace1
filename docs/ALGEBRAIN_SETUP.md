# Algebrain AI Setup Guide

## Overview
Algebrain is an AI-powered math tutor integrated with Gemini. The application provides an interactive chat interface for students to get help with mathematical concepts.

## Environment Configuration

### 1. API Key Setup
The application uses the Forge API key for AI interactions. The key is configured in the following files:

- `.env`: Contains the raw API key
- `.env.local`: Contains the Vite environment variable

### 2. Current Configuration
```
FORGE_KEY=sk-fg-v1-2e0e98fdf569036838a1fa1315d6920ebc681a300aa62cd710fc857b7bcba176
VITE_FORGE_KEY=sk-fg-v1-2e0e98fdf569036838a1fa1315d6920ebc681a300aa62cd710fc857b7bcba176
```

## Features

### 1. Interactive Chat Interface
- Real-time conversation with AI math tutor
- Step-by-step problem solving
- Support for algebra, calculus, geometry, and more

### 2. Quick Start Examples
- Pre-configured example problems
- One-click problem submission
- Categorized by mathematical topics

### 3. Responsive Design
- Modern UI with dark/light theme support
- Mobile-friendly interface
- Smooth animations and transitions

## Current Implementation

### Mock Responses
Due to API endpoint configuration requirements, the application currently uses mock responses for demonstration purposes. The mock responses include:

- **Algebra**: Solving linear equations (2x + 5 = 13)
- **Calculus**: Explaining derivatives
- **Geometry**: Pythagorean theorem
- **Factoring**: Quadratic expressions (x² - 5x + 6)

### API Integration
The application is configured to use Gemini with the following setup:

```typescript
// API endpoint configuration (when ready)
const response = await fetch('https://api.forgecode.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_FORGE_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-pro-preview',
    messages: [...],
    max_tokens: 2000,
    temperature: 0.7,
    stream: false
  }),
});
```

## Running the Application

### Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Access Algebrain
Navigate to `/algebrain` in your browser to access the AI math tutor.

## Next Steps

### 1. API Endpoint Configuration
To enable real AI responses, configure the correct Forge API endpoint:

1. Update the API endpoint in `src/pages/Algebrain.tsx`
2. Verify the API key permissions
3. Test the API connection

### 2. Enhanced Features
- Add more mathematical topics
- Implement equation rendering with LaTeX
- Add voice input/output
- Create study session tracking

### 3. Integration with Forge
Once the correct API endpoint is identified, replace the mock implementation with real API calls.

## File Structure

```
src/
├── pages/
│   └── Algebrain.tsx          # Main AI tutor component
├── components/
│   └── ui/                    # UI components
├── contexts/                  # React contexts
├── hooks/                     # Custom hooks
└── lib/                       # Utility functions
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FORGE_KEY` | Forge API authentication key | `sk-fg-v1-...` |
| `VITE_FORGE_KEY` | Vite environment variable for client-side access | `sk-fg-v1-...` |

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify the API key is correct
   - Check network connectivity
   - Ensure the API endpoint is accessible

2. **Environment Variables Not Loading**
   - Restart the development server
   - Check file permissions for `.env` files
   - Verify Vite configuration

3. **Mock Responses Only**
   - This is expected behavior until API endpoint is configured
   - Update the API endpoint in the component to enable real AI responses

## Support

For issues with the Forge API integration, please refer to the official Forge API documentation or contact the API provider. 