// アクセシビリティ強化機能

class AccessibilityManager {
    constructor() {
        this.settings = {
            fontSize: 'normal',
            contrast: 'normal',
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.createAccessibilityPanel();
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotionSupport();
        this.addAccessibilityStyles();
        this.checkSystemPreferences();
    }
    
    // 設定を読み込む
    loadSettings() {
        if (window.utils) {
            this.settings = { ...this.settings, ...window.utils.getFromLocalStorage('accessibility_settings', {}) };
        } else {
            try {
                const saved = JSON.parse(localStorage.getItem('accessibility_settings') || '{}');
                this.settings = { ...this.settings, ...saved };
            } catch (e) {
                console.warn('Failed to load accessibility settings');
            }
        }
        
        this.applySettings();
    }
    
    // 設定を保存
    saveSettings() {
        if (window.utils) {
            window.utils.saveToLocalStorage('accessibility_settings', this.settings);
        } else {
            try {
                localStorage.setItem('accessibility_settings', JSON.stringify(this.settings));
            } catch (e) {
                console.warn('Failed to save accessibility settings');
            }
        }
    }
    
    // アクセシビリティパネルを作成
    createAccessibilityPanel() {
        // 既存のパネルがあるかチェック
        if (document.getElementById('accessibility-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'accessibility-panel';
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'accessibility-title');
        panel.setAttribute('aria-hidden', 'true');
        panel.innerHTML = `
            <div class="accessibility-content">
                <header class="accessibility-header">
                    <h2 id="accessibility-title">
                        <span class="es-text">Opciones de Accesibilidad</span>
                        <span class="ja-text">アクセシビリティ設定</span>
                    </h2>
                    <button class="accessibility-close" aria-label="Cerrar panel" id="accessibility-close">×</button>
                </header>
                
                <div class="accessibility-body">
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Tamaño de Texto</span>
                            <span class="ja-text">文字サイズ</span>
                        </h3>
                        <div class="accessibility-buttons">
                            <button class="accessibility-btn" data-action="fontSize" data-value="small">
                                <span class="es-text">Pequeño</span>
                                <span class="ja-text">小</span>
                            </button>
                            <button class="accessibility-btn active" data-action="fontSize" data-value="normal">
                                <span class="es-text">Normal</span>
                                <span class="ja-text">中</span>
                            </button>
                            <button class="accessibility-btn" data-action="fontSize" data-value="large">
                                <span class="es-text">Grande</span>
                                <span class="ja-text">大</span>
                            </button>
                            <button class="accessibility-btn" data-action="fontSize" data-value="xlarge">
                                <span class="es-text">Extra Grande</span>
                                <span class="ja-text">特大</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Contraste</span>
                            <span class="ja-text">コントラスト</span>
                        </h3>
                        <div class="accessibility-buttons">
                            <button class="accessibility-btn active" data-action="contrast" data-value="normal">
                                <span class="es-text">Normal</span>
                                <span class="ja-text">標準</span>
                            </button>
                            <button class="accessibility-btn" data-action="contrast" data-value="high">
                                <span class="es-text">Alto Contraste</span>
                                <span class="ja-text">高コントラスト</span>
                            </button>
                            <button class="accessibility-btn" data-action="contrast" data-value="dark">
                                <span class="es-text">Modo Oscuro</span>
                                <span class="ja-text">ダークモード</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Animaciones</span>
                            <span class="ja-text">アニメーション</span>
                        </h3>
                        <label class="accessibility-toggle">
                            <input type="checkbox" id="reduce-motion" ${this.settings.reducedMotion ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <span class="es-text">Reducir Animaciones</span>
                                <span class="ja-text">アニメーションを減らす</span>
                            </span>
                        </label>
                    </div>
                    
                    <div class="accessibility-group">
                        <h3>
                            <span class="es-text">Navegación</span>
                            <span class="ja-text">ナビゲーション</span>
                        </h3>
                        <label class="accessibility-toggle">
                            <input type="checkbox" id="keyboard-navigation" ${this.settings.keyboardNavigation ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                            <span class="toggle-label">
                                <span class="es-text">Navegación por Teclado Mejorada</span>
                                <span class="ja-text">キーボードナビゲーション強化</span>
                            </span>
                        </label>
                    </div>
                    
                    <div class="accessibility-actions">
                        <button class="btn btn-outline" id="accessibility-reset">
                            <span class="es-text">Restablecer</span>
                            <span class="ja-text">リセット</span>
                        </button>
                        <button class="btn" id="accessibility-apply">
                            <span class="es-text">Aplicar</span>
                            <span class="ja-text">適用</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // アクセシビリティボタンを作成
        this.createAccessibilityButton();
        
        // イベントリスナーを設定
        this.setupPanelEventListeners();
        
        // 初期状態を設定
        this.updatePanelState();
    }
    
    // アクセシビリティボタンを作成
    createAccessibilityButton() {
        const button = document.createElement('button');
        button.id = 'accessibility-toggle';
        button.className = 'accessibility-toggle-btn';
        button.setAttribute('aria-label', 'Abrir opciones de accesibilidad');
        button.innerHTML = '♿';
        button.title = 'Opciones de Accesibilidad';
        
        document.body.appendChild(button);
        
        button.addEventListener('click', () => {
            this.togglePanel();
        });
    }
    
    // パネルのイベントリスナーを設定
    setupPanelEventListeners() {
        const panel = document.getElementById('accessibility-panel');
        
        // 閉じるボタン
        panel.querySelector('#accessibility-close').addEventListener('click', () => {
            this.closePanel();
        });
        
        // 設定ボタン
        panel.querySelectorAll('.accessibility-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const value = e.target.dataset.value;
                this.updateSetting(action, value);
                this.updateButtonStates(action, value);
            });
        });
        
        // トグルスイッチ
        panel.querySelector('#reduce-motion').addEventListener('change', (e) => {
            this.updateSetting('reducedMotion', e.target.checked);
        });
        
        panel.querySelector('#keyboard-navigation').addEventListener('change', (e) => {
            this.updateSetting('keyboardNavigation', e.target.checked);
        });
        
        // アクションボタン
        panel.querySelector('#accessibility-reset').addEventListener('click', () => {
            this.resetSettings();
        });
        
        panel.querySelector('#accessibility-apply').addEventListener('click', () => {
            this.applySettings();
            this.closePanel();
        });
        
        // ESCキーで閉じる
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closePanel();
            }
        });
        
        // クリック外で閉じる
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.closePanel();
            }
        });
    }
    
    // パネルを開閉
    togglePanel() {
        const panel = document.getElementById('accessibility-panel');
        const isOpen = panel.getAttribute('aria-hidden') === 'false';
        
        if (isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    // パネルを開く
    openPanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.setAttribute('aria-hidden', 'false');
        panel.classList.add('open');
        
        // フォーカスをパネルに移動
        const firstFocusable = panel.querySelector('button, input');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // ボディのスクロールを無効化
        document.body.style.overflow = 'hidden';
    }
    
    // パネルを閉じる
    closePanel() {
        const panel = document.getElementById('accessibility-panel');
        panel.setAttribute('aria-hidden', 'true');
        panel.classList.remove('open');
        
        // フォーカスをトリガーボタンに戻す
        document.getElementById('accessibility-toggle').focus();
        
        // ボディのスクロールを復元
        document.body.style.overflow = '';
    }
    
    // 設定を更新
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySettings();
    }
    
    // ボタンの状態を更新
    updateButtonStates(action, value) {
        const buttons = document.querySelectorAll(`[data-action="${action}"]`);
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }
    
    // パネルの状態を更新
    updatePanelState() {
        // フォントサイズボタン
        this.updateButtonStates('fontSize', this.settings.fontSize);
        
        // コントラストボタン
        this.updateButtonStates('contrast', this.settings.contrast);
        
        // トグルスイッチ
        document.getElementById('reduce-motion').checked = this.settings.reducedMotion;
        document.getElementById('keyboard-navigation').checked = this.settings.keyboardNavigation;
    }
    
    // 設定をリセット
    resetSettings() {
        this.settings = {
            fontSize: 'normal',
            contrast: 'normal',
            reducedMotion: false,
            screenReader: false,
            keyboardNavigation: true
        };
        
        this.saveSettings();
        this.applySettings();
        this.updatePanelState();
    }
    
    // 設定を適用
    applySettings() {
        const body = document.body;
        
        // 既存のアクセシビリティクラスを削除
        body.classList.remove('font-small', 'font-normal', 'font-large', 'font-xlarge');
        body.classList.remove('contrast-normal', 'contrast-high', 'contrast-dark');
        body.classList.remove('reduced-motion', 'enhanced-keyboard');
        
        // フォントサイズ
        body.classList.add(`font-${this.settings.fontSize}`);
        
        // コントラスト
        body.classList.add(`contrast-${this.settings.contrast}`);
        
        // モーション削減
        if (this.settings.reducedMotion) {
            body.classList.add('reduced-motion');
        }
        
        // キーボードナビゲーション強化
        if (this.settings.keyboardNavigation) {
            body.classList.add('enhanced-keyboard');
        }
    }
    
    // システム設定をチェック
    checkSystemPreferences() {
        // モーション削減設定
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.settings.reducedMotion = true;
            document.getElementById('reduce-motion').checked = true;
        }
        
        // ダークモード設定
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.settings.contrast = 'dark';
        }
        
        // 高コントラスト設定
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.settings.contrast = 'high';
        }
        
        this.applySettings();
        this.updatePanelState();
    }
    
    // キーボードナビゲーションを設定
    setupKeyboardNavigation() {
        // Tabキーでのナビゲーション可視化
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // ショートカットキー
        document.addEventListener('keydown', (e) => {
            // Alt + A でアクセシビリティパネル
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.togglePanel();
            }
            
            // Alt + S で検索
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const searchInput = document.querySelector('#global-search, input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Alt + M でメインコンテンツ
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                const main = document.querySelector('main');
                if (main) {
                    main.focus();
                    main.scrollIntoView();
                }
            }
        });
    }
    
    // フォーカス管理を設定
    setupFocusManagement() {
        // フォーカス可能な要素を追跡
        this.focusableElements = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
        
        // フォーカストラップ（モーダル用）
        this.setupFocusTrap();
        
        // Skip to content リンク
        this.createSkipLinks();
    }
    
    // スキップリンクを作成
    createSkipLinks() {
        if (document.querySelector('.skip-links')) return;
        
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">
                <span class="es-text">Saltar al contenido principal</span>
                <span class="ja-text">メインコンテンツへスキップ</span>
            </a>
            <a href="#navigation" class="skip-link">
                <span class="es-text">Saltar a la navegación</span>
                <span class="ja-text">ナビゲーションへスキップ</span>
            </a>
        `;
        
        document.body.insertBefore(skipLinks, document.body.firstChild);
        
        // メインコンテンツにIDを追加
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
        
        // ナビゲーションにIDを追加
        const nav = document.querySelector('nav');
        if (nav && !nav.id) {
            nav.id = 'navigation';
        }
    }
    
    // フォーカストラップを設定
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            // モーダルが開いている場合のフォーカストラップ
            const modal = document.querySelector('.accessibility-panel.open, .cart-sidebar.open');
            if (!modal) return;
            
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(this.focusableElements);
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
    
    // スクリーンリーダーサポートを設定
    setupScreenReaderSupport() {
        // ARIA ライブリージョンを作成
        this.createLiveRegion();
        
        // 動的コンテンツの変更を通知
        this.setupContentChangeNotifications();
    }
    
    // ライブリージョンを作成
    createLiveRegion() {
        if (document.getElementById('aria-live-region')) return;
        
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        
        document.body.appendChild(liveRegion);
    }
    
    // コンテンツ変更通知を設定
    setupContentChangeNotifications() {
        // カート変更通知
        document.addEventListener('cartUpdated', (e) => {
            this.announceToScreenReader(`商品がカートに追加されました。現在${e.detail.itemCount}個の商品があります。`);
        });
        
        // 検索結果通知
        document.addEventListener('searchCompleted', (e) => {
            this.announceToScreenReader(`検索完了。${e.detail.resultCount}件の結果が見つかりました。`);
        });
        
        // フォーム送信通知
        document.addEventListener('formSubmitted', (e) => {
            this.announceToScreenReader('フォームが正常に送信されました。');
        });
    }
    
    // スクリーンリーダーにアナウンス
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // メッセージをクリア
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    // モーション削減サポートを設定
    setupReducedMotionSupport() {
        // システム設定の変更を監視
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener((e) => {
            if (e.matches) {
                this.settings.reducedMotion = true;
                document.getElementById('reduce-motion').checked = true;
                this.applySettings();
            }
        });
    }
    
    // アクセシビリティスタイルを追加
    addAccessibilityStyles() {
        if (document.getElementById('accessibility-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'accessibility-styles';
        style.textContent = `
            /* Skip Links */
            .skip-links {
                position: absolute;
                top: -1000px;
                left: -1000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            }
            
            .skip-link:focus {
                position: absolute;
                top: 10px;
                left: 10px;
                width: auto;
                height: auto;
                padding: 10px 15px;
                background: var(--primary-color);
                color: white;
                text-decoration: none;
                border-radius: 5px;
                z-index: 10000;
            }
            
            /* Screen Reader Only */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            /* Accessibility Toggle Button */
            .accessibility-toggle-btn {
                position: fixed;
                bottom: 20px;
                left: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s ease;
            }
            
            .accessibility-toggle-btn:hover,
            .accessibility-toggle-btn:focus {
                transform: scale(1.1);
                outline: 3px solid rgba(255, 255, 255, 0.8);
            }
            
            /* Accessibility Panel */
            .accessibility-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .accessibility-panel.open {
                opacity: 1;
                visibility: visible;
            }
            
            .accessibility-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            .accessibility-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .accessibility-header h2 {
                margin: 0;
                font-size: 1.3em;
            }
            
            .accessibility-close {
                background: none;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
            }
            
            .accessibility-close:hover {
                background: #f0f0f0;
            }
            
            .accessibility-body {
                padding: 20px;
            }
            
            .accessibility-group {
                margin-bottom: 25px;
            }
            
            .accessibility-group h3 {
                margin: 0 0 15px;
                font-size: 1.1em;
                color: #333;
            }
            
            .accessibility-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .accessibility-btn {
                padding: 8px 15px;
                border: 2px solid #ddd;
                background: white;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 0.9em;
            }
            
            .accessibility-btn:hover {
                border-color: var(--primary-color);
            }
            
            .accessibility-btn.active {
                background: var(--primary-color);
                color: white;
                border-color: var(--primary-color);
            }
            
            .accessibility-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }
            
            .accessibility-toggle input {
                display: none;
            }
            
            .toggle-slider {
                width: 50px;
                height: 25px;
                background: #ddd;
                border-radius: 25px;
                position: relative;
                transition: background 0.3s ease;
            }
            
            .toggle-slider::before {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 21px;
                height: 21px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s ease;
            }
            
            .accessibility-toggle input:checked + .toggle-slider {
                background: var(--primary-color);
            }
            
            .accessibility-toggle input:checked + .toggle-slider::before {
                transform: translateX(25px);
            }
            
            .accessibility-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
            
            /* Font Size Classes */
            .font-small {
                font-size: 0.9em;
            }
            
            .font-normal {
                font-size: 1em;
            }
            
            .font-large {
                font-size: 1.1em;
            }
            
            .font-xlarge {
                font-size: 1.25em;
            }
            
            /* High Contrast */
            .contrast-high {
                filter: contrast(150%);
            }
            
            .contrast-high * {
                text-shadow: none !important;
                box-shadow: none !important;
            }
            
            /* Dark Mode */
            .contrast-dark {
                background: #1a1a1a !important;
                color: #ffffff !important;
            }
            
            .contrast-dark .product-card,
            .contrast-dark .blog-card,
            .contrast-dark .category-card {
                background: #2a2a2a !important;
                color: #ffffff !important;
                border: 1px solid #444 !important;
            }
            
            /* Reduced Motion */
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
            
            /* Enhanced Keyboard Navigation */
            .enhanced-keyboard *:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation *:focus {
                outline: 3px solid var(--primary-color) !important;
                outline-offset: 2px !important;
            }
            
            /* Mobile Adjustments */
            @media (max-width: 768px) {
                .accessibility-toggle-btn {
                    bottom: 80px;
                    left: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .accessibility-content {
                    width: 95%;
                    margin: 10px;
                }
                
                .accessibility-buttons {
                    flex-direction: column;
                }
                
                .accessibility-btn {
                    width: 100%;
                    padding: 12px 15px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// ページロード時に初期化
document.addEventListener('DOMContentLoaded', function() {
    window.accessibilityManager = new AccessibilityManager();
});

// エクスポート
window.AccessibilityManager = AccessibilityManager;