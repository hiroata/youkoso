#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔗 Checking internal links...');

function findHtmlFiles(dir) {
    let htmlFiles = [];
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            htmlFiles = htmlFiles.concat(findHtmlFiles(fullPath));
        } else if (file.endsWith('.html')) {
            htmlFiles.push(fullPath);
        }
    });
    
    return htmlFiles;
}

function extractLinks(htmlContent) {
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    const links = [];
    let match;
    
    while ((match = linkRegex.exec(htmlContent)) !== null) {
        const href = match[1];
        // Only check relative links
        if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            links.push(href);
        }
    }
    
    return links;
}

function checkFileExists(filePath, relativeTo) {
    const basePath = path.dirname(relativeTo);
    let fullPath;
    
    // Split hash and query parameters
    const [cleanPath, hash] = filePath.split('#');
    const pathWithoutQuery = cleanPath.split('?')[0];
    
    // If it's just a hash link (#something), check in the current file
    if (pathWithoutQuery === '') {
        if (hash) {
            const content = fs.readFileSync(relativeTo, 'utf8');
            // Check if the id exists in the file
            const idRegex = new RegExp(`id=["']${hash}["']`, 'i');
            return idRegex.test(content);
        }
        return true; // Empty path refers to current file
    }
    
    if (pathWithoutQuery === '/' || pathWithoutQuery === '') {
        fullPath = path.join(basePath, '../index.html');
    } else if (pathWithoutQuery.startsWith('./')) {
        fullPath = path.join(basePath, pathWithoutQuery.substring(2));
    } else if (pathWithoutQuery.startsWith('../')) {
        fullPath = path.join(basePath, pathWithoutQuery);
    } else if (pathWithoutQuery.startsWith('/')) {
        fullPath = path.join(__dirname, '..', pathWithoutQuery.substring(1));
    } else {
        fullPath = path.join(basePath, pathWithoutQuery);
    }
    
    // If it's a directory, check for index.html
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        fullPath = path.join(fullPath, 'index.html');
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    
    // If there's a hash, check if the id exists in the target file
    if (hash) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const idRegex = new RegExp(`id=["']${hash}["']`, 'i');
        return idRegex.test(content);
    }
    
    return true;
}

// Main check
const projectRoot = path.join(__dirname, '..');
const htmlFiles = findHtmlFiles(projectRoot);
let brokenLinks = [];

console.log(`📄 Found ${htmlFiles.length} HTML files`);

htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    const relativePath = path.relative(projectRoot, file);
    
    console.log(`   🔍 ${relativePath}: ${links.length} internal links`);
    
    links.forEach(link => {
        if (!checkFileExists(link, file)) {
            brokenLinks.push({
                file: relativePath,
                link: link
            });
        }
    });
});

if (brokenLinks.length > 0) {
    console.log(`\n❌ Found ${brokenLinks.length} broken links:`);
    brokenLinks.forEach(item => {
        console.log(`   ${item.file} -> ${item.link}`);
    });
    process.exit(1);
} else {
    console.log('\n✅ All internal links are valid!');
    process.exit(0);
}