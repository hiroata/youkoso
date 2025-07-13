// ===== SIMPLE PRODUCTS.JS - Products page functionality =====

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// Load and display products
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    try {
        allProducts = await utils.loadData('products');
        filteredProducts = [...allProducts];
        
        displayProducts();
        setupFilters();
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p>Error al cargar los productos.</p>';
    }
}

// Display products with pagination
function displayProducts() {
    const grid = document.getElementById('products-grid');
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }
    
    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
    
    // Load product images asynchronously
    loadProductImages(productsToShow);
    
    // Add to cart functionality
    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                utils.cart.add(product);
                this.innerHTML = '<i class="fas fa-check"></i> Agregado';
                this.disabled = true;
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-shopping-cart"></i> Agregar';
                    this.disabled = false;
                }, 2000);
            }
        });
    });
    
    updatePagination();
    updateResultsCount();
}

// Create product card
function createProductCard(product) {
    const price = utils.formatPrice(product.price);
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f8f9fa"/%3E%3Ctext x="50%" y="50%" font-family="Arial" font-size="16" fill="%23adb5bd" text-anchor="middle" dy=".3em"%3ECargando...%3C/text%3E%3C/svg%3E';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" onclick="goToProductDetail('${product.id}')">
                <img src="${placeholderImage}" alt="${product.name}" loading="lazy" data-product-id="${product.id}">
                ${product.discount ? `<span class="badge badge-discount">${product.discount}% OFF</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name" onclick="goToProductDetail('${product.id}')">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${price}</p>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}" onclick="event.stopPropagation()">
                    <i class="fas fa-shopping-cart"></i> Agregar
                </button>
            </div>
        </div>
    `;
}

// Setup filters
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-input');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(applyFilters, 300);
        });
    }
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('category-filter')?.value || 'all';
    const sort = document.getElementById('sort-filter')?.value || 'name';
    const search = document.getElementById('search-input')?.value.toLowerCase() || '';
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        const matchesCategory = category === 'all' || product.category === category;
        const matchesSearch = !search || 
            product.name.toLowerCase().includes(search) ||
            product.description?.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
    });
    
    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sort) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });
    
    currentPage = 1;
    displayProducts();
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">Anterior</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-current">${i}</span>`;
        } else {
            html += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">Siguiente</button>`;
    }
    
    pagination.innerHTML = html;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update results count
function updateResultsCount() {
    const count = document.getElementById('results-count');
    if (!count) return;
    
    const total = filteredProducts.length;
    const start = (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, total);
    
    count.textContent = `Mostrando ${start}-${end} de ${total} productos`;
}

// Load product images asynchronously
async function loadProductImages(products) {
    console.log(`Starting to load images for ${products.length} products...`);
    
    // キャッシュ統計を表示
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    console.log(`📊 Current cache: ${cacheKeys.length} images cached`);
    
    let cacheHits = 0;
    let cacheMisses = 0;
    let errors = 0;
    
    // Process images sequentially to avoid overwhelming the API
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        try {
            const imgElement = document.querySelector(`img[data-product-id="${product.id}"]`);
            if (!imgElement) continue;
            
            // Add loading state immediately
            imgElement.classList.add('loading');
            
            // Check if image is already cached
            const cacheKey = `img_${product.id}`;
            const isCached = localStorage.getItem(cacheKey) !== null;
            
            // Show progress in console with cache status
            const cacheStatus = isCached ? '🟢 cached' : '🔄 fetching';
            console.log(`[${i+1}/${products.length}] ${cacheStatus} - ${product.name}`);
            
            if (isCached) {
                cacheHits++;
            } else {
                cacheMisses++;
            }
            
            // Get the image URL
            const imageUrl = await utils.getProductImage(product);
            
            // Set up event handlers
            imgElement.onerror = function() {
                console.warn(`❌ Image failed to load for ${product.name}`);
                errors++;
                this.src = utils.createPlaceholderImage(product);
                this.classList.remove('loading');
                this.classList.add('error');
                
                // Remove bad cache entry if exists
                if (localStorage.getItem(cacheKey)) {
                    localStorage.removeItem(cacheKey);
                    console.log(`🗑️ Removed bad cache for ${product.name}`);
                }
            };
            
            imgElement.onload = function() {
                console.log(`✅ Image loaded successfully for ${product.name}`);
                this.classList.remove('loading');
                this.classList.add('loaded');
            };
            
            // Set the source
            imgElement.src = imageUrl;
            
            // Small delay between requests to be respectful to the API
            if (i < products.length - 1 && !isCached) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
        } catch (error) {
            console.error(`❌ Error loading image for ${product.name}:`, error);
            errors++;
            const imgElement = document.querySelector(`img[data-product-id="${product.id}"]`);
            if (imgElement) {
                imgElement.src = utils.createPlaceholderImage(product);
                imgElement.classList.remove('loading');
                imgElement.classList.add('error');
            }
        }
    }
    
    // 統計を表示
    console.group(`🎉 Image loading completed for ${products.length} products`);
    console.log(`Cache hits: ${cacheHits} (${((cacheHits/products.length)*100).toFixed(1)}%)`);
    console.log(`Cache misses: ${cacheMisses} (${((cacheMisses/products.length)*100).toFixed(1)}%)`);
    if (errors > 0) {
        console.warn(`Errors: ${errors} (${((errors/products.length)*100).toFixed(1)}%)`);
    }
    console.groupEnd();
    
    // パフォーマンス改善のヒントを表示
    if (cacheMisses > cacheHits) {
        console.log('💡 ヒント: fetchAllProductImages() を実行してキャッシュを事前に構築すると、ページの読み込みが高速化されます');
    }
}

