// ===== SIMPLE MAIN.JS - Homepage specific functions =====

// Load and display featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;
    
    try {
        const products = await utils.loadData('products');
        const featured = products.filter(p => p.featured).slice(0, 6);
        
        if (featured.length === 0) {
            container.innerHTML = '<p>No hay productos destacados disponibles.</p>';
            return;
        }
        
        container.innerHTML = featured.map(product => createProductCard(product)).join('');
        
        // Add to cart buttons
        container.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.dataset.productId);
                const product = featured.find(p => p.id === productId);
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
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = '<p>Error al cargar los productos.</p>';
    }
}

// Create product card HTML
function createProductCard(product) {
    const price = utils.formatPrice(product.price);
    const image = product.image || 'assets/images/ui/placeholder.jpg';
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${image}" alt="${product.name}" loading="lazy">
                ${product.featured ? '<span class="badge badge-featured">Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${price}</p>
                <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Agregar
                </button>
            </div>
        </div>
    `;
}

// Initialize homepage
document.addEventListener('DOMContentLoaded', function() {
    // Only run on homepage
    if (window.location.pathname === '/' || window.location.pathname.includes('index')) {
        loadFeaturedProducts();
    }
});