// Google Analytics 4 統合とカスタム分析
// eCommerce トラッキング、ユーザー行動分析、コンバージョン測定

class Analytics {
    constructor() {
        this.isGALoaded = false;
        this.isDebugMode = false;
        this.measurementId = 'G-XXXXXXXXXX'; // 実際のGA4測定IDに置き換え
        this.customEvents = [];
        this.userProperties = {};
        this.ecommerceData = {};
        this.sessionData = {
            startTime: new Date(),
            pageViews: 0,
            events: 0,
            scrollDepth: 0,
            timeOnPage: 0
        };
    }

    // 初期化
    async init() {
        try {
            console.log('Analytics: Initializing...');
            
            // Google Analytics 4の読み込み
            await this.loadGA4();
            
            // 基本設定
            this.setupGA4();
            
            // eCommerce設定
            this.setupEcommerce();
            
            // カスタムイベントの設定
            this.setupCustomEvents();
            
            // ユーザー行動の監視
            this.trackUserBehavior();
            
            // Core Web Vitals の測定
            this.measureCoreWebVitals();
            
            console.log('Analytics: Initialized successfully');
            
        } catch (error) {
            console.error('Analytics: Initialization failed', error);
        }
    }

    // Google Analytics 4の読み込み
    async loadGA4() {
        return new Promise((resolve, reject) => {
            // Google Analytics スクリプトの読み込み
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
            
            script.onload = () => {
                // gtag 関数の初期化
                window.dataLayer = window.dataLayer || [];
                window.gtag = function() {
                    window.dataLayer.push(arguments);
                };
                
                this.isGALoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Google Analytics'));
            };
            
            document.head.appendChild(script);
        });
    }

    // GA4の基本設定
    setupGA4() {
        if (!this.isGALoaded) return;

        // GA4の初期化
        gtag('js', new Date());
        gtag('config', this.measurementId, {
            // プライバシー設定
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            
            // カスタム設定
            page_title: document.title,
            page_location: window.location.href,
            language: document.documentElement.lang || 'es',
            
            // eCommerce設定
            send_page_view: true,
            
            // カスタムパラメータ
            custom_map: {
                'custom_parameter_1': 'user_type',
                'custom_parameter_2': 'page_category'
            }
        });

        // ユーザープロパティの設定
        this.setUserProperties();
        
        console.log('Analytics: GA4 configured');
    }

    // eCommerce設定
    setupEcommerce() {
        // 通貨設定
        gtag('config', this.measurementId, {
            currency: 'MXN'
        });

        // Enhanced Ecommerce イベントの設定
        this.setupEcommerceEvents();
    }

    // eCommerceイベントの設定
    setupEcommerceEvents() {
        // カート関連のイベントリスナー
        document.addEventListener('addToCart', (e) => {
            this.trackAddToCart(e.detail);
        });

        document.addEventListener('removeFromCart', (e) => {
            this.trackRemoveFromCart(e.detail);
        });

        document.addEventListener('viewItem', (e) => {
            this.trackViewItem(e.detail);
        });

        document.addEventListener('beginCheckout', (e) => {
            this.trackBeginCheckout(e.detail);
        });

        document.addEventListener('purchase', (e) => {
            this.trackPurchase(e.detail);
        });
    }

    // ユーザープロパティの設定
    setUserProperties() {
        // 言語設定
        const language = document.body.classList.contains('ja') ? 'japanese' : 'spanish';
        this.setUserProperty('preferred_language', language);

        // デバイスタイプ
        const deviceType = this.getDeviceType();
        this.setUserProperty('device_type', deviceType);

        // 新規ユーザーか判定
        const isNewUser = !localStorage.getItem('user_visit_history');
        this.setUserProperty('user_type', isNewUser ? 'new' : 'returning');

        // 訪問履歴の更新
        if (isNewUser) {
            localStorage.setItem('user_visit_history', JSON.stringify({
                firstVisit: new Date().toISOString(),
                visitCount: 1
            }));
        } else {
            const history = JSON.parse(localStorage.getItem('user_visit_history'));
            history.visitCount = (history.visitCount || 0) + 1;
            history.lastVisit = new Date().toISOString();
            localStorage.setItem('user_visit_history', JSON.stringify(history));
            
            this.setUserProperty('visit_count', history.visitCount);
        }
    }

    // ユーザープロパティの設定メソッド
    setUserProperty(name, value) {
        this.userProperties[name] = value;
        
        if (this.isGALoaded) {
            gtag('config', this.measurementId, {
                user_properties: {
                    [name]: value
                }
            });
        }
    }

    // カスタムイベントの設定
    setupCustomEvents() {
        // ページビューの追跡
        this.trackPageView();

        // スクロール深度の追跡
        this.trackScrollDepth();

        // フォーム操作の追跡
        this.trackFormInteractions();

        // 検索の追跡
        this.trackSearchUsage();

        // 言語切り替えの追跡
        this.trackLanguageSwitches();

        // エラーの追跡
        this.trackErrors();
    }

