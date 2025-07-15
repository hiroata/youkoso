// ===== ADMIN MANAGEMENT SYSTEM =====

// Admin credentials (Firebase認証に移行)
// 旧認証情報（参考用）
const LEGACY_CREDENTIALS = {
    id: 'admin',
    pass: 'japan2024'
};

// Global admin state
let isAuthenticated = false;
let currentLanguage = 'es';
let products = [];
let editingProductId = null;
let blogs = [];
let editingBlogId = null;

// Initialize admin interface
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin interface initialized');
    
    // Check if already authenticated
    checkAuthentication();
    
    // Initialize language
    initializeLanguage();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load data if authenticated
    if (isAuthenticated) {
        loadProducts();
        loadBlogs();
    }
    
    // Make switchTab function globally available
    window.switchTab = switchTab;
    
    // Add debug function for manual testing
    window.debugTab = function() {
        console.log('=== TAB DEBUG INFO ===');
        console.log('Tab buttons:', document.querySelectorAll('.tab-btn'));
        console.log('Tab contents:', document.querySelectorAll('.tab-content'));
        console.log('isAuthenticated:', isAuthenticated);
        console.log('Current language:', currentLanguage);
    };
});

// Check authentication status
function checkAuthentication() {
    const authData = sessionStorage.getItem('adminAuth');
    if (authData) {
        try {
            const auth = JSON.parse(authData);
            if (auth.authenticated && Date.now() < auth.expires) {
                isAuthenticated = true;
                showManagementInterface();
                // Load data for authenticated user
                loadProducts();
                loadBlogs();
                return;
            }
        } catch (error) {
            console.warn('Invalid auth data');
        }
    }
    
    showLoginInterface();
}

// Initialize language detection
function initializeLanguage() {
    currentLanguage = localStorage.getItem('language') || 'es';
    updateLanguageDisplay(currentLanguage);
}

// Initialize all event listeners
function initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Product form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
    
    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancelEdit');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', cancelEdit);
    }
    
    // Blog form
    const blogForm = document.getElementById('blogForm');
    if (blogForm) {
        blogForm.addEventListener('submit', handleBlogSubmit);
    }
    
    // Cancel blog edit button
    const cancelBlogEditBtn = document.getElementById('cancelBlogEdit');
    if (cancelBlogEditBtn) {
        cancelBlogEditBtn.addEventListener('click', cancelBlogEdit);
    }
    
    // Form inputs styling
    initializeFormStyling();
    
    // Image management
    initializeImageManagement();
    
    // Tab navigation removed - using single page layout
    
    // Language buttons
    initializeLanguageButtons();
}

// Initialize form styling for better UX
function initializeFormStyling() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.style.padding = '0.75rem';
        select.style.border = '2px solid var(--border)';
        select.style.borderRadius = '8px';
        select.style.background = 'var(--background)';
        select.style.color = 'var(--text)';
        select.style.cursor = 'pointer';
    });
}

// Initialize language buttons
function initializeLanguageButtons() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.dataset.lang;
            if (lang && lang !== currentLanguage) {
                currentLanguage = lang;
                updateLanguageDisplay(lang);
                localStorage.setItem('language', lang);
            }
        });
    });
}

// Update language display
function updateLanguageDisplay(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    
    // Update language buttons
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.lang === lang);
    });
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const adminId = document.getElementById('adminId').value.trim();
    const adminPass = document.getElementById('adminPass').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Clear previous errors
    errorMessage.style.display = 'none';
    
    // Disable form during authentication
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const loadingTexts = {
        es: 'Verificando...',
        ja: '確認中...',
        en: 'Verifying...'
    };
    submitBtn.innerHTML = loadingTexts[currentLanguage];
    
    // Simulate authentication delay for security
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check credentials
    if (adminId === ADMIN_CREDENTIALS.id && adminPass === ADMIN_CREDENTIALS.pass) {
        // Store authentication state
        const authData = {
            authenticated: true,
            expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours
        };
        sessionStorage.setItem('adminAuth', JSON.stringify(authData));
        
        isAuthenticated = true;
        showManagementInterface();
        
        // Load data
        await loadProducts();
        await loadBlogs();
        
        console.log('Login successful');
    } else {
        // Show error
        const errorMessages = {
            es: 'Credenciales incorrectas. Inténtalo de nuevo.',
            ja: '認証情報が正しくありません。再試行してください。',
            en: 'Invalid credentials. Please try again.'
        };
        
        errorMessage.textContent = errorMessages[currentLanguage];
        errorMessage.style.display = 'block';
        
        // Re-enable form
        submitBtn.disabled = false;
        const loginTexts = {
            es: 'Iniciar Sesión',
            ja: 'ログイン',
            en: 'Login'
        };
        submitBtn.innerHTML = loginTexts[currentLanguage];
        
        // Clear form
        document.getElementById('adminPass').value = '';
    }
}

