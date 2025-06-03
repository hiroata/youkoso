// ===== MAIN JAVASCRIPT FILE =====

// Global variables
let currentLanguage = 'es';
let currentTheme = 'light';
let products = [];
let cart = [];
let isMobile = window.innerWidth <= 768;

// DOM Elements
const elements = {
    languageButtons: null,
    themeToggle: null,
    mobileMenuToggle: null,
    mobileMenu: null,
    cartCount: null,
    featuredProductsGrid: null,
    notificationsContainer: null,
    footerSubtitles: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('¡Hola Japón! Website initialized');
    
    // Initialize DOM elements
    initializeElements();
    
    // Load settings
    loadSettings();
    
    // Initialize features
    initializeLanguageToggle();
    initializeThemeToggle();
    initializeMobileMenu();
    initializeCart();
    initializeMobileFooter();
    
    // Load products
    loadProducts();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize responsive behavior
    initializeResponsive();
});

// Initialize responsive behavior
function initializeResponsive() {
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        
        // Reinitialize mobile footer if screen size changed
        if (wasMobile !== isMobile) {
            initializeMobileFooter();
        }
        
        adjustForMobile();
    });
    
    adjustForMobile();
}

// Initialize mobile footer accordion functionality
function initializeMobileFooter() {
    const footerSubtitles = document.querySelectorAll('.footer-subtitle');
    
    footerSubtitles.forEach(subtitle => {
        // Remove existing event listeners to avoid duplicates
        const newSubtitle = subtitle.cloneNode(true);
        subtitle.parentNode.replaceChild(newSubtitle, subtitle);
        
        if (isMobile) {
            // Add accordion functionality for mobile
            newSubtitle.addEventListener('click', function() {
                const footerSection = this.closest('.footer-section');
                const isFirstSection = footerSection === footerSection.parentNode.firstElementChild;
                
                // Skip accordion for first section (brand section)
                if (isFirstSection) return;
                
                const content = footerSection.querySelector('.footer-links, .contact-info');
                const isExpanded = content && content.classList.contains('expanded');
                
                // Close all other sections first
                footerSubtitles.forEach(otherSubtitle => {
                    if (otherSubtitle !== newSubtitle) {
                        const otherSection = otherSubtitle.closest('.footer-section');
                        const otherContent = otherSection.querySelector('.footer-links, .contact-info');
                        if (otherContent && otherContent.classList.contains('expanded')) {
                            otherSubtitle.classList.remove('expanded');
                            otherContent.classList.remove('expanded');
                        }
                    }
                });
                
                // Toggle current section
                if (content) {
                    if (isExpanded) {
                        newSubtitle.classList.remove('expanded');
                        content.classList.remove('expanded');
                    } else {
                        newSubtitle.classList.add('expanded');
                        content.classList.add('expanded');
                    }
                }
                
                // Update ARIA attributes
                const expanded = content && content.classList.contains('expanded');
                newSubtitle.setAttribute('aria-expanded', expanded);
                if (content) {
                    content.setAttribute('aria-hidden', !expanded);
                }
            });
            
            // Set initial ARIA attributes
            const footerSection = newSubtitle.closest('.footer-section');
            const isFirstSection = footerSection === footerSection.parentNode.firstElementChild;
            
            if (!isFirstSection) {
                newSubtitle.setAttribute('role', 'button');
                newSubtitle.setAttribute('aria-expanded', 'false');
                newSubtitle.setAttribute('tabindex', '0');
                
                const content = footerSection.querySelector('.footer-links, .contact-info');
                if (content) {
                    content.setAttribute('aria-hidden', 'true');
                }
                
                // Add keyboard support
                newSubtitle.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            }
        } else {
            // Remove mobile-specific attributes and classes for desktop
            const footerSection = newSubtitle.closest('.footer-section');
            const content = footerSection.querySelector('.footer-links, .contact-info');
            
            newSubtitle.removeAttribute('role');
            newSubtitle.removeAttribute('aria-expanded');
            newSubtitle.removeAttribute('tabindex');
            newSubtitle.classList.remove('expanded');
            
            if (content) {
                content.removeAttribute('aria-hidden');
                content.classList.remove('expanded');
            }
        }
    });
}

function adjustForMobile() {
    const productsGrid = elements.featuredProductsGrid;
    if (productsGrid && isMobile) {
        productsGrid.style.gridTemplateColumns = '1fr';
        productsGrid.style.gap = '1rem';
    } else if (productsGrid) {
        productsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        productsGrid.style.gap = '2rem';
    }
}

