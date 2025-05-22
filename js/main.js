// メインJavaScript - 統合最適化版

// サイト全体のデータとキャッシュ
window.siteData = {
    products: [],
    posts: [],
    testimonials: [],
    categories: []
};

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded in main.js');
    
    // パフォーマンス計測開始
    if (window.utils) window.utils.log('Performance measurement started');
    const startTime = performance.now();
    
    // サイトデータを読み込む
    await window.utils.measureAsyncPerformance('Site data loading', loadSiteData);
    
    // 共通コンポーネントを初期化
    initializeCommonComponents();
    
    // 言語切り替えイベントをセットアップ
    setupLanguageSwitcher();
    
    // スクロールアニメーションをセットアップ
    setupScrollAnimations();
    
    // 画像の最適化
    optimizeImages();
    
    // トップページのカテゴリー表示
    const categoryGrid = document.querySelector('.category-grid');
    if (categoryGrid) {
        window.utils.measurePerformance('Categories rendering', loadCategories, categoryGrid);
    }
    
    // お客様の声の表示
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (testimonialSlider) {
        window.utils.measurePerformance('Testimonials rendering', loadTestimonials, testimonialSlider);
    }
    
    // 特集商品の表示
    const featuredProductsContainer = document.getElementById('featured-products');
    if (featuredProductsContainer) {
        window.utils.measurePerformance('Featured products rendering', loadFeaturedProducts, featuredProductsContainer);
    }
    
    // パフォーマンス計測終了
    const endTime = performance.now();
    window.utils.log(`Total initialization time: ${(endTime - startTime).toFixed(2)}ms`);
    
    // カスタムアニメーション初期化
    setupScrollAnimations();
    enhanceCardEffects();
    enhanceButtonEffects();
    setupSmoothScrolling();
    enhanceLanguageSwitcher();
});

/**
 * サイトデータを読み込む関数
 */
async function loadSiteData() {
    try {
        // パス設定
        const pathPrefix = getPathPrefix();
        const dataPath = `${pathPrefix}data/data.json`;
        
        // ローカルストレージからキャッシュを確認
        const cachedData = window.utils ? window.utils.getFromLocalStorage('site_data') : null;
        const cacheTime = window.utils ? window.utils.getFromLocalStorage('site_data_timestamp') : null;
        const now = new Date().getTime();
        
        // キャッシュが有効期限内なら使用（60分）
        const cacheValid = cachedData && cacheTime && (now - cacheTime < 60 * 60 * 1000);
        if (cacheValid) {
            console.log('Using cached site data');
            window.siteData = cachedData;
            
            // 先行してDOMを更新してからバックグラウンドで最新データを取得
            setTimeout(() => refreshDataInBackground(dataPath, now), 3000);
            
            return window.siteData;
        }
        
        // キャッシュがない、または期限切れの場合は取得
        console.log('Fetching site data from:', dataPath);
        const data = await fetchDataWithRetry(dataPath);
        
        // データを保存
        window.siteData = data;
        
        // キャッシュに保存
        if (window.utils) {
            window.utils.saveToLocalStorage('site_data', window.siteData);
            window.utils.saveToLocalStorage('site_data_timestamp', now);
        }
        
        // 主要商品画像をプリロード
        if (window.utils && window.siteData.products) {
            const featuredProducts = window.siteData.products.filter(p => p.featured).slice(0, 4);
            const imagesToPreload = featuredProducts.map(p => p.image);
            window.utils.preloadImages(imagesToPreload);
        }
        
        console.log('Site data loaded successfully');
        return window.siteData;
    } catch (error) {
        console.error('サイトデータの読み込みに失敗しました:', error);
        
        // エラー時に個別のデータを読み込む試行
        await loadFallbackData();
        
        return window.siteData;
    }
}

/**
 * バックグラウンドでデータをリフレッシュする関数
 */
async function refreshDataInBackground(dataPath, timestamp) {
    try {
        const data = await window.utils.fetchData(dataPath);
        window.siteData = data;
        window.utils.saveToLocalStorage('site_data', data);
        window.utils.saveToLocalStorage('site_data_timestamp', timestamp);
        window.utils.log('Background data refresh completed');
    } catch (error) {
        window.utils.log('Background data refresh failed:', error);
    }
}

/**
 * リトライ付きのデータ取得関数
 */
