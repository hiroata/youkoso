// ===== SIMPLE CORE.JS - Essential functions only =====

// Global utilities
const utils = {
    // Language management
    currentLanguage: 'es',
    
    // Theme management
    currentTheme: 'light',
    
    // Initialize language from localStorage or default
    initLanguage() {
        const saved = localStorage.getItem('language');
        if (saved && ['es', 'en', 'ja'].includes(saved)) {
            this.currentLanguage = saved;
            document.documentElement.setAttribute('data-lang', saved);
            document.documentElement.setAttribute('lang', saved);
        }
    },
    
    // Change language
    setLanguage(lang) {
        if (['es', 'en', 'ja'].includes(lang)) {
            this.currentLanguage = lang;
            document.documentElement.setAttribute('data-lang', lang);
            document.documentElement.setAttribute('lang', lang);
            localStorage.setItem('language', lang);
            
            // Update active button
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.lang === lang);
            });
        }
    },
    
    // Initialize theme from localStorage or default
    initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved && ['light', 'dark'].includes(saved)) {
            this.currentTheme = saved;
            document.documentElement.setAttribute('data-theme', saved);
        }
    },
    
    // Toggle theme
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        // Update icon
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },
    
    // Load JSON data
    async loadData(type) {
        try {
            const response = await fetch('data/data.json');
            if (!response.ok) throw new Error(`Failed to load data: ${response.status}`);
            const data = await response.json();
            return data[type] || [];
        } catch (error) {
            console.error(`Error loading ${type}:`, error);
            return [];
        }
    },
    
    // Format price
    formatPrice(price, currency = 'MXN') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency
        }).format(price);
    },

    // Enhanced image fetching with anime/figure specific sources
    async fetchProductImage(product) {
        try {
            console.log(`Fetching anime/figure image for: ${product.name}`);
            
            // Try different image sources in order of preference
            const imageSources = [
                // 1. Try anime-specific styled placeholder (most appropriate)
                () => this.createAnimeStyledImage(product),
                // 2. Try general styled placeholder
                () => this.tryPlaceholderImage(product),
                // 3. Create custom SVG as last resort
                () => Promise.resolve(this.createPlaceholderImage(product))
            ];
            
            for (let i = 0; i < imageSources.length; i++) {
                try {
                    const imageUrl = await imageSources[i]();
                    if (imageUrl) {
                        console.log(`✅ Created appropriate image for ${product.name} using method ${i + 1}`);
                        return imageUrl;
                    }
                } catch (error) {
                    console.warn(`❌ Method ${i + 1} failed for ${product.name}:`, error.message);
                    continue;
                }
            }
            
            // If all sources fail, return basic placeholder
            console.warn(`Using basic placeholder for ${product.name}`);
            return this.createPlaceholderImage(product);
            
        } catch (error) {
            console.error('Error in fetchProductImage:', error);
            return this.createPlaceholderImage(product);
        }
    },
    
    // Create anime-themed styled images
    async createAnimeStyledImage(product) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 400;
            canvas.height = 400;
            
            // Category-specific styling
            const styles = this.getAnimeStyles(product);
            
            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, 400, 400);
            gradient.addColorStop(0, styles.gradientStart);
            gradient.addColorStop(1, styles.gradientEnd);
            
            // Fill background
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 400, 400);
            
            // Add decorative elements
            this.drawAnimeDecorations(ctx, styles);
            
            // Add category icon
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = styles.iconColor;
            ctx.fillText(styles.icon, 200, 150);
            
            // Add product name
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = styles.textColor;
            ctx.textAlign = 'center';
            
            const productName = product.name.length > 25 ? 
                product.name.substring(0, 25) + '...' : product.name;
            
            this.wrapText(ctx, productName, 200, 250, 350, 30);
            
            // Add category label
            ctx.font = '20px Arial';
            ctx.fillStyle = styles.categoryColor;
            ctx.fillText(styles.categoryText, 200, 320);
            
            // Add price if available
            if (product.price) {
                ctx.font = 'bold 28px Arial';
                ctx.fillStyle = styles.priceColor;
                const formattedPrice = this.formatPrice(product.price);
                ctx.fillText(formattedPrice, 200, 360);
            }
            
            // Convert to data URL
            try {
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        });
    },
    
    // Get anime-specific styles for each category
    getAnimeStyles(product) {
        const category = product.category?.toLowerCase() || 'default';
        
        const styleMap = {
            figuras: {
                gradientStart: '#667eea',
                gradientEnd: '#764ba2',
                icon: '🎎',
                iconColor: '#ffffff',
                textColor: '#ffffff',
                categoryText: 'ANIME FIGURE',
                categoryColor: '#f8f9fa',
                priceColor: '#ffd700'
            },
            peluches: {
                gradientStart: '#ffeaa7',
                gradientEnd: '#fab1a0',
                icon: '🧸',
                iconColor: '#ffffff',
                textColor: '#2d3436',
                categoryText: 'KAWAII PLUSH',
                categoryColor: '#636e72',
                priceColor: '#e17055'
            },
            manga: {
                gradientStart: '#74b9ff',
                gradientEnd: '#0984e3',
                icon: '📚',
                iconColor: '#ffffff',
                textColor: '#ffffff',
                categoryText: 'MANGA BOOK',
                categoryColor: '#ddd',
                priceColor: '#00b894'
            },
            ropa: {
                gradientStart: '#fd79a8',
                gradientEnd: '#e84393',
                icon: '👕',
                iconColor: '#ffffff',
                textColor: '#ffffff',
                categoryText: 'ANIME WEAR',
                categoryColor: '#f8f9fa',
                priceColor: '#fdcb6e'
            },
            default: {
                gradientStart: '#a29bfe',
                gradientEnd: '#6c5ce7',
                icon: '⭐',
                iconColor: '#ffffff',
                textColor: '#ffffff',
                categoryText: 'ANIME ITEM',
                categoryColor: '#f8f9fa',
                priceColor: '#ffeaa7'
            }
        };
        
        return styleMap[category] || styleMap.default;
    },
    
    // Draw decorative anime-style elements
    drawAnimeDecorations(ctx, styles) {
        // Add sparkle effects
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        
        const sparkles = [
            {x: 50, y: 50, size: 8},
            {x: 350, y: 80, size: 6},
            {x: 80, y: 350, size: 10},
            {x: 320, y: 320, size: 7},
            {x: 150, y: 100, size: 5},
            {x: 250, y: 350, size: 8}
        ];
        
        sparkles.forEach(sparkle => {
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Add border effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 380, 380);
    },
    
    // Wrap text to fit within specified width
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && i > 0) {
                ctx.fillText(line, x, currentY);
                line = words[i] + ' ';
                currentY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, currentY);
    },
    
    // Try placeholder.com with custom styling
    async tryPlaceholderImage(product) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // Create category-based colors and text
            const categoryStyles = {
                figuras: { bg: '3498db', text: 'Figure' },
                peluches: { bg: 'e74c3c', text: 'Plush' },
                manga: { bg: '2ecc71', text: 'Manga' },
                ropa: { bg: 'f39c12', text: 'Shirt' },
                default: { bg: '9b59b6', text: 'Product' }
            };
            
            const style = categoryStyles[product.category] || categoryStyles.default;
            const displayText = encodeURIComponent(style.text);
            
            const placeholderUrl = `https://via.placeholder.com/400x400/${style.bg}/ffffff?text=${displayText}`;
            
            const timeout = setTimeout(() => {
                reject(new Error('Placeholder load timeout'));
            }, 3000);
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(placeholderUrl);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error('Placeholder failed to load'));
            };
            
            img.src = placeholderUrl;
        });
    },
    
    // Generate optimized search terms for each product
    generateSearchTerms(product) {
        const name = product.name.toLowerCase();
        const specific = [];
        const general = [];
        let category = 'anime merchandise';
        
        // Character-specific terms
        if (name.includes('tanjiro')) specific.push('tanjiro kamado', 'demon slayer');
        if (name.includes('nezuko')) specific.push('nezuko kamado', 'demon slayer');
        if (name.includes('inosuke')) specific.push('inosuke hashibira', 'demon slayer');
        if (name.includes('zenitsu')) specific.push('zenitsu agatsuma', 'demon slayer');
        if (name.includes('goku')) specific.push('son goku', 'dragon ball');
        if (name.includes('vegeta')) specific.push('vegeta', 'dragon ball');
        if (name.includes('luffy')) specific.push('monkey d luffy', 'one piece');
        if (name.includes('pikachu')) specific.push('pikachu', 'pokemon');
        if (name.includes('charizard')) specific.push('charizard', 'pokemon');
        if (name.includes('allmight') || name.includes('all might')) specific.push('all might', 'my hero academia');
        if (name.includes('bakugo')) specific.push('katsuki bakugo', 'my hero academia');
        if (name.includes('todoroki')) specific.push('shoto todoroki', 'my hero academia');
        if (name.includes('gojo')) specific.push('satoru gojo', 'jujutsu kaisen');
        if (name.includes('sukuna')) specific.push('ryomen sukuna', 'jujutsu kaisen');
        if (name.includes('levi')) specific.push('levi ackerman', 'attack on titan');
        if (name.includes('edward')) specific.push('edward elric', 'fullmetal alchemist');
        if (name.includes('ichigo')) specific.push('ichigo kurosaki', 'bleach');
        if (name.includes('naruto')) specific.push('naruto uzumaki', 'naruto');
        
        // Product type terms
        if (name.includes('figura')) {
            general.push('anime figure', 'collectible figure');
            category = 'anime figure';
        } else if (name.includes('peluche')) {
            general.push('anime plush', 'kawaii plushie');
            category = 'anime plush toy';
        } else if (name.includes('manga')) {
            general.push('manga book', 'japanese manga');
            category = 'manga book';
        } else if (name.includes('camiseta')) {
            general.push('anime t-shirt', 'anime clothing');
            category = 'anime shirt';
        }
        
        // Fallback anime series terms
        if (specific.length === 0) {
            if (name.includes('demon slayer')) general.push('demon slayer anime');
            if (name.includes('dragon ball')) general.push('dragon ball anime');
            if (name.includes('one piece')) general.push('one piece anime');
            if (name.includes('pokemon')) general.push('pokemon anime');
            if (name.includes('my hero') || name.includes('hero academia')) general.push('my hero academia');
            if (name.includes('jujutsu kaisen')) general.push('jujutsu kaisen anime');
            if (name.includes('attack on titan')) general.push('attack on titan anime');
            if (name.includes('fullmetal')) general.push('fullmetal alchemist anime');
        }
        
        return { specific, general, category };
    },

    // Get cached or fetch new image
    async getProductImage(product) {
        const cacheKey = `img_${product.id}`;
        const cached = localStorage.getItem(cacheKey);
        
        // Return cached image if it's a valid external URL or canvas data
        if (cached && (cached.startsWith('https://via.placeholder.com') || cached.startsWith('data:image/')) && cached !== 'failed') {
            console.log(`Using cached image for ${product.name}`);
            return cached;
        }
        
        // If cached value is placeholder SVG or failed, clear it and try again
        if (cached && (cached.includes('data:image/svg+xml') || cached === 'failed')) {
            console.log(`Clearing old cache for ${product.name}`);
            localStorage.removeItem(cacheKey);
        }
        
        console.log(`Fetching new image for ${product.name}...`);
        
        // Try to fetch from our reliable sources
        try {
            const imageUrl = await this.fetchProductImage(product);
            
            // Cache if it's a real external URL or canvas data, not a basic SVG placeholder
            if (imageUrl && (imageUrl.startsWith('https://via.placeholder.com') || imageUrl.startsWith('data:image/png'))) {
                localStorage.setItem(cacheKey, imageUrl);
                console.log(`✅ Successfully created and cached anime-styled image for ${product.name}`);
                return imageUrl;
            } else {
                console.warn(`Got basic SVG placeholder for ${product.name}`);
                // Don't cache basic SVG placeholder
                return imageUrl;
            }
            
        } catch (error) {
            console.error(`Failed to fetch image for ${product.name}:`, error);
            
            // Return SVG placeholder as last resort
            return this.createPlaceholderImage(product);
        }
    },
    
    // Create a simple placeholder image
    createPlaceholderImage(product) {
        const categoryEmoji = {
            'figuras': '🎎',
            'peluches': '🧸',
            'manga': '📚',
            'ropa': '👕',
            'default': '📦'
        };
        
        const emoji = categoryEmoji[product.category] || categoryEmoji.default;
        
        return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="2"/%3E%3Ctext x="50%" y="40%" font-family="Arial" font-size="48" text-anchor="middle"%3E${emoji}%3C/text%3E%3Ctext x="50%" y="55%" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle"%3E${encodeURIComponent(product.name.substring(0, 30))}%3C/text%3E%3Ctext x="50%" y="65%" font-family="Arial" font-size="12" fill="%23999" text-anchor="middle"%3E${product.category}%3C/text%3E%3C/svg%3E`;
    },
    
    // Simple cart management
    cart: {
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        
        add(product) {
            this.items.push(product);
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateDisplay();
        },
        
        updateDisplay() {
            const countElement = document.querySelector('.cart-count');
            if (countElement) {
                countElement.textContent = this.items.length;
                countElement.style.display = this.items.length > 0 ? 'flex' : 'none';
            }
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language and theme
    utils.initLanguage();
    utils.initTheme();
    utils.cart.updateDisplay();
    
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => utils.setLanguage(btn.dataset.lang));
    });
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => utils.toggleTheme());
    }
    
    // Mobile menu
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }
});

