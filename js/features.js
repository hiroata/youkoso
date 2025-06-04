// Products.js - 商品ページとデータ管理

class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.filteredProducts = [];
        this.currentFilters = {
            category: 'all',
            search: '',
            minPrice: 0,
            maxPrice: Infinity,
            featured: false
        };
        this.currentSort = 'name';
        this.currentPage = 1;
        this.productsPerPage = 12;
        this.isLoading = false;
    }

    // 初期化
    async init() {
        try {
            this.isLoading = true;
            this.showLoading();

            // データを並列で取得
            const [products, categories] = await Promise.all([
                window.utils.dataLoader.loadData('products'),
                window.utils.dataLoader.loadData('categories')
            ]);

            this.products = products;
            this.categories = categories;
            this.filteredProducts = [...this.products];

            this.renderProducts();
            this.setupEventListeners();
            this.hideLoading();

            console.log(`Loaded ${this.products.length} products and ${this.categories.length} categories`);
        } catch (error) {
            console.error('Failed to initialize products:', error);
            // エラー通知は無効化
        } finally {
            this.isLoading = false;
        }
    }

    // ローディング表示
    showLoading() {
        const container = document.querySelector('.products-grid');
        if (container) {
            container.innerHTML = window.createLoadingComponent('商品を読み込み中...');
        }
    }

    // ローディング非表示
    hideLoading() {
        const container = document.querySelector('.products-grid');
        if (container) {
            const loading = container.querySelector('.loading-container');
            if (loading) {
                loading.remove();
            }
        }
    }

    // エラー表示 (無効化)
    showError(message) {
        // エラーはコンソールのみに表示
        console.error('Product Error:', message);
    }

    // 商品を表示
    renderProducts() {
        const container = document.querySelector('.products-grid');
        if (!container) return;

        if (this.filteredProducts.length === 0) {
            container.innerHTML = window.createEmptyStateComponent(
                '条件に一致する商品が見つかりません',
                'フィルターを調整してみてください'
            );
            return;
        }

        // ページング計算
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        // 商品カードを生成
        const productsHTML = productsToShow.map(product => 
            window.createProductCardComponent(product)
        ).join('');

        container.innerHTML = productsHTML;

        // ページネーション更新
        this.renderPagination();

        // 画像遅延読み込み設定
        window.utils.setupLazyLoading();
    }

    // ページネーション表示
    renderPagination() {
        const container = document.querySelector('.pagination-container');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        const paginationHTML = window.createPaginationComponent(this.currentPage, totalPages);
        
        container.innerHTML = paginationHTML;

        // ページネーションのイベントリスナー設定
        container.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.getAttribute('data-page'));
                this.changePage(page);
            });
        });
    }

    // フィルター設定
    setupFilters() {
        // カテゴリフィルター
        const categoryContainer = document.querySelector('.category-filter-container');
        if (categoryContainer) {
            categoryContainer.innerHTML = window.createCategoryFilterComponent(
                this.categories, 
                this.currentFilters.category
            );

            categoryContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    const category = e.target.getAttribute('data-category');
                    this.applyFilter('category', category);
                }
            });
        }

        // 価格フィルター
        const priceContainer = document.querySelector('.price-filter-container');
        if (priceContainer) {
            priceContainer.innerHTML = window.createPriceFilterComponent(
                this.currentFilters.minPrice,
                this.currentFilters.maxPrice === Infinity ? 10000 : this.currentFilters.maxPrice
            );

            const applyBtn = priceContainer.querySelector('.apply-filter-btn');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    const minPrice = parseInt(document.getElementById('min-price').value) || 0;
                    const maxPrice = parseInt(document.getElementById('max-price').value) || Infinity;
                    this.applyPriceFilter(minPrice, maxPrice);
                });
            }
        }

        // 検索バー
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.innerHTML = window.createSearchBarComponent();

            const searchInput = document.getElementById('search-input');
            const searchBtn = document.getElementById('search-btn');

            if (searchInput && searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.applyFilter('search', searchInput.value);
                });

                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.applyFilter('search', searchInput.value);
                    }
                });
            }
        }

        // ソート選択
        const sortContainer = document.querySelector('.sort-container');
        if (sortContainer) {
            sortContainer.innerHTML = window.createSortSelectComponent(this.currentSort);

            const sortSelect = document.getElementById('sort-by');
            if (sortSelect) {
                sortSelect.addEventListener('change', (e) => {
                    this.applySort(e.target.value);
                });
            }
        }
    }

    // イベントリスナー設定
    setupEventListeners() {
        // フィルター設定
        this.setupFilters();

        // カートに追加ボタン
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const productId = e.target.getAttribute('data-product-id');
                this.addToCart(productId);
            }
        });

        // 商品カードクリック（詳細ページへ）
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.classList.contains('add-to-cart')) {
                const productId = productCard.getAttribute('data-product-id');
                window.location.href = `product-detail.html?id=${productId}`;
            }
        });
    }

    // フィルター適用
    applyFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.currentPage = 1; // ページを最初にリセット
        this.updateFilteredProducts();
        this.renderProducts();

        // アクティブフィルターの表示更新
        this.updateActiveFilters();
    }

    // 価格フィルター適用
    applyPriceFilter(minPrice, maxPrice) {
        this.currentFilters.minPrice = minPrice;
        this.currentFilters.maxPrice = maxPrice;
        this.currentPage = 1;
        this.updateFilteredProducts();
        this.renderProducts();
        this.updateActiveFilters();
    }

    // ソート適用
    applySort(sortBy) {
        this.currentSort = sortBy;
        this.updateFilteredProducts();
        this.renderProducts();
    }

    // フィルター済み商品更新
    updateFilteredProducts() {
        // フィルタリング
        this.filteredProducts = window.utils.filterProducts(this.products, this.currentFilters);
        
        // ソート
        this.filteredProducts = window.utils.sortProducts(this.filteredProducts, this.currentSort);
    }

    // アクティブフィルター表示更新
    updateActiveFilters() {
        // カテゴリフィルターのアクティブ状態更新
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === this.currentFilters.category) {
                btn.classList.add('active');
            }
        });

        // 結果数表示
        const resultCount = document.querySelector('.result-count');
        if (resultCount) {
            resultCount.textContent = `${this.filteredProducts.length} productos encontrados`;
        }
    }

    // ページ変更
    changePage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // カートに追加
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // カート機能の実装（ローカルストレージまたは状態管理）
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // 通知表示は無効化
            console.log(`${product.name} をカートに追加しました`);

            // カートアイコンの数量更新
            this.updateCartCount();
        }
    }

    // カート数量更新
    updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // 注目商品を取得
    getFeaturedProducts(limit = 6) {
        return this.products.filter(product => product.featured).slice(0, limit);
    }

    // カテゴリ別商品を取得
    getProductsByCategory(categoryId, limit = null) {
        const filtered = this.products.filter(product => product.category === categoryId);
        return limit ? filtered.slice(0, limit) : filtered;
    }

    // 商品検索
    searchProducts(query) {
        return window.utils.filterProducts(this.products, { search: query });
    }
}