// Handle logout
function handleLogout() {
    sessionStorage.removeItem('adminAuth');
    isAuthenticated = false;
    showLoginInterface();
    
    console.log('Logged out successfully');
}

// Show login interface
function showLoginInterface() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('managementSection').style.display = 'none';
    
    // Clear form
    document.getElementById('loginForm').reset();
    document.getElementById('errorMessage').style.display = 'none';
}

// Show management interface
function showManagementInterface() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('managementSection').style.display = 'block';
    
    // Re-initialize tab navigation to ensure it works
    setTimeout(() => {
        // Tab navigation removed - using single page layout
        
        // Restore last selected tab
        const savedTab = localStorage.getItem('adminCurrentTab');
        if (savedTab && ['products', 'blogs'].includes(savedTab)) {
            switchTab(savedTab);
        } else {
            // Default to products tab
            switchTab('products');
        }
    }, 100);
}

// Load products from data.json
async function loadProducts() {
    try {
        // Use unified DataLoader
        products = await window.utils.dataLoader.loadData('products');
        displayProductsList();
    } catch (error) {
        window.utils.handleError(error, {
            module: 'admin',
            context: 'loadProducts'
        });
        // Fallback to embedded data
        loadProductsFromEmbeddedData();
    }
}

// Display products in table
function displayProductsList() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;
    
    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <span class="es-text">No hay productos disponibles</span>
                    <span class="ja-text">商品がありません</span>
                    <span class="en-text">No products available</span>
                </td>
            </tr>
        `;
        return;
    }
    
    const productsHTML = products.map(product => {
        const featuredTexts = {
            es: product.featured ? 'Sí' : 'No',
            ja: product.featured ? 'はい' : 'いいえ',
            en: product.featured ? 'Yes' : 'No'
        };
        const featuredText = featuredTexts[currentLanguage];
        
        return `
            <tr>
                <td data-label="ID">${product.id}</td>
                <td data-label="Nombre">${product.name}</td>
                <td data-label="Categoría">${product.category}</td>
                <td data-label="Precio">$${product.price.toLocaleString()}</td>
                <td data-label="Destacado">${featuredText}</td>
                <td data-label="Acciones" class="product-actions">
                    <button class="edit-btn" onclick="editProduct('${product.id}')">
                        <i class="fas fa-edit"></i>
                        <span class="es-text">Editar</span>
                        <span class="ja-text">編集</span>
                        <span class="en-text">Edit</span>
                    </button>
                    <button class="delete-btn" onclick="deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i>
                        <span class="es-text">Eliminar</span>
                        <span class="ja-text">削除</span>
                        <span class="en-text">Delete</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = productsHTML;
}

// Handle product form submission
async function handleProductSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable form during processing
    submitBtn.disabled = true;
    const savingTexts = {
        es: 'Guardando...',
        ja: '保存中...',
        en: 'Saving...'
    };
    submitBtn.innerHTML = savingTexts[currentLanguage];
    
    try {
        const productData = {
            id: document.getElementById('productId').value || generateProductId(),
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseInt(document.getElementById('productPrice').value),
            image: document.getElementById('productImage').value.trim() || 'assets/images/products/default.jpg',
            description: document.getElementById('productDescription').value.trim(),
            featured: document.getElementById('productFeatured').checked,
            tags: document.getElementById('productTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        if (editingProductId) {
            // Update existing product
            updateProduct(productData);
        } else {
            // Add new product
            addProduct(productData);
        }
        
        // Save to JSON (simulation - in real app would be server)
        await saveProductsToJSON();
        
        // Reset form and refresh list
        resetProductForm();
        displayProductsList();
        
        console.log('Product saved successfully');
        
    } catch (error) {
        console.error('Error saving product:', error);
        console.error('Error saving product:', error);
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        const saveTexts = {
            es: 'Guardar Producto',
            ja: '商品を保存',
            en: 'Save Product'
        };
        submitBtn.innerHTML = saveTexts[currentLanguage];
    }
}

// Generate new product ID
function generateProductId() {
    const existingIds = products.map(p => p.id);
    let newId;
    let counter = 1;
    
    do {
        newId = `p${String(counter).padStart(3, '0')}`;
        counter++;
    } while (existingIds.includes(newId));
    
    return newId;
}

// Add new product
function addProduct(productData) {
    products.push(productData);
}

