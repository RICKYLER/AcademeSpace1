import fs from 'fs';
import path from 'path';

function showPhotoGallery() {
  console.log('🎨 Venice AI Photo Gallery');
  console.log('===========================\n');
  
  if (!fs.existsSync('generated-photos')) {
    console.log('❌ No generated photos folder found');
    console.log('💡 Run a generation script first to create photos');
    return;
  }
  
  const folders = {
    'venice': 'Single Image Generations',
    'demos': 'Demo Image Collections',
    'dual-demos': 'Combined Image + Chat Demos',
    'chat-responses': 'Chat Response Texts'
  };
  
  let totalFiles = 0;
  let totalSize = 0;
  
  Object.entries(folders).forEach(([folder, description]) => {
    const folderPath = `generated-photos/${folder}`;
    
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath);
      
      if (files.length > 0) {
        console.log(`📁 ${description} (${folder}/):`);
        
        files.forEach(file => {
          const filePath = path.join(folderPath, file);
          const stats = fs.statSync(filePath);
          const size = (stats.size / 1024).toFixed(1);
          const date = stats.mtime.toLocaleDateString();
          
          console.log(`   📄 ${file} (${size} KB) - ${date}`);
          totalFiles++;
          totalSize += stats.size;
        });
        
        console.log('');
      }
    }
  });
  
  console.log('📊 Summary:');
  console.log(`   📁 Total files: ${totalFiles}`);
  console.log(`   💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
  
  console.log('💡 Commands to generate more photos:');
  console.log('   node save-venice-image.js     - Generate single image');
  console.log('   node venice-demo.js           - Generate demo collection');
  console.log('   node venice-dual-demo.js      - Generate image + chat combo');
  console.log('');
  
  console.log('🗂️  Organization:');
  console.log('   generated-photos/venice/      - Single image generations');
  console.log('   generated-photos/demos/       - Demo image collections');
  console.log('   generated-photos/dual-demos/  - Combined image + chat demos');
  console.log('   generated-photos/chat-responses/ - Text responses from chat');
}

function showRecentPhotos(limit = 5) {
  console.log(`🕒 Recent Photos (Last ${limit}):\n`);
  
  const allFiles = [];
  
  // Collect all files with their stats
  function collectFiles(dir) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          allFiles.push({
            name: file,
            path: filePath,
            size: stats.size,
            date: stats.mtime
          });
        }
      });
    }
  }
  
  // Collect from all subfolders
  const subfolders = ['venice', 'demos', 'dual-demos'];
  subfolders.forEach(folder => {
    collectFiles(`generated-photos/${folder}`);
  });
  
  // Sort by date (newest first) and show recent ones
  allFiles.sort((a, b) => b.date - a.date);
  
  const recentFiles = allFiles.slice(0, limit);
  
  if (recentFiles.length === 0) {
    console.log('❌ No photos found');
    return;
  }
  
  recentFiles.forEach((file, index) => {
    const size = (file.size / 1024).toFixed(1);
    const date = file.date.toLocaleString();
    const relativePath = file.path.replace('generated-photos/', '');
    
    console.log(`${index + 1}. 📸 ${file.name}`);
    console.log(`   📁 ${relativePath}`);
    console.log(`   📏 ${size} KB`);
    console.log(`   📅 ${date}`);
    console.log('');
  });
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--recent') || args.includes('-r')) {
    const limit = args.find(arg => arg.startsWith('--limit='))?.split('=')[1] || 5;
    showRecentPhotos(parseInt(limit));
  } else {
    showPhotoGallery();
  }
}

// Run the viewer
main(); 