// ===== PRODUCTS PAGE JAVASCRIPT =====

// Global variables for products page
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

// DOM Elements
const productsElements = {
    categoryFilter: null,
    sortFilter: null,
    searchInput: null,
    productsGrid: null,
    resultsCount: null,
    pagination: null
};

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('products.html')) return;
    
    console.log('Products page initialized');
    
    // Initialize DOM elements
    initializeProductsElements();
    
    // Load products data
    loadProductsData();
    
    // Initialize filters and search
    initializeFilters();
    
    // Check URL parameters
    checkUrlParameters();
});

// Initialize DOM elements
function initializeProductsElements() {
    productsElements.categoryFilter = document.getElementById('category-filter');
    productsElements.sortFilter = document.getElementById('sort-filter');
    productsElements.searchInput = document.getElementById('search-input');
    productsElements.productsGrid = document.getElementById('products-grid');
    productsElements.resultsCount = document.getElementById('results-count');
    productsElements.pagination = document.getElementById('pagination');
}

// Load products data
async function loadProductsData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allProducts = data.products || [];
        filteredProducts = [...allProducts];
        
        // Display products
        displayProducts();
        updateResultsCount();
        
    } catch (error) {
        console.error('Error loading products:', error);
        showProductsError();
    }
}

// Initialize filters and search
function initializeFilters() {
    if (productsElements.categoryFilter) {
        productsElements.categoryFilter.addEventListener('change', handleFilters);
    }
    
    if (productsElements.sortFilter) {
        productsElements.sortFilter.addEventListener('change', handleFilters);
    }
    
    if (productsElements.searchInput) {
        let searchTimeout;
        productsElements.searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(handleFilters, 300);
        });
    }
}

// Handle filters change
function handleFilters() {
    const category = productsElements.categoryFilter?.value || 'all';
    const sort = productsElements.sortFilter?.value || 'featured';
    const search = productsElements.searchInput?.value.toLowerCase().trim() || '';
    
    // Filter products
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const matchesCategory = category === 'all' || product.category === category;
        
        // Search filter
        const matchesSearch = search === '' || 
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search) ||
            (product.tags && product.tags.some(tag => tag.toLowerCase().includes(search)));
        
        return matchesCategory && matchesSearch;
    });
    
    // Sort products
    sortProducts(sort);
    
    // Reset to first page
    currentPage = 1;
    
    // Update display
    displayProducts();
    updateResultsCount();
    
    // Update URL without reload
    updateUrl(category, sort, search);
}

// Sort products
function sortProducts(sortBy) {
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            });
            break;
    }
}

// Display products
function displayProducts() {
    if (!productsElements.productsGrid) return;
    
    if (filteredProducts.length === 0) {
        showNoProductsMessage();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Generate HTML
    const productsHTML = paginatedProducts.map(product => createProductCard(product)).join('');
    productsElements.productsGrid.innerHTML = productsHTML;
    
    // Add event listeners for add to cart buttons
    const addToCartButtons = productsElements.productsGrid.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            if (window.Youkoso && window.Youkoso.addToCart) {
                window.Youkoso.addToCart(productId);
            }
        });
    });
    
    // Update pagination
    updatePagination();
    
    // Add animation
    const productCards = productsElements.productsGrid.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-in');
    });
}

// Create product card HTML (reuse from main.js with slight modifications)
function createProductCard(product) {
    const imageElement = product.image ? 
        `<img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
         <div class="product-placeholder" style="display: none;">🎌</div>` :
        `<div class="product-placeholder">🎌</div>`;
    
    const featuredBadge = product.featured ? 
        `<div class="featured-badge">
            <span class="es-text">Destacado</span>
            <span class="ja-text">注目</span>
         </div>` : '';
    
    const tagsHTML = product.tags ? 
        product.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    
    const price = typeof product.price === 'number' ? 
        `$${product.price.toLocaleString()}` : product.price;
    
    return `
        <div class="product-card">
            <div class="product-image-container">
                ${imageElement}
                ${featuredBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-tags">${tagsHTML}</div>
                <div class="product-footer">
                    <span class="price">${price}</span>
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <span class="es-text">Agregar</span>
                        <span class="ja-text">追加</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Show no products message
function showNoProductsMessage() {
    if (!productsElements.productsGrid) return;
    
    productsElements.productsGrid.innerHTML = `
        <div class="no-products-message">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
            <h3>
                <span class="es-text">No se encontraron productos</span>
                <span class="ja-text">商品が見つかりませんでした</span>
            </h3>
            <p>
                <span class="es-text">Intenta cambiar los filtros o términos de búsqueda</span>
                <span class="ja-text">フィルターまたは検索条件を変更してください</span>
            </p>
        </div>
    `;
    
    // Clear pagination
    if (productsElements.pagination) {
        productsElements.pagination.innerHTML = '';
    }
}

// Show products error (無効化)
function showProductsError() {
    // エラー表示は無効化、コンソールのみに出力
    console.error('Products loading error');
    // ポップアップ通知を完全に無効化
    return;
}

// Update results count
function updateResultsCount() {
    if (!productsElements.resultsCount) return;
    
    const total = filteredProducts.length;
    const currentLang = window.Youkoso ? window.Youkoso.currentLanguage() : 'es';
    
    if (total === 0) {
        productsElements.resultsCount.innerHTML = `
            <span class="es-text">0 productos encontrados</span>
            <span class="ja-text">0件の商品が見つかりました</span>
        `;
    } else {
        const startIndex = (currentPage - 1) * productsPerPage + 1;
        const endIndex = Math.min(currentPage * productsPerPage, total);
        
        productsElements.resultsCount.innerHTML = `
            <span class="es-text">Mostrando ${startIndex}-${endIndex} de ${total} productos</span>
            <span class="ja-text">${total}件中 ${startIndex}-${endIndex}件を表示</span>
        `;
    }
}

// Update pagination
function updatePagination() {
    if (!productsElements.pagination) return;
    
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    if (totalPages <= 1) {
        productsElements.pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button class="pagination-btn pagination-prev" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
                <span class="es-text">Anterior</span>
                <span class="ja-text">前へ</span>
            </button>
        `;
    }
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn pagination-number ${i === currentPage ? 'active' : ''}" 
                    data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button class="pagination-btn pagination-next" data-page="${currentPage + 1}">
                <span class="es-text">Siguiente</span>
                <span class="ja-text">次へ</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    productsElements.pagination.innerHTML = paginationHTML;
    
    // Add event listeners
    const paginationButtons = productsElements.pagination.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = parseInt(this.dataset.page);
            if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                currentPage = page;
                displayProducts();
                updateResultsCount();
                
                // Scroll to top of products section
                const productsSection = document.querySelector('.products-section');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Check URL parameters
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category && productsElements.categoryFilter) {
        productsElements.categoryFilter.value = category;
    }
    
    if (search && productsElements.searchInput) {
        productsElements.searchInput.value = search;
    }
    
    if (category || search) {
        handleFilters();
    }
}

// Update URL without reload
function updateUrl(category, sort, search) {
    const url = new URL(window.location);
    
    if (category && category !== 'all') {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    
    if (search) {
        url.searchParams.set('search', search);
    } else {
        url.searchParams.delete('search');
    }
    
    if (sort && sort !== 'featured') {
        url.searchParams.set('sort', sort);
    } else {
        url.searchParams.delete('sort');
    }
    
    window.history.replaceState({}, '', url);
}

console.log('Products page script loaded successfully');