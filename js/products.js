// 商品表示用JavaScript

// 商品データ（共有データから取得）
let productData = [];

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded in products.js');
    
    // 商品データを読み込む
    await loadProductData();
    
    // トップページ用の特集商品表示
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (featuredProductsContainer) {
        loadFeaturedProducts();
    }
    
    // 商品一覧ページ用の表示
    const productsContainer = document.getElementById('products-container');
    if (productsContainer && window.location.pathname.includes('/products/')) {
        // URLパラメータに基づいてUIを更新
        updateUIBasedOnParams();
        
        // 商品を読み込む
        loadAllProducts();
        
        // フィルターをセットアップ
        setupFilters();
    }
});

// 商品データを読み込む関数
async function loadProductData() {
    try {
        // メイン処理でデータが読み込まれているか確認
        if (window.siteData && window.siteData.products && window.siteData.products.length > 0) {
            console.log('Using products from site data');
            productData = window.siteData.products;
            return productData;
        }
        
        // メインデータが読み込まれていない場合は待機
        await waitForSiteData();
        
        // データが読み込まれていれば使用
        if (window.siteData && window.siteData.products) {
            productData = window.siteData.products;
            console.log('Products loaded from site data:', productData.length);
            return productData;
        }
        
        // それでもデータがない場合は個別に読み込む
        console.log('Loading products from individual file');
        const pathPrefix = window.location.pathname.includes('/products/') ? '../' : '';
        const basePath = `${pathPrefix}data/products.json`;
        
        // 共通ユーティリティ関数を使用してデータを取得
        const data = await window.utils.fetchData(basePath);
        productData = data.products;
        console.log('Products loaded from individual file:', productData.length);
        return productData;
    } catch (error) {
        console.error('商品データの読み込みに失敗しました:', error);
        return [];
    }
}

// サイトデータが読み込まれるのを待つ関数
function waitForSiteData(timeout = 5000) {
    return new Promise((resolve) => {
        // すでに読み込まれている場合はすぐに解決
        if (window.siteData && window.siteData.products && window.siteData.products.length > 0) {
            return resolve();
        }
        
        let timeWaited = 0;
        const interval = 100;
        
        // 定期的にチェック
        const checkInterval = setInterval(() => {
            timeWaited += interval;
            
            // データが読み込まれたか、タイムアウトに達したかをチェック
            if ((window.siteData && window.siteData.products && window.siteData.products.length > 0) || timeWaited >= timeout) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval);
    });
}

// URLパラメータに基づいてUIを更新する関数
function updateUIBasedOnParams() {
    // カテゴリパラメータを取得
    const categoryParam = window.utils.getUrlParam('category');
    
    if (categoryParam) {
        // カテゴリ名を取得
        const categoryName = getCategoryName(categoryParam);
        
        // ヘッダーとタイトルを更新
        const categoryHeader = document.getElementById('category-header');
        if (categoryHeader) {
            categoryHeader.textContent = categoryName;
        }
        
        const productsTitle = document.getElementById('products-title');
        if (productsTitle) {
            productsTitle.textContent = `Productos - ${categoryName}`;
        }
        
        // カテゴリセクションを非表示にする
        const categoriesSection = document.getElementById('categories-section');
        if (categoriesSection) {
            categoriesSection.style.display = 'none';
        }
        
        // ドロップダウンの選択を更新
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = categoryParam;
        }
    }
}

// カテゴリ名を取得する関数（siteDataから取得するよう改善）
function getCategoryName(categorySlug) {
    // siteDataからカテゴリ情報を取得
    if (window.siteData && window.siteData.categories) {
        const category = window.siteData.categories.find(cat => cat.slug === categorySlug);
        if (category) {
            return category.name;
        }
    }
    
    // フォールバック
    const categories = {
        'figuras': 'Figuras de Anime',
        'manga': 'Manga',
        'peluches': 'Peluches',
        'videojuegos': 'Videojuegos',
        'ropa': 'Ropa y Accesorios',
        'cartas': 'Cartas Coleccionables',
        'comida': 'Comida Japonesa'
    };
    
    return categories[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
}

// 特集商品をロードする関数
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (!featuredProductsContainer) return;
    
    // 特集商品をフィルタリング（共通ユーティリティ関数を使用）
    const featuredProducts = window.utils.filterItems(productData, { featured: true });
    
    // 空の場合は、最初の4つを表示
    const productsToShow = featuredProducts.length > 0 ? featuredProducts : productData.slice(0, 4);
    
    // コンテナをクリア
    featuredProductsContainer.innerHTML = '';
    
    // 商品カードを追加（components.jsで定義した関数を使用）
    const relativePath = window.location.pathname.includes('/products/') ? '../' : '';
    productsToShow.forEach(product => {
        featuredProductsContainer.innerHTML += window.createProductCardComponent(product, relativePath);
    });
}

