// Main.js - アプリケーションのメイン制御

class App {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.isInitialized = false;
    }

    // 現在のページを検出
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename.includes('index') || path === '/' || filename === '') {
            return 'home';
        } else if (filename.includes('products')) {
            return 'products';
        } else if (filename.includes('about')) {
            return 'about';
        } else if (filename.includes('contact')) {
            return 'contact';
        } else if (filename.includes('testimonials')) {
            return 'testimonials';
        } else {
            return 'other';
        }
    }

    // アプリケーション初期化
    async init() {
        try {
            console.log(`Initializing app for page: ${this.currentPage}`);

            // 共通の初期化
            await this.initCommon();

            // ページ固有の初期化
            switch (this.currentPage) {
                case 'home':
                    await this.initHomePage();
                    break;
                case 'products':
                    await this.initProductsPage();
                    break;
                default:
                    console.log('No specific initialization for this page');
            }

            this.isInitialized = true;
            console.log('App initialization completed');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            // エラー通知は表示しない
        }
    }

    // 共通初期化
    async initCommon() {
        // ダークモードの初期化
        this.initThemeToggle();
        
        // メニューの初期化
        this.initMobileMenu();
        
        // 言語切り替えの初期化
        this.initLanguageToggle();
        
        // スクロールエフェクトの初期化
        this.initScrollEffects();

        // 検索機能の初期化
        this.initGlobalSearch();
    }

    // ホームページ初期化
    async initHomePage() {
        try {
            // 注目商品の読み込み
            await this.loadFeaturedProducts();
            
            // アニメーション効果
            this.initHomeAnimations();
            
        } catch (error) {
            console.error('Failed to initialize home page:', error);
        }
    }

    // 商品ページ初期化
    async initProductsPage() {
        // products.jsで処理されるため、ここでは追加の初期化のみ
        console.log('Products page initialization delegated to products.js');
    }

    // 注目商品の読み込み
    async loadFeaturedProducts() {
        const container = document.querySelector('.featured-products-grid');
        if (!container) return;

        try {
            window.utils.showLoading(container);
            
            const products = await window.utils.dataLoader.loadData('products');
            const featuredProducts = products.filter(product => product.featured).slice(0, 6);
            
            if (featuredProducts.length === 0) {
                container.innerHTML = window.createEmptyStateComponent('注目商品が見つかりません');
                return;
            }

            const productsHTML = featuredProducts.map(product => 
                window.createProductCardComponent(product)
            ).join('');

            container.innerHTML = productsHTML;

            // カートボタンのイベントリスナー設定
            this.setupCartButtons(container);

        } catch (error) {
            console.error('Failed to load featured products:', error);
            // エラー表示は無効化
        }
    }

    // カートボタンの設定
    setupCartButtons(container) {
        const addToCartBtns = container.querySelectorAll('.add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = btn.getAttribute('data-product-id');
                this.addToCart(productId);
            });
        });
    }

    // カートに追加
    addToCart(productId) {
        try {
            // ローカルストレージからカートを取得
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // 商品がすでにカートにある場合は数量を増やす
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                // 新しい商品をカートに追加
                cart.push({ id: productId, quantity: 1 });
            }
            
            // カートを保存
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // カート数量を更新
            this.updateCartCount();
            
            // 成功通知は無効化
            console.log('商品をカートに追加しました');
            
        } catch (error) {
            console.error('Failed to add to cart:', error);
            // エラー通知は無効化
        }
    }

    // カート数量更新
    updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = totalItems;
                cartCount.style.display = totalItems > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Failed to update cart count:', error);
        }
    }

    // ダークモード切り替え
    initThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) return;

        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // アイコン更新
            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            }
        });
    }

    // モバイルメニュー
    initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (!menuToggle || !mobileMenu) return;

        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // メニュー外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // 言語切り替え
    initLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
                
                // アクティブ状態更新
                langButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // 言語設定
    setLanguage(lang) {
        document.documentElement.setAttribute('data-lang', lang);
        localStorage.setItem('language', lang);
        
        // translate.jsに委譲
        if (window.switchLanguage) {
            window.switchLanguage(lang);
        }
    }

    // スクロールエフェクト
    initScrollEffects() {
        // ヘッダーの背景変更
        const header = document.querySelector('header');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            });
        }

        // 要素のフェードイン
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.product-card, .category-card').forEach(el => {
            observer.observe(el);
        });
    }

    // グローバル検索
    initGlobalSearch() {
        const searchToggle = document.querySelector('.search-toggle');
        const searchOverlay = document.querySelector('.search-overlay');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                if (searchOverlay) {
                    searchOverlay.classList.toggle('active');
                } else {
                    // 検索ページにリダイレクト
                    window.location.href = 'products.html';
                }
            });
        }
    }

    // ホームページアニメーション
    initHomeAnimations() {
        // ヒーローセクションのアニメーション
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('animate-in');
            }, 300);
        }

        // カテゴリカードのstaggeredアニメーション
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-in');
            }, 500 + (index * 100));
        });
    }

    // エラー表示 (無効化)
    showError(message) {
        // エラーはコンソールのみに表示
        console.error('App Error:', message);
    }
}

