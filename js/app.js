// 統合されたメインアプリケーションファイル
// utilities.js、components.js、main.jsの全機能を統合

/* === UTILITIES SECTION === */

/**
 * データをフェッチする汎用関数
 * @param {string} url - データを取得するURL
 * @returns {Promise<Object>} - 取得したデータのPromise
 */
async function fetchData(url) {
    try {
        console.log(`Fetching data from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Data fetched successfully from: ${url}`);
        
        // ローカルストレージにキャッシュ
        try {
            localStorage.setItem(`cache_${url}`, JSON.stringify({
                timestamp: new Date().getTime(),
                data: data
            }));
        } catch (e) {
            console.warn('Could not cache data in localStorage:', e);
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        
        // エラー時にキャッシュからデータを取得を試みる
        try {
            const cachedData = localStorage.getItem(`cache_${url}`);
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                console.log(`Returning cached data for ${url}`);
                return parsedCache.data;
            }
        } catch (e) {
            console.error('Could not retrieve cached data:', e);
        }
        
        throw error;
    }
}

/**
 * データをフィルタリングする関数
 */
function filterItems(items, filters = {}) {
    return items.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === '' || value === undefined || value === null || value === 'all') {
                return true;
            }
            
            if (key === 'search' && typeof value === 'string') {
                const searchFields = ['name', 'title', 'description', 'excerpt', 'content'];
                return searchFields.some(field => {
                    return item[field] && item[field].toLowerCase().includes(value.toLowerCase());
                });
            }
            
            if (key === 'category') {
                return item.category === value;
            }
            
            return item[key] === value;
        });
    });
}

/**
 * データをソートする関数
 */
function sortItems(items, sortBy = 'id', sortOrder = 'asc') {
    const sortedItems = [...items].sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];
        
        if (sortBy === 'date' && typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
        }
        
        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        }
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    return sortedItems;
}

/**
 * データをページネーションする関数
 */
function paginateItems(items, pageSize = 10, currentPage = 1) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
}

/**
 * パラメータからURLクエリパラメータを取得する関数
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * 数値を通貨形式にフォーマットする関数
 */
function formatCurrency(amount, currencyCode = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

/**
 * 日付文字列をローカライズされた形式にフォーマットする関数
 */
function formatDate(dateString, locale = 'es-MX') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * ローカルストレージにデータを保存する関数
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * ローカルストレージからデータを取得する関数
 */
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
    }
}

/**
 * 画像を遅延読み込みするよう設定する関数
 */
function setupLazyLoading(container = document) {
    const lazyImages = container.querySelectorAll('img[loading="lazy"], img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.removeAttribute('data-src');
                    }
                    
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                        lazyImage.removeAttribute('data-srcset');
                    }
                    
                    lazyImage.classList.add('loaded');
                    imageObserver.unobserve(lazyImage);
                }
            });
        });
        
        lazyImages.forEach(image => {
            if ((!image.src || image.src === '') && image.dataset.src) {
                image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
            }
            imageObserver.observe(image);
        });
    }
}

/**
 * コールバック関数をデバウンスする関数
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* === COMPONENTS SECTION === */

// サイト全体のデータとキャッシュ
window.siteData = {
    products: [],
    posts: [],
    testimonials: [],
    categories: []
};

/**
 * 現在のパスを取得する関数
 */
function getCurrentPath() {
    const path = window.location.pathname;
    const isInProductsFolder = path.includes('/products/');
    const isInBlogFolder = path.includes('/blog/');
    return { 
        isRoot: !isInProductsFolder && !isInBlogFolder, 
        isInProductsFolder, 
        isInBlogFolder,
        path 
    };
}

/**
 * パスに基づいて相対パスを生成する関数
 */
function getRelativePath() {
    const { isRoot } = getCurrentPath();
    return isRoot ? '' : '../';
}

/**
 * ヘッダーを読み込む関数
 */