// Export for use in other files
window.utils = utils;

// ===== IMAGE CACHE MANAGEMENT UTILITIES =====

// キャッシュをクリアしてページ再読み込み
window.clearImageCache = function() {
    console.log('画像キャッシュをクリアしています...');
    
    // 画像キャッシュのキーをすべて取得
    const imageCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    
    console.log(`${imageCacheKeys.length}個のキャッシュエントリを削除中...`);
    
    // 画像キャッシュを削除
    imageCacheKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`削除済み: ${key}`);
    });
    
    // 成功メッセージを表示
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #28a745; color: white; border-radius: 8px;
        padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif; font-weight: bold;
    `;
    messageEl.textContent = `✓ ${imageCacheKeys.length}個のキャッシュを削除しました`;
    document.body.appendChild(messageEl);
    
    // 3秒後にページをリロード
    setTimeout(() => {
        console.log('ページを再読み込みしています...');
        location.reload();
    }, 3000);
};

// 現在のキャッシュ状況を確認
window.checkImageCache = function() {
    const imageCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    
    console.group('📊 画像キャッシュ状況');
    console.log(`キャッシュエントリ数: ${imageCacheKeys.length}`);
    
    let totalSize = 0;
    const cacheInfo = imageCacheKeys.map(key => {
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size;
        totalSize += size;
        
        return {
            key: key,
            productId: key.replace('img_', ''),
            size: size,
            sizeFormatted: formatBytes(size),
            preview: value.substring(0, 50) + '...'
        };
    });
    
    // サイズ順でソート
    cacheInfo.sort((a, b) => b.size - a.size);
    
    console.log(`総キャッシュサイズ: ${formatBytes(totalSize)}`);
    console.log('キャッシュエントリ詳細:');
    console.table(cacheInfo);
    
    // ローカルストレージの使用率チェック
    checkLocalStorageUsage();
    
    console.groupEnd();
    
    return {
        count: imageCacheKeys.length,
        totalSize: totalSize,
        entries: cacheInfo
    };
};

// バイト数を人間が読める形式に変換
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ローカルストレージの使用率をチェック
function checkLocalStorageUsage() {
    try {
        // ローカルストレージの容量を概算（通常5-10MB）
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        // 文字数 × 2 = 概算バイト数
        const estimatedBytes = totalSize * 2;
        const usagePercent = (estimatedBytes / (5 * 1024 * 1024)) * 100; // 5MBベース
        
        console.log(`ローカルストレージ使用量: ${formatBytes(estimatedBytes)} (約${usagePercent.toFixed(1)}%)`);
        
        if (usagePercent > 80) {
            console.warn('⚠️ ローカルストレージの使用率が高くなっています');
        }
        
    } catch (error) {
        console.error('ローカルストレージ使用率の計算でエラー:', error);
    }
}

// 特定の商品の画像キャッシュを削除
window.clearProductImageCache = function(productId) {
    const cacheKey = `img_${productId}`;
    const existed = localStorage.getItem(cacheKey) !== null;
    
    if (existed) {
        localStorage.removeItem(cacheKey);
        console.log(`✓ 商品 ${productId} の画像キャッシュを削除しました`);
    } else {
        console.log(`商品 ${productId} の画像キャッシュは存在しません`);
    }
    
    return existed;
};

// キャッシュ統計を取得
window.getCacheStats = function() {
    const imageCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    const stats = checkImageCache();
    
    return {
        ...stats,
        oldestCache: findOldestCache(),
        largestCache: findLargestCache(),
        recommendations: getCacheRecommendations(stats)
    };
};

// 最も古いキャッシュを見つける
function findOldestCache() {
    // 簡単な実装：キーの名前から推測
    // より正確にするには、キャッシュ作成時にタイムスタンプを保存する必要があります
    const keys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    return keys.length > 0 ? keys[0] : null;
}

// 最も大きいキャッシュを見つける
function findLargestCache() {
    let largest = { key: null, size: 0 };
    
    Object.keys(localStorage).filter(key => key.startsWith('img_')).forEach(key => {
        const size = new Blob([localStorage.getItem(key)]).size;
        if (size > largest.size) {
            largest = { key, size };
        }
    });
    
    return largest.key ? largest : null;
}

// キャッシュ最適化の推奨事項
function getCacheRecommendations(stats) {
    const recommendations = [];
    
    if (stats.count > 100) {
        recommendations.push('キャッシュエントリが多すぎます。古いキャッシュの削除を検討してください。');
    }
    
    if (stats.totalSize > 2 * 1024 * 1024) { // 2MB
        recommendations.push('キャッシュサイズが大きくなっています。画像の最適化を検討してください。');
    }
    
    if (stats.count === 0) {
        recommendations.push('キャッシュが空です。fetchAllProductImages() を実行してパフォーマンスを向上させましょう。');
    }
    
    return recommendations;
}

// 開発者用のヘルプメッセージ
window.showImageCacheHelp = function() {
    console.log(`
