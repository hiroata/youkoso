#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Auto-fixing code issues...');

// Auto-fix JavaScript issues
try {
    console.log('📝 Fixing JavaScript...');
    execSync('npx eslint js/**/*.js --fix', { stdio: 'inherit' });
    console.log('✅ JavaScript auto-fixes applied');
} catch (error) {
    console.log('⚠️  Some JavaScript issues need manual fixing');
}

// Auto-fix CSS issues  
try {
    console.log('🎨 Fixing CSS...');
    execSync('npx stylelint css/**/*.css --fix', { stdio: 'inherit' });
    console.log('✅ CSS auto-fixes applied');
} catch (error) {
    console.log('⚠️  Some CSS issues need manual fixing');
}

// Remove unused files
console.log('🗑️  Removing unused files...');

const unusedFiles = [
    '.DS_Store',
    'Thumbs.db',
    'desktop.ini',
    '*.log',
    '*.tmp',
    '*.temp'
];

function removeUnusedFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
            removeUnusedFiles(fullPath);
        } else {
            // Check if file matches unused patterns
            if (unusedFiles.some(pattern => {
                if (pattern.startsWith('*')) {
                    return file.endsWith(pattern.substring(1));
                }
                return file === pattern;
            })) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`🗑️  Removed: ${fullPath}`);
                } catch (e) {
                    console.log(`⚠️  Could not remove: ${fullPath}`);
                }
            }
        }
    });
}

removeUnusedFiles(path.join(__dirname, '..'));

console.log('🎉 Auto-fix completed!');