// Initialize DOM elements
function initializeElements() {
    elements.languageButtons = document.querySelectorAll('.lang-btn');
    elements.themeToggle = document.querySelector('.theme-toggle');
    elements.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    elements.mobileMenu = document.querySelector('.mobile-menu');
    elements.cartCount = document.querySelector('.cart-count');
    elements.featuredProductsGrid = document.getElementById('featured-products');
    elements.notificationsContainer = document.getElementById('notifications');
}

// Load user settings from localStorage
function loadSettings() {
    try {
        const savedLanguage = localStorage.getItem('language');
        const savedTheme = localStorage.getItem('theme');
        const savedCart = localStorage.getItem('cart');
        
        if (savedLanguage && ['es', 'ja'].includes(savedLanguage)) {
            currentLanguage = savedLanguage;
            updateLanguage(currentLanguage);
        }
        
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
            currentTheme = savedTheme;
            updateTheme(currentTheme);
        }
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    } catch (error) {
        console.warn('Error loading settings:', error);
    }
}

// Save settings to localStorage
function saveSettings() {
    try {
        localStorage.setItem('language', currentLanguage);
        localStorage.setItem('theme', currentTheme);
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('Error saving settings:', error);
    }
}

// Language toggle functionality
function initializeLanguageToggle() {
    if (!elements.languageButtons) return;
    
    elements.languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (lang && lang !== currentLanguage) {
                currentLanguage = lang;
                updateLanguage(lang);
                saveSettings();
                showNotification(
                    lang === 'es' ? 'Idioma cambiado a Español' : '日本語に変更されました',
                    'success'
                );
            }
        });
    });
}

// Update language display
function updateLanguage(lang) {
    // Update HTML lang attribute
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    
    // Update language buttons
    if (elements.languageButtons) {
        elements.languageButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.lang === lang);
        });
    }
    
    // Update page title
    const titles = {
        es: '¡Hola Japón! - Tienda de Productos Japoneses',
        ja: 'ハロー・ジャパン！ - 日本商品店'
    };
    document.title = titles[lang] || titles.es;
}

// Theme toggle functionality
function initializeThemeToggle() {
    if (!elements.themeToggle) return;
    
    elements.themeToggle.addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        updateTheme(currentTheme);
        saveSettings();
        
        const messages = {
            light: {
                es: 'Tema claro activado',
                ja: 'ライトテーマに変更'
            },
            dark: {
                es: 'Tema oscuro activado',
                ja: 'ダークテーマに変更'
            }
        };
        
        showNotification(messages[currentTheme][currentLanguage], 'success');
    });
}

