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
            if (!response.ok) throw new Error(`Failed to load data`);
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

    // Image utilities
    async fetchProductImage(product, fallbackUrl = 'assets/images/ui/placeholder.jpg') {
        try {
            // Create search query from product name and tags
            const searchTerms = [];
            
            // Extract key terms from product name
            const name = product.name.toLowerCase();
            if (name.includes('figura')) searchTerms.push('anime figure');
            if (name.includes('peluche')) searchTerms.push('plush toy');
            if (name.includes('manga')) searchTerms.push('manga book');
            if (name.includes('poster')) searchTerms.push('anime poster');
            if (name.includes('camiseta') || name.includes('playera')) searchTerms.push('anime shirt');
            
            // Add specific anime/character terms
            if (name.includes('demon slayer') || name.includes('tanjiro') || name.includes('nezuko')) searchTerms.push('demon slayer anime');
            if (name.includes('my hero') || name.includes('allmight') || name.includes('deku')) searchTerms.push('my hero academia');
            if (name.includes('pokemon') || name.includes('pikachu')) searchTerms.push('pokemon');
            if (name.includes('naruto')) searchTerms.push('naruto anime');
            if (name.includes('dragon ball') || name.includes('goku')) searchTerms.push('dragon ball');
            if (name.includes('one piece') || name.includes('luffy')) searchTerms.push('one piece anime');
            
            // Add category-based terms
            if (product.category === 'figuras') searchTerms.push('collectible figure');
            if (product.category === 'peluches') searchTerms.push('kawaii plush');
            if (product.category === 'manga') searchTerms.push('japanese manga');
            if (product.category === 'ropa') searchTerms.push('anime clothing');
            
            // Create search query
            const query = searchTerms.length > 0 ? searchTerms.join(' ') : 'anime merchandise';
            
            // Use Unsplash API
            const unsplashUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(query)}`;
            
            // Test if image loads
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(unsplashUrl);
                img.onerror = () => resolve(fallbackUrl);
                img.src = unsplashUrl;
            });
            
        } catch (error) {
            console.error('Error fetching product image:', error);
            return fallbackUrl;
        }
    },

    // Get cached or fetch new image
    async getProductImage(product) {
        const cacheKey = `img_${product.id}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        // Try original image first
        if (product.image && !product.image.includes('placeholder')) {
            try {
                const response = await fetch(product.image, { method: 'HEAD' });
                if (response.ok) {
                    localStorage.setItem(cacheKey, product.image);
                    return product.image;
                }
            } catch (error) {
                console.log(`Original image not found for ${product.name}, fetching alternative...`);
            }
        }
        
        // Fetch from Unsplash
        const imageUrl = await this.fetchProductImage(product);
        localStorage.setItem(cacheKey, imageUrl);
        return imageUrl;
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
    utils.cart.init();
    
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