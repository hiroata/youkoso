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
            const response = await fetch(`data/${type}.json`);
            if (!response.ok) throw new Error(`Failed to load ${type}`);
            return await response.json();
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
    
    // Simple cart management
    cart: {
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        
        add(product) {
            this.items.push(product);
            localStorage.setItem('cart', JSON.stringify(this.items));
            this.updateCount();
        },
        
        updateCount() {
            const countElement = document.querySelector('.cart-count');
            if (countElement) {
                countElement.textContent = this.items.length;
                countElement.style.display = this.items.length > 0 ? 'flex' : 'none';
            }
        },
        
        init() {
            this.updateCount();
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