#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🖼️  Checking image references...');

function findUsedImages() {
    const usedImages = new Set();
    const projectRoot = path.join(__dirname, '..');
    
    // Check HTML files
    function checkHtmlFiles(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                checkHtmlFiles(fullPath);
            } else if (file.endsWith('.html')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
                let match;
                
                while ((match = imgRegex.exec(content)) !== null) {
                    usedImages.add(match[1]);
                }
            }
        });
    }
    
    // Check CSS files
    function checkCssFiles(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                checkCssFiles(fullPath);
            } else if (file.endsWith('.css')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const bgRegex = /background-image:\s*url\(['"]?([^'"]+)['"]?\)/gi;
                let match;
                
                while ((match = bgRegex.exec(content)) !== null) {
                    usedImages.add(match[1]);
                }
            }
        });
    }
    
    // Check data files
    const dataFile = path.join(projectRoot, 'data/data.json');
    if (fs.existsSync(dataFile)) {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        if (data.products) {
            data.products.forEach(product => {
                if (product.image) usedImages.add(product.image);
                if (product.images) {
                    product.images.forEach(img => usedImages.add(img));
                }
            });
        }
    }
    
    checkHtmlFiles(projectRoot);
    checkCssFiles(path.join(projectRoot, 'css'));
    
    return usedImages;
}

function findAllImages() {
    const allImages = [];
    const assetsDir = path.join(__dirname, '../assets');
    
    if (!fs.existsSync(assetsDir)) {
        return allImages;
    }
    
    function scanDirectory(dir) {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(file)) {
                const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
                allImages.push(relativePath);
            }
        });
    }
    
    scanDirectory(assetsDir);
    return allImages;
}

// Main check
const usedImages = findUsedImages();
const allImages = findAllImages();

console.log(`📊 Found ${allImages.length} image files`);
console.log(`📊 Found ${usedImages.size} referenced images`);

// Check for missing images
const missingImages = [];
usedImages.forEach(imgPath => {
    let found = false;
    
    // Try different path variations
    const variations = [
        imgPath,
        imgPath.startsWith('./') ? imgPath.substring(2) : './' + imgPath,
        imgPath.startsWith('../') ? imgPath.substring(3) : '../' + imgPath
    ];
    
    variations.forEach(variation => {
        const fullPath = path.join(__dirname, '..', variation);
        if (fs.existsSync(fullPath)) {
            found = true;
        }
    });
    
    if (!found) {
        missingImages.push(imgPath);
    }
});

// Check for unused images
const unusedImages = [];
allImages.forEach(imgPath => {
    let used = false;
    
    usedImages.forEach(usedPath => {
        if (usedPath.includes(path.basename(imgPath)) || 
            imgPath.includes(usedPath.replace(/^\.\//, '').replace(/^\.\.\//, ''))) {
            used = true;
        }
    });
    
    if (!used) {
        unusedImages.push(imgPath);
    }
});

// Report results
if (missingImages.length > 0) {
    console.log(`\n❌ Missing images (${missingImages.length}):`);
    missingImages.forEach(img => console.log(`   ${img}`));
}

if (unusedImages.length > 0) {
    console.log(`\n⚠️  Unused images (${unusedImages.length}):`);
    unusedImages.forEach(img => console.log(`   ${img}`));
    
    console.log('\n💡 You can safely delete these unused images to save space.');
}

if (missingImages.length === 0 && unusedImages.length === 0) {
    console.log('\n✅ All image references are valid and no unused images found!');
}

process.exit(missingImages.length > 0 ? 1 : 0);