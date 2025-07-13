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
    
    // Add to cart functionality
    grid.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.dataset.productId);
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
    const image = product.image || 'assets/images/ui/placeholder.jpg';
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${image}" alt="${product.name}" loading="lazy">
                ${product.discount ? `<span class="badge badge-discount">${product.discount}% OFF</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">${price}</p>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('products-grid')) {
        loadProducts();
    }
});

// Make changePage available globally
window.changePage = changePage;