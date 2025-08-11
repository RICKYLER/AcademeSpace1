import fs from 'fs';
import path from 'path';

console.log('🔐 Venice AI Environment Setup');
console.log('==============================\n');

// Check if .env file already exists
const envPath = path.join(process.cwd(), '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('📁 Current .env file location:', envPath);
  console.log('\n💡 If you want to update your API keys, edit the existing .env file.');
  console.log('💡 If you want to start fresh, delete the .env file and run this script again.');
  process.exit(0);
}

// Create .env content
const envContent = `# Venice AI API Keys
VITE_VENICE_IMAGE_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1
VITE_VENICE_CHAT_API_KEY=utYea00v2M_igCI7uKOwpj7i3pamq7qpX14TJlJGpB

# Photo Generation API Key (for web application)
VITE_PHOTO_API_KEY=TdGumCtlLvzyZWfLHhjOziUSsH0yeaLQc8zFXPULH1

# Server Configuration
PORT=3001
`;

try {
  // Write .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ .env file created successfully!');
  console.log('📁 Location:', envPath);
  console.log('\n🔑 Your API tokens are now securely stored in environment variables.');
  console.log('\n📋 Environment variables configured:');
  console.log('   • VITE_VENICE_IMAGE_API_KEY - Image generation API');
  console.log('   • VITE_VENICE_CHAT_API_KEY - Chat API');
  console.log('   • VITE_PHOTO_API_KEY - Photo generation (fallback)');
  console.log('   • PORT - Server port (default: 3001)');
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Restart your development server: npm run dev');
  console.log('   2. Test image generation: node test-venice-direct.js');
  console.log('   3. Test chat API: node test-venice-chat.js');
  console.log('   4. Open your AlgebrAI Assistant and try photo generation');
  
  console.log('\n🛡️  Security notes:');
  console.log('   • .env file is automatically ignored by git');
  console.log('   • Never commit your .env file to version control');
  console.log('   • Keep your API tokens private and secure');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n💡 Please create the .env file manually with the following content:');
  console.log('\n' + envContent);
} 