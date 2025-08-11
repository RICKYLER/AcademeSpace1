import fs from 'fs';
import path from 'path';

// Create organized folder structure
function createPhotoFolders() {
  const folders = [
    'generated-photos',
    'generated-photos/demos',
    'generated-photos/venice',
    'generated-photos/dual-demos',
    'generated-photos/chat-responses'
  ];
  
  folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`📁 Created folder: ${folder}`);
    }
  });
}

// Move files to appropriate folders
function organizeFiles() {
  console.log('🗂️  Organizing generated files...\n');
  
  // Move webp files to generated-photos
  const webpFiles = fs.readdirSync('.').filter(file => file.endsWith('.webp'));
  webpFiles.forEach(file => {
    const newPath = `generated-photos/${file}`;
    fs.renameSync(file, newPath);
    console.log(`📸 Moved: ${file} → ${newPath}`);
  });
  
  // Move chat response files to chat-responses
  const chatFiles = fs.readdirSync('.').filter(file => file.includes('chat') && file.endsWith('.txt'));
  chatFiles.forEach(file => {
    const newPath = `generated-photos/chat-responses/${file}`;
    fs.renameSync(file, newPath);
    console.log(`💬 Moved: ${file} → ${newPath}`);
  });
  
  // Organize files within generated-photos
  const photoFiles = fs.readdirSync('generated-photos').filter(file => file.endsWith('.webp'));
  
  photoFiles.forEach(file => {
    let targetFolder = 'generated-photos';
    
    if (file.startsWith('demo-')) {
      targetFolder = 'generated-photos/demos';
    } else if (file.startsWith('venice-generated-')) {
      targetFolder = 'generated-photos/venice';
    } else if (file.startsWith('dual-demo-')) {
      targetFolder = 'generated-photos/dual-demos';
    }
    
    if (targetFolder !== 'generated-photos') {
      const newPath = `${targetFolder}/${file}`;
      fs.renameSync(`generated-photos/${file}`, newPath);
      console.log(`📁 Organized: ${file} → ${newPath}`);
    }
  });
}

// Show current organization
function showOrganization() {
  console.log('\n📊 Current File Organization:\n');
  
  function listFolder(folderPath, indent = '') {
    if (fs.existsSync(folderPath)) {
      const items = fs.readdirSync(folderPath);
      items.forEach(item => {
        const fullPath = path.join(folderPath, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          console.log(`${indent}📁 ${item}/`);
          listFolder(fullPath, indent + '  ');
        } else {
          const size = (stats.size / 1024).toFixed(1);
          console.log(`${indent}📄 ${item} (${size} KB)`);
        }
      });
    }
  }
  
  listFolder('generated-photos');
}

// Clean up old files
function cleanupOldFiles() {
  console.log('\n🧹 Cleaning up old files...\n');
  
  const oldFiles = [
    'venice-generated-*.webp',
    'demo-*.webp',
    'dual-demo-*.webp',
    '*chat.txt'
  ];
  
  oldFiles.forEach(pattern => {
    const files = fs.readdirSync('.').filter(file => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(file);
      }
      return file === pattern;
    });
    
    files.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`🗑️  Deleted: ${file}`);
      } catch (error) {
        console.log(`⚠️  Could not delete: ${file}`);
      }
    });
  });
}

// Main function
async function organizePhotos() {
  console.log('🎨 Venice AI Photo Organizer');
  console.log('=============================\n');
  
  try {
    // Create folder structure
    createPhotoFolders();
    
    // Organize existing files
    organizeFiles();
    
    // Show current organization
    showOrganization();
    
    // Clean up old files
    cleanupOldFiles();
    
    console.log('\n✅ Photo organization complete!');
    console.log('📁 All generated photos are now organized in the generated-photos folder');
    console.log('💡 Future generations will automatically save to the organized structure');
    
  } catch (error) {
    console.error('❌ Error organizing photos:', error.message);
  }
}

// Run the organizer
organizePhotos(); 