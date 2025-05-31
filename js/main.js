// メインアプリケーション制御
// 全体的なアプリケーションの初期化と制御を管理

class App {
    constructor() {
        this.isInitialized = false;
        this.currentLanguage = 'es';
        this.isDarkMode = false;
    }

    // アプリケーションの初期化
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('Initializing Hola Japón application...');

            // 言語設定の復元
            this.restoreUserPreferences();

            // 基本機能の初期化
            this.initializeLanguageToggle();
            this.initializeThemeToggle();
            this.initializeNavigation();
            this.initializeAccessibility();

            // ページ固有の初期化
            await this.initializePageSpecificFeatures();

            // パフォーマンス最適化
            this.optimizePerformance();

            this.isInitialized = true;
            console.log('Application initialized successfully');

        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }

    // ユーザー設定の復元
    restoreUserPreferences() {
        // 言語設定の復元
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && ['es', 'ja'].includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
            document.body.classList.toggle('ja', savedLanguage === 'ja');
        }

        // テーマ設定の復元
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }
    }

    // 言語切り替え機能
    initializeLanguageToggle() {
        const languageToggle = document.querySelector('.language-toggle');
        if (!languageToggle) return;

        const buttons = languageToggle.querySelectorAll('.lang-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedLang = e.target.dataset.lang;
                this.switchLanguage(selectedLang);
            });
        });

        // 初期言語の適用
        this.switchLanguage(this.currentLanguage);
    }

    // 言語切り替え処理
    switchLanguage(lang) {
        if (!['es', 'ja'].includes(lang)) return;

        this.currentLanguage = lang;
        document.body.classList.toggle('ja', lang === 'ja');
        
        // ボタンのアクティブ状態を更新
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // 設定を保存
        localStorage.setItem('preferred-language', lang);

        // カスタムイベントを発火
        document.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }

    // テーマ切り替え機能（ダークモード）
    initializeThemeToggle() {
        // テーマ切り替えボタンがある場合
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // キーボードショートカット (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // テーマ切り替え処理
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        
        // 設定を保存
        localStorage.setItem('theme-preference', this.isDarkMode ? 'dark' : 'light');

        // カスタムイベントを発火
        document.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { isDarkMode: this.isDarkMode } 
        }));
    }

    // ナビゲーション機能
    initializeNavigation() {
        // スムーズスクロール
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // アクティブページのハイライト
        this.highlightActivePage();
    }

    // アクティブページのハイライト
    highlightActivePage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (currentPath.includes(href) || 
                        (href === 'index.html' && currentPath === '/'))) {
                link.classList.add('active');
            }
        });
    }

    // アクセシビリティ機能
    initializeAccessibility() {
        // フォーカス管理
        this.manageFocus();

        // キーボードナビゲーション
        this.initializeKeyboardNavigation();

        // ARIA属性の動的更新
        this.updateAriaAttributes();
    }

    // フォーカス管理
    manageFocus() {
        // タブインデックスの管理
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('using-keyboard');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('using-keyboard');
        });
    }

    // キーボードナビゲーション
    initializeKeyboardNavigation() {
        // ESCキーでモーダルやメニューを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // モーダルを閉じる
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => modal.classList.remove('active'));

                // メニューを閉じる
                const menus = document.querySelectorAll('.menu.open');
                menus.forEach(menu => menu.classList.remove('open'));
            }
        });
    }

    // ARIA属性の更新
    updateAriaAttributes() {
        // 言語変更時にlang属性を更新
        document.addEventListener('languageChanged', (e) => {
            document.documentElement.lang = e.detail.language;
        });
    }

    // ページ固有の機能初期化
    async initializePageSpecificFeatures() {
        const path = window.location.pathname;

        if (path.includes('/products/')) {
            await this.initializeProductsPage();
        } else if (path.includes('/blog/')) {
            await this.initializeBlogPage();
        } else if (path.includes('/contact.html')) {
            await this.initializeContactPage();
        } else if (path === '/' || path.includes('index.html')) {
            await this.initializeHomePage();
        }
    }

    // ホームページ初期化
    async initializeHomePage() {
        console.log('Initializing home page features...');
        // ホームページ固有の機能をここに追加
    }

    // 商品ページ初期化
    async initializeProductsPage() {
        console.log('Initializing products page features...');
        // 商品ページ固有の機能をここに追加
    }

    // ブログページ初期化
    async initializeBlogPage() {
        console.log('Initializing blog page features...');
        // ブログページ固有の機能をここに追加
    }

    // お問い合わせページ初期化
    async initializeContactPage() {
        console.log('Initializing contact page features...');
        // お問い合わせページ固有の機能をここに追加
    }

    // パフォーマンス最適化
    optimizePerformance() {
        // 画像の遅延読み込み
        this.initializeLazyLoading();

        // リソースの事前読み込み
        this.preloadCriticalResources();

        // メモリ使用量の監視
        this.monitorMemoryUsage();
    }

    // 遅延読み込みの初期化
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 重要リソースの事前読み込み
    preloadCriticalResources() {
        // フォントの事前読み込み
        const fontLinks = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];

        fontLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    // メモリ使用量の監視
    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                    console.warn('High memory usage detected');
                    // 必要に応じてクリーンアップを実行
                }
            }, 30000); // 30秒ごとに監視
        }
    }

    // 現在の言語を取得
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // ダークモード状態を取得
    isDarkModeEnabled() {
        return this.isDarkMode;
    }
}

// グローバルAppインスタンスを作成
window.App = new App();

// DOM読み込み完了時にアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});

// ページ表示時の追加初期化（ブラウザバック等）
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.App.init();
    }
});