async function fetchDataWithRetry(url, retries = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            return await window.utils.fetchData(url);
        } catch (error) {
            console.warn(`Fetch attempt ${i + 1} failed, retrying...`);
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5; // 次のリトライまでの待機時間を増やす
        }
    }
    
    throw lastError;
}

/**
 * フォールバックデータを読み込む関数（個別のJSONから読み込み）
 */
async function loadFallbackData() {
    const pathPrefix = getPathPrefix();
    
    try {
        // 商品データ
        try {
            const productsData = await window.utils.fetchData(`${pathPrefix}data/products.json`);
            window.siteData.products = productsData.products || [];
        } catch (e) {
            console.error('Failed to load products:', e);
            window.siteData.products = [];
        }
        
        // ブログ記事データ
        try {
            const postsData = await window.utils.fetchData(`${pathPrefix}data/blog-posts.json`);
            window.siteData.posts = postsData.posts || [];
        } catch (e) {
            console.error('Failed to load blog posts:', e);
            window.siteData.posts = [];
        }
        
        // お客様の声データ
        try {
            const testimonialsData = await window.utils.fetchData(`${pathPrefix}data/testimonials.json`);
            window.siteData.testimonials = testimonialsData.testimonials || [];
        } catch (e) {
            console.error('Failed to load testimonials:', e);
            window.siteData.testimonials = [];
        }
        
        // カテゴリデータは商品データから抽出
        window.siteData.categories = extractCategories(window.siteData.products);
        
        console.log('Fallback data loaded');
    } catch (error) {
        console.error('Failed to load fallback data:', error);
    }
}

/**
 * 商品データからカテゴリを抽出する関数
 */
function extractCategories(products) {
    if (!products || products.length === 0) return [];
    
    const categoryMap = {
        'figuras': { slug: 'figuras', name: 'Figuras de Anime', image: 'assets/images/categories/figuras.jpg' },
        'manga': { slug: 'manga', name: 'Manga', image: 'assets/images/categories/manga.jpg' },
        'peluches': { slug: 'peluches', name: 'Peluches', image: 'assets/images/categories/peluches.jpg' },
        'videojuegos': { slug: 'videojuegos', name: 'Videojuegos', image: 'assets/images/categories/videojuegos.jpg' },
        'ropa': { slug: 'ropa', name: 'Ropa y Accesorios', image: 'assets/images/categories/ropa.jpg' },
        'cartas': { slug: 'cartas', name: 'Cartas Coleccionables', image: 'assets/images/categories/cartas.jpg' },
        'comida': { slug: 'comida', name: 'Comida Japonesa', image: 'assets/images/categories/comida.jpg' }
    };
    
    // 商品から使用されているカテゴリのみを抽出
    const usedCategories = new Set(products.map(p => p.category));
    return Object.values(categoryMap).filter(cat => usedCategories.has(cat.slug));
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
 * 共通コンポーネントを初期化する関数
 */
function initializeCommonComponents() {
    // ヘッダー検索フィールドの初期化
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            if (searchInput && searchInput.value.trim()) {
                const pathPrefix = getPathPrefix();
                window.location.href = `${pathPrefix}products/index.html?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
    
    // モバイルメニューの初期化
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // 「トップに戻る」ボタンの追加
    addBackToTopButton();
}

/**
 * 「トップに戻る」ボタンを追加する関数
 */
function addBackToTopButton() {
    // 既存のボタンがあれば何もしない
    if (document.getElementById('back-to-top')) return;
    
    // ボタン要素を作成
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTopButton);
    
    // スクロールイベントリスナー
    window.addEventListener('scroll', window.utils.debounce(function() {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    }, 100));
    
    // クリックイベントリスナー
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // スタイルを追加
    if (!document.getElementById('back-to-top-style')) {
        const style = document.createElement('style');
        style.id = 'back-to-top-style';
        style.textContent = `
            #back-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: var(--primary-color);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
                z-index: 999;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            #back-to-top.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            #back-to-top:hover {
                background-color: var(--secondary-color);
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 言語切り替え機能をセットアップする関数
 */
function setupLanguageSwitcher() {
    const languageSwitcher = document.getElementById('language-switcher');
    if (!languageSwitcher) return;
    
    // 初期言語を設定（ローカルストレージまたはブラウザの言語から）
    const savedLanguage = window.utils.getFromLocalStorage('site_language');
    let currentLanguage = savedLanguage || (navigator.language.startsWith('ja') ? 'ja' : 'es');
    
    // 言語表示を更新
    updateLanguageDisplay(currentLanguage);
    
    // 言語切り替えイベント
    languageSwitcher.addEventListener('click', function() {
        currentLanguage = currentLanguage === 'es' ? 'ja' : 'es';
        updateLanguageDisplay(currentLanguage);
        window.utils.saveToLocalStorage('site_language', currentLanguage);
        
        // 言語切り替えイベントを発火
        const event = new CustomEvent('languageChanged', { detail: { language: currentLanguage } });
        document.dispatchEvent(event);
    });
    
    // 初期言語に応じたテキスト表示
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: currentLanguage } 
    }));
}

