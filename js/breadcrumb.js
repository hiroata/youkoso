// パンくずナビゲーション機能

class BreadcrumbManager {
    constructor() {
        this.pathMap = {
            '/': { es: 'Inicio', ja: 'ホーム' },
            '/products/': { es: 'Productos', ja: '商品' },
            '/products/index.html': { es: 'Productos', ja: '商品' },
            '/products/product-detail.html': { es: 'Detalle del Producto', ja: '商品詳細' },
            '/products/peluches/': { es: 'Peluches', ja: 'ぬいぐるみ' },
            '/products/peluches/index.html': { es: 'Peluches', ja: 'ぬいぐるみ' },
            '/products/peluches/labubu.html': { es: 'Labubu', ja: 'ラブブ' },
            '/products/peluches/monchhichi.html': { es: 'Monchhichi', ja: 'モンチッチ' },
            '/blog/': { es: 'Blog', ja: 'ブログ' },
            '/blog/index.html': { es: 'Blog', ja: 'ブログ' },
            '/blog/blog-detail.html': { es: 'Artículo', ja: '記事' },
            '/about.html': { es: 'Sobre Nosotros', ja: '私たちについて' },
            '/contact.html': { es: 'Contacto', ja: 'お問い合わせ' },
            '/testimonials.html': { es: 'Testimonios', ja: 'お客様の声' }
        };
        
        this.init();
    }
    
    init() {
        this.createBreadcrumbContainer();
        this.updateBreadcrumb();
        this.setupLanguageChangeListener();
    }
    
    createBreadcrumbContainer() {
        // 既存のパンくずナビゲーションがあるかチェック
        if (document.querySelector('.breadcrumb-navigation')) return;
        
        // mainタグの直後にパンくずナビゲーションを追加
        const main = document.querySelector('main');
        if (!main) return;
        
        const breadcrumbNav = document.createElement('nav');
        breadcrumbNav.className = 'breadcrumb-navigation';
        breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');
        breadcrumbNav.innerHTML = '<div class="container"><ol class="breadcrumb-list" id="breadcrumb-list"></ol></div>';
        
        main.parentNode.insertBefore(breadcrumbNav, main);
        
        // スタイルを追加
        this.addBreadcrumbStyles();
    }
    
    updateBreadcrumb() {
        const breadcrumbList = document.getElementById('breadcrumb-list');
        if (!breadcrumbList) return;
        
        const currentPath = this.getCurrentPath();
        const pathSegments = this.getPathSegments(currentPath);
        const breadcrumbItems = this.generateBreadcrumbItems(pathSegments);
        
        breadcrumbList.innerHTML = breadcrumbItems.join('');
        
        // 非表示にする条件
        if (this.shouldHideBreadcrumb(currentPath)) {
            document.querySelector('.breadcrumb-navigation').style.display = 'none';
        } else {
            document.querySelector('.breadcrumb-navigation').style.display = 'block';
        }
    }
    
    getCurrentPath() {
        let path = window.location.pathname;
        
        // index.htmlを削除して正規化
        if (path.endsWith('/index.html')) {
            path = path.replace('/index.html', '/');
        }
        
        return path;
    }
    
    getPathSegments(currentPath) {
        const segments = [];
        
        // ホームは常に追加
        segments.push({
            path: '/',
            title: this.pathMap['/'],
            isActive: false
        });
        
        // パスを分解
        const pathParts = currentPath.split('/').filter(part => part !== '');
        let cumulativePath = '';
        
        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            cumulativePath += '/' + part;
            
            // 最後のセグメントでない場合は/を追加
            const fullPath = i === pathParts.length - 1 ? 
                             cumulativePath : 
                             cumulativePath + '/';
            
            const title = this.pathMap[fullPath] || this.pathMap[cumulativePath] || { es: this.formatTitle(part), ja: this.formatTitle(part) };
            
            segments.push({
                path: fullPath,
                title: title,
                isActive: i === pathParts.length - 1
            });
        }
        
        // 商品詳細ページの場合、商品名を取得
        if (currentPath.includes('product-detail.html')) {
            this.addProductNameToBreadcrumb(segments);
        }
        
        // ブログ詳細ページの場合、記事タイトルを取得
        if (currentPath.includes('blog-detail.html')) {
            this.addArticleTitleToBreadcrumb(segments);
        }
        
        return segments;
    }
    
    formatTitle(str) {
        return str.replace(/[-_]/g, ' ')
                 .split(' ')
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');
    }
    
    addProductNameToBreadcrumb(segments) {
        const productId = this.getUrlParam('id');
        if (!productId) return;
        
        // 商品データから商品名を取得
        if (window.siteData && window.siteData.products) {
            const product = window.siteData.products.find(p => p.id === productId);
            if (product) {
                segments[segments.length - 1].title = {
                    es: product.name,
                    ja: product.name
                };
            }
        }
    }
    
    addArticleTitleToBreadcrumb(segments) {
        const articleId = this.getUrlParam('id');
        if (!articleId) return;
        
        // ブログデータから記事タイトルを取得
        if (window.siteData && window.siteData.posts) {
            const post = window.siteData.posts.find(p => p.id === articleId);
            if (post) {
                segments[segments.length - 1].title = {
                    es: post.title,
                    ja: post.title
                };
            }
        }
    }
    
    generateBreadcrumbItems(segments) {
        const isJapanese = document.body.classList.contains('ja');
        
        return segments.map((segment) => {
            const title = typeof segment.title === 'object' ? 
                         segment.title[isJapanese ? 'ja' : 'es'] : 
                         segment.title;
            
            if (segment.isActive) {
                return `
                    <li class="breadcrumb-item active" aria-current="page">
                        <span>${title}</span>
                    </li>
                `;
            } else {
                return `
                    <li class="breadcrumb-item">
                        <a href="${segment.path}">${title}</a>
                    </li>
                `;
            }
        });
    }
    
    shouldHideBreadcrumb(currentPath) {
        // ホームページでは非表示
        return currentPath === '/' || currentPath === '/index.html';
    }
    
    setupLanguageChangeListener() {
        document.addEventListener('languageChanged', () => {
            this.updateBreadcrumb();
        });
    }
    
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    
    addBreadcrumbStyles() {
        if (document.getElementById('breadcrumb-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'breadcrumb-styles';
        style.textContent = `
            .breadcrumb-navigation {
                background-color: #f8f9fa;
                border-bottom: 1px solid #e9ecef;
                padding: 10px 0;
                font-size: 0.9em;
            }
            
            .breadcrumb-list {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                margin: 0;
                padding: 0;
                list-style: none;
            }
            
            .breadcrumb-item {
                display: flex;
                align-items: center;
            }
            
            .breadcrumb-item + .breadcrumb-item::before {
                content: '/';
                margin: 0 8px;
                color: #6c757d;
                font-weight: 300;
            }
            
            .breadcrumb-item a {
                color: var(--primary-color);
                text-decoration: none;
                transition: color 0.2s ease;
            }
            
            .breadcrumb-item a:hover {
                color: #0056b3;
                text-decoration: underline;
            }
            
            .breadcrumb-item.active span {
                color: #6c757d;
                font-weight: 500;
            }
            
            @media (max-width: 768px) {
                .breadcrumb-navigation {
                    padding: 8px 0;
                    font-size: 0.85em;
                }
                
                .breadcrumb-item + .breadcrumb-item::before {
                    margin: 0 6px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', function() {
    window.breadcrumbManager = new BreadcrumbManager();
});

// エクスポート
window.BreadcrumbManager = BreadcrumbManager;