    // ページビューの追跡
    trackPageView(pagePath = null, pageTitle = null) {
        const path = pagePath || window.location.pathname;
        const title = pageTitle || document.title;

        if (this.isGALoaded) {
            gtag('event', 'page_view', {
                page_title: title,
                page_location: window.location.href,
                page_path: path,
                content_group1: this.getPageCategory(path),
                content_group2: this.getPageType(path)
            });
        }

        this.sessionData.pageViews++;
        console.log(`Analytics: Page view tracked - ${path}`);
    }

    // スクロール深度の追跡
    trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const trackScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
            );

            maxScroll = Math.max(maxScroll, scrollPercent);
            this.sessionData.scrollDepth = maxScroll;

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    this.trackEvent('scroll_depth', {
                        percent_scrolled: milestone,
                        page_path: window.location.pathname
                    });
                }
            });
        };

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    trackScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // フォーム操作の追跡
    trackFormInteractions() {
        // フォーム開始
        document.addEventListener('focusin', (e) => {
            if (e.target.form && !e.target.form.dataset.tracked) {
                e.target.form.dataset.tracked = 'true';
                this.trackEvent('form_start', {
                    form_id: e.target.form.id || 'unknown',
                    form_type: this.getFormType(e.target.form)
                });
            }
        });

        // フォーム送信
        document.addEventListener('submit', (e) => {
            this.trackEvent('form_submit', {
                form_id: e.target.id || 'unknown',
                form_type: this.getFormType(e.target)
            });
        });
    }

    // 検索使用の追跡
    trackSearchUsage() {
        document.addEventListener('search', (e) => {
            this.trackEvent('search', {
                search_term: e.detail.query,
                results_count: e.detail.resultsCount || 0,
                search_type: e.detail.type || 'product'
            });
        });
    }

    // 言語切り替えの追跡
    trackLanguageSwitches() {
        document.addEventListener('languageChanged', (e) => {
            this.trackEvent('language_change', {
                previous_language: e.detail.previousLanguage || 'unknown',
                new_language: e.detail.language,
                page_path: window.location.pathname
            });

            // ユーザープロパティも更新
            this.setUserProperty('preferred_language', e.detail.language);
        });
    }

    // エラーの追跡
    trackErrors() {
        window.addEventListener('error', (e) => {
            this.trackEvent('javascript_error', {
                error_message: e.message,
                error_filename: e.filename,
                error_line: e.lineno,
                error_column: e.colno
            });
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.trackEvent('promise_rejection', {
                error_message: e.reason.toString(),
                page_path: window.location.pathname
            });
        });
    }

    // eCommerce イベントトラッキング
    trackAddToCart(item) {
        if (!this.isGALoaded) return;

        gtag('event', 'add_to_cart', {
            currency: this.ecommerceData.currency || 'MXN',
            value: item.price * item.quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price
            }]
        });

        console.log(`Analytics: Add to cart tracked - ${item.name}`);
    }

    trackRemoveFromCart(item) {
        if (!this.isGALoaded) return;

        gtag('event', 'remove_from_cart', {
            currency: this.ecommerceData.currency || 'MXN',
            value: item.price * item.quantity,
            items: [{
                item_id: item.id,
                item_name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price
            }]
        });

        console.log(`Analytics: Remove from cart tracked - ${item.name}`);
    }

    trackViewItem(item) {
        if (!this.isGALoaded) return;

        gtag('event', 'view_item', {
            currency: this.ecommerceData.currency || 'MXN',
            value: item.price,
            items: [{
                item_id: item.id,
                item_name: item.name,
                category: item.category,
                price: item.price
            }]
        });

        console.log(`Analytics: View item tracked - ${item.name}`);
    }

    trackBeginCheckout(cartData) {
        if (!this.isGALoaded) return;

        gtag('event', 'begin_checkout', {
            currency: this.ecommerceData.currency || 'MXN',
            value: cartData.total,
            items: cartData.items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price
            }))
        });

        console.log('Analytics: Begin checkout tracked');
    }

    trackPurchase(purchaseData) {
        if (!this.isGALoaded) return;

        gtag('event', 'purchase', {
            transaction_id: purchaseData.transactionId,
            currency: this.ecommerceData.currency || 'MXN',
            value: purchaseData.total,
            tax: purchaseData.tax,
            shipping: purchaseData.shipping,
            items: purchaseData.items.map(item => ({
                item_id: item.id,
                item_name: item.name,
                category: item.category,
                quantity: item.quantity,
                price: item.price
            }))
        });

        console.log(`Analytics: Purchase tracked - ${purchaseData.transactionId}`);
    }

    // 汎用イベントトラッキング
    trackEvent(eventName, parameters = {}) {
        if (!this.isGALoaded) return;

        const eventData = {
            ...parameters,
            timestamp: new Date().toISOString(),
            page_path: window.location.pathname,
            user_agent: navigator.userAgent
        };

        gtag('event', eventName, eventData);
        
        this.sessionData.events++;
        this.customEvents.push({
            name: eventName,
            parameters: eventData,
            timestamp: new Date()
        });

        console.log(`Analytics: Custom event tracked - ${eventName}`, parameters);
    }

    // Core Web Vitals の測定
    measureCoreWebVitals() {
        // LCP (Largest Contentful Paint)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    const lcp = lastEntry.startTime;

                    this.trackEvent('core_web_vitals', {
                        metric_name: 'LCP',
                        metric_value: Math.round(lcp),
                        metric_rating: this.getCWVRating(lcp, [2500, 4000])
                    });
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.warn('Analytics: Could not observe LCP', e);
            }

            // FID (First Input Delay)
            try {
                const fidObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        const fid = entry.processingStart - entry.startTime;
                        
                        this.trackEvent('core_web_vitals', {
                            metric_name: 'FID',
                            metric_value: Math.round(fid),
                            metric_rating: this.getCWVRating(fid, [100, 300])
                        });
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                console.warn('Analytics: Could not observe FID', e);
            }

            // CLS (Cumulative Layout Shift)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // ページ離脱時にCLSを送信
                window.addEventListener('beforeunload', () => {
                    this.trackEvent('core_web_vitals', {
                        metric_name: 'CLS',
                        metric_value: Math.round(clsValue * 1000) / 1000,
                        metric_rating: this.getCWVRating(clsValue, [0.1, 0.25])
                    });
                });
            } catch (e) {
                console.warn('Analytics: Could not observe CLS', e);
            }
        }
    }

    // Core Web Vitals の評価を取得
    getCWVRating(value, thresholds) {
        if (value <= thresholds[0]) return 'good';
        if (value <= thresholds[1]) return 'needs_improvement';
        return 'poor';
    }

    // ユーザー行動の監視
    trackUserBehavior() {
        // セッション開始時間の記録
        this.sessionData.startTime = new Date();

        // ページ滞在時間の計算
        window.addEventListener('beforeunload', () => {
            const timeOnPage = new Date() - this.sessionData.startTime;
            this.trackEvent('session_engagement', {
                time_on_page: Math.round(timeOnPage / 1000),
                page_views: this.sessionData.pageViews,
                events_count: this.sessionData.events,
                max_scroll_depth: this.sessionData.scrollDepth
            });
        });

        // 非アクティブ時間の監視
        let lastActivity = new Date();
        let idleTimer;

        const resetIdleTimer = () => {
            lastActivity = new Date();
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                this.trackEvent('user_idle', {
                    idle_time: 30, // 30秒
                    page_path: window.location.pathname
                });
            }, 30000);
        };

        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            window.addEventListener(event, resetIdleTimer, true);
        });

        resetIdleTimer();
    }

    // ヘルパーメソッド
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    getPageCategory(path) {
        if (path.includes('/products/')) return 'products';
        if (path.includes('/blog/')) return 'blog';
        if (path.includes('/about')) return 'about';
        if (path.includes('/contact')) return 'contact';
        return 'home';
    }

    getPageType(path) {
        if (path.includes('product-detail')) return 'product_detail';
        if (path.includes('blog-detail')) return 'article_detail';
        if (path.includes('/products/')) return 'product_listing';
        if (path.includes('/blog/')) return 'blog_listing';
        return 'static_page';
    }

    getFormType(form) {
        if (form.id.includes('contact')) return 'contact';
        if (form.id.includes('search')) return 'search';
        if (form.id.includes('newsletter')) return 'newsletter';
        return 'other';
    }

    // デバッグモード
    enableDebugMode() {
        this.isDebugMode = true;
        gtag('config', this.measurementId, {
            debug_mode: true
        });
        console.log('Analytics: Debug mode enabled');
    }

    disableDebugMode() {
        this.isDebugMode = false;
        console.log('Analytics: Debug mode disabled');
    }

    // 分析データの取得
    getSessionData() {
        return {
            ...this.sessionData,
            currentTime: new Date(),
            timeOnSite: new Date() - this.sessionData.startTime
        };
    }

    getCustomEvents() {
        return [...this.customEvents];
    }

    getUserProperties() {
        return { ...this.userProperties };
    }
}

// グローバルAnalyticsインスタンス
window.Analytics = new Analytics();

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.Analytics.init();
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    // 最終的な分析データを送信
    if (window.Analytics.isGALoaded) {
        gtag('event', 'session_end', window.Analytics.getSessionData());
    }
});