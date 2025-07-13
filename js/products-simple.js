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
    const imagePromises = products.map(async (product) => {
        try {
            const imageUrl = await utils.getProductImage(product);
            const imgElement = document.querySelector(`img[data-product-id="${product.id}"]`);
            if (imgElement) {
                imgElement.src = imageUrl;
                imgElement.classList.add('loaded');
            }
        } catch (error) {
            console.error(`Error loading image for product ${product.id}:`, error);
        }
    });
    
    await Promise.all(imagePromises);
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