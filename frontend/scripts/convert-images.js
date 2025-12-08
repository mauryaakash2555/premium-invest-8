const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const imagesToConvert = [
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'apple-touch-icon.png',
  'logo.png'
];

async function convertToWebP() {
  console.log('Converting images to WebP format...');
  
  for (const imageName of imagesToConvert) {
    const inputPath = path.join(publicDir, imageName);
    const outputPath = path.join(publicDir, imageName.replace('.png', '.webp'));
    
    try {
      // Only convert if source file exists
      if (fs.existsSync(inputPath)) {
        await sharp(inputPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(outputPath);
        
        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((1 - webpSize / originalSize) * 100).toFixed(2);
        
        console.log(`✓ ${imageName} -> ${imageName.replace('.png', '.webp')} (${savings}% smaller)`);
      } else {
        console.log(`✗ ${imageName} not found, skipping...`);
      }
    } catch (error) {
      console.error(`Error converting ${imageName}:`, error.message);
    }
  }
  
  console.log('\nWebP conversion complete!');
}

convertToWebP().catch(console.error);