// グローバルインスタンス
window.productManager = new ProductManager();

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    // 商品ページの場合のみ初期化
    if (document.querySelector('.products-grid') || 
        document.querySelector('.featured-products') ||
        window.location.pathname.includes('products.html') ||
        window.location.pathname.includes('index.html')) {
        
        try {
            await window.productManager.init();
            
            // カート数量の初期表示
            window.productManager.updateCartCount();
            
        } catch (error) {
            console.error('Failed to initialize product manager:', error);
        }
    }
});

console.log('Products.js loaded successfully');// 翻訳機能用JavaScript - 最適化版

// 言語データ（インメモリでのキャッシュ用）
const translations = {
    es: {},  // スペイン語テキスト（オリジナル）
    ja: {}   // 日本語翻訳
};

// 初期化済みフラグ
let translationInitialized = false;

// 現在の言語
let currentLanguage = 'es';

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in translate.js');
    
    // 翻訳データをロード
    loadTranslationData();
    
    // 言語切り替えボタンのセットアップ
    setupLanguageToggle();
    
    // ローカルストレージから言語設定を復元
    restoreLanguageSettings();
    
    // 言語切り替えイベントのリスナー
    listenForLanguageChangeEvents();
});

/**
 * 翻訳データをロードする関数
 */
async function loadTranslationData() {
    try {
        // ローカルストレージから翻訳データをチェック
        const cachedTranslations = window.utils ? window.utils.getFromLocalStorage('translations_data') : null;
        
        if (cachedTranslations) {
            console.log('Using cached translation data');
            
            // キャッシュデータをロード
            Object.assign(translations, cachedTranslations);
            translationInitialized = true;
            
            // バックグラウンドでデータ更新
            setTimeout(fetchTranslationData, 3000);
            
            return;
        }
        
        // キャッシュがなければデータを取得
        await fetchTranslationData();
        
    } catch (error) {
        console.error('Failed to load translation data:', error);
        
        // フォールバック翻訳を使用
        setupFallbackTranslations();
    }
}

/**
 * 翻訳データをサーバーから取得
 */
async function fetchTranslationData() {
    try {
        const pathPrefix = getPathPrefix();
        const dataPath = `${pathPrefix}data/translations.json`;
        
        console.log('Fetching translation data from:', dataPath);
        
        try {
            // 翻訳ファイルがあればそれを使用
            const data = await window.utils.fetchData(dataPath);
            Object.assign(translations, data);
        } catch (e) {
            console.warn('Translation file not found, using dynamic translation');
            
            // 翻訳ファイルがなければページから動的に生成
            generateTranslationsFromPage();
        }
        
        translationInitialized = true;
        
        // キャッシュに保存
        if (window.utils) {
            window.utils.saveToLocalStorage('translations_data', translations);
        }
        
        // 現在の言語に適用
        if (currentLanguage !== 'es') {
            applyTranslations(currentLanguage);
        }
        
        console.log('Translation data loaded successfully');
    } catch (error) {
        console.error('Failed to fetch translation data:', error);
        setupFallbackTranslations();
    }
}

/**
 * ページから動的に翻訳データを生成する関数
 */
function generateTranslationsFromPage() {
    // ナビゲーションリンク
    translations.ja['Inicio'] = 'ホーム';
    translations.ja['Productos'] = '商品';
    translations.ja['Blog'] = 'ブログ';
    translations.ja['Testimonios'] = 'レビュー';
    translations.ja['Sobre Nosotros'] = '会社概要';
    translations.ja['Contacto'] = 'お問い合わせ';
    
    // ヘッダー/フッター
    translations.ja['Japan to Mexico Export Trading'] = 'Japan to Mexico Export Trading';
    translations.ja['Tienda de Productos Japoneses en México'] = '日本商品専門店（メキシコ）';
    translations.ja['Traemos lo mejor de la cultura japonesa directamente a México desde 2023.'] = '2023年から日本の文化の最高のものをメキシコへ直接お届けしています。';
    
    // フッター
    translations.ja['Enlaces Rápidos'] = 'クイックリンク';
    translations.ja['Síguenos'] = 'フォローする';
    translations.ja['Todos los derechos reservados.'] = '無断複写・転載を禁じます。';
    
    // メインページ
    translations.ja['Productos Populares'] = '人気商品';
    translations.ja['Productos Destacados'] = '注目商品';
    translations.ja['Ver todos'] = 'すべて見る';
    translations.ja['Categorías'] = 'カテゴリー';
    translations.ja['Nuestro Blog'] = 'ブログ記事';
    translations.ja['Leer más'] = '続きを読む';
    translations.ja['Opiniones de Clientes'] = 'お客様の声';
    
    // 商品ページ
    translations.ja['Filtrar por:'] = '絞り込み:';
    translations.ja['Categoría'] = 'カテゴリー';
    translations.ja['Precio'] = '価格';
    translations.ja['Disponibilidad'] = '在庫状況';
    translations.ja['En stock'] = '在庫あり';
    translations.ja['Agotado'] = '在庫なし';
    translations.ja['Ordenar por:'] = '並び替え:';
    translations.ja['Más reciente'] = '新着順';
    translations.ja['Precio: menor a mayor'] = '価格: 安い順';
    translations.ja['Precio: mayor a menor'] = '価格: 高い順';
    translations.ja['Popularidad'] = '人気順';
    translations.ja['Añadir al carrito'] = 'カートに追加';
    translations.ja['Comprar ahora'] = '今すぐ購入';
    
    // カテゴリー名
    translations.ja['Figuras de Anime'] = 'アニメフィギュア';
    translations.ja['Manga'] = '漫画';
    translations.ja['Peluches'] = 'ぬいぐるみ';
    translations.ja['Videojuegos'] = 'ビデオゲーム';
    translations.ja['Ropa y Accesorios'] = '服・アクセサリー';
    translations.ja['Cartas Coleccionables'] = 'トレーディングカード';
    translations.ja['Comida Japonesa'] = '日本食';
    
    console.log('Generated translations from page');
}

/**
 * フォールバック翻訳を設定
 */
function setupFallbackTranslations() {
    // 基本的な翻訳のみを含む
    translations.ja['Inicio'] = 'ホーム';
    translations.ja['Productos'] = '商品';
    translations.ja['Blog'] = 'ブログ';
    translations.ja['Sobre Nosotros'] = '会社概要';
    translations.ja['Japan to Mexico Export Trading'] = 'Japan to Mexico Export Trading';
    
    translationInitialized = true;
    
    // 現在の言語に適用
    if (currentLanguage !== 'es') {
        applyTranslations(currentLanguage);
    }
    
    console.log('Fallback translations set up');
}

