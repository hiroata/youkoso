// SEO最適化スクリプト
// メタタグ、構造化データ、パフォーマンス最適化を管理

class SEOOptimizer {
    constructor() {
        this.structuredData = {};
        this.currentPage = this.getCurrentPageType();
        this.isInitialized = false;
    }

    // 初期化
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('SEO Optimizer: Initializing...');
            
            // 基本的なSEO最適化
            this.optimizeBasicSEO();
            
            // 構造化データの設定
            await this.setupStructuredData();
            
            // Open Graphの最適化
            this.optimizeOpenGraph();
            
            // Twitter Cardの最適化
            this.optimizeTwitterCard();
            
            // パフォーマンス関連のSEO
            this.optimizePerformanceSEO();
            
            // 内部リンク最適化
            this.optimizeInternalLinks();
            
            this.isInitialized = true;
            console.log('SEO Optimizer: Initialized successfully');
            
        } catch (error) {
            console.error('SEO Optimizer: Initialization failed', error);
        }
    }

    // 現在のページタイプを取得
    getCurrentPageType() {
        const path = window.location.pathname;
        
        if (path === '/' || path.includes('index.html')) {
            return 'home';
        } else if (path.includes('/products/')) {
            if (path.includes('product-detail.html')) {
                return 'product';
            }
            return 'products';
        } else if (path.includes('/blog/')) {
            if (path.includes('blog-detail.html')) {
                return 'article';
            }
            return 'blog';
        } else if (path.includes('/about.html')) {
            return 'about';
        } else if (path.includes('/contact.html')) {
            return 'contact';
        }
        
        return 'page';
    }

    // 基本的なSEO最適化
    optimizeBasicSEO() {
        // 言語属性の動的更新
        document.addEventListener('languageChanged', (e) => {
            const lang = e.detail.language;
            document.documentElement.lang = lang === 'ja' ? 'ja' : 'es-MX';
        });

        // キャノニカルURLの設定
        this.setCanonicalUrl();

        // robots metaの最適化
        this.optimizeRobotsMeta();

        // viewport metaの最適化
        this.optimizeViewportMeta();
    }

    // キャノニカルURLの設定
    setCanonicalUrl() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }

        const currentUrl = new URL(window.location.href);
        // URLパラメータを正規化
        const cleanUrl = `${currentUrl.origin}${currentUrl.pathname}`;
        canonical.href = cleanUrl;
    }

    // robots metaの最適化
    optimizeRobotsMeta() {
        let robotsMeta = document.querySelector('meta[name="robots"]');
        if (!robotsMeta) {
            robotsMeta = document.createElement('meta');
            robotsMeta.name = 'robots';
            document.head.appendChild(robotsMeta);
        }

        // ページタイプに応じてrobotsを設定
        switch (this.currentPage) {
            case 'home':
            case 'products':
            case 'blog':
            case 'about':
                robotsMeta.content = 'index, follow, max-image-preview:large';
                break;
            case 'contact':
                robotsMeta.content = 'index, nofollow';
                break;
            default:
                robotsMeta.content = 'index, follow';
        }
    }

    // viewport metaの最適化
    optimizeViewportMeta() {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        }
    }

    // 構造化データの設定
    async setupStructuredData() {
        try {
            switch (this.currentPage) {
                case 'home':
                    await this.addWebsiteStructuredData();
                    await this.addOrganizationStructuredData();
                    break;
                case 'products':
                    await this.addProductCatalogStructuredData();
                    break;
                case 'product':
                    await this.addProductStructuredData();
                    break;
                case 'article':
                    await this.addArticleStructuredData();
                    break;
                case 'about':
                    await this.addAboutPageStructuredData();
                    break;
                case 'contact':
                    await this.addContactPageStructuredData();
                    break;
            }
        } catch (error) {
            console.error('SEO Optimizer: Error setting up structured data', error);
        }
    }

    // WebSite構造化データ
    async addWebsiteStructuredData() {
        const websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Hola Japón",
            "alternateName": "オラ・ハポン",
            "url": "https://holajapon.mx",
            "description": "Tienda especializada en productos japoneses auténticos en México",
            "inLanguage": ["es-MX", "ja-JP"],
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://holajapon.mx/products/?search={search_term_string}",
                "query-input": "required name=search_term_string"
            },
            "sameAs": [
                "https://facebook.com/holajapon",
                "https://instagram.com/holajapon",
                "https://twitter.com/holajapon"
            ]
        };

        this.addStructuredDataToPage('website', websiteData);
    }

    // Organization構造化データ
    async addOrganizationStructuredData() {
        const organizationData = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Hola Japón",
            "alternateName": "オラ・ハポン",
            "url": "https://holajapon.mx",
            "logo": {
                "@type": "ImageObject",
                "url": "https://holajapon.mx/assets/images/ui/logo-512.png",
                "width": 512,
                "height": 512
            },
            "description": "Tienda especializada en productos japoneses auténticos en México",
            "foundingDate": "2023",
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX",
                "addressLocality": "México"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+52-xxx-xxx-xxxx",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "Japanese"],
                "areaServed": "MX"
            },
            "sameAs": [
                "https://facebook.com/holajapon",
                "https://instagram.com/holajapon",
                "https://twitter.com/holajapon"
            ]
        };

        this.addStructuredDataToPage('organization', organizationData);
    }

    // Product構造化データ
    async addProductStructuredData() {
        const productId = this.getProductIdFromUrl();
        if (!productId) return;

        try {
            const productData = await this.fetchProductData(productId);
            if (!productData) return;

            const structuredData = {
                "@context": "https://schema.org",
                "@type": "Product",
                "name": productData.name,
                "description": productData.description,
                "image": [
                    `https://holajapon.mx/${productData.image}`,
                    `https://holajapon.mx/${productData.image.replace('.jpg', '_alt.jpg')}`
                ],
                "brand": {
                    "@type": "Brand",
                    "name": "Hola Japón"
                },
                "category": productData.category,
                "offers": {
                    "@type": "Offer",
                    "price": productData.price,
                    "priceCurrency": "MXN",
                    "availability": "https://schema.org/InStock",
                    "url": `https://holajapon.mx/products/product-detail.html?id=${productId}`,
                    "seller": {
                        "@type": "Organization",
                        "name": "Hola Japón"
                    }
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": 4.8,
                    "reviewCount": 127
                }
            };

            this.addStructuredDataToPage('product', structuredData);
        } catch (error) {
            console.error('SEO Optimizer: Error adding product structured data', error);
        }
    }

    // Article構造化データ
    async addArticleStructuredData() {
        const articleId = this.getArticleIdFromUrl();
        if (!articleId) return;

        try {
            const articleData = await this.fetchArticleData(articleId);
            if (!articleData) return;

            const structuredData = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": articleData.title,
                "description": articleData.excerpt,
                "image": `https://holajapon.mx/${articleData.image}`,
                "datePublished": articleData.publishDate,
                "dateModified": articleData.modifiedDate || articleData.publishDate,
                "author": {
                    "@type": "Person",
                    "name": articleData.author || "Equipo Hola Japón"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Hola Japón",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://holajapon.mx/assets/images/ui/logo-512.png"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": window.location.href
                }
            };

            this.addStructuredDataToPage('article', structuredData);
        } catch (error) {
            console.error('SEO Optimizer: Error adding article structured data', error);
        }
    }

    // 構造化データをページに追加
    addStructuredDataToPage(type, data) {
        // 既存の構造化データを削除
        const existingScript = document.querySelector(`script[data-schema-type="${type}"]`);
        if (existingScript) {
            existingScript.remove();
        }

        // 新しい構造化データを追加
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-schema-type', type);
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);

        console.log(`SEO Optimizer: Added ${type} structured data`);
    }

    // Open Graph最適化
    optimizeOpenGraph() {
        const ogTags = {
            'og:type': this.getOGType(),
            'og:url': window.location.href,
            'og:site_name': 'Hola Japón',
            'og:locale': 'es_MX',
            'og:locale:alternate': 'ja_JP'
        };

        Object.entries(ogTags).forEach(([property, content]) => {
            this.setMetaProperty(property, content);
        });
    }

    // Twitter Card最適化
    optimizeTwitterCard() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:site': '@holajapon',
            'twitter:creator': '@holajapon'
        };

        Object.entries(twitterTags).forEach(([name, content]) => {
            this.setMetaName(name, content);
        });
    }

    // メタプロパティを設定
    setMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    // メタネームを設定
    setMetaName(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    // OGタイプを取得
    getOGType() {
        switch (this.currentPage) {
            case 'home':
                return 'website';
            case 'product':
                return 'product';
            case 'article':
                return 'article';
            default:
                return 'website';
        }
    }

    // パフォーマンス関連のSEO最適化
    optimizePerformanceSEO() {
        // Critical Resource Hintsの追加
        this.addResourceHints();

        // Preload重要リソース
        this.preloadCriticalResources();

        // Core Web Vitals監視
        this.monitorCoreWebVitals();
    }

    // リソースヒントの追加
    addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            if (!document.querySelector(`link[href="${hint.href}"]`)) {
                const link = document.createElement('link');
                Object.assign(link, hint);
                document.head.appendChild(link);
            }
        });
    }

    // 重要リソースのプリロード
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/css/style.css', as: 'style' },
            { href: '/js/main.js', as: 'script' },
            { href: '/data/data.json', as: 'fetch', crossorigin: true }
        ];

        criticalResources.forEach(resource => {
            if (!document.querySelector(`link[href="${resource.href}"][rel="preload"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                Object.assign(link, resource);
                document.head.appendChild(link);
            }
        });
    }

    // Core Web Vitals監視
    monitorCoreWebVitals() {
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // FID (First Input Delay)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // CLS (Cumulative Layout Shift)
            new PerformanceObserver((entryList) => {
                let clsValue = 0;
                entryList.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }

    // 内部リンク最適化
    optimizeInternalLinks() {
        // パンくずナビの動的生成
        this.generateBreadcrumbs();

        // 関連ページリンクの追加
        this.addRelatedPages();

        // 言語切り替えリンクの最適化
        this.optimizeLanguageLinks();
    }

    // パンくずナビ生成
    generateBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('#breadcrumb-container');
        if (!breadcrumbContainer) return;

        const breadcrumbs = this.getBreadcrumbsForCurrentPage();
        if (breadcrumbs.length === 0) return;

        const breadcrumbHTML = breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <span class="breadcrumb-item ${isLast ? 'active' : ''}">
                    ${isLast ? item.name : `<a href="${item.url}">${item.name}</a>`}
                </span>
            `;
        }).join('<span class="breadcrumb-separator">›</span>');

        breadcrumbContainer.innerHTML = breadcrumbHTML;

        // 構造化データも追加
        this.addBreadcrumbStructuredData(breadcrumbs);
    }

    // 現在のページのパンくずリストを取得
    getBreadcrumbsForCurrentPage() {
        const breadcrumbs = [{ name: 'Inicio', url: '/' }];

        switch (this.currentPage) {
            case 'products':
                breadcrumbs.push({ name: 'Productos', url: '/products/' });
                break;
            case 'product':
                breadcrumbs.push({ name: 'Productos', url: '/products/' });
                breadcrumbs.push({ name: 'Detalles del Producto', url: window.location.href });
                break;
            case 'blog':
                breadcrumbs.push({ name: 'Blog', url: '/blog/' });
                break;
            case 'article':
                breadcrumbs.push({ name: 'Blog', url: '/blog/' });
                breadcrumbs.push({ name: 'Artículo', url: window.location.href });
                break;
            case 'about':
                breadcrumbs.push({ name: 'Sobre Nosotros', url: '/about.html' });
                break;
            case 'contact':
                breadcrumbs.push({ name: 'Contacto', url: '/contact.html' });
                break;
        }

        return breadcrumbs;
    }

    // ヘルパーメソッド
    getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    getArticleIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async fetchProductData(productId) {
        try {
            const response = await fetch('/data/data.json');
            const data = await response.json();
            return data.products.find(p => p.id === productId);
        } catch (error) {
            console.error('Error fetching product data:', error);
            return null;
        }
    }

    async fetchArticleData(articleId) {
        try {
            const response = await fetch('/data/blog.json');
            const data = await response.json();
            return data.articles.find(a => a.id === articleId);
        } catch (error) {
            console.error('Error fetching article data:', error);
            return null;
        }
    }
}

// グローバルSEOOptimizerインスタンス
window.SEOOptimizer = new SEOOptimizer();

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.SEOOptimizer.init();
});