/**
 * 言語表示を更新する関数
 */
function updateLanguageDisplay(language) {
    document.body.classList.remove('es', 'ja');
    document.body.classList.add(language);
    
    const languageSwitch = document.getElementById('language-switcher');
    if (languageSwitch) {
        languageSwitch.textContent = language === 'es' ? '日本語' : 'Español';
    }
}

/**
 * Apple風のスクロールアニメーションをセットアップする関数
 * より洗練されたアニメーション効果を提供
 */
function setupScrollAnimations() {
    // IntersectionObserverが利用可能な場合のみ実行
    if (!('IntersectionObserver' in window)) return;
    
    // アニメーション対象の要素を選択
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .scale-in, .slide-from-left, .slide-from-right, .category-card, .product-card, .blog-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // クラス名に基づいて異なるアニメーション効果を適用
                if (entry.target.classList.contains('fade-up')) {
                    entry.target.classList.add('visible');
                } else if (entry.target.classList.contains('fade-in') || 
                           entry.target.classList.contains('product-card') || 
                           entry.target.classList.contains('blog-card') || 
                           entry.target.classList.contains('category-card')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    
                    // 遅延を追加して段階的にアニメーション
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                } else if (entry.target.classList.contains('scale-in')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'scale(0.9)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }, 100);
                } else if (entry.target.classList.contains('slide-from-left')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateX(-30px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }, 100);
                } else if (entry.target.classList.contains('slide-from-right')) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateX(30px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }, 100);
                }
                
                // 監視を解除
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // 要素の監視を開始
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // パララックス効果を追加
    setupParallaxEffect();
}

/**
 * パララックス効果を追加
 * Apple風の微妙なスクロール効果
 */
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    });
    
    // ヘッダーのスクロール効果
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * カードのホバーエフェクト強化
 */
function enhanceCardEffects() {
    const cards = document.querySelectorAll('.product-card, .blog-card, .category-card');
    
    cards.forEach(card => {
        card.classList.add('card-hover-effect');
        
        // マウスムーブエフェクトを追加（軽微な3D効果）
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPercent = (x / rect.width - 0.5) * 5; // -2.5° to 2.5°
            const yPercent = (y / rect.height - 0.5) * 5; // -2.5° to 2.5°
            
            card.style.transform = `perspective(1000px) rotateX(${-yPercent}deg) rotateY(${xPercent}deg) translateY(-5px)`;
        });
        
        // マウスアウト時に元に戻す
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

/**
 * ボタンのインタラクション強化
 */
function enhanceButtonEffects() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // タッチエフェクト
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', () => {
            button.style.transform = '';
        });
    });
}

/**
 * スムーズスクロール機能
 */
function setupSmoothScrolling() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 言語切り替えのエフェクト改善
 */
function enhanceLanguageSwitcher() {
    const languageButtons = document.querySelectorAll('.lang-btn');
    
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // アクティブなボタンの更新
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            button.classList.add('active');
            
            // フェードエフェクトを追加
            document.body.style.opacity = '0.8';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 300);
        });
    });
}

/**
 * スクロールアニメーションをセットアップする関数
 */