// グローバルアプリインスタンス
window.app = new App();

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.app.init();
        
        // カート数量の初期表示
        window.app.updateCartCount();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
});

// ページ離脱前の処理
window.addEventListener('beforeunload', () => {
    // 必要に応じてクリーンアップ処理
});

console.log('Main.js loaded successfully');// Utilities.js - ユーティリティ関数とデータ管理

// データローダークラス
class DataLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5分
    }

    // データを取得（キャッシュ機能付き）
    async loadData(type) {
        const cacheKey = `${type}_data`;
        const cachedData = this.getFromCache(cacheKey);
        
        if (cachedData) {
            console.log(`Using cached data for: ${type}`);
            return cachedData;
        }

        try {
            const url = `data/data.json`;
            console.log(`Fetching data from: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // キャッシュに保存
            this.setCache(cacheKey, data[type] || data);
            
            return data[type] || data;
        } catch (error) {
            console.error(`Error loading ${type} data:`, error);
            
            // ローカルストレージからフォールバック
            const fallbackData = this.getFromLocalStorage(cacheKey);
            if (fallbackData) {
                console.log(`Using fallback data for: ${type}`);
                return fallbackData;
            }
            
            throw error;
        }
    }

    // 画像を動的に取得
    async loadImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                console.log(`Image loaded successfully: ${imagePath}`);
                resolve(img);
            };
            
            img.onerror = () => {
                console.error(`Failed to load image: ${imagePath}`);
                // フォールバック画像を設定
                img.src = 'assets/images/ui/placeholder.jpg';
                resolve(img);
            };
            
            img.src = imagePath;
        });
    }

    // キャッシュから取得
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    // キャッシュに保存
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // ローカルストレージにも保存
        try {
            localStorage.setItem(key, JSON.stringify({
                data: data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    // ローカルストレージから取得
    getFromLocalStorage(key) {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < this.cacheTimeout) {
                    return parsed.data;
                }
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
        return null;
    }

    // キャッシュをクリア
    clearCache() {
        this.cache.clear();
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.endsWith('_data')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
    }
}

// API関数
async function fetchData(url, options = {}) {
    try {
        console.log(`Fetching data from: ${url}`);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // ローカルストレージにキャッシュ
        if (options.cache !== false) {
            try {
                localStorage.setItem(`cache_${url}`, JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: data
                }));
            } catch (e) {
                console.warn('Failed to cache data:', e);
            }
        }
        
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        
        // エラー時にキャッシュからデータを取得
        try {
            const cachedData = localStorage.getItem(`cache_${url}`);
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                console.log('Using cached data due to fetch error');
                return parsedCache.data;
            }
        } catch (e) {
            console.warn('Failed to load cached data:', e);
        }
        
        throw error;
    }
}

// 商品フィルタリング関数
function filterProducts(products, filters = {}) {
    let filtered = [...products];

    // カテゴリーフィルター
    if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(product => product.category === filters.category);
    }

    // 価格フィルター
    if (filters.minPrice !== undefined) {
        filtered = filtered.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
        filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }

    // 検索フィルター
    if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    // 注目商品フィルター
    if (filters.featured) {
        filtered = filtered.filter(product => product.featured);
    }

    return filtered;
}

// 商品ソート関数
function sortProducts(products, sortBy = 'name') {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'featured':
            return sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            });
        default:
            return sorted;
    }
}

// 画像遅延読み込み
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ローディング表示
function showLoading(container) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    if (container) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>読み込み中...</p>
            </div>
        `;
    }
}

function hideLoading(container) {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    if (container) {
        const loading = container.querySelector('.loading-spinner');
        if (loading) {
            loading.remove();
        }
    }
}

// エラー表示
function showError(container, message = 'エラーが発生しました') {
    if (typeof container === 'string') {
        container = document.querySelector(container);
    }
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">再試行</button>
            </div>
        `;
    }
}

// グローバルオブジェクトとして公開
const dataLoaderInstance = new DataLoader();
window.utils = {
    dataLoader: dataLoaderInstance,
    fetchData,
    filterProducts,
    sortProducts,
    setupLazyLoading,
    showLoading,
    hideLoading,
    showError,
    // ローカルストレージ管理
    saveToLocalStorage: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    },

    getFromLocalStorage: function(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            if (stored === null) return defaultValue;
            return JSON.parse(stored);
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    // 遅延読み込みを設定
    if (typeof IntersectionObserver !== 'undefined') {
        setupLazyLoading();
    }
});

console.log('Utilities.js loaded successfully');// Components.js - 再利用可能なUIコンポーネント

// 商品カードコンポーネント
function createProductCardComponent(product, relativePath = '') {
    const imagePath = relativePath + product.image;
    const formattedPrice = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(product.price);

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <img src="${imagePath}" 
                     alt="${product.name}" 
                     class="product-image"
                     loading="lazy"
                     onerror="this.onerror=null; this.style.opacity='0.5'; this.alt='画像を読み込めませんでした'"
                ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">
                    ${product.tags ? product.tags.map(tag => `<span class="tag">#${tag}</span>`).join('') : ''}
                </div>
                <div class="product-footer">
                    <span class="price">${formattedPrice}</span>
                    <button class="btn-primary add-to-cart" data-product-id="${product.id}">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

// カテゴリーフィルターコンポーネント
function createCategoryFilterComponent(categories, activeCategory = 'all') {
    return `
        <div class="category-filter">
            <button class="filter-btn ${activeCategory === 'all' ? 'active' : ''}" 
                    data-category="all">
                Todos
            </button>
            ${categories.map(category => `
                <button class="filter-btn ${activeCategory === category.id ? 'active' : ''}" 
                        data-category="${category.id}">
                    ${category.name}
                </button>
            `).join('')}
        </div>
    `;
}

// 価格フィルターコンポーネント
function createPriceFilterComponent(minPrice = 0, maxPrice = 10000) {
    return `
        <div class="price-filter">
            <h4>Rango de Precio</h4>
            <div class="price-inputs">
                <input type="number" 
                       id="min-price" 
                       placeholder="Mín" 
                       value="${minPrice}"
                       min="0">
                <span>-</span>
                <input type="number" 
                       id="max-price" 
                       placeholder="Máx" 
                       value="${maxPrice}"
                       min="0">
            </div>
            <button class="apply-filter-btn">Aplicar</button>
        </div>
    `;
}

// 検索バーコンポーネント
function createSearchBarComponent(placeholder = 'Buscar productos...') {
    return `
        <div class="search-bar">
            <input type="text" 
                   id="search-input" 
                   placeholder="${placeholder}"
                   class="search-input">
            <button class="search-btn" id="search-btn">
                <i class="fas fa-search"></i>
            </button>
        </div>
    `;
}

// ソート選択コンポーネント
function createSortSelectComponent(currentSort = 'name') {
    const sortOptions = [
        { value: 'name', label: 'Nombre A-Z' },
        { value: 'price-low', label: 'Precio: Menor a Mayor' },
        { value: 'price-high', label: 'Precio: Mayor a Menor' },
        { value: 'featured', label: 'Destacados Primero' }
    ];

    return `
        <div class="sort-select">
            <label for="sort-by">Ordenar por:</label>
            <select id="sort-by" class="sort-dropdown">
                ${sortOptions.map(option => `
                    <option value="${option.value}" ${currentSort === option.value ? 'selected' : ''}>
                        ${option.label}
                    </option>
                `).join('')}
            </select>
        </div>
    `;
}

// ページネーションコンポーネント
function createPaginationComponent(currentPage, totalPages, baseUrl = '') {
    if (totalPages <= 1) return '';

    let pagination = '<div class="pagination">';
    
    // 前のページボタン
    if (currentPage > 1) {
        pagination += `
            <button class="page-btn prev-btn" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
        `;
    }

    // ページ番号
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            pagination += `
                <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            pagination += '<span class="page-ellipsis">...</span>';
        }
    }

    // 次のページボタン
    if (currentPage < totalPages) {
        pagination += `
            <button class="page-btn next-btn" data-page="${currentPage + 1}">
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    pagination += '</div>';
    return pagination;
}

// ローディングスピナーコンポーネント
function createLoadingComponent(message = 'Cargando...') {
    return `
        <div class="loading-container">
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        </div>
    `;
}

// エラーメッセージコンポーネント (通知は無効化)
function createErrorComponent(message = 'Ha ocurrido un error', showRetry = true) {
    // エラーはコンソールのみに表示
    console.error('Error:', message);
    return `
        <div class="error-container" style="display: none;">
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                ${showRetry ? '<button class="retry-btn" onclick="location.reload()">Reintentar</button>' : ''}
            </div>
        </div>
    `;
}

// 空の状態コンポーネント
function createEmptyStateComponent(message = 'No se encontraron productos', suggestion = '') {
    return `
        <div class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>${message}</h3>
            ${suggestion ? `<p class="suggestion">${suggestion}</p>` : ''}
        </div>
    `;
}

// モーダルコンポーネント
function createModalComponent(title, content, modalId = 'modal') {
    return `
        <div class="modal-overlay" id="${modalId}">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <button class="modal-close" data-modal="${modalId}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
}

// グローバルに公開
window.createProductCardComponent = createProductCardComponent;
window.createCategoryFilterComponent = createCategoryFilterComponent;
window.createPriceFilterComponent = createPriceFilterComponent;
window.createSearchBarComponent = createSearchBarComponent;
window.createSortSelectComponent = createSortSelectComponent;
window.createPaginationComponent = createPaginationComponent;
window.createLoadingComponent = createLoadingComponent;
window.createErrorComponent = createErrorComponent;
window.createEmptyStateComponent = createEmptyStateComponent;
window.createModalComponent = createModalComponent;

console.log('Components.js loaded successfully');