// ===== 開発者用便利コマンド =====

// 全商品の画像を一括取得（進捗バー付き） - グローバル関数として利用可能
window.fetchAllProductImages = window.fetchAllProductImages || async function() {
    // core-simple.js の実装を使用
    if (typeof utils !== 'undefined' && utils.loadData) {
        return window.fetchAllProductImages();
    } else {
        console.error('utils.loadData が利用できません。core-simple.js が読み込まれていることを確認してください。');
    }
};

// 現在のキャッシュ状況を確認 - 商品ページ専用の詳細版
window.checkProductImageCache = function() {
    const imageCacheKeys = Object.keys(localStorage).filter(key => key.startsWith('img_'));
    
    console.group('🖼️ 商品画像キャッシュ状況（詳細）');
    
    if (imageCacheKeys.length === 0) {
        console.log('キャッシュは空です');
        console.log('💡 fetchAllProductImages() を実行して画像をキャッシュしましょう');
        console.groupEnd();
        return { count: 0, products: [] };
    }
    
    const productIds = imageCacheKeys.map(key => key.replace('img_', ''));
    
    console.log(`キャッシュされた商品数: ${productIds.length}`);
    
    // 現在表示されている商品との照合
    if (typeof allProducts !== 'undefined' && allProducts.length > 0) {
        const cachedProducts = allProducts.filter(p => productIds.includes(p.id));
        const uncachedProducts = allProducts.filter(p => !productIds.includes(p.id));
        
        console.log(`全商品数: ${allProducts.length}`);
        console.log(`キャッシュ済み: ${cachedProducts.length} (${((cachedProducts.length/allProducts.length)*100).toFixed(1)}%)`);
        console.log(`未キャッシュ: ${uncachedProducts.length} (${((uncachedProducts.length/allProducts.length)*100).toFixed(1)}%)`);
        
        if (uncachedProducts.length > 0) {
            console.log('未キャッシュ商品:', uncachedProducts.map(p => p.name));
        }
        
        console.groupEnd();
        return {
            count: imageCacheKeys.length,
            total: allProducts.length,
            cached: cachedProducts,
            uncached: uncachedProducts,
            coverage: (cachedProducts.length/allProducts.length)*100
        };
    } else {
        console.log('商品データが読み込まれていません');
        console.groupEnd();
        return { count: imageCacheKeys.length, products: productIds };
    }
};

// 表示中の商品の画像を再読み込み
window.reloadVisibleImages = async function() {
    const visibleProductCards = document.querySelectorAll('.product-card');
    const productIds = Array.from(visibleProductCards).map(card => card.dataset.productId);
    
    console.log(`表示中の ${productIds.length} 商品の画像を再読み込みします...`);
    
    // 該当する商品のキャッシュを削除
    productIds.forEach(id => {
        const cacheKey = `img_${id}`;
        if (localStorage.getItem(cacheKey)) {
            localStorage.removeItem(cacheKey);
            console.log(`🗑️ ${id} のキャッシュを削除`);
        }
    });
    
    // 現在表示中の商品を再読み込み
    if (typeof allProducts !== 'undefined') {
        const visibleProducts = allProducts.filter(p => productIds.includes(p.id));
        await loadProductImages(visibleProducts);
        console.log('✅ 表示中の商品画像の再読み込みが完了しました');
    }
};

// 商品ページ専用ヘルプ
window.showProductImageHelp = function() {
    console.log(`
🖼️ 商品画像管理コマンド（商品ページ専用）

基本操作:
• checkProductImageCache()    - 商品画像キャッシュの詳細状況を確認
• reloadVisibleImages()       - 表示中の商品画像を再読み込み
• fetchAllProductImages()     - 全商品画像を一括取得

グローバル操作:
• clearImageCache()           - 全画像キャッシュをクリア
• checkImageCache()           - 全画像キャッシュ状況を確認

使用例:
> checkProductImageCache()    // 商品キャッシュ状況をチェック
> reloadVisibleImages()       // 表示中の画像を再読み込み
> fetchAllProductImages()     // 全画像をキャッシュ（時間がかかります）
    `);
};

// 商品ページでの自動ヘルプ表示
if (window.location.pathname.includes('products.html') || document.getElementById('products-grid')) {
    console.log('🖼️ 商品画像管理ツールが利用可能です。showProductImageHelp() でヘルプを表示できます。');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) {
        loadProducts();
    }
});

// Navigate to product detail page
function goToProductDetail(productId) {
    // Store product ID in localStorage for the detail page
    localStorage.setItem('selectedProductId', productId);
    // Navigate to product detail page
    window.location.href = 'product-detail.html';
}

// Make functions available globally
window.changePage = changePage;
window.goToProductDetail = goToProductDetail;