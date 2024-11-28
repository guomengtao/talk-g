const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Clear background (transparent)
    ctx.clearRect(0, 0, size, size);
    
    // Set text properties
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Adjust font size based on icon size
    const fontSize = Math.floor(size * 0.7);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Draw the letter G
    ctx.fillText('G', size/2, size/2);
    
    return canvas;
}

// Ensure images directory exists
const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Generate icons for all sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
    const canvas = generateIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(imagesDir, `icon${size}.png`), buffer);
    console.log(`Generated icon${size}.png`);
});