/**
 * 言語切り替えボタンのイベントリスナーを設定
 */
function setupLanguageToggle() {
    const languageBtns = document.querySelectorAll('.lang-btn');
    
    if (languageBtns.length === 0) {
        console.log('Language buttons not found, using the language-switcher');
        const languageSwitcher = document.getElementById('language-switcher');
        
        if (languageSwitcher) {
            languageSwitcher.addEventListener('click', function() {
                const newLang = currentLanguage === 'es' ? 'ja' : 'es';
                switchLanguage(newLang);
            });
        }
        return;
    }
    
    // 通常の言語ボタン
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('Changing language to:', lang);
            
            // アクティブクラスを更新
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // 言語を切り替え
            switchLanguage(lang);
        });
    });
}

/**
 * 言語切り替えイベントをリッスン
 */
function listenForLanguageChangeEvents() {
    document.addEventListener('languageChanged', function(e) {
        const lang = e.detail.language;
        console.log('Language change event received:', lang);
        
        if (lang !== currentLanguage) {
            switchLanguage(lang);
        }
    });
}

/**
 * 言語を切り替える関数
 */
function switchLanguage(lang) {
    // 現在と同じ言語なら何もしない
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    console.log(`Switching to ${lang === 'ja' ? 'Japanese' : 'Spanish'}`);
    
    // ボディクラスを更新
    if (lang === 'ja') {
        document.body.classList.add('ja');
    } else {
        document.body.classList.remove('ja');
    }
    
    // 翻訳を適用
    applyTranslations(lang);
    
    // 設定を保存
    if (window.utils) {
        window.utils.saveToLocalStorage('preferredLanguage', lang);
    } else {
        localStorage.setItem('preferredLanguage', lang);
    }
    
    // ページタイトルも更新
    updatePageTitle(lang);
    
    // ヘッダーとフッターも更新されるよう他コンポーネントに通知
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    document.dispatchEvent(event);
}

/**
 * 翻訳を適用
 */
function applyTranslations(lang) {
    if (!translationInitialized) {
        console.log('Translations not initialized yet, will apply later');
        return;
    }
    
    if (lang === 'es') {
        // スペイン語の場合は元に戻すだけ
        translateElementsToSpanish();
    } else {
        // 日本語の場合は翻訳を適用
        translateElementsToJapanese();
    }
}

/**
 * すべての要素を日本語に翻訳
 */
function translateElementsToJapanese() {
    console.log('Translating elements to Japanese');
    
    // 翻訳マップが空ならページから生成
    if (Object.keys(translations.ja).length === 0) {
        generateTranslationsFromPage();
    }
    
    // すべてのテキストノードをチェック
    translateTextNodes(document.body, 'es', 'ja');
    
    // プレースホルダーテキストを翻訳
    translatePlaceholders('es', 'ja');
    
    // ボタンテキストを翻訳
    translateButtonValues('es', 'ja');
}

/**
 * すべての要素をスペイン語に戻す
 */
function translateElementsToSpanish() {
    console.log('Translating elements back to Spanish');
    
    // データ属性から元のテキストを復元
    const translatedElements = document.querySelectorAll('[data-original-text]');
    translatedElements.forEach(el => {
        el.textContent = el.getAttribute('data-original-text');
        el.removeAttribute('data-original-text');
    });
    
    // プレースホルダーを復元
    const translatedPlaceholders = document.querySelectorAll('[data-original-placeholder]');
    translatedPlaceholders.forEach(el => {
        el.setAttribute('placeholder', el.getAttribute('data-original-placeholder'));
        el.removeAttribute('data-original-placeholder');
    });
    
    // ボタン値を復元
    const translatedButtons = document.querySelectorAll('[data-original-value]');
    translatedButtons.forEach(el => {
        el.value = el.getAttribute('data-original-value');
        el.removeAttribute('data-original-value');
    });
}

/**
 * テキストノードを翻訳
 */
function translateTextNodes(element, fromLang, toLang) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodesToTranslate = [];
    let node;
    
    // 最初にすべてのテキストノードを収集
    while ((node = walker.nextNode())) {
        const text = node.nodeValue.trim();
        if (text && translations[toLang][text]) {
            nodesToTranslate.push(node);
        }
    }
    
    // 次に翻訳を適用
    nodesToTranslate.forEach(node => {
        const originalText = node.nodeValue.trim();
        if (translations[toLang][originalText]) {
            // 親要素にオリジナルテキストを保存
            if (node.parentElement && !node.parentElement.hasAttribute('data-original-text')) {
                node.parentElement.setAttribute('data-original-text', originalText);
            }
            
            // テキストを翻訳
            node.nodeValue = node.nodeValue.replace(originalText, translations[toLang][originalText]);
        }
    });
    
    // 子要素にも適用
    for (let i = 0; i < element.children.length; i++) {
        translateTextNodes(element.children[i], fromLang, toLang);
    }
}

/**
 * プレースホルダーを翻訳
 */
function translatePlaceholders(fromLang, toLang) {
    const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    
    inputElements.forEach(el => {
        const originalPlaceholder = el.getAttribute('placeholder');
        
        if (originalPlaceholder && translations[toLang][originalPlaceholder]) {
            // オリジナルプレースホルダーを保存
            if (!el.hasAttribute('data-original-placeholder')) {
                el.setAttribute('data-original-placeholder', originalPlaceholder);
            }
            
            // プレースホルダーを翻訳
            el.setAttribute('placeholder', translations[toLang][originalPlaceholder]);
        }
    });
}

/**
 * ボタン値を翻訳
 */
function translateButtonValues(fromLang, toLang) {
    const buttons = document.querySelectorAll('input[type="submit"], input[type="button"]');
    
    buttons.forEach(btn => {
        const originalValue = btn.value;
        
        if (originalValue && translations[toLang][originalValue]) {
            // オリジナル値を保存
            if (!btn.hasAttribute('data-original-value')) {
                btn.setAttribute('data-original-value', originalValue);
            }
            
            // 値を翻訳
            btn.value = translations[toLang][originalValue];
        }
    });
}

/**
 * ページタイトルを言語に合わせて更新
 */
function updatePageTitle(lang) {
    let title = document.title;
    
    if (lang === 'ja') {
        // スペイン語のタイトルを日本語に変更
        if (title.includes('Japan to Mexico Export Trading')) {
            title = title.replace('Japan to Mexico Export Trading', 'Japan to Mexico Export Trading');
            
            // 一般的なページタイトルの翻訳
            title = title.replace('Tienda de Productos Japoneses en México', '日本商品専門店（メキシコ）');
            title = title.replace('Productos', '商品');
            title = title.replace('Blog', 'ブログ');
            title = title.replace('Sobre Nosotros', '会社概要');
            title = title.replace('Testimonios', 'お客様の声');
        }
    } else {
        // 日本語のタイトルをスペイン語に戻す
        if (title.includes('Japan to Mexico Export Trading')) {
            title = title.replace('Japan to Mexico Export Trading', 'Japan to Mexico Export Trading');
            
            // 一般的なページタイトルの翻訳を戻す
            title = title.replace('日本商品専門店（メキシコ）', 'Tienda de Productos Japoneses en México');
            title = title.replace('商品', 'Productos');
            title = title.replace('ブログ', 'Blog');
            title = title.replace('会社概要', 'Sobre Nosotros');
            title = title.replace('お客様の声', 'Testimonios');
        }
    }
    
    document.title = title;
}