function loadHeader(placeholder) {
    try {
        const { isInProductsFolder, isInBlogFolder } = getCurrentPath();
        const relativePath = getRelativePath();
        
        const homeClass = !isInProductsFolder && !isInBlogFolder ? ' class="active"' : '';
        const productsClass = isInProductsFolder ? ' class="active"' : '';
        const blogClass = isInBlogFolder ? ' class="active"' : '';
        
        const headerHTML = `
            <div class="container">
                <div class="logo">
                    <h1><a href="${relativePath}index.html">Hola <span class="japan">Japón</span></a></h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="${relativePath}index.html"${homeClass}>Inicio</a></li>
                        <li><a href="${relativePath}products/index.html"${productsClass}>Productos</a></li>
                        <li><a href="${relativePath}blog/index.html"${blogClass}>Blog</a></li>
                        <li><a href="${relativePath}testimonials.html">Testimonios</a></li>
                        <li><a href="${relativePath}about.html">Sobre Nosotros</a></li>
                    </ul>
                </nav>
            </div>
        `;
        
        placeholder.innerHTML = headerHTML;
        
        // ヘッダーのスクロール効果を設定
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                placeholder.classList.add('scrolled');
            } else {
                placeholder.classList.remove('scrolled');
            }
        });
    } catch (error) {
        console.error('Error loading header component:', error);
        placeholder.innerHTML = '<div class="container"><p>Error loading header</p></div>';
    }
}

/**
 * フッターを読み込む関数
 */
function loadFooter(placeholder) {
    try {
        const relativePath = getRelativePath();
        
        const footerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-about">
                        <h3>Hola Japón</h3>
                        <p>Traemos lo mejor de la cultura japonesa directamente a México desde 2023.</p>
                    </div>
                    <div class="footer-links">
                        <h3>Enlaces Rápidos</h3>
                        <ul>
                            <li><a href="${relativePath}products/index.html">Productos</a></li>
                            <li><a href="${relativePath}blog/index.html">Blog</a></li>
                            <li><a href="${relativePath}testimonials.html">Testimonios</a></li>
                            <li><a href="${relativePath}about.html">Sobre Nosotros</a></li>
                        </ul>
                    </div>
                    <div class="footer-contact">
                        <h3>Contacto</h3>
                        <div class="contact-info">
                            <p>📧 info@holajapon.mx</p>
                            <p>🕐 Lun-Vie: 9:00-18:00 GMT-6</p>
                            <p>📍 México</p>
                        </div>
                    </div>
                </div>
                <div class="copyright">
                    <p>&copy; 2025 Hola Japón. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
        
        placeholder.innerHTML = footerHTML;
    } catch (error) {
        console.error('Error loading footer component:', error);
        placeholder.innerHTML = '<div class="container"><p>Error loading footer</p></div>';
    }
}

/**
 * 商品カテゴリーに応じた画像URLを取得する関数
 */
function getCategoryImageUrl(product) {
    const categoryImages = {
        'figuras': [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Anime figures
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', // Collectible figures
            'https://images.unsplash.com/photo-1578662000522-df8533d83928?w=400&h=400&fit=crop', // Action figures
            'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=400&fit=crop', // Character figures
        ],
        'manga': [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', // Books/manga
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', // Library books
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', // Comic books
            'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', // Reading books
        ],
        'peluches': [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', // Cute teddy bear
            'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop', // Plush toys
            'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=400&fit=crop', // Stuffed animals
            'https://images.unsplash.com/photo-1564583138697-34f7b71c2195?w=400&h=400&fit=crop', // Kawaii plushies
        ],
        'videojuegos': [
            'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=400&fit=crop', // Gaming controller
            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=400&fit=crop', // Video games
            'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=400&fit=crop', // Gaming setup
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=400&fit=crop', // Console gaming
        ],
        'ropa': [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', // T-shirts
            'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop', // Clothing rack
            'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop', // Fashion clothing
            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop', // Casual wear
        ],
        'cartas': [
            'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop', // Trading cards
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Card games
            'https://images.unsplash.com/photo-1541692641319-981cc79ee10e?w=400&h=400&fit=crop', // Playing cards
            'https://images.unsplash.com/photo-1607734834519-d8576ae60ea4?w=400&h=400&fit=crop', // Collectible cards
        ]
    };

    // カテゴリーに対応する画像配列を取得
    const images = categoryImages[product.category] || categoryImages['figuras'];
    
    // 商品IDに基づいて画像をランダムに選択（一貫性を保つため）
    const imageIndex = parseInt(product.id.replace(/\D/g, '')) % images.length;
    return images[imageIndex];
}

// グローバルスコープで利用可能にする
window.getCategoryImageUrl = getCategoryImageUrl;

/**
 * 商品カードコンポーネントを作成する関数
 */
function createProductCardComponent(product, relativePath = '') {
    try {
        const detailPath = `${relativePath}products/product-detail.html?id=${product.id}`;
        // カテゴリーに応じた適切な画像を取得
        const imagePath = getCategoryImageUrl(product, '300x300');
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-image-container">
                    <img src="${imagePath}" alt="${product.name}" class="product-image" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                    <a href="${detailPath}" class="btn">Ver Detalles</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating product card component:', error, product);
        return `<div class="product-card error">Error loading product</div>`;
    }
}

