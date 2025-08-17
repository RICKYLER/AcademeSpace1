#!/usr/bin/env node

/**
 * Netlify New Hosting Deployment Script
 * Automates the deployment process for a new Netlify site
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'cyan');
  
  // Check if netlify.toml exists
  const netlifyConfig = path.join(process.cwd(), 'netlify.toml');
  if (!fs.existsSync(netlifyConfig)) {
    log('❌ netlify.toml not found!', 'red');
    return false;
  }
  log('✅ netlify.toml found', 'green');
  
  // Check if package.json exists
  const packageJson = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJson)) {
    log('❌ package.json not found!', 'red');
    return false;
  }
  log('✅ package.json found', 'green');
  
  // Check if dist directory exists or can be built
  try {
    log('🔨 Testing build process...', 'yellow');
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Build successful', 'green');
  } catch (error) {
    log('❌ Build failed! Please fix build errors first.', 'red');
    log(error.message, 'red');
    return false;
  }
  
  return true;
}

function checkNetlifyCLI() {
  log('🔍 Checking Netlify CLI...', 'cyan');
  
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    log('✅ Netlify CLI is installed', 'green');
    return true;
  } catch (error) {
    log('❌ Netlify CLI not found!', 'red');
    log('📦 Installing Netlify CLI...', 'yellow');
    
    try {
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      log('✅ Netlify CLI installed successfully', 'green');
      return true;
    } catch (installError) {
      log('❌ Failed to install Netlify CLI', 'red');
      log('Please install manually: npm install -g netlify-cli', 'yellow');
      return false;
    }
  }
}

function displayEnvironmentVariables() {
  log('\n📋 Required Environment Variables:', 'cyan');
  log('Copy these to your Netlify site settings:', 'yellow');
  
  const envVars = [
    'VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1',
    'VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB',
    'VITE_PHOTO_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1',
    'VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6789012345678901234567890abcd',
    'VITE_SOCKET_URL=https://your-backend-url.com',
    'VITE_FORGE_KEY=your-forge-api-key',
    'VITE_VENICE_AI_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1'
  ];
  
  envVars.forEach(envVar => {
    log(`  ${envVar}`, 'bright');
  });
  
  log('\n⚠️  Remember to update VITE_SOCKET_URL with your actual backend URL!', 'yellow');
}

function displayDeploymentOptions() {
  log('\n🚀 Deployment Options:', 'cyan');
  
  log('\n1. 🔗 GitHub Integration (Recommended):', 'bright');
  log('   • Visit: https://app.netlify.com/start', 'blue');
  log('   • Connect your GitHub repository', 'blue');
  log('   • Configure build settings (auto-detected)', 'blue');
  log('   • Add environment variables', 'blue');
  log('   • Deploy!', 'blue');
  
  log('\n2. 📤 Manual Upload:', 'bright');
  log('   • Visit: https://app.netlify.com/drop', 'blue');
  log('   • Drag and drop your dist folder', 'blue');
  log('   • Configure environment variables', 'blue');
  
  log('\n3. 💻 Netlify CLI:', 'bright');
  log('   • Run: netlify login', 'blue');
  log('   • Run: netlify init', 'blue');
  log('   • Run: netlify deploy --prod --dir=dist', 'blue');
}

function runCLIDeployment() {
  log('\n🚀 Starting CLI deployment...', 'cyan');
  
  try {
    // Check if user is logged in
    log('🔐 Checking Netlify authentication...', 'yellow');
    try {
      execSync('netlify status', { stdio: 'pipe' });
      log('✅ Already logged in to Netlify', 'green');
    } catch (error) {
      log('🔐 Please log in to Netlify...', 'yellow');
      execSync('netlify login', { stdio: 'inherit' });
    }
    
    // Build the project
    log('🔨 Building project...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Initialize site if needed
    log('🏗️  Initializing Netlify site...', 'yellow');
    try {
      execSync('netlify init', { stdio: 'inherit' });
    } catch (error) {
      // Site might already be initialized
      log('ℹ️  Site already initialized or initialization skipped', 'blue');
    }
    
    // Deploy to production
    log('🚀 Deploying to production...', 'yellow');
    execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
    
    log('\n🎉 Deployment completed!', 'green');
    log('\n⚠️  Don\'t forget to add environment variables in Netlify dashboard!', 'yellow');
    
  } catch (error) {
    log('❌ Deployment failed!', 'red');
    log(error.message, 'red');
    return false;
  }
  
  return true;
}

function displayPostDeploymentChecklist() {
  log('\n✅ Post-Deployment Checklist:', 'cyan');
  
  const checklist = [
    'Add all environment variables in Netlify dashboard',
    'Test AI Image Generator functionality',
    'Verify chat functionality works',
    'Test wallet connection features',
    'Check navigation between pages',
    'Verify no console errors',
    'Test on mobile devices',
    'Set up custom domain (optional)',
    'Enable Netlify Analytics (optional)',
    'Configure performance optimizations'
  ];
  
  checklist.forEach((item, index) => {
    log(`  ${index + 1}. ${item}`, 'bright');
  });
}

function main() {
  log('🚀 Netlify New Hosting Deployment Script', 'magenta');
  log('==========================================\n', 'magenta');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    log('\n❌ Prerequisites check failed. Please fix the issues above.', 'red');
    process.exit(1);
  }
  
  // Display environment variables
  displayEnvironmentVariables();
  
  // Check if user wants to use CLI deployment
  const args = process.argv.slice(2);
  
  if (args.includes('--cli') || args.includes('-c')) {
    // Check Netlify CLI
    if (!checkNetlifyCLI()) {
      log('\n❌ Netlify CLI setup failed.', 'red');
      process.exit(1);
    }
    
    // Run CLI deployment
    if (runCLIDeployment()) {
      displayPostDeploymentChecklist();
    }
  } else {
    // Display deployment options
    displayDeploymentOptions();
    
    log('\n💡 Usage:', 'cyan');
    log('  node scripts/netlify-deploy-new.js --cli    # Use CLI deployment', 'blue');
    log('  node scripts/netlify-deploy-new.js         # Show deployment options', 'blue');
    
    displayPostDeploymentChecklist();
  }
  
  log('\n📚 For detailed instructions, see: NETLIFY_NEW_HOSTING_SETUP.md', 'cyan');
  log('\n🎉 Happy deploying!', 'green');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  checkNetlifyCLI,
  displayEnvironmentVariables,
  displayDeploymentOptions,
  runCLIDeployment,
  displayPostDeploymentChecklist
};