// Update existing product
function updateProduct(productData) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) {
        products[index] = productData;
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    
    // Fill form with product data
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productFeatured').checked = product.featured;
    document.getElementById('productTags').value = product.tags ? product.tags.join(', ') : '';
    
    // Preview the image
    previewProductImage();
    
    // Show cancel button
    document.getElementById('cancelEdit').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.product-form').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Cancel edit
function cancelEdit() {
    editingProductId = null;
    resetProductForm();
}

// Reset product form
function resetProductForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('cancelEdit').style.display = 'none';
    editingProductId = null;
    
    // Clear image preview
    clearProductImage();
}

// Delete product
function deleteProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const confirmMessages = {
        es: `¿Estás seguro de que quieres eliminar "${product.name}"?`,
        ja: `"${product.name}"を削除してもよろしいですか？`,
        en: `Are you sure you want to delete "${product.name}"?`
    };
    
    if (confirm(confirmMessages[currentLanguage])) {
        products = products.filter(p => p.id !== productId);
        
        // Save changes
        saveProductsToJSON();
        
        // Refresh list
        displayProductsList();
        
        console.log('Product deleted successfully');
    }
}

// Save products to JSON (simulation)
async function saveProductsToJSON() {
    try {
        // In a real implementation, this would send data to a server
        // For this demo, we'll save to localStorage as backup
        const dataToSave = {
            products: products,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('adminProductsBackup', JSON.stringify(dataToSave));
        
        // Simulate server save delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Products saved to backup storage');
        
    } catch (error) {
        console.error('Error saving products:', error);
        throw error;
    }
}

// Enhanced notification system for admin
function showNotification(message, type = 'info') {
    // Remove existing notifications if too many
    const existingNotifications = document.querySelectorAll('.notification');
    if (existingNotifications.length >= 3) {
        removeNotification(existingNotifications[0]);
    }
    
    // Get or create notifications container
    let notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.className = 'notifications-container';
        notificationsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationsContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: var(--card-bg);
        color: var(--text);
        padding: 1rem;
        border-radius: 8px;
        box-shadow: var(--shadow);
        border-left: 4px solid ${getTypeColor(type)};
        min-width: 300px;
        max-width: 400px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
    `;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-circle'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${icons[type]}" style="color: ${getTypeColor(type)};"></i>
            <span>${message}</span>
        </div>
        <button style="
            background: none;
            border: none;
            color: var(--text);
            cursor: pointer;
            padding: 0.25rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });
    
    // Close button functionality
    const closeBtn = notification.querySelector('button');
    closeBtn.addEventListener('click', () => removeNotification(notification));
    
    // Auto-remove
    setTimeout(() => {
        if (notification.parentNode) {
            removeNotification(notification);
        }
    }, 5000);
}

// Get color for notification type
function getTypeColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    return colors[type] || colors.info;
}

// Remove notification with animation
function removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 300);
}

// Load blogs from blogs.json
async function loadBlogs() {
    try {
        // Use unified DataLoader for blogs
        blogs = await window.utils.dataLoader.loadData('blogs');
        displayBlogsList();
    } catch (error) {
        window.utils.handleError(error, {
            module: 'admin',
            context: 'loadBlogs'
        });
        // Fallback to embedded data
        loadBlogsFromEmbeddedData();
    }
}

// Display blogs in table
function displayBlogsList() {
    const tableBody = document.getElementById('blogsTableBody');
    if (!tableBody) return;
    
    if (blogs.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <span class="es-text">No hay blogs disponibles</span>
                    <span class="ja-text">ブログがありません</span>
                    <span class="en-text">No blogs available</span>
                </td>
            </tr>
        `;
        return;
    }
    
    const blogsHTML = blogs.map(blog => {
        const publishedTexts = {
            es: blog.published ? 'Publicado' : 'Borrador',
            ja: blog.published ? '公開済み' : '下書き',
            en: blog.published ? 'Published' : 'Draft'
        };
        const statusText = publishedTexts[currentLanguage];
        
        return `
            <tr>
                <td data-label="ID">${blog.id}</td>
                <td data-label="Título">${blog.title}</td>
                <td data-label="Autor">${blog.author}</td>
                <td data-label="Fecha">${blog.publishDate || 'No date'}</td>
                <td data-label="Estado"><span style="color: ${blog.published ? '#27ae60' : '#f39c12'}">${statusText}</span></td>
                <td data-label="Acciones" class="product-actions">
                    <button class="edit-btn" onclick="editBlog('${blog.id}')">
                        <i class="fas fa-edit"></i>
                        <span class="es-text">Editar</span>
                        <span class="ja-text">編集</span>
                        <span class="en-text">Edit</span>
                    </button>
                    <button class="delete-btn" onclick="deleteBlog('${blog.id}')">
                        <i class="fas fa-trash"></i>
                        <span class="es-text">Eliminar</span>
                        <span class="ja-text">削除</span>
                        <span class="en-text">Delete</span>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = blogsHTML;
}

// Handle blog form submission
async function handleBlogSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Disable form during processing
    submitBtn.disabled = true;
    const savingTexts = {
        es: 'Guardando...',
        ja: '保存中...',
        en: 'Saving...'
    };
    submitBtn.innerHTML = savingTexts[currentLanguage];
    
    try {
        const blogData = {
            id: document.getElementById('blogId').value || generateBlogId(),
            title: document.getElementById('blogTitle').value.trim(),
            slug: document.getElementById('blogSlug').value.trim() || generateSlug(document.getElementById('blogTitle').value),
            excerpt: document.getElementById('blogExcerpt').value.trim(),
            content: document.getElementById('blogContent').value.trim(),
            image: document.getElementById('blogImage').value.trim() || 'assets/images/blog/default.jpg',
            author: document.getElementById('blogAuthor').value.trim(),
            publishDate: new Date().toISOString().split('T')[0],
            tags: document.getElementById('blogTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            featured: document.getElementById('blogFeatured').checked,
            published: document.getElementById('blogPublished').checked
        };
        
        if (editingBlogId) {
            // Update existing blog
            updateBlog(blogData);
        } else {
            // Add new blog
            addBlog(blogData);
        }
        
        // Save to JSON (simulation)
        await saveBlogsToJSON();
        
        // Reset form and refresh list
        resetBlogForm();
        displayBlogsList();
        
        console.log('Blog saved successfully');
        
    } catch (error) {
        console.error('Error saving blog:', error);
        console.error('Error saving blog:', error);
    } finally {
        // Re-enable form
        submitBtn.disabled = false;
        const saveTexts = {
            es: 'Guardar Blog',
            ja: 'ブログを保存',
            en: 'Save Blog'
        };
        submitBtn.innerHTML = saveTexts[currentLanguage];
    }
}

// Generate new blog ID
function generateBlogId() {
    const existingIds = blogs.map(b => b.id);
    let newId;
    let counter = 1;
    
    do {
        newId = `blog${String(counter).padStart(3, '0')}`;
        counter++;
    } while (existingIds.includes(newId));
    
    return newId;
}

// Generate slug from title
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Add new blog
function addBlog(blogData) {
    blogs.push(blogData);
}

// Update existing blog
function updateBlog(blogData) {
    const index = blogs.findIndex(b => b.id === blogData.id);
    if (index !== -1) {
        blogs[index] = blogData;
    }
}

// Edit blog
function editBlog(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;
    
    editingBlogId = blogId;
    
    // Fill form with blog data
    document.getElementById('blogId').value = blog.id;
    document.getElementById('blogTitle').value = blog.title;
    document.getElementById('blogSlug').value = blog.slug;
    document.getElementById('blogExcerpt').value = blog.excerpt;
    document.getElementById('blogContent').value = blog.content;
    document.getElementById('blogImage').value = blog.image;
    document.getElementById('blogAuthor').value = blog.author;
    document.getElementById('blogTags').value = blog.tags ? blog.tags.join(', ') : '';
    document.getElementById('blogFeatured').checked = blog.featured;
    document.getElementById('blogPublished').checked = blog.published;
    
    // Preview the image
    previewBlogImage();
    
    // Show cancel button
    document.getElementById('cancelBlogEdit').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.blog-form').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Cancel blog edit
function cancelBlogEdit() {
    editingBlogId = null;
    resetBlogForm();
}

// Reset blog form
function resetBlogForm() {
    document.getElementById('blogForm').reset();
    document.getElementById('blogId').value = '';
    document.getElementById('cancelBlogEdit').style.display = 'none';
    document.getElementById('blogPublished').checked = true; // Default to published
    editingBlogId = null;
    
    // Clear image preview
    clearBlogImage();
}

// Delete blog
function deleteBlog(blogId) {
    const blog = blogs.find(b => b.id === blogId);
    if (!blog) return;
    
    const confirmMessages = {
        es: `¿Estás seguro de que quieres eliminar "${blog.title}"?`,
        ja: `"${blog.title}"を削除してもよろしいですか？`,
        en: `Are you sure you want to delete "${blog.title}"?`
    };
    
    if (confirm(confirmMessages[currentLanguage])) {
        blogs = blogs.filter(b => b.id !== blogId);
        
        // Save changes
        saveBlogsToJSON();
        
        // Refresh list
        displayBlogsList();
        
        console.log('Blog deleted successfully');
    }
}

// Save blogs to JSON (simulation)
async function saveBlogsToJSON() {
    try {
        const dataToSave = {
            blogs: blogs,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('adminBlogsBackup', JSON.stringify(dataToSave));
        
        // Simulate server save delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('Blogs saved to backup storage');
        
    } catch (error) {
        console.error('Error saving blogs:', error);
        throw error;
    }
}

// Prevent unauthorized access
window.addEventListener('beforeunload', function() {
    if (!isAuthenticated) {
        sessionStorage.removeItem('adminAuth');
    }
});

// Security: Clear session on tab close/browser close
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden' && isAuthenticated) {
        // Keep session but could add additional security here
        console.log('Admin session maintained');
    }
});

// Number input adjustment
function adjustNumber(inputId, change) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 0;
    const newValue = Math.max(0, currentValue + change);
    input.value = newValue;
    
    // Trigger change event
    input.dispatchEvent(new Event('change'));
}

// Initialize image management
function initializeImageManagement() {
    // Auto-preview images when path changes
    const productImageInput = document.getElementById('productImage');
    const blogImageInput = document.getElementById('blogImage');
    
    if (productImageInput) {
        productImageInput.addEventListener('input', () => previewProductImage());
    }
    
    if (blogImageInput) {
        blogImageInput.addEventListener('input', () => previewBlogImage());
    }
}

// Product image management
function handleProductImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // Create a temporary URL for preview
        const objectURL = URL.createObjectURL(file);
        
        // Update the image display
        const imageDisplay = document.getElementById('productImageDisplay');
        const placeholder = document.getElementById('productImagePlaceholder');
        
        imageDisplay.src = objectURL;
        imageDisplay.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Update the path input with filename
        document.getElementById('productImage').value = `assets/images/products/${file.name}`;
        
        // Clean up the object URL when the image loads
        imageDisplay.onload = function() {
            URL.revokeObjectURL(objectURL);
        };
        
        // Show success notification
        const successTexts = {
            es: 'Imagen seleccionada correctamente',
            ja: '画像が正しく選択されました',
            en: 'Image selected successfully'
        };
        console.log('Image selected successfully');
    } else {
        const errorTexts = {
            es: 'Por favor selecciona un archivo de imagen válido',
            ja: '有効な画像ファイルを選択してください',
            en: 'Please select a valid image file'
        };
        console.error('Please select a valid image file');
    }
}

function previewProductImage() {
    const imagePath = document.getElementById('productImage').value.trim();
    const imageDisplay = document.getElementById('productImageDisplay');
    const placeholder = document.getElementById('productImagePlaceholder');
    
    if (imagePath) {
        imageDisplay.src = imagePath;
        imageDisplay.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Handle image load error
        imageDisplay.onerror = function() {
            this.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div style="text-align: center; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    <span class="es-text">Error cargando imagen</span>
                    <span class="ja-text">画像読み込みエラー</span>
                    <span class="en-text">Image load error</span>
                </div>
            `;
        };
    } else {
        imageDisplay.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                <span class="es-text">No hay imagen</span>
                <span class="ja-text">画像なし</span>
                <span class="en-text">No image</span>
            </div>
        `;
    }
}

function clearProductImage() {
    document.getElementById('productImage').value = '';
    previewProductImage();
}

// Blog image management
function handleBlogImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        // Create a temporary URL for preview
        const objectURL = URL.createObjectURL(file);
        
        // Update the image display
        const imageDisplay = document.getElementById('blogImageDisplay');
        const placeholder = document.getElementById('blogImagePlaceholder');
        
        imageDisplay.src = objectURL;
        imageDisplay.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Update the path input with filename
        document.getElementById('blogImage').value = `assets/images/blog/${file.name}`;
        
        // Clean up the object URL when the image loads
        imageDisplay.onload = function() {
            URL.revokeObjectURL(objectURL);
        };
        
        // Show success notification
        const successTexts = {
            es: 'Imagen seleccionada correctamente',
            ja: '画像が正しく選択されました',
            en: 'Image selected successfully'
        };
        console.log('Image selected successfully');
    } else {
        const errorTexts = {
            es: 'Por favor selecciona un archivo de imagen válido',
            ja: '有効な画像ファイルを選択してください',
            en: 'Please select a valid image file'
        };
        console.error('Please select a valid image file');
    }
}

function previewBlogImage() {
    const imagePath = document.getElementById('blogImage').value.trim();
    const imageDisplay = document.getElementById('blogImageDisplay');
    const placeholder = document.getElementById('blogImagePlaceholder');
    
    if (imagePath) {
        imageDisplay.src = imagePath;
        imageDisplay.style.display = 'block';
        placeholder.style.display = 'none';
        
        // Handle image load error
        imageDisplay.onerror = function() {
            this.style.display = 'none';
            placeholder.style.display = 'flex';
            placeholder.innerHTML = `
                <div style="text-align: center; color: #e74c3c;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    <span class="es-text">Error cargando imagen</span>
                    <span class="ja-text">画像読み込みエラー</span>
                    <span class="en-text">Image load error</span>
                </div>
            `;
        };
    } else {
        imageDisplay.style.display = 'none';
        placeholder.style.display = 'flex';
        placeholder.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-image" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                <span class="es-text">No hay imagen</span>
                <span class="ja-text">画像なし</span>
                <span class="en-text">No image</span>
            </div>
        `;
    }
}