/**
 * ブログカードコンポーネントを作成する関数
 */
function createBlogCardComponent(post, relativePath = '') {
    try {
        const detailPath = `${relativePath}blog/blog-detail.html?id=${post.id}`;
        const imagePath = `${relativePath}${post.image.replace('../', '')}`;
        const formattedDate = formatDate(post.date);
        
        return `
            <div class="blog-card" data-id="${post.id}" data-category="${post.category}">
                <div class="blog-image-container">
                    <img src="${imagePath}" alt="${post.title}" class="blog-image" loading="lazy">
                </div>
                <div class="blog-info">
                    <h3>${post.title}</h3>
                    <div class="blog-meta">
                        <span class="blog-date">${formattedDate}</span>
                        <span class="blog-author">Por: ${post.author}</span>
                    </div>
                    <div class="blog-excerpt">${post.excerpt}</div>
                    <a href="${detailPath}" class="btn">Leer Más</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating blog card component:', error, post);
        return `<div class="blog-card error">Error loading blog post</div>`;
    }
}

/**
 * お客様の声カードコンポーネントを作成する関数
 */
function createTestimonialCardComponent(testimonial) {
    try {
        const avatarPath = testimonial.avatar || 'assets/images/ui/avatars/default-avatar.jpg';
        
        return `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"${testimonial.content}"</p>
                </div>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">
                        <img src="${avatarPath}" alt="${testimonial.name}" loading="lazy">
                    </div>
                    <div class="testimonial-author-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.location}</p>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating testimonial card component:', error, testimonial);
        return `<div class="testimonial-card error">Error loading testimonial</div>`;
    }
}

/* === MAIN APPLICATION LOGIC === */

/**
 * サイトデータを読み込む関数
 */
async function loadSiteData() {
    try {
        const pathPrefix = getPathPrefix();
        const dataPath = `${pathPrefix}data/data.json`;
        
        const data = await fetchData(dataPath);
        window.siteData = data;
        
        return window.siteData;
    } catch (error) {
        console.error('サイトデータの読み込みに失敗しました:', error);
        return window.siteData;
    }
}

/**
 * カレントディレクトリに基づいてパスのプレフィックスを取得する関数
 */
function getPathPrefix() {
    const path = window.location.pathname;
    if (path.includes('/products/') || path.includes('/blog/')) {
        return '../';
    }
    return '';
}

/**
 * スクロールアニメーションをセットアップする関数
 */
function setupScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    
    const animatedElements = document.querySelectorAll('.fade-in, .scale-in, .slide-from-left, .slide-from-right, .category-card, .product-card, .blog-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * 言語切り替え機能をセットアップする関数
 */
function setupLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.dataset.lang;
            
            // アクティブボタンの更新
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // 言語表示の更新
            document.body.classList.remove('es', 'ja');
            document.body.classList.add(lang);
            
            // ローカルストレージに保存
            saveToLocalStorage('site_language', lang);
        });
    });
    
    // 初期言語設定
    const savedLanguage = getFromLocalStorage('site_language', 'es');
    document.body.classList.add(savedLanguage);
    
    const activeButton = document.querySelector(`[data-lang="${savedLanguage}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// グローバルに公開
window.app = {
    fetchData,
    filterItems,
    sortItems,
    paginateItems,
    getUrlParam,
    formatCurrency,
    formatDate,
    saveToLocalStorage,
    getFromLocalStorage,
    setupLazyLoading,
    debounce,
    getCurrentPath,
    getRelativePath,
    loadHeader,
    loadFooter,
    createProductCardComponent,
    createBlogCardComponent,
    createTestimonialCardComponent,
    loadSiteData,
    getPathPrefix,
    setupScrollAnimations,
    setupLanguageSwitcher
};

// DOMロード時に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('App initialized');
    
    // ヘッダーのロード
    const headerPlaceholder = document.querySelector('[data-component="header"]');
    if (headerPlaceholder) {
        loadHeader(headerPlaceholder);
    }
    
    // フッターのロード
    const footerPlaceholder = document.querySelector('[data-component="footer"]');
    if (footerPlaceholder) {
        loadFooter(footerPlaceholder);
    }
    
    // サイトデータを読み込む
    await loadSiteData();
    
    // 画像の遅延読み込みをセットアップ
    setupLazyLoading();
    
    // スクロールアニメーションをセットアップ
    setupScrollAnimations();
    
    // 言語切り替えをセットアップ
    setupLanguageSwitcher();
});