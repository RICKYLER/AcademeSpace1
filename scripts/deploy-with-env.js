#!/usr/bin/env node

/**
 * Netlify Deployment Script with Environment Variables
 * This script helps deploy your app with proper API configuration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Netlify Deployment with API Configuration...');

// Read current .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current Environment Variables:');
console.log(envContent);

// Environment variables that need to be set in Netlify
const requiredEnvVars = {
  'VITE_VENICE_API_KEY_CHAT': 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1',
  'VITE_VENICE_API_KEY_IMAGE': 'TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1',
  'VITE_PHOTO_GENERATION_API_ENDPOINT': 'https://api.openai.com/v1/images/generations',
  'VITE_WALLETCONNECT_PROJECT_ID': 'a1b2c3d4e5f6789012345678901234567890abcd',
  'VITE_SOCKET_IO_SERVER_URL': 'https://your-production-server.com'
};

console.log('\n🔧 Required Netlify Environment Variables:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n📝 Manual Steps Required:');
console.log('1. Go to https://app.netlify.com/');
console.log('2. Find your AcademeSpace site');
console.log('3. Go to Site settings > Environment variables');
console.log('4. Add each variable listed above');
console.log('5. Trigger a new deployment');

console.log('\n🏗️ Building project for deployment...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

console.log('\n📦 Build output ready in dist/ folder');
console.log('\n🌐 Your site: https://academespace.netlify.app/algebrain');

console.log('\n🔄 Next Steps:');
console.log('- Set environment variables in Netlify dashboard');
console.log('- Upload dist/ folder or trigger auto-deploy');
console.log('- Test API connections on live site');

console.log('\n✨ Deployment preparation complete!');