function clearBlogImage() {
    document.getElementById('blogImage').value = '';
    previewBlogImage();
}

// Tab navigation removed - using single page layout
// function initializeTabNavigation() { ... }

// Switch between tabs
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Validate tab name
    if (!tabName || !['products', 'blogs'].includes(tabName)) {
        console.error('Invalid tab name:', tabName);
        return;
    }
    
    try {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        console.log('Found tab buttons:', tabButtons.length);
        
        tabButtons.forEach((button, index) => {
            const isActive = button.dataset.tab === tabName;
            button.classList.toggle('active', isActive);
            console.log(`Button ${index} (${button.dataset.tab}): ${isActive ? 'active' : 'inactive'}`);
        });
        
        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        console.log('Found tab contents:', tabContents.length);
        
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabName}Tab`);
        console.log('Target content element:', targetContent);
        
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            targetContent.style.visibility = 'visible';
            targetContent.style.opacity = '1';
            console.log('Tab switched successfully to:', tabName);
            
            // Verify visibility
            setTimeout(() => {
                const computedStyle = window.getComputedStyle(targetContent);
                console.log('Final display style:', computedStyle.display);
                console.log('Final visibility style:', computedStyle.visibility);
            }, 50);
        } else {
            console.error('Could not find tab content for:', tabName);
            return;
        }
        
        // Load data based on tab
        if (tabName === 'blogs' && blogs.length === 0) {
            console.log('Loading blogs data...');
            loadBlogs();
        } else if (tabName === 'products' && products.length === 0) {
            console.log('Loading products data...');
            loadProducts();
        }
        
        // Notification removed - user doesn't want popups
        
        // Save current tab preference
        localStorage.setItem('adminCurrentTab', tabName);
        
    } catch (error) {
        console.error('Error switching tabs:', error);
        showNotification('Error al cambiar de pestaña', 'error');
    }
}

// Make switchTab globally accessible for debugging and direct calls
window.switchTab = switchTab;

// Debug function to check tab state
window.debugTab = function() {
    console.log('=== TAB DEBUG INFO ===');
    console.log('Tab buttons found:', document.querySelectorAll('.tab-btn').length);
    console.log('Tab contents found:', document.querySelectorAll('.tab-content').length);
    console.log('Products tab exists:', !!document.getElementById('productsTab'));
    console.log('Blogs tab exists:', !!document.getElementById('blogsTab'));
    console.log('Current language:', currentLanguage);
    console.log('Is authenticated:', isAuthenticated);
    
    // Try to click blogs tab directly
    const blogsBtn = document.querySelector('[data-tab="blogs"]');
    if (blogsBtn) {
        console.log('Blogs button found, attempting direct click...');
        blogsBtn.click();
    } else {
        console.log('Blogs button NOT found!');
    }
};

// Embedded data fallback functions
function loadProductsFromEmbeddedData() {
    // Sample product data for testing
    products = [
        {
            "id": "p001",
            "name": "Figura Demon Slayer - Tanjiro Kamado",
            "category": "figuras",
            "price": 1299,
            "image": "assets/images/products/nezuko.jpg",
            "description": "Figura de alta calidad de Tanjiro Kamado del popular anime Demon Slayer. Perfecta para coleccionistas.",
            "featured": true,
            "tags": ["anime", "demon-slayer", "figura"]
        },
        {
            "id": "p002",
            "name": "Figura My Hero Academia - All Might",
            "category": "figuras",
            "price": 1499,
            "image": "assets/images/products/allmight.jpg",
            "description": "Figura del símbolo de la paz All Might de My Hero Academia en su forma musculosa.",
            "featured": true,
            "tags": ["anime", "my-hero-academia", "figura"]
        },
        {
            "id": "p003",
            "name": "Peluche Pikachu Pokémon",
            "category": "peluches",
            "price": 699,
            "image": "assets/images/products/pikachu-plush.jpg",
            "description": "Peluche oficial de Pikachu, el Pokémon más querido.",
            "featured": true,
            "tags": ["pokemon", "pikachu", "peluche"]
        },
        {
            "id": "p004",
            "name": "Camiseta Dragon Ball Z",
            "category": "ropa",
            "price": 599,
            "image": "assets/images/products/dbz-shirt.jpg",
            "description": "Camiseta oficial de Dragon Ball Z con diseño de Goku.",
            "featured": false,
            "tags": ["dragon-ball", "camiseta", "ropa"]
        },
        {
            "id": "p005",
            "name": "Figura Attack on Titan - Levi",
            "category": "figuras",
            "price": 1399,
            "image": "assets/images/products/levi.jpg",
            "description": "Figura del Capitán Levi de Attack on Titan en pose de combate.",
            "featured": false,
            "tags": ["attack-on-titan", "levi", "figura"]
        },
        {
            "id": "p006",
            "name": "Figura Jujutsu Kaisen - Gojo",
            "category": "figuras",
            "price": 1599,
            "image": "assets/images/products/gojo.jpg",
            "description": "Figura de Satoru Gojo de Jujutsu Kaisen con efectos especiales.",
            "featured": true,
            "tags": ["jujutsu-kaisen", "gojo", "figura"]
        },
        {
            "id": "p007",
            "name": "Manga One Piece Tomo 1",
            "category": "manga",
            "price": 299,
            "image": "assets/images/products/onepiece-manga.jpg",
            "description": "Primer tomo del manga One Piece de Eiichiro Oda.",
            "featured": false,
            "tags": ["one-piece", "manga", "luffy"]
        },
        {
            "id": "p008",
            "name": "Figura Demon Slayer - Nezuko",
            "category": "figuras",
            "price": 1199,
            "image": "assets/images/products/nezuko.jpg",
            "description": "Figura de Nezuko Kamado en su forma demonio de Demon Slayer.",
            "featured": false,
            "tags": ["demon-slayer", "nezuko", "figura"]
        },
        {
            "id": "p009",
            "name": "Peluche Charizard Pokémon",
            "category": "peluches",
            "price": 899,
            "image": "assets/images/products/charizard-plush.jpg",
            "description": "Peluche de Charizard, el Pokémon dragón tipo fuego.",
            "featured": false,
            "tags": ["pokemon", "charizard", "peluche"]
        },
        {
            "id": "p010",
            "name": "Camiseta Attack on Titan",
            "category": "ropa",
            "price": 649,
            "image": "assets/images/products/aot-shirt.jpg",
            "description": "Camiseta con el emblema de las Alas de la Libertad de Attack on Titan.",
            "featured": false,
            "tags": ["attack-on-titan", "camiseta", "ropa"]
        },
        {
            "id": "p011",
            "name": "Figura Dragon Ball - Goku Ultra Instinct",
            "category": "figuras",
            "price": 1799,
            "image": "assets/images/products/goku-ui.jpg",
            "description": "Figura de Goku en su forma Ultra Instinto con efectos luminosos.",
            "featured": true,
            "tags": ["dragon-ball", "goku", "figura"]
        },
        {
            "id": "p012",
            "name": "Manga Jujutsu Kaisen Tomo 1",
            "category": "manga",
            "price": 299,
            "image": "assets/images/products/jjk-manga.jpg",
            "description": "Primer tomo del manga Jujutsu Kaisen de Gege Akutami.",
            "featured": false,
            "tags": ["jujutsu-kaisen", "manga", "yuji"]
        },
        {
            "id": "p013",
            "name": "Figura My Hero Academia - Bakugo",
            "category": "figuras",
            "price": 1399,
            "image": "assets/images/products/bakugo.jpg",
            "description": "Figura de Katsuki Bakugo con efectos de explosión de My Hero Academia.",
            "featured": false,
            "tags": ["my-hero-academia", "bakugo", "figura"]
        },
        {
            "id": "p014",
            "name": "Camiseta Jujutsu Kaisen",
            "category": "ropa",
            "price": 599,
            "image": "assets/images/products/jjk-shirt.jpg",
            "description": "Camiseta oficial de Jujutsu Kaisen con diseño de Yuji Itadori.",
            "featured": false,
            "tags": ["jujutsu-kaisen", "camiseta", "ropa"]
        },
        {
            "id": "p015",
            "name": "Figura Demon Slayer - Inosuke",
            "category": "figuras",
            "price": 1299,
            "image": "assets/images/products/inosuke.jpg",
            "description": "Figura de Inosuke Hashibira con sus espadas serradas de Demon Slayer.",
            "featured": false,
            "tags": ["demon-slayer", "inosuke", "figura"]
        },
        {
            "id": "p016",
            "name": "Peluche Eevee Pokémon",
            "category": "peluches",
            "price": 799,
            "image": "assets/images/products/eevee-plush.jpg",
            "description": "Peluche de Eevee, el Pokémon evolución más adorable.",
            "featured": false,
            "tags": ["pokemon", "eevee", "peluche"]
        },
        {
            "id": "p017",
            "name": "Figura Fullmetal Alchemist - Edward Elric",
            "category": "figuras",
            "price": 1499,
            "image": "assets/images/products/edward-elric.jpg",
            "description": "Figura del Alquimista Fullmetal Edward Elric con brazo automail.",
            "featured": false,
            "tags": ["fullmetal-alchemist", "edward", "figura"]
        },
        {
            "id": "p018",
            "name": "Camiseta Fullmetal Alchemist",
            "category": "ropa",
            "price": 649,
            "image": "assets/images/products/fma-shirt.jpg",
            "description": "Camiseta con el símbolo de la alquimia de Fullmetal Alchemist.",
            "featured": false,
            "tags": ["fullmetal-alchemist", "camiseta", "ropa"]
        },
        {
            "id": "p019",
            "name": "Manga Attack on Titan Completa",
            "category": "manga",
            "price": 2999,
            "image": "assets/images/products/aot-complete.jpg",
            "description": "Colección completa del manga Attack on Titan de Hajime Isayama.",
            "featured": true,
            "tags": ["attack-on-titan", "manga", "coleccion"]
        },
        {
            "id": "p020",
            "name": "Figura One Piece - Luffy Gear 4",
            "category": "figuras",
            "price": 1699,
            "image": "assets/images/products/luffy-gear4.jpg",
            "description": "Figura de Monkey D. Luffy en su forma Gear 4 de One Piece.",
            "featured": true,
            "tags": ["one-piece", "luffy", "figura"]
        }
    ];
    
    displayProductsList();
}

function loadBlogsFromEmbeddedData() {
    // Sample blog data for testing
    blogs = [
        {
            "id": "blog001",
            "title": "¿Por qué los Mexicanos se Enamoran del Anime?",
            "slug": "mexicanos-anime",
            "excerpt": "Descubre las sorprendentes similitudes entre la cultura mexicana y japonesa que explican por qué el anime resuena tanto en México.",
            "content": "El fenómeno del anime en México ha crecido exponencialmente en las últimas décadas...",
            "image": "assets/images/blog/anime-guide.jpg",
            "author": "María González",
            "publishDate": "2024-01-15",
            "tags": ["anime", "cultura", "mexico", "japon"],
            "featured": true,
            "published": true
        },
        {
            "id": "blog002",
            "title": "Guía Completa de Manga para Principiantes",
            "slug": "guia-manga-principiantes",
            "excerpt": "Todo lo que necesitas saber para comenzar tu aventura en el mundo del manga japonés.",
            "content": "El manga es mucho más que cómics japoneses; es una forma de arte que ha conquistado el mundo entero...",
            "image": "assets/images/blog/top-manga.jpg",
            "author": "Hiroshi Tanaka",
            "publishDate": "2024-01-20",
            "tags": ["manga", "principiantes", "guia", "lectura"],
            "featured": true,
            "published": true
        },
        {
            "id": "blog003",
            "title": "La Magia de Studio Ghibli",
            "slug": "magia-studio-ghibli",
            "excerpt": "Un viaje por las películas más emblemáticas del estudio que redefinió la animación japonesa.",
            "content": "Studio Ghibli no es solo un estudio de animación; es una ventana mágica a mundos donde la fantasía y la realidad se entrelazan...",
            "image": "assets/images/blog/ghibli.jpg",
            "author": "Ana Martínez",
            "publishDate": "2024-01-25",
            "tags": ["ghibli", "miyazaki", "animacion", "peliculas"],
            "featured": false,
            "published": true
        },
        {
            "id": "blog004",
            "title": "Explorando Harajuku: El Corazón de la Moda Kawaii",
            "slug": "harajuku-moda-kawaii",
            "excerpt": "Descubre el distrito más colorido y creativo de Tokio, donde nace la moda kawaii que conquista el mundo.",
            "content": "Harajuku es más que un distrito de Tokio; es el epicentro de una revolución cultural que ha redefinido la moda juvenil...",
            "image": "assets/images/blog/harajuku.jpg",
            "author": "Yuki Tanaka",
            "publishDate": "2024-02-01",
            "tags": ["harajuku", "moda", "kawaii", "tokio", "cultura"],
            "featured": true,
            "published": true
        },
        {
            "id": "blog005",
            "title": "Los Videojuegos Japoneses que Marcaron Historia",
            "slug": "videojuegos-japoneses-historia",
            "excerpt": "Un recorrido por los videojuegos nipones que revolucionaron la industria y definieron géneros enteros.",
            "content": "Japón no solo es la cuna de muchas franquicias de videojuegos icónicas, sino que ha definido géneros enteros...",
            "image": "assets/images/blog/japanese-games.jpg",
            "author": "Carlos Ruiz",
            "publishDate": "2024-02-05",
            "tags": ["videojuegos", "nintendo", "gaming", "historia", "japon"],
            "featured": false,
            "published": true
        }
    ];
    
    displayBlogsList();
}