function setupScrollAnimations() {
    // IntersectionObserverが利用可能な場合のみ
    if (!('IntersectionObserver' in window)) return;
    
    // アニメーション対象の要素
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .zoom-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * 画像を最適化する関数
 */
function optimizeImages() {
    // Lazy Loading
    window.utils.setupLazyLoading();
    
    // エラーハンドリング
    window.utils.handleImageErrors();
    
    // 画像のレスポンシブ化（必要に応じてsrcsetを設定）
    setupResponsiveImages();
}

/**
 * レスポンシブ画像を設定する関数
 */
function setupResponsiveImages() {
    const productImages = document.querySelectorAll('.product-card-image img, .product-detail-image img');
    
    productImages.forEach(img => {
        if (!img.hasAttribute('srcset') && img.src) {
            const src = img.src;
            const extension = src.split('.').pop();
            const basePath = src.substring(0, src.lastIndexOf('.'));
            
            // srcsetとsizesを設定
            img.srcset = `${basePath}-sm.${extension} 400w, ${basePath}.${extension} 800w`;
            img.sizes = '(max-width: 768px) 400px, 800px';
        }
    });
}

/**
 * カテゴリーを表示する関数
 */
function loadCategories(container) {
    if (!container || !window.siteData.categories || window.siteData.categories.length === 0) return;
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // 相対パス
    const relativePath = getPathPrefix();
    
    // クラスがないならアニメーション用クラスを追加
    if (!container.classList.contains('fade-in') && !container.classList.contains('slide-in')) {
        container.classList.add('fade-in');
    }
    
    // カテゴリーカードを追加
    window.siteData.categories.forEach((category, index) => {
        // 遅延表示用のスタイルを追加
        const delay = index * 0.1;
        const categoryCard = window.createCategoryCardComponent(category, relativePath);
        
        // カードにスタイルを適用
        const div = document.createElement('div');
        div.innerHTML = categoryCard;
        const card = div.firstElementChild;
        card.style.animationDelay = `${delay}s`;
        
        container.appendChild(card);
    });
}

/**
 * お客様の声を表示する関数
 */
function loadTestimonials(container, count = 3) {
    if (!container || !window.siteData.testimonials || window.siteData.testimonials.length === 0) return;
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // 最高評価順に並べ替え
    const sortedTestimonials = window.utils.sortItems(window.siteData.testimonials, 'rating', 'desc');
    
    // 表示するお客様の声の数を制限
    const testimonialsToShow = sortedTestimonials.slice(0, count);
    
    // クラスがないならアニメーション用クラスを追加
    if (!container.classList.contains('fade-in') && !container.classList.contains('slide-in')) {
        container.classList.add('slide-in');
    }
    
    // お客様の声カードを追加
    testimonialsToShow.forEach((testimonial, index) => {
        // 遅延表示用のスタイルを追加
        const delay = index * 0.2;
        const testimonialCard = window.createTestimonialCardComponent(testimonial);
        
        // カードにスタイルを適用
        const div = document.createElement('div');
        div.innerHTML = testimonialCard;
        const card = div.firstElementChild;
        card.style.animationDelay = `${delay}s`;
        
        container.appendChild(card);
    });
}

/**
 * 特集商品を表示する関数
 */
function loadFeaturedProducts(container, count = 4) {
    if (!container || !window.siteData.products || window.siteData.products.length === 0) return;
    
    // コンテナをクリア
    container.innerHTML = '<h2>Productos Destacados</h2><div class="product-grid"></div>';
    
    const productGrid = container.querySelector('.product-grid');
    if (!productGrid) return;
    
    // 特集商品をフィルタリング
    const featuredProducts = window.siteData.products.filter(product => product.featured);
    
    // 表示する商品の数を制限
    const productsToShow = featuredProducts.slice(0, count);
    
    // クラスがないならアニメーション用クラスを追加
    if (!productGrid.classList.contains('fade-in') && !productGrid.classList.contains('slide-in')) {
        productGrid.classList.add('fade-in');
    }
    
    // 相対パス
    const relativePath = getPathPrefix();
    
    // 商品カードを追加
    if (productsToShow.length > 0) {
        productsToShow.forEach((product, index) => {
            // 遅延表示用のスタイルを追加
            const delay = index * 0.1;
            const productCard = window.createProductCardComponent(product, relativePath);
            
            // カードにスタイルを適用
            const div = document.createElement('div');
            div.innerHTML = productCard;
            const card = div.firstElementChild;
            card.style.animationDelay = `${delay}s`;
            
            productGrid.appendChild(card);
        });
    } else {
        productGrid.innerHTML = '<p>No hay productos destacados disponibles.</p>';
    }
}
