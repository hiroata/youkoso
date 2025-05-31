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
    
    // Remove hash and query parameters
    const cleanPath = filePath.split('#')[0].split('?')[0];
    
    if (cleanPath === '' || cleanPath === '/') {
        fullPath = path.join(basePath, '../index.html');
    } else if (cleanPath.startsWith('./')) {
        fullPath = path.join(basePath, cleanPath.substring(2));
    } else if (cleanPath.startsWith('../')) {
        fullPath = path.join(basePath, cleanPath);
    } else if (cleanPath.startsWith('/')) {
        fullPath = path.join(__dirname, '..', cleanPath.substring(1));
    } else {
        fullPath = path.join(basePath, cleanPath);
    }
    
    // If it's a directory, check for index.html
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
        fullPath = path.join(fullPath, 'index.html');
    }
    
    return fs.existsSync(fullPath);
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