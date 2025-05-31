#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖼️  Creating placeholder images...');

// Create a simple SVG placeholder
function createPlaceholderSVG(width, height, text, color = '#e0e0e0') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${color}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
        font-family="Arial, sans-serif" font-size="14" fill="#666">
    ${text}
  </text>
</svg>`;
}

// List of missing images to create
const missingImages = [
    { path: 'assets/images/products/tanjiro.jpg', text: 'Tanjiro Figure', width: 400, height: 400 },
    { path: 'assets/images/products/myhero.jpg', text: 'My Hero Academia', width: 400, height: 400 },
    { path: 'assets/images/products/totoro.jpg', text: 'Totoro Plush', width: 400, height: 400 },
    { path: 'assets/images/products/switch.jpg', text: 'Nintendo Switch', width: 400, height: 400 },
    { path: 'assets/images/products/dbz-shirt.jpg', text: 'Dragon Ball Z Shirt', width: 400, height: 400 },
    { path: 'assets/images/products/pokemon-cards.jpg', text: 'Pokemon Cards', width: 400, height: 400 },
    { path: 'assets/images/products/sailormoon.jpg', text: 'Sailor Moon Manga', width: 400, height: 400 },
    { path: 'assets/images/products/deathnote.jpg', text: 'Death Note Manga', width: 400, height: 400 },
    { path: 'assets/images/ui/about-us.jpg', text: 'About Us', width: 800, height: 400 },
    { path: 'assets/images/team/founder.jpg', text: 'Founder', width: 300, height: 300 },
    { path: 'assets/images/team/curator.jpg', text: 'Curator', width: 300, height: 300 },
    { path: 'assets/images/team/support.jpg', text: 'Support', width: 300, height: 300 },
    { path: 'assets/images/ui/facebook.png', text: 'FB', width: 32, height: 32 },
    { path: 'assets/images/ui/instagram.png', text: 'IG', width: 32, height: 32 },
    { path: 'assets/images/ui/twitter.png', text: 'TW', width: 32, height: 32 }
];

let created = 0;

missingImages.forEach(img => {
    const fullPath = path.join(__dirname, '..', img.path);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    // Create SVG placeholder
    const svgContent = createPlaceholderSVG(img.width, img.height, img.text);
    
    // Save as SVG (browsers can display SVG even with .jpg extension)
    fs.writeFileSync(fullPath.replace(/\.(jpg|png)$/, '.svg'), svgContent);
    
    // Also create a basic HTML file that redirects to the SVG for .jpg/.png references
    const htmlContent = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${img.text}</title></head>
<body style="margin:0;padding:0;">
<img src="${path.basename(fullPath).replace(/\.(jpg|png)$/, '.svg')}" 
     alt="${img.text}" style="width:100%;height:100%;object-fit:cover;">
</body>
</html>`;
    
    fs.writeFileSync(fullPath, htmlContent);
    
    console.log(`✅ Created placeholder: ${img.path}`);
    created++;
});

console.log(`🎉 Created ${created} placeholder images!`);