// Update theme
function updateTheme(theme) {
    // Add transition class before theme change
    document.body.classList.add('theme-transitioning');
    
    document.documentElement.setAttribute('data-theme', theme);
    
    if (elements.themeToggle) {
        const icon = elements.themeToggle.querySelector('i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    // Remove transition class after animation
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 300);
}

// Mobile menu functionality
function initializeMobileMenu() {
    if (!elements.mobileMenuToggle || !elements.mobileMenu) return;
    
    elements.mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = elements.mobileMenu.classList.contains('active');
        
        if (!isActive) {
            elements.mobileMenu.classList.add('active');
            elements.mobileMenuToggle.classList.add('active');
            
            // Improve accessibility
            elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
            elements.mobileMenu.setAttribute('aria-hidden', 'false');
        } else {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu when clicking on links
    const mobileLinks = elements.mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (elements.mobileMenu.classList.contains('active') &&
            !elements.mobileMenu.contains(e.target) && 
            !elements.mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close mobile menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

function closeMobileMenu() {
    elements.mobileMenu.classList.remove('active');
    elements.mobileMenuToggle.classList.remove('active');
    
    // Improve accessibility
    elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    elements.mobileMenu.setAttribute('aria-hidden', 'true');
}

// Cart functionality
function initializeCart() {
    updateCartDisplay();
    
    // Cart button click handler
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', function() {
            showCartModal();
        });
    }
}

// Update cart display
function updateCartDisplay() {
    if (elements.cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCount.textContent = totalItems;
        elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Add item to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    saveSettings();
    
    // Enhanced button feedback
    const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <span class="es-text">¡Agregado!</span>
            <span class="ja-text">追加済み！</span>
            <i class="fas fa-check" aria-hidden="true"></i>
        `;
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    }
    
    const messages = {
        es: `${product.name} añadido al carrito`,
        ja: `${product.name}をカートに追加しました`
    };
    
    showNotification(messages[currentLanguage], 'success');
}

// Show cart modal (placeholder)
function showCartModal() {
    const messages = {
        es: 'Funcionalidad del carrito próximamente',
        ja: 'カート機能は近日公開予定'
    };
    
    showNotification(messages[currentLanguage], 'info');
}

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        products = data.products || [];
        
        // Display featured products
        displayFeaturedProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError();
    }
}

// Display featured products
function displayFeaturedProducts() {
    if (!elements.featuredProductsGrid) return;
    
    const featuredProducts = products.filter(product => product.featured).slice(0, 6);
    
    if (featuredProducts.length === 0) {
        showProductsError();
        return;
    }
    
    const productsHTML = featuredProducts.map(product => createProductCard(product)).join('');
    elements.featuredProductsGrid.innerHTML = productsHTML;
    
    // Add click handlers for add to cart buttons
    const addToCartButtons = elements.featuredProductsGrid.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            addToCart(productId);
        });
    });
}

// Enhanced product card creation with better mobile support
function createProductCard(product) {
    const imageHeight = isMobile ? '180px' : '200px';
    
    const imageElement = product.image ? 
        `<img src="${product.image}" 
             alt="${product.name}" 
             class="product-image" 
             style="height: ${imageHeight}; object-fit: cover;"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
             loading="lazy">
         <div class="product-placeholder" style="display: none; height: ${imageHeight};">🎌</div>` :
        `<div class="product-placeholder" style="height: ${imageHeight};">🎌</div>`;
    
    const featuredBadge = product.featured ? 
        `<div class="featured-badge">
            <span class="es-text">Destacado</span>
            <span class="ja-text">注目</span>
         </div>` : '';
    
    const tagsHTML = product.tags ? 
        product.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    
    const price = typeof product.price === 'number' ? 
        `$${product.price.toLocaleString()}` : product.price;
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container" style="height: ${imageHeight};">
                ${imageElement}
                ${featuredBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">${tagsHTML}</div>
                <div class="product-footer">
                    <span class="price">${price}</span>
                    <button class="add-to-cart" 
                            data-product-id="${product.id}"
                            aria-label="${product.name}をカートに追加">
                        <span class="es-text">Agregar</span>
                        <span class="ja-text">追加</span>
                        <i class="fas fa-plus" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show products error
function showProductsError() {
    if (!elements.featuredProductsGrid) return;
    
    elements.featuredProductsGrid.innerHTML = `
        <div class="error-container" role="alert">
            <div class="error-icon" aria-hidden="true">😅</div>
            <h3>
                <span class="es-text">Error al cargar productos</span>
                <span class="ja-text">商品の読み込みエラー</span>
            </h3>
            <p>
                <span class="es-text">Por favor, recarga la página o intenta más tarde.</span>
                <span class="ja-text">ページを再読み込みするか、後でもう一度お試しください。</span>
            </p>
            <button onclick="location.reload()" class="btn btn-primary">
                <span class="es-text">Recargar</span>
                <span class="ja-text">再読み込み</span>
            </button>
        </div>
    `;
}

// Enhanced scroll effects with performance optimization
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let isScrolled = false;
    let ticking = false;
    
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const shouldBeScrolled = scrollTop > 50;
        
        if (shouldBeScrolled !== isScrolled) {
            isScrolled = shouldBeScrolled;
            header.classList.toggle('scrolled', isScrolled);
        }
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// Enhanced animations with mobile optimization
function initializeAnimations() {
    // Skip animations on mobile for better performance
    if (isMobile) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with a delay to avoid layout shift
    setTimeout(() => {
        const animateElements = document.querySelectorAll('.category-card, .product-card, .about-content');
        animateElements.forEach(el => {
            if (!el.classList.contains('animate-in')) {
                observer.observe(el);
            }
        });
    }, 100);
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications if too many
    const existingNotifications = document.querySelectorAll('.notification');
    if (existingNotifications.length >= 3) {
        removeNotification(existingNotifications[0]);
    }
    
    // Get or create notifications container
    let notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        document.body.appendChild(notificationsContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type]}" aria-hidden="true"></i>
            <span role="status" aria-live="polite">${message}</span>
        </div>
        <button class="notification-close" aria-label="閉じる" type="button">
            <i class="fas fa-times" aria-hidden="true"></i>
        </button>
    `;
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Animate in with improved performance
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto-remove with mobile-friendly duration
    const duration = isMobile ? 6000 : 5000;
    setTimeout(() => {
        if (notification.parentNode) {
            removeNotification(notification);
        }
    }, duration);
}

// Enhanced notification removal
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Error boundary for JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e);
    showNotification(
        currentLanguage === 'es' ? 
        'Ha ocurrido un error. Por favor, recarga la página.' :
        'エラーが発生しました。ページを再読み込みしてください。',
        'error'
    );
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
            });
    });
}