🖼️ 画像キャッシュ管理コマンド

基本操作:
• clearImageCache()          - キャッシュをクリアしてページ再読み込み
• checkImageCache()          - 現在のキャッシュ状況を確認
• fetchAllProductImages()    - 全商品の画像を一括取得（進捗バー付き）

詳細操作:
• clearProductImageCache('product-id') - 特定商品のキャッシュを削除
• getCacheStats()            - 詳細な統計情報を取得
• showImageCacheHelp()       - このヘルプを表示

クイックチェック:
• Object.keys(localStorage).filter(key => key.startsWith('img_')).length
  → 現在のキャッシュエントリ数

使用例:
> checkImageCache()         // 現在の状況をチェック
> clearImageCache()         // 全キャッシュをクリア
> fetchAllProductImages()   // 全画像を再取得
    `);
};

// Quick test function for anime image system
window.testAnimeImageSystem = async function() {
    console.log('🎎 Testing anime-specific image system...');
    
    try {
        const products = await utils.loadData('products');
        
        if (!products || products.length === 0) {
            console.error('No products found for testing');
            return;
        }
        
        // Test different categories
        const testCategories = ['figuras', 'peluches', 'manga', 'ropa'];
        const testResults = [];
        
        for (const category of testCategories) {
            const productInCategory = products.find(p => p.category === category);
            
            if (productInCategory) {
                console.log(`\n🧪 Testing ${category} category with: ${productInCategory.name}`);
                
                // Clear cache for clean test
                const cacheKey = `img_${productInCategory.id}`;
                localStorage.removeItem(cacheKey);
                
                // Generate anime-styled image
                const imageUrl = await utils.getProductImage(productInCategory);
                
                if (imageUrl.startsWith('data:image/png')) {
                    console.log('✅ Canvas-based anime image created');
                    testResults.push({ category, status: 'success', type: 'canvas' });
                } else if (imageUrl.startsWith('https://')) {
                    console.log('✅ External styled image created');
                    testResults.push({ category, status: 'success', type: 'external' });
                } else {
                    console.log('⚠️ Fallback SVG placeholder used');
                    testResults.push({ category, status: 'fallback', type: 'svg' });
                }
                
                // Test loading
                const testImg = new Image();
                testImg.onload = () => console.log(`✅ ${category} image loads successfully`);
                testImg.onerror = () => console.log(`❌ ${category} image failed to load`);
                testImg.src = imageUrl;
            }
        }
        
        console.log('\n📊 Test Results Summary:');
        console.table(testResults);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
};

// 自動的にヘルプを表示（開発環境の場合）
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🎎 アニメ画像システム管理ツールが利用可能です。');
    console.log('• testAnimeImageSystem() - アニメ画像システムをテスト');
    console.log('• clearImageCache() - キャッシュをクリア');
    console.log('• fetchAllProductImages() - 全商品の画像を生成');
    console.log('• showImageCacheHelp() - 詳細ヘルプを表示');
}