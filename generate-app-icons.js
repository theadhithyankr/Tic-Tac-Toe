const sharp = require('sharp');

// Create the exact icon design from your image
async function createAppIcon() {
  const size = 1024;
  const pixelSize = size / 8; // 128px per pixel for 8x8 grid
  
  // Colors from your design
  const colors = {
    black: [0, 0, 0],
    blue: [70, 130, 180],
    red: [220, 20, 60],
    green: [34, 139, 34],
    orange: [255, 140, 0],
    white: [255, 255, 255]
  };

  // Create the icon pixel by pixel based on your 8x8 design
  const iconData = [
    [0, 0, 0, 0, 0, 0, 0, 0], // Black border top
    [0, 1, 1, 1, 1, 1, 1, 0], // Blue border
    [0, 1, 0, 0, 0, 0, 1, 0], // Blue border with black squares
    [0, 1, 0, 5, 5, 0, 1, 0], // T and O symbols row
    [0, 1, 0, 5, 5, 0, 1, 0], // T and O symbols row
    [0, 1, 0, 0, 0, 0, 1, 0], // Square and Crown row
    [0, 1, 1, 1, 1, 1, 1, 0], // Blue border
    [0, 0, 0, 0, 0, 0, 0, 0]  // Black border bottom
  ];

  // Create SVG
  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="${size}" height="${size}" fill="rgb(0,0,0)"/>`;
  
  // Blue border frame
  svg += `<rect x="${pixelSize}" y="${pixelSize}" width="${size-2*pixelSize}" height="${size-2*pixelSize}" fill="rgb(70,130,180)"/>`;
  
  // Black inner area
  svg += `<rect x="${2*pixelSize}" y="${2*pixelSize}" width="${size-4*pixelSize}" height="${size-4*pixelSize}" fill="rgb(0,0,0)"/>`;
  
  // White squares for symbols
  // Top left quadrant (T symbol)
  svg += `<rect x="${2*pixelSize}" y="${2*pixelSize}" width="${2*pixelSize}" height="${2*pixelSize}" fill="rgb(255,255,255)"/>`;
  // Top right quadrant (O symbol)  
  svg += `<rect x="${4*pixelSize}" y="${2*pixelSize}" width="${2*pixelSize}" height="${2*pixelSize}" fill="rgb(255,255,255)"/>`;
  // Bottom left quadrant (Square symbol)
  svg += `<rect x="${2*pixelSize}" y="${4*pixelSize}" width="${2*pixelSize}" height="${2*pixelSize}" fill="rgb(255,255,255)"/>`;
  // Bottom right quadrant (Crown symbol)
  svg += `<rect x="${4*pixelSize}" y="${4*pixelSize}" width="${2*pixelSize}" height="${2*pixelSize}" fill="rgb(255,255,255)"/>`;
  
  // T Symbol (blue)
  const tPixel = pixelSize/4;
  svg += `<rect x="${2*pixelSize + tPixel}" y="${2*pixelSize + tPixel}" width="${1.5*pixelSize}" height="${tPixel*2}" fill="rgb(70,130,180)"/>`;
  svg += `<rect x="${2.5*pixelSize}" y="${2*pixelSize + tPixel}" width="${tPixel*2}" height="${1.2*pixelSize}" fill="rgb(70,130,180)"/>`;
  svg += `<rect x="${2*pixelSize + tPixel}" y="${3*pixelSize}" width="${tPixel}" height="${tPixel*3}" fill="rgb(70,130,180)"/>`;
  svg += `<rect x="${3.5*pixelSize - tPixel}" y="${3*pixelSize}" width="${tPixel}" height="${tPixel*3}" fill="rgb(70,130,180)"/>`;
  
  // O Symbol (red)
  svg += `<rect x="${4*pixelSize + tPixel}" y="${2*pixelSize + tPixel}" width="${1.5*pixelSize}" height="${tPixel*2}" fill="rgb(220,20,60)"/>`;
  svg += `<rect x="${4*pixelSize + tPixel}" y="${3.5*pixelSize}" width="${1.5*pixelSize}" height="${tPixel*2}" fill="rgb(220,20,60)"/>`;
  svg += `<rect x="${4*pixelSize + tPixel}" y="${2.5*pixelSize}" width="${tPixel*2}" height="${pixelSize}" fill="rgb(220,20,60)"/>`;
  svg += `<rect x="${5.5*pixelSize - tPixel}" y="${2.5*pixelSize}" width="${tPixel*2}" height="${pixelSize}" fill="rgb(220,20,60)"/>`;
  
  // Square Symbol (green)
  svg += `<rect x="${2.5*pixelSize}" y="${4.5*pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="rgb(34,139,34)"/>`;
  
  // Crown Symbol (orange)
  svg += `<rect x="${4.5*pixelSize}" y="${5*pixelSize}" width="${pixelSize}" height="${0.7*pixelSize}" fill="rgb(255,140,0)"/>`;
  svg += `<rect x="${4.6*pixelSize}" y="${4.7*pixelSize}" width="${tPixel}" height="${tPixel*2}" fill="rgb(255,140,0)"/>`;
  svg += `<rect x="${4.9*pixelSize}" y="${4.5*pixelSize}" width="${tPixel}" height="${tPixel*3}" fill="rgb(255,140,0)"/>`;
  svg += `<rect x="${5.2*pixelSize}" y="${4.7*pixelSize}" width="${tPixel}" height="${tPixel*2}" fill="rgb(255,140,0)"/>`;
  
  svg += '</svg>';
  
  return Buffer.from(svg);
}

async function generateAllAppAssets() {
  try {
    console.log('🎨 Creating your pixelated app icon...');
    const iconBuffer = await createAppIcon();
    
    // Generate main app icon (1024x1024)
    await sharp(iconBuffer)
      .png()
      .toFile('./assets/icon.png');
    console.log('✅ Generated icon.png (1024x1024)');

    // Generate adaptive icon (1024x1024)
    await sharp(iconBuffer)
      .png()
      .toFile('./assets/adaptive-icon.png');
    console.log('✅ Generated adaptive-icon.png (1024x1024)');

    // Generate favicon (48x48)
    await sharp(iconBuffer)
      .resize(48, 48)
      .png()
      .toFile('./assets/favicon.png');
    console.log('✅ Generated favicon.png (48x48)');

    // Generate splash screen
    const splashBuffer = await sharp({
      create: {
        width: 1284,
        height: 2778,
        channels: 4,
        background: { r: 74, g: 74, b: 74, alpha: 1 }
      }
    })
    .composite([{
      input: await sharp(iconBuffer).resize(400, 400).png().toBuffer(),
      top: Math.round((2778 - 400) / 2),
      left: Math.round((1284 - 400) / 2)
    }])
    .png()
    .toBuffer();
    
    await sharp(splashBuffer)
      .png()
      .toFile('./assets/splash-icon.png');
    console.log('✅ Generated splash-icon.png (1284x2778)');

    console.log('\n🎉 All app assets generated successfully!');
    console.log('� Your pixelated Minecraft-style icon with T, O, Square, and Crown is ready!');
    console.log('\n📁 Files created:');
    console.log('   - assets/icon.png');
    console.log('   - assets/adaptive-icon.png'); 
    console.log('   - assets/favicon.png');
    console.log('   - assets/splash-icon.png');
    
  } catch (error) {
    console.error('❌ Error generating app assets:', error);
  }
}

// Run the generation
try {
  generateAllAppAssets();
} catch (error) {
  console.log('📦 Please install sharp first: npm install sharp');
}