// すべての商品をロードする関数
function loadAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // コンテナをクリア
    productsContainer.innerHTML = '';
    
    // URLからフィルタとソートパラメータを取得
    const categoryFilter = window.utils.getUrlParam('category');
    const searchQuery = window.utils.getUrlParam('q');
    
    // フィルタリング条件を作成
    const filters = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (searchQuery) filters.search = searchQuery;
    
    // 共通ユーティリティ関数を使用してフィルタリング
    let filteredProducts = window.utils.filterItems(productData, filters);
    
    // 並び替えを適用（共通ユーティリティ関数を使用）
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        const sortValue = sortFilter.value;
        
        switch(sortValue) {
            case 'price-low':
                filteredProducts = window.utils.sortItems(filteredProducts, 'price', 'asc');
                break;
            case 'price-high':
                filteredProducts = window.utils.sortItems(filteredProducts, 'price', 'desc');
                break;
            case 'name':
                filteredProducts = window.utils.sortItems(filteredProducts, 'name', 'asc');
                break;
            case 'featured':
            default:
                // フィーチャード商品を先に表示
                filteredProducts = filteredProducts.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                break;
        }
    }
    
    // 商品がない場合
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No se encontraron productos con estos criterios de búsqueda.</div>';
        return;
    }
    
    // ページネーションの設定
    const currentPage = parseInt(window.utils.getUrlParam('page')) || 1;
    const pageSize = 12;
    
    // 表示する商品を取得
    const paginatedProducts = window.utils.paginateItems(filteredProducts, pageSize, currentPage);
    
    // 商品カードを追加（components.jsで定義した関数を使用）
    const relativePath = '../';
    paginatedProducts.forEach(product => {
        productsContainer.innerHTML += window.createProductCardComponent(product, relativePath);
    });
    
    // ページネーションを設定
    setupPagination(filteredProducts.length, pageSize);
}

// ページネーションを設定する関数
function setupPagination(totalItems, pageSize = 12) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // 現在のページを取得（デフォルトは1）
    const currentPage = parseInt(window.utils.getUrlParam('page')) || 1;
    
    // ページネーションコントロールを生成
    let paginationHTML = '<div class="pagination-controls">';
    
    // 戻るボタン
    if (currentPage > 1) {
        paginationHTML += `<button data-page="${currentPage - 1}">Anterior</button>`;
    }
    
    // ページ番号（表示を5ページまでに制限）
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button data-page="${i}" class="${activeClass}">${i}</button>`;
    }
    
    // 次へボタン
    if (currentPage < totalPages) {
        paginationHTML += `<button data-page="${currentPage + 1}">Siguiente</button>`;
    }
    
    paginationHTML += '</div>';
    
    // ページネーションを挿入
    paginationContainer.innerHTML = paginationHTML;
    
    // ページネーションボタンのイベントリスナーを設定
    const pageButtons = paginationContainer.querySelectorAll('button');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // URLパラメータを更新して再読み込み
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            window.location.href = url.toString();
        });
    });
}

// フィルターの設定
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-products');
    
    // カテゴリーフィルター
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            
            // URLパラメータを更新
            const url = new URL(window.location);
            if (selectedCategory) {
                url.searchParams.set('category', selectedCategory);
            } else {
                url.searchParams.delete('category');
            }
            window.location.href = url.toString();
        });
    }
    
    // ソートフィルター
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            // 商品を再ロード
            loadAllProducts();
        });
    }
    
    // 検索フィルター
    if (searchInput) {
        // Enter キーで検索を実行
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // URLパラメータを更新
                const url = new URL(window.location);
                if (this.value.trim()) {
                    url.searchParams.set('q', this.value.trim());
                } else {
                    url.searchParams.delete('q');
                }
                window.location.href = url.toString();
            }
        });
        
        // テキスト入力でリアルタイム検索
        searchInput.addEventListener('input', function() {
            // 遅延してから商品を再ロード
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                loadAllProducts();
            }, 300);
        });
    }
}