/**
 * ローカルストレージから言語設定を復元
 */
function restoreLanguageSettings() {
    // ローカルストレージから言語設定を取得
    let savedLang;
    
    try {
        if (window.utils) {
            savedLang = window.utils.getFromLocalStorage('preferredLanguage');
        } else {
            const stored = localStorage.getItem('preferredLanguage');
            // JSONとして保存されているかプレーンテキストかを判断
            if (stored) {
                try {
                    savedLang = JSON.parse(stored);
                } catch (e) {
                    // プレーンテキストの場合
                    savedLang = stored;
                }
            }
        }
    } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        savedLang = null;
    }
    
    // 言語設定がない場合はブラウザの言語から判断
    if (!savedLang) {
        const browserLang = navigator.language.toLowerCase();
        savedLang = browserLang.startsWith('ja') ? 'ja' : 'es';
        console.log('Using browser language:', savedLang);
    } else {
        console.log('Restoring saved language:', savedLang);
    }
    
    // ボタンの状態を更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 言語を切り替え
    switchLanguage(savedLang);
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

// ===== ADVANCED FEATURES =====

// Lazy Loading for Images
class LazyImageLoader {
    constructor() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        this.init();
    }
    
    init() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.imageObserver.observe(img));
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (src) {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        }
    }
}

// WebP Support Detection
class WebPSupport {
    static check() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    
    static updateImages() {
        if (this.check()) {
            const images = document.querySelectorAll('img[data-webp]');
            images.forEach(img => {
                img.src = img.dataset.webp;
                img.removeAttribute('data-webp');
            });
        }
    }
}

// Performance Monitoring
class PerformanceMonitor {
    static trackPageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.fetchStart;
            
            console.log(`Page Load Time: ${loadTime}ms`);
            
            // Send to analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_parameter: 'performance'
                });
            }
        });
    }
    
    static trackCLS() {
        let cls = 0;
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    cls += entry.value;
                }
            }
            console.log('Cumulative Layout Shift:', cls);
        }).observe({type: 'layout-shift', buffered: true});
    }
}

// Enhanced Search Functionality
class AdvancedSearch {
    constructor() {
        this.searchData = [];
        this.searchIndex = new Map();
        this.init();
    }
    
    async init() {
        await this.buildSearchIndex();
        this.setupSearchUI();
    }
    
    async buildSearchIndex() {
        try {
            const response = await fetch('data/data.json');
            const data = await response.json();
            
            // Index products
            data.products?.forEach(product => {
                const searchTerms = [
                    product.name,
                    product.description,
                    ...product.tags
                ].join(' ').toLowerCase();
                
                this.searchIndex.set(product.id, {
                    type: 'product',
                    data: product,
                    searchTerms
                });
            });
            
            // Index blog posts
            data.blog?.forEach(post => {
                const searchTerms = [
                    post.title.es,
                    post.title.ja,
                    post.excerpt.es,
                    post.excerpt.ja,
                    ...post.tags
                ].join(' ').toLowerCase();
                
                this.searchIndex.set(post.id, {
                    type: 'blog',
                    data: post,
                    searchTerms
                });
            });
            
        } catch (error) {
            console.error('Error building search index:', error);
        }
    }
    
    search(query) {
        const normalizedQuery = query.toLowerCase().trim();
        const results = [];
        
        for (const [id, item] of this.searchIndex) {
            if (item.searchTerms.includes(normalizedQuery)) {
                results.push(item);
            }
        }
        
        return results.sort((a, b) => {
            const aScore = this.calculateRelevanceScore(a.searchTerms, normalizedQuery);
            const bScore = this.calculateRelevanceScore(b.searchTerms, normalizedQuery);
            return bScore - aScore;
        });
    }
    
    calculateRelevanceScore(text, query) {
        const matches = (text.match(new RegExp(query, 'gi')) || []).length;
        const titleMatch = text.toLowerCase().startsWith(query) ? 10 : 0;
        return matches + titleMatch;
    }
    
    setupSearchUI() {
        const searchInput = document.querySelector('#global-search');
        if (!searchInput) return;
        
        const resultsContainer = this.createResultsContainer();
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.displayResults(this.search(e.target.value), resultsContainer);
            }, 300);
        });
        
        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }
    
    createResultsContainer() {
        const container = document.createElement('div');
        container.className = 'search-results-dropdown';
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        const searchContainer = document.querySelector('#global-search')?.parentElement;
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(container);
        }
        
        return container;
    }
    
    displayResults(results, container) {
        if (results.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = results.slice(0, 8).map(result => {
            if (result.type === 'product') {
                return this.createProductResult(result.data);
            } else {
                return this.createBlogResult(result.data);
            }
        }).join('');
        
        container.style.display = 'block';
    }
    
    createProductResult(product) {
        return `
            <div class="search-result-item" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <div>
                    <strong>${product.name}</strong>
                    <div style="color: #666; font-size: 0.9em;">$${product.price} MXN</div>
                </div>
            </div>
        `;
    }
    
    createBlogResult(post) {
        const currentLang = document.documentElement.getAttribute('data-lang') || 'es';
        const title = post.title[currentLang] || post.title.es;
        
        return `
            <div class="search-result-item" onclick="window.location.href='blog${post.id}.html'">
                <img src="${post.image}" alt="${title}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                <div>
                    <strong>${title}</strong>
                    <div style="color: #666; font-size: 0.9em;">Blog • ${post.author}</div>
                </div>
            </div>
        `;
    }
}

// PWA Support
class PWAManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
    
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
        });
    }
    
    showInstallButton() {
        // Create install button if it doesn't exist
        if (document.querySelector('#install-btn')) return;
        
        const installBtn = document.createElement('button');
        installBtn.id = 'install-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        installBtn.className = 'btn btn-primary install-prompt';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            border-radius: 50px;
            padding: 12px 20px;
            font-size: 0.9rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(installBtn);
        
        installBtn.addEventListener('click', () => {
            this.installPWA();
        });
    }
    
    hideInstallButton() {
        const installBtn = document.querySelector('#install-btn');
        if (installBtn) {
            installBtn.remove();
        }
    }
    
    async installPWA() {
        const deferredPrompt = this.deferredPrompt;
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            this.deferredPrompt = null;
            this.hideInstallButton();
        }
    }
}

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    new LazyImageLoader();
    
    // Check WebP support
    WebPSupport.updateImages();
    
    // Initialize performance monitoring
    PerformanceMonitor.trackPageLoad();
    PerformanceMonitor.trackCLS();
    
    // Initialize advanced search
    new AdvancedSearch();
    
    // Initialize PWA features
    new PWAManager();
});

