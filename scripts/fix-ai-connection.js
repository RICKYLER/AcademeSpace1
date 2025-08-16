#!/usr/bin/env node

/**
 * AI Connection Fix Script for Netlify Deployment
 * Automatically checks and fixes AI connection issues
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

console.log('🔧 AI Connection Fix Script Starting...');
console.log('=' .repeat(50));

// Check if .env file exists
const envPath = join(projectRoot, '.env');
if (!existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('Please create a .env file with your API keys.');
    process.exit(1);
}

// Read environment variables
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim().replace(/["']/g, '');
    }
});

console.log('📋 Current Environment Variables:');
console.log('--------------------------------');

const requiredVars = [
    'VITE_VENICE_API_KEY_CHAT',
    'VITE_VENICE_API_KEY_IMAGE', 
    'VITE_PHOTO_GENERATION_API_ENDPOINT',
    'VITE_WALLETCONNECT_PROJECT_ID',
    'VITE_SOCKET_IO_SERVER_URL'
];

let missingVars = [];

requiredVars.forEach(varName => {
    if (envVars[varName]) {
        console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}...`);
    } else {
        console.log(`❌ ${varName}: MISSING`);
        missingVars.push(varName);
    }
});

if (missingVars.length > 0) {
    console.log('\n⚠️  Missing environment variables detected!');
    console.log('Please add these to your .env file and Netlify dashboard:');
    missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
    });
}

console.log('\n🏗️  Building project with current environment...');
console.log('=' .repeat(50));

try {
    // Build the project
    execSync('npm run build', { 
        stdio: 'inherit',
        cwd: projectRoot 
    });
    
    console.log('\n✅ Build completed successfully!');
    console.log('\n📋 Next Steps to Fix AI Connection:');
    console.log('=' .repeat(50));
    
    console.log('\n1. 🌐 Go to Netlify Dashboard:');
    console.log('   https://app.netlify.com/');
    
    console.log('\n2. 🔧 Add Environment Variables:');
    console.log('   Site Settings → Environment Variables → Add Variable');
    
    requiredVars.forEach(varName => {
        if (envVars[varName]) {
            console.log(`   ${varName} = ${envVars[varName]}`);
        }
    });
    
    console.log('\n3. 🚀 Trigger New Deployment:');
    console.log('   Deploys → Trigger Deploy → Clear cache and deploy site');
    
    console.log('\n4. 🧪 Test AI Connection:');
    console.log('   Visit: https://academespace.netlify.app/algebrain');
    console.log('   Try using AI chat and check browser console for errors');
    
    console.log('\n🎯 Your dist/ folder is ready for deployment!');
    console.log('   You can also drag & drop the dist/ folder to Netlify');
    
} catch (error) {
    console.error('\n❌ Build failed!');
    console.error('Error:', error.message);
    console.log('\n🔍 Please check:');
    console.log('   - All dependencies are installed (npm install)');
    console.log('   - Environment variables are correctly set');
    console.log('   - No syntax errors in your code');
    process.exit(1);
}

console.log('\n' + '=' .repeat(50));
console.log('🎉 AI Connection Fix Script Completed!');
console.log('Follow the steps above to fix your AI connection.');