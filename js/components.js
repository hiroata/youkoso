// コンポーネント用JavaScript

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in components.js');
    
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
});

// 現在のパスを取得する関数
function getCurrentPath() {
    const path = window.location.pathname;
    console.log('Current path:', path);
    const isInProductsFolder = path.includes('/products/');
    const isInBlogFolder = path.includes('/blog/');
    return { 
        isRoot: !isInProductsFolder && !isInBlogFolder, 
        isInProductsFolder, 
        isInBlogFolder,
        path 
    };
}

// パスに基づいて相対パスを生成する関数
function getRelativePath() {
    const { isRoot } = getCurrentPath();
    const relativePath = isRoot ? '' : '../';
    console.log('Relative path:', relativePath);
    return relativePath;
}

// 現在のパスとURLを比較して、アクティブクラスを追加するか判断する関数
function isActiveLink(linkPath) {
    const currentPath = window.location.pathname;
    console.log('Comparing current path:', currentPath, 'with link path:', linkPath);
    
    if (linkPath === 'index.html' || linkPath === '') {
        return currentPath.endsWith('index.html') || currentPath.endsWith('/');
    }
    return currentPath.includes(linkPath);
}

// ヘッダーを読み込む関数
function loadHeader(placeholder) {
    try {
        console.log('Loading header component');
        const { isInProductsFolder, isInBlogFolder } = getCurrentPath();
        const relativePath = getRelativePath();
        
        // 現在のパスに基づいてアクティブクラスを設定
        const homeClass = !isInProductsFolder && !isInBlogFolder ? ' class="active"' : '';
        const productsClass = isInProductsFolder ? ' class="active"' : '';
        const blogClass = isInBlogFolder ? ' class="active"' : '';
        
        console.log('Active classes:', { homeClass, productsClass, blogClass });
        
        // ヘッダーのHTMLを生成
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
        
        // プレースホルダーにヘッダーを挿入
        placeholder.innerHTML = headerHTML;
        console.log('Header component loaded');
        
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

// フッターを読み込む関数
function loadFooter(placeholder) {
    try {
        console.log('Loading footer component');
        const relativePath = getRelativePath();
        
        // フッターのHTMLを生成
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
                    <div class="footer-social">
                        <h3>Síguenos</h3>
                        <div class="social-links" id="social-links-footer">
                            <a href="https://facebook.com/holajapon" target="_blank" rel="noopener noreferrer">
                                <img src="${relativePath}assets/images/ui/facebook.png" alt="Facebook" loading="lazy">
                            </a>
                            <a href="https://instagram.com/holajapon" target="_blank" rel="noopener noreferrer">
                                <img src="${relativePath}assets/images/ui/instagram.png" alt="Instagram" loading="lazy">
                            </a>
                            <a href="https://twitter.com/holajapon" target="_blank" rel="noopener noreferrer">
                                <img src="${relativePath}assets/images/ui/twitter.png" alt="Twitter" loading="lazy">
                            </a>
                        </div>
                    </div>
                </div>
                <div class="copyright">
                    <p>&copy; 2025 Hola Japón. Todos los derechos reservados.</p>
                </div>
            </div>
        `;
        
        // プレースホルダーにフッターを挿入
        placeholder.innerHTML = footerHTML;
        console.log('Footer component loaded');
    } catch (error) {
        console.error('Error loading footer component:', error);
        placeholder.innerHTML = '<div class="container"><p>Error loading footer</p></div>';
    }
}

// 商品カードコンポーネントを作成する関数
function createProductCardComponent(product, relativePath = '') {
    try {
        // 商品の詳細ページへのリンクパス
        const detailPath = `${relativePath}products/product-detail.html?id=${product.id}`;
        
        // 商品画像のパス
        const imagePath = `${relativePath}${product.image.replace('../', '')}`;
        
        return `
            <div class="product-card" data-id="${product.id}" data-category="${product.category}">
                <div class="product-image-container">
                    <img src="${imagePath}" alt="${product.name}" class="product-image" loading="lazy">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">${window.utils ? window.utils.formatCurrency(product.price) : '$' + product.price.toFixed(2) + ' MXN'}</div>
                    <a href="${detailPath}" class="btn">
                        <span class="es-text">Ver Detalles</span>
                        <span class="ja-text">詳細を見る</span>
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating product card component:', error, product);
        return `<div class="product-card error">Error loading product</div>`;
    }
}

// ブログカードコンポーネントを作成する関数
function createBlogCardComponent(post, relativePath = '') {
    try {
        // ブログ詳細ページへのリンクパス
        const detailPath = `${relativePath}blog/blog-detail.html?id=${post.id}`;
        
        // 画像のパス
        const imagePath = `${relativePath}${post.image.replace('../', '')}`;
        
        // 日付のフォーマット
        const formattedDate = window.utils ? 
            window.utils.formatDate(post.date) : 
            new Date(post.date).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        
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
                    <a href="${detailPath}" class="btn">
                        <span class="es-text">Leer Más</span>
                        <span class="ja-text">続きを読む</span>
                    </a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error creating blog card component:', error, post);
        return `<div class="blog-card error">Error loading blog post</div>`;
    }
}

// お客様の声カードコンポーネントを作成する関数
function createTestimonialCardComponent(testimonial) {
    try {
        // アバター画像のパス
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

// カテゴリーカードコンポーネントを作成する関数
function createCategoryCardComponent(category, relativePath = '') {
    try {
        return `
            <a href="${relativePath}products/index.html?category=${category.slug}" class="category-card">
                <div class="category-icon-container">
                    <img src="${relativePath}assets/images/ui/category-${category.slug}.jpg" alt="${category.name}" class="category-icon" loading="lazy">
                </div>
                <h3>
                    <span class="es-text">${category.name}</span>
                    <span class="ja-text">${category.nameJa}</span>
                </h3>
            </a>
        `;
    } catch (error) {
        console.error('Error creating category card component:', error, category);
        return `<div class="category-card error">Error loading category</div>`;
    }
}

// エクスポート（他のJSファイルから参照できるようにする）
window.createProductCardComponent = createProductCardComponent;
window.createBlogCardComponent = createBlogCardComponent;
window.createTestimonialCardComponent = createTestimonialCardComponent;
window.createCategoryCardComponent = createCategoryCardComponent;