console.log('Advanced features loaded successfully');// アクセシビリティ強化機能 - WCAG 2.1 AA準拠

class AccessibilityManager {
    constructor() {
        this.settings = {
            fontSize: 'normal', // small, normal, large, xlarge
            contrast: 'normal', // normal, high, dark_high
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true,
            colorBlindness: 'none', // none, protanopia, deuteranopia, tritanopia
            language: 'auto',
            announcements: true,
            focusVisible: true
        };
        
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])'
        ].join(', ');
        
        this.isMenuOpen = false;
        this.lastFocused = null;
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.createAccessibilityPanel();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotionSupport();
        this.addAccessibilityStyles();
        this.checkSystemPreferences();
    }
    
    // 設定を読み込む
    loadSettings() {
        if (window.utils) {
            this.settings = { ...this.settings, ...window.utils.getFromLocalStorage('accessibility_settings', {}) };
        } else {
            try {
                const saved = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
                this.settings = { ...this.settings, ...saved };
            } catch (e) {
                console.warn('Failed to load accessibility settings');
            }
        }
        
        this.applySettings();
    }
    
    // 設定を保存
    saveSettings() {
        if (window.utils) {
            window.utils.saveToLocalStorage('accessibility_settings', this.settings);
        } else {
            try {
                localStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
            } catch (e) {
                console.warn('Failed to save accessibility settings');
            }
        }
    }
    
    // アクセシビリティパネルを作成
    createAccessibilityPanel() {
        // 既存のパネルがあるかチェック
        if (document.getElementById('accessibility-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'accessibility-title');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = `
            <div class="accessibility-content">
                <header class="accessibility-header">
                    <h2 id="accessibility-title">
                        <span class="es-text">Opciones de Accesibilidad</span>
                        <span class="ja-text">アクセシビリティ設定</span>
                    </h2>
                    <button class="accessibility-close" aria-label="Cerrar panel" id="accessibility-close">×</button>
                </header>
                
                <div class="accessibility-body">
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Tamaño de Texto</span>
                            <span class="ja-text">文字サイズ</span>
                        </h3>
                        <div class="accessibility-buttons">
                            <button class="accessibility-btn" data-action="fontSize" data-value="small">
                                <span class="es-text">Pequeño</span>
                                <span class="ja-text">小</span>
                            </button>
                            <button class="accessibility-btn active" data-action="fontSize" data-value="normal">
                                <span class="es-text">Normal</span>
                                <span class="ja-text">中</span>
                            </button>
                            <button class="accessibility-btn" data-action="fontSize" data-value="large">
                                <span class="es-text">Grande</span>
                                <span class="ja-text">大</span>
                            </button>
                            <button class="accessibility-btn" data-action="fontSize" data-value="xlarge">
                                <span class="es-text">Extra Grande</span>
                                <span class="ja-text">特大</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Contraste</span>
                            <span class="ja-text">コントラスト</span>
                        </h3>
                        <div class="accessibility-buttons">
                            <button class="accessibility-btn active" data-action="contrast" data-value="normal">
                                <span class="es-text">Normal</span>
                                <span class="ja-text">標準</span>
                            </button>
                            <button class="accessibility-btn" data-action="contrast" data-value="high">
                                <span class="es-text">Alto Contraste</span>
                                <span class="ja-text">高コントラスト</span>
                            </button>
                            <button class="accessibility-btn" data-action="contrast" data-value="dark">
                                <span class="es-text">Modo Oscuro</span>
                                <span class="ja-text">ダークモード</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Animaciones</span>
                            <span class="ja-text">アニメーション</span>
                        </h3>
                        <label class="accessibility-toggle">
                            <input type="checkbox" id="reduce-motion" ${this.settings.reducedMotion ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <span class="es-text">Reducir Animaciones</span>
                                <span class="ja-text">アニメーションを減らす</span>
                            </span>
                        </label>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Navegación</span>
                            <span class="ja-text">ナビゲーション</span>
                        </h3>
                        <label class="accessibility-toggle">
                            <input type="checkbox" id="keyboard-navigation" ${this.settings.keyboardNavigation ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <span class="es-text">Navegación por Teclado Mejorada</span>
                                <span class="ja-text">キーボードナビゲーション強化</span>
                            </span>
                        </label>
                    </div>
                    
                    <div class="accessibility-actions">
                        <button class="btn btn-outline" id="accessibility-reset">
                            <span class="es-text">Restablecer</span>
                            <span class="ja-text">リセット</span>
                        </button>
                        <button class="btn" id="accessibility-apply">
                            <span class="es-text">Aplicar</span>
                            <span class="ja-text">適用</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // アクセシビリティボタンを作成
        this.createAccessibilityButton();
        
        // イベントリスナーを設定
        this.setupPanelEventListeners();
        
        // 初期状態を設定
        this.updatePanelState();
    }
    
    // アクセシビリティボタンを作成
    createAccessibilityButton() {
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle-btn';
        button.setAttribute('aria-label', 'Abrir opciones de accesibilidad');
        button.innerHTML = '♿';
        button.title = 'Opciones de Accesibilidad';
        
        document.body.appendChild(button);
        
        button.addEventListener('click', () => {
            this.togglePanel();
        });
    }
    
    // パネルのイベントリスナーを設定
    setupPanelEventListeners() {
        const panel = document.getElementById('accessibility-panel');
        
        // 閉じるボタン
        panel.querySelector('#accessibility-close').addEventListener('click', () => {
            this.closePanel();
        });
        
        // 設定ボタン
        panel.querySelectorAll('.accessibility-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const value = e.target.dataset.value;
                this.updateSetting(action, value);
                this.updateButtonStates(action, value);
            });
        });
        
        // トグルスイッチ
        panel.querySelector('#reduce-motion').addEventListener('change', (e) => {
            this.updateSetting('reducedMotion', e.target.checked);
        });
        
        panel.querySelector('#keyboard-navigation').addEventListener('change', (e) => {
            this.updateSetting('keyboardNavigation', e.target.checked);
        });
        
        // アクションボタン
        panel.querySelector('#accessibility-reset').addEventListener('click', () => {
            this.resetSettings();
        });
        
        panel.querySelector('#accessibility-apply').addEventListener('click', () => {
            this.applySettings();
            this.closePanel();
        });
        
        // ESCキーで閉じる
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });
        
        // クリック外で閉じる
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.closePanel();
            }
        });
    }
    
    // パネルを開閉
    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        const isOpen = panel.getAttribute('aria-hidden') === 'false';
        
        if (isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    // パネルを開く
    openPanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.add('open');
        
        // フォーカスをパネルに移動
        const firstFocusable = panel.querySelector('button, input');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // ボディのスクロールを無効化
        document.body.style.overflow = 'hidden';
    }
    
    // パネルを閉じる
    closePanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.remove('open');
        
        // フォーカスをトリガーボタンに戻す
        document.getElementById('accessibility-toggle').focus();
        
        // ボディのスクロールを復元
        document.body.style.overflow = '';
    }
    
    // 設定を更新
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }
    
    // ボタンの状態を更新
    updateButtonStates(action, value) {
        const buttons = document.querySelectorAll(`[data-action="${action}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }
    
    // パネルの状態を更新
    updatePanelState() {
        // フォントサイズボタン
        this.updateButtonStates('fontSize', this.settings.fontSize);
        
        // コントラストボタン
        this.updateButtonStates('contrast', this.settings.contrast);
        
        // トグルスイッチ
        document.getElementById('reduce-motion').checked = this.settings.reducedMotion;
        document.getElementById('keyboard-navigation').checked = this.settings.keyboardNavigation;
    }
    
    // 設定をリセット
    resetSettings() {
        this.settings = {
            fontSize: 'normal',
            contrast: 'normal',
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true
        };
        
        this.saveSettings();
        this.applySettings();
        this.updatePanelState();
    }
    
    // 設定を適用
    applySettings() {
        const body = document.body;
        
        // 既存のアクセシビリティクラスを削除
        body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
        body.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
        body.classList.remove('reduced-motion', 'enhanced-keyboard');
        
        // フォントサイズ
        body.classList.add(`font-${this.settings.fontSize}`);
        
        // コントラスト
        body.classList.add(`contrast-${this.settings.contrast}`);
        
        // モーション削減
        if (this.settings.reducedMotion) {
            body.classList.add('reduced-motion');
        }
        
        // キーボードナビゲーション強化
        if (this.settings.keyboardNavigation) {
            body.classList.add('enhanced-keyboard');
        }
    }
    
    // システム設定をチェック
    checkSystemPreferences() {
        // モーション削減設定
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
            document.getElementById('reduce-motion').checked = true;
        }
        
        // ダークモード設定
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.settings.contrast = 'dark';
        }
        
        // 高コントラスト設定
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.contrast = 'high';
        }
        
        this.applySettings();
        this.updatePanelState();
    }
    
    // キーボードナビゲーションを設定
    setupKeyboardNavigation() {
        // Tabキーでのナビゲーション可視化
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // ショートカットキー
        document.addEventListener('keydown', (e) => {
            // Alt + A でアクセシビリティパネル
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.togglePanel();
            }
            
            // Alt + S で検索
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const searchInput = document.querySelector('#global-search, input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Alt + M でメインコンテンツ
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView();
                }
            }
        });
    }
    
    // フォーカス管理を設定
    setupFocusManagement() {
        // フォーカス可能な要素を追跡
        this.focusableElements = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        
        // フォーカストラップ（モーダル用）
        this.setupFocusTrap();
        
        // Skip to content リンク
        this.createSkipLinks();
    }
    
    // スキップリンクを作成
    createSkipLinks() {
        if (document.querySelector('.skip-links')) return;
        
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">
                <span class="es-text">Saltar al contenido principal</span>
                <span class="ja-text">メインコンテンツへスキップ</span>
            </a>
            <a href="#navigation" class="skip-link">
                <span class="es-text">Saltar a la navegación</span>
                <span class="ja-text">ナビゲーションへスキップ</span>
            </a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // メインコンテンツにIDを追加
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
        
        // ナビゲーションにIDを追加
        const nav = document.querySelector('nav');
        if (nav && !nav.id) {
            nav.id = 'navigation';
        }
    }
    
    // フォーカストラップを設定
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            // モーダルが開いている場合のフォーカストラップ
            const modal = document.querySelector('.accessibility-panel.open, .cart-sidebar.open');
            if (!modal) return;
            
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(this.focusableElements);
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    // スクリーンリーダーサポートを設定
    setupScreenReaderSupport() {
        // ARIA ライブリージョンを作成
        this.createLiveRegion();
        
        // 動的コンテンツの変更を通知
        this.setupContentChangeNotifications();
    }
    
    // ライブリージョンを作成
    createLiveRegion() {
        if (document.getElementById('aria-live-region')) return;
        
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        
        document.body.appendChild(liveRegion);
    }
    
    // コンテンツ変更通知を設定
    setupContentChangeNotifications() {
        // カート変更通知
        document.addEventListener('cartUpdated', (e) => {
            this.announceToScreenReader(`商品がカートに追加されました。現在${e.detail.itemCount}個の商品があります。`);
        });
        
        // 検索結果通知
        document.addEventListener('searchCompleted', (e) => {
            this.announceToScreenReader(`検索完了。${e.detail.resultCount}件の結果が見つかりました。`);
        });
        
        // フォーム送信通知
        document.addEventListener('formSubmitted', () => {
            this.announceToScreenReader('フォームが正常に送信されました。');
        });
    }
    
    
    // モーション削減サポートを設定
    setupReducedMotionSupport() {
        // システム設定の変更を監視
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener((e) => {
            if (e.matches) {
                this.settings.reducedMotion = true;
                document.getElementById('reduce-motion').checked = true;
                this.applySettings();
            }
        });
    }
    
    // アクセシビリティスタイルを追加
    addAccessibilityStyles() {
        if (document.getElementById('accessibility-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'accessibility-styles';
        style.textContent = `
            /* Skip Links */
            .skip-links {
                position: absolute;
                top: -1000px;
                left: -1000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            }
            
            .skip-link:focus {
                position: absolute;
                top: 10px;
                left: 10px;
                width: auto;
                height: auto;
                padding: 10px 15px;
                background: var(--primary-color);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                z-index: 10000;
            }
            
            /* Screen Reader Only */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            /* Accessibility Toggle Button */
            .accessibility-toggle-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s ease;
            }
            
            .accessibility-toggle-btn:hover,
            .accessibility-toggle-btn:focus {
                transform: scale(1.1);
                outline: 3px solid rgba(255, 255, 255, 0.8);
            }
            
            /* Accessibility Panel */
            .accessibility-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .accessibility-panel.open {
                opacity: 1;
                visibility: visible;
            }
            
            .accessibility-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .accessibility-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .accessibility-header h2 {
                margin: 0;
                font-size: 1.3em;
            }
            
            .accessibility-close {
                background: none;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
            }
            
            .accessibility-close:hover {
                background: #f0f0f0;
            }
            
            .accessibility-body {
                padding: 20px;
            }
            
            .accessibility-group {
                margin-bottom: 25px;
            }
            
            .accessibility-group h3 {
                margin: 0 0 15px;
                font-size: 1.1em;
                color: #333;
            }
            
            .accessibility-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .accessibility-btn {
                padding: 8px 15px;
                border: 2px solid #ddd;
                background: white;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9em;
            }
            
            .accessibility-btn:hover {
                border-color: var(--primary-color);
            }
            
            .accessibility-btn.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .accessibility-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }
            
            .accessibility-toggle input {
                display: none;
            }
            
            .toggle-slider {
                width: 50px;
                height: 25px;
                background: #ddd;
                border-radius: 25px;
                position: relative;
                transition: background 0.3s ease;
            }
            
            .toggle-slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 21px;
                height: 21px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
            }
            
            .accessibility-toggle input:checked + .toggle-slider {
                background: var(--primary-color);
            }
            
            .accessibility-toggle input:checked + .toggle-slider::before {
                transform: translateX(25px);
            }
            
            .accessibility-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            
            /* Font Size Classes */
            .font-small {
                font-size: 0.9em;
            }
            
            .font-normal {
                font-size: 1em;
            }
            
            .font-large {
                font-size: 1.1em;
            }
            
            .font-xlarge {
                font-size: 1.25em;
            }
            
            /* High Contrast */
            .contrast-high {
                filter: contrast(150%);
            }
            
            .contrast-high * {
                text-shadow: none !important;
                box-shadow: none !important;
            }
            
            /* Dark Mode */
            .contrast-dark {
                background: #1a1a1a !important;
                color: #ffffff !important;
            }
            
            .contrast-dark .product-card,
            .contrast-dark .blog-card,
            .contrast-dark .category-card {
                background: #2a2a2a !important;
                color: #ffffff !important;
                border: 1px solid #444 !important;
            }
            
            /* Reduced Motion */
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            /* Enhanced Keyboard Navigation */
            .enhanced-keyboard *:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation *:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            /* Mobile Adjustments */
            @media (max-width: 768px) {
                .accessibility-toggle-btn {
                    bottom: 80px;
                    left: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .accessibility-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .accessibility-buttons {
                    flex-direction: column;
                }
                
                .accessibility-btn {
                    width: 100%;
                    padding: 12px 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 色覚異常対応フィルター
    applyColorBlindnessFilter() {
        const existingFilter = document.getElementById('colorblind-filter');
        if (existingFilter) {
            existingFilter.remove();
        }

        if (this.settings.colorBlindness === 'none') return;

        const filters = {
            protanopia: `
                <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0
                                                     0.558, 0.442, 0, 0, 0
                                                     0, 0.242, 0.758, 0, 0
                                                     0, 0, 0, 1, 0"/>
            `,
            deuteranopia: `
                <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0
                                                     0.7, 0.3, 0, 0, 0
                                                     0, 0.3, 0.7, 0, 0
                                                     0, 0, 0, 1, 0"/>
            `,
            tritanopia: `
                <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0
                                                     0, 0.433, 0.567, 0, 0
                                                     0, 0.475, 0.525, 0, 0
                                                     0, 0, 0, 1, 0"/>
            `
        };

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'colorblind-filter';
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        svg.innerHTML = `
            <defs>
                <filter id="${this.settings.colorBlindness}">
                    ${filters[this.settings.colorBlindness]}
                </filter>
            </defs>
        `;

        document.body.appendChild(svg);
        document.documentElement.style.filter = `url(#${this.settings.colorBlindness})`;
    }

    // 読み上げ機能（Web Speech API使用）
    speak(text, options = {}) {
        if (!this.settings.announcements || !('speechSynthesis' in window)) return;

        // 既存の読み上げを停止
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.settings.language === 'auto' ? 
            document.documentElement.lang || 'es-ES' : this.settings.language;
        utterance.rate = options.rate || 0.9;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 0.8;

        speechSynthesis.speak(utterance);
    }

    // ライブリージョン通知
    announceToScreenReader(message, priority = 'polite') {
        let liveRegion = document.getElementById('accessibility-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'accessibility-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }

        // 一時的にメッセージを表示
        liveRegion.textContent = message;
        
        // 読み上げもする
        this.speak(message);

        // 3秒後にクリア
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 3000);
    }

    // 高コントラストモード強化
    enhanceContrast() {
        const contrastLevels = {
            normal: '',
            high: `
                * { 
                    text-shadow: none !important;
                    box-shadow: none !important;
                }
                a, button { 
                    text-decoration: underline !important;
                    font-weight: bold !important;
                }
                .btn {
                    border: 2px solid !important;
                    font-weight: bold !important;
                }
            `,
            dark_high: `
                html { 
                    filter: invert(1) hue-rotate(180deg) !important;
                }
                img, video, iframe, svg, [style*="background-image"] {
                    filter: invert(1) hue-rotate(180deg) !important;
                }
            `
        };

        let contrastStyle = document.getElementById('contrast-enhancement');
        if (!contrastStyle) {
            contrastStyle = document.createElement('style');
            contrastStyle.id = 'contrast-enhancement';
            document.head.appendChild(contrastStyle);
        }

        contrastStyle.textContent = contrastLevels[this.settings.contrast];
    }

    // キーボードナビゲーション強化
    enhanceKeyboardNavigation() {
        // スキップリンクの追加
        this.addSkipLinks();

        // フォーカストラップの実装
        this.setupFocusTraps();

        // ランドマークナビゲーション
        this.setupLandmarkNavigation();

        // カスタムキーボードショートカット
        this.setupKeyboardShortcuts();
    }

    addSkipLinks() {
        if (document.querySelector('.skip-links')) return;

        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">
                <span class="es-text">Saltar al contenido principal</span>
                <span class="ja-text">メインコンテンツへスキップ</span>
            </a>
            <a href="#navigation" class="skip-link">
                <span class="es-text">Saltar a la navegación</span>
                <span class="ja-text">ナビゲーションへスキップ</span>
            </a>
            <a href="#footer" class="skip-link">
                <span class="es-text">Saltar al pie de página</span>
                <span class="ja-text">フッターへスキップ</span>
            </a>
        `;

        document.body.insertBefore(skipLinks, document.body.firstChild);

        // メインコンテンツにIDを追加
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    setupFocusTraps() {
        // モーダルやドロップダウン内でのフォーカストラップ
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal.active, .dropdown.open');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                               lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }
    }

    setupLandmarkNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + Number でランドマークに移動
            if (e.altKey && !e.ctrlKey && !e.shiftKey) {
                const landmarks = {
                    '1': 'header',
                    '2': 'nav, [role="navigation"]',
                    '3': 'main, [role="main"]',
                    '4': 'aside, [role="complementary"]',
                    '5': 'footer, [role="contentinfo"]'
                };

                const landmark = landmarks[e.key];
                if (landmark) {
                    e.preventDefault();
                    const element = document.querySelector(landmark);
                    if (element) {
                        element.focus();
                        this.announceToScreenReader(
                            `Navegando a ${element.tagName.toLowerCase()}`, 
                            'assertive'
                        );
                    }
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + / でアクセシビリティヘルプ
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showAccessibilityHelp();
            }

            // Alt + A でアクセシビリティメニュー
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAccessibilityMenu();
            }

            // Ctrl + + / Ctrl + - でフォントサイズ調整
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                e.preventDefault();
                this.increaseFontSize();
            }
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                this.decreaseFontSize();
            }
        });
    }

    showAccessibilityHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'accessibility-help-modal modal active';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'help-title');
        helpModal.innerHTML = `
            <div class="modal-content">
                <h2 id="help-title">
                    <span class="es-text">Ayuda de Accesibilidad</span>
                    <span class="ja-text">アクセシビリティヘルプ</span>
                </h2>
                <div class="help-content">
                    <section>
                        <h3>
                            <span class="es-text">Navegación por Teclado</span>
                            <span class="ja-text">キーボードナビゲーション</span>
                        </h3>
                        <ul>
                            <li><kbd>Tab</kbd> - Siguiente elemento</li>
                            <li><kbd>Shift + Tab</kbd> - Elemento anterior</li>
                            <li><kbd>Enter/Space</kbd> - Activar elemento</li>
                            <li><kbd>Esc</kbd> - 閉じる modal/menú</li>
                            <li><kbd>Alt + 1-5</kbd> - Navegar por landmarks</li>
                        </ul>
                    </section>
                    <section>
                        <h3>
                            <span class="es-text">Atajos de Accesibilidad</span>
                            <span class="ja-text">アクセシビリティショートカット</span>
                        </h3>
                        <ul>
                            <li><kbd>Ctrl + /</kbd> - Esta ayuda</li>
                            <li><kbd>Alt + A</kbd> - メニューのアクセシビリティ</li>
                            <li><kbd>Ctrl + +/-</kbd> - フォントサイズの調整</li>
                        </ul>
                    </section>
                </div>
                <button class="close-help">
                    <span class="es-text">Cerrar</span>
                    <span class="ja-text">閉じる</span>
                </button>
            </div>
        `;

        document.body.appendChild(helpModal);
        helpModal.querySelector('.close-help').focus();

        helpModal.querySelector('.close-help').addEventListener('click', () => {
            helpModal.remove();
        });

        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                helpModal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // ARIA属性の動的管理
    updateAriaAttributes() {
        // フォーム要素のaria-required
        document.querySelectorAll('input[required], select[required], textarea[required]').forEach(el => {
            el.setAttribute('aria-required', 'true');
        });

        // ボタンのaria-pressed状態
        document.querySelectorAll('button[data-toggle]').forEach(button => {
            button.addEventListener('click', () => {
                const isPressed = button.getAttribute('aria-pressed') === 'true';
                button.setAttribute('aria-pressed', !isPressed);
            });
        });

        // 展開可能な要素のaria-expanded
        document.querySelectorAll('[data-expandable]').forEach(element => {
            const trigger = element.querySelector('[data-trigger]');
            const content = element.querySelector('[data-content]');
            
            if (trigger && content) {
                trigger.setAttribute('aria-expanded', 'false');
                trigger.setAttribute('aria-controls', content.id || 'expandable-content');
                content.setAttribute('aria-hidden', 'true');

                trigger.addEventListener('click', () => {
                    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
                    trigger.setAttribute('aria-expanded', !isExpanded);
                    content.setAttribute('aria-hidden', isExpanded);
                });
            }
        });
    }

    // フォーカス管理の強化
    enhanceFocusManagement() {
        // フォーカス可視性の改善
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // フォーカスの自動管理
        document.addEventListener('DOMContentLoaded', () => {
            // ページロード時にh1またはメインコンテンツにフォーカス
            const h1 = document.querySelector('h1');
            const main = document.querySelector('main');
            if (h1) {
                h1.setAttribute('tabindex', '-1');
                h1.focus();
            } else if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
            }
        });
    }

    // パフォーマンス最適化
    optimizeForScreenReaders() {
        // 装飾的な要素をスクリーンリーダーから隠す
        document.querySelectorAll('.decorative, .icon-only, [data-decorative]').forEach(el => {
            if (!el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) {
                el.setAttribute('aria-hidden', 'true');
            }
        });

        // 重複するリンクテキストの改善
        document.querySelectorAll('a').forEach(link => {
            const text = link.textContent.trim();
            if (text === 'Read more' || text === 'Click here' || text === 'Ver más') {
                const context = this.getContextForLink(link);
                if (context) {
                    link.setAttribute('aria-label', `${text} - ${context}`);
                }
            }
        });
    }

    getContextForLink(link) {
        // 親要素から文脈を取得
        const parent = link.closest('article, section, .card, .product-card');
        if (parent) {
            const heading = parent.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                return heading.textContent.trim();
            }
        }
        return null;
    }

    // アクセシビリティレポート生成
    generateAccessibilityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            issues: [],
            suggestions: []
        };

        // 基本的なチェック
        this.checkHeadingStructure(report);
        this.checkImages(report);
        this.checkForms(report);
        this.checkLinks(report);
        this.checkColorContrast(report);

        return report;
    }

    checkHeadingStructure(report) {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const levels = headings.map(h => parseInt(h.tagName.charAt(1)));
        
        if (levels.length === 0) {
            report.issues.push('No headings found on page');
        } else if (levels[0] !== 1) {
            report.issues.push('Page should start with h1');
        }

        // 見出しレベルのスキップをチェック
        for (let i = 1; i < levels.length; i++) {
            if (levels[i] > levels[i-1] + 1) {
                report.issues.push(`Heading level skip detected: h${levels[i-1]} to h${levels[i]}`);
            }
        }
    }

    checkImages(report) {
        document.querySelectorAll('img').forEach(img => {
            if (!img.alt && !img.getAttribute('aria-hidden')) {
                report.issues.push(`Image missing alt text: ${img.src}`);
            }
        });
    }

    checkForms(report) {
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.labels || field.labels.length === 0) {
                if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
                    report.issues.push(`Form field missing label: ${field.name || field.id || field.type}`);
                }
            }
        });
    }

    checkLinks(report) {
        document.querySelectorAll('a[href]').forEach(link => {
            const text = link.textContent.trim();
            if (!text) {
                report.issues.push(`Empty link text: ${link.href}`);
            } else if (text.length < 3) {
                report.suggestions.push(`Consider more descriptive link text: "${text}"`);
            }
        });
    }

    checkColorContrast(report) {
        // 簡単なコントラストチェック（より詳細な実装が必要）
        if (this.settings.contrast === 'normal') {
            report.suggestions.push('Consider enabling high contrast mode for better readability');
        }
    }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', function() {
    window.accessibilityManager = new AccessibilityManager();
});

// エクスポート
window.AccessibilityManager = AccessibilityManager;