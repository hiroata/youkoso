// コンポーネント管理システム
// ヘッダー、フッター、その他の再利用可能なコンポーネントを管理

class ComponentManager {
    constructor() {
        this.components = {};
        this.loadedComponents = new Set();
    }

    // コンポーネントを登録
    register(name, component) {
        this.components[name] = component;
    }

    // コンポーネントをロード
    async load(name, element) {
        if (this.loadedComponents.has(name)) {
            return;
        }

        const component = this.components[name];
        if (component) {
            await component.render(element);
            this.loadedComponents.add(name);
        }
    }

    // 全ての登録されたコンポーネントを初期化
    async initializeAll() {
        const componentElements = document.querySelectorAll('[data-component]');
        
        for (const element of componentElements) {
            const componentName = element.dataset.component;
            await this.load(componentName, element);
        }
    }
}

// ヘッダーコンポーネント
const HeaderComponent = {
    async render(element) {
        const currentPage = this.getCurrentPage();
        
        element.innerHTML = `
            <div class="container">
                <div class="logo">
                    <h1><a href="/index.html">Hola <span class="japan">Japón</span></a></h1>
                </div>
                <nav>
                    <ul>
                        <li><a href="/index.html" class="${currentPage === 'index' ? 'active' : ''}">
                            <span class="es-text">Inicio</span>
                            <span class="ja-text">ホーム</span>
                        </a></li>
                        <li><a href="/products/index.html" class="${currentPage === 'products' ? 'active' : ''}">
                            <span class="es-text">Productos</span>
                            <span class="ja-text">商品</span>
                        </a></li>
                        <li><a href="/blog/index.html" class="${currentPage === 'blog' ? 'active' : ''}">
                            <span class="es-text">Blog</span>
                            <span class="ja-text">ブログ</span>
                        </a></li>
                        <li><a href="/about.html" class="${currentPage === 'about' ? 'active' : ''}">
                            <span class="es-text">Nosotros</span>
                            <span class="ja-text">私たち</span>
                        </a></li>
                        <li><a href="/contact.html" class="${currentPage === 'contact' ? 'active' : ''}">
                            <span class="es-text">Contacto</span>
                            <span class="ja-text">お問い合わせ</span>
                        </a></li>
                    </ul>
                </nav>
                <div class="header-actions">
                    <button class="search-toggle" aria-label="Buscar">
                        <span class="search-icon">🔍</span>
                    </button>
                    <button class="cart-toggle" aria-label="Carrito">
                        <span class="cart-icon">🛒</span>
                        <span class="cart-count">0</span>
                    </button>
                </div>
            </div>
        `;

        // イベントリスナーを追加
        this.attachEventListeners(element);
    },

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/products/')) return 'products';
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/about.html')) return 'about';
        if (path.includes('/contact.html')) return 'contact';
        return 'index';
    },

    attachEventListeners(element) {
        // 検索トグル
        const searchToggle = element.querySelector('.search-toggle');
        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                // 検索機能を呼び出し
                if (window.SearchManager) {
                    window.SearchManager.toggle();
                }
            });
        }

        // カートトグル
        const cartToggle = element.querySelector('.cart-toggle');
        if (cartToggle) {
            cartToggle.addEventListener('click', () => {
                // カート機能を呼び出し
                if (window.CartManager) {
                    window.CartManager.toggle();
                }
            });
        }
    }
};

// フッターコンポーネント
const FooterComponent = {
    async render(element) {
        element.innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h3>
                            <span class="es-text">Hola Japón</span>
                            <span class="ja-text">オラ・ハポン</span>
                        </h3>
                        <p class="es-text">Tu tienda de confianza para productos japoneses auténticos en México.</p>
                        <p class="ja-text">メキシコで信頼できる本物の日本商品店</p>
                    </div>
                    
                    <div class="footer-section">
                        <h4>
                            <span class="es-text">Enlaces Rápidos</span>
                            <span class="ja-text">クイックリンク</span>
                        </h4>
                        <ul>
                            <li><a href="/products/index.html">
                                <span class="es-text">Productos</span>
                                <span class="ja-text">商品</span>
                            </a></li>
                            <li><a href="/about.html">
                                <span class="es-text">Sobre Nosotros</span>
                                <span class="ja-text">私たちについて</span>
                            </a></li>
                            <li><a href="/contact.html">
                                <span class="es-text">Contacto</span>
                                <span class="ja-text">お問い合わせ</span>
                            </a></li>
                            <li><a href="/blog/index.html">
                                <span class="es-text">Blog</span>
                                <span class="ja-text">ブログ</span>
                            </a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-section">
                        <h4>
                            <span class="es-text">Síguenos</span>
                            <span class="ja-text">フォローする</span>
                        </h4>
                        <div class="social-links">
                            <a href="https://facebook.com/holajapon" target="_blank" rel="noopener">
                                <img src="/assets/images/ui/facebook.png" alt="Facebook" width="24" height="24">
                            </a>
                            <a href="https://instagram.com/holajapon" target="_blank" rel="noopener">
                                <img src="/assets/images/ui/instagram.png" alt="Instagram" width="24" height="24">
                            </a>
                            <a href="https://twitter.com/holajapon" target="_blank" rel="noopener">
                                <img src="/assets/images/ui/twitter.png" alt="Twitter" width="24" height="24">
                            </a>
                        </div>
                    </div>
                    
                    <div class="footer-section">
                        <h4>
                            <span class="es-text">Contacto</span>
                            <span class="ja-text">連絡先</span>
                        </h4>
                        <p>Email: info@holajapon.mx</p>
                        <p class="es-text">Horario: Lun-Vie 9:00-18:00</p>
                        <p class="ja-text">営業時間: 月-金 9:00-18:00</p>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p>&copy; 2025 Hola Japón. 
                        <span class="es-text">Todos los derechos reservados.</span>
                        <span class="ja-text">全権利所有。</span>
                    </p>
                    <div class="footer-links">
                        <a href="#privacy">
                            <span class="es-text">Privacidad</span>
                            <span class="ja-text">プライバシー</span>
                        </a>
                        <a href="#terms">
                            <span class="es-text">Términos</span>
                            <span class="ja-text">利用規約</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
};

// グローバルコンポーネントマネージャーのインスタンスを作成
window.ComponentManager = new ComponentManager();

// コンポーネントを登録
window.ComponentManager.register('header', HeaderComponent);
window.ComponentManager.register('footer', FooterComponent);

// DOM読み込み完了時にコンポーネントを初期化
document.addEventListener('DOMContentLoaded', () => {
    window.ComponentManager.initializeAll();
});