#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating data files...');

function validateDataFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        console.log(`✅ ${filePath}: Valid JSON`);
        
        // Validate data structure
        if (data.products && Array.isArray(data.products)) {
            console.log(`   📦 Products: ${data.products.length} items`);
        }
        
        if (data.posts && Array.isArray(data.posts)) {
            console.log(`   📝 Blog posts: ${data.posts.length} items`);
        }
        
        if (data.testimonials && Array.isArray(data.testimonials)) {
            console.log(`   💬 Testimonials: ${data.testimonials.length} items`);
        }
        
        return true;
    } catch (error) {
        console.error(`❌ ${filePath}: ${error.message}`);
        return false;
    }
}

function validateImageReferences(dataFile) {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        let missingImages = [];
        
        // Check product images
        if (data.products) {
            data.products.forEach(product => {
                if (product.image) {
                    const imagePath = path.join(__dirname, '..', product.image);
                    if (!fs.existsSync(imagePath)) {
                        missingImages.push(product.image);
                    }
                }
            });
        }
        
        if (missingImages.length > 0) {
            console.log(`⚠️  Missing images: ${missingImages.length}`);
            missingImages.forEach(img => console.log(`   ❌ ${img}`));
        } else {
            console.log('✅ All referenced images exist');
        }
        
        return missingImages.length === 0;
    } catch (error) {
        console.error(`❌ Error checking images: ${error.message}`);
        return false;
    }
}

// Main validation
let allValid = true;

// Check data.json
const dataFile = path.join(__dirname, '../data/data.json');
if (fs.existsSync(dataFile)) {
    allValid &= validateDataFile(dataFile);
    allValid &= validateImageReferences(dataFile);
} else {
    console.error('❌ data/data.json not found');
    allValid = false;
}

// Check manifest.json
const manifestFile = path.join(__dirname, '../manifest.json');
if (fs.existsSync(manifestFile)) {
    allValid &= validateDataFile(manifestFile);
} else {
    console.error('❌ manifest.json not found');
    allValid = false;
}

if (allValid) {
    console.log('🎉 All data validation passed!');
    process.exit(0);
} else {
    console.log('💥 Data validation failed!');
    process.exit(1);
}