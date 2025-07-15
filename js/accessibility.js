// アクセシビリティ強化機能
class AccessibilityEnhancer {
    constructor() {
        this.isHighContrast = false;
        this.fontSize = 'normal';
        this.isScreenReaderMode = false;
        this.focusedElement = null;
        this.init();
    }

    init() {
        this.addAccessibilityControls();
        this.enhanceKeyboardNavigation();
        this.addAriaLabels();
        this.setupScreenReaderSupport();
        this.addFocusManagement();
        this.loadUserPreferences();
    }

    // アクセシビリティコントロールパネル追加
    addAccessibilityControls() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'accessibility-controls';
        controlPanel.setAttribute('role', 'region');
        controlPanel.setAttribute('aria-label', 'アクセシビリティコントロール');
        controlPanel.innerHTML = `
            <button class="accessibility-toggle" id="accessibility-toggle" aria-label="アクセシビリティメニューを開く">
                <i class="fas fa-universal-access" aria-hidden="true"></i>
                <span class="sr-only">ユニバーサルアクセス</span>
            </button>
            <div class="accessibility-menu" id="accessibility-menu" role="menu" aria-hidden="true">
                <div class="accessibility-menu-header">
                    <h3>アクセシビリティ設定</h3>
                    <button class="close-accessibility" aria-label="アクセシビリティメニューを閉じる">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="accessibility-options">
                    <div class="option-group">
                        <label for="font-size-control">文字サイズ</label>
                        <div class="font-size-controls" role="radiogroup" aria-labelledby="font-size-control">
                            <button class="font-size-btn active" data-size="normal" role="radio" aria-checked="true">標準</button>
                            <button class="font-size-btn" data-size="large" role="radio" aria-checked="false">大</button>
                            <button class="font-size-btn" data-size="xlarge" role="radio" aria-checked="false">特大</button>
                        </div>
                    </div>
                    <div class="option-group">
                        <button class="accessibility-option" id="high-contrast-toggle" role="switch" aria-checked="false">
                            <i class="fas fa-adjust" aria-hidden="true"></i>
                            <span>ハイコントラスト</span>
                        </button>
                    </div>
                    <div class="option-group">
                        <button class="accessibility-option" id="screen-reader-mode" role="switch" aria-checked="false">
                            <i class="fas fa-volume-up" aria-hidden="true"></i>
                            <span>スクリーンリーダーモード</span>
                        </button>
                    </div>
                    <div class="option-group">
                        <button class="accessibility-option" id="keyboard-navigation-help">
                            <i class="fas fa-keyboard" aria-hidden="true"></i>
                            <span>キーボードショートカット</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(controlPanel);
        this.addAccessibilityStyles();
        this.setupAccessibilityEvents();
    }

    // アクセシビリティスタイル
    addAccessibilityStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-controls {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
            }
            
            .accessibility-toggle {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--accent-color);
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
            }
            
            .accessibility-toggle:hover,
            .accessibility-toggle:focus {
                background: var(--accent-dark);
                transform: scale(1.1);
                outline: 3px solid rgba(52, 152, 219, 0.5);
            }
            
            .accessibility-menu {
                position: absolute;
                top: 60px;
                right: 0;
                background: var(--bg-color);
                border: 2px solid var(--border-color);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                padding: 1.5rem;
                min-width: 300px;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
            }
            
            .accessibility-menu.active {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .accessibility-menu-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .accessibility-menu-header h3 {
                margin: 0;
                font-size: 1.125rem;
                color: var(--text-color);
            }
            
            .close-accessibility {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: var(--radius-sm);
                color: var(--text-light);
                transition: all 0.2s ease;
            }
            
            .close-accessibility:hover,
            .close-accessibility:focus {
                color: var(--text-color);
                background: var(--bg-light);
                outline: 2px solid var(--accent-color);
            }
            
            .option-group {
                margin-bottom: 1.5rem;
            }
            
            .option-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-color);
            }
            
            .font-size-controls {
                display: flex;
                gap: 0.5rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                padding: 0.25rem;
            }
            
            .font-size-btn {
                flex: 1;
                padding: 0.5rem;
                border: none;
                background: none;
                cursor: pointer;
                border-radius: var(--radius-sm);
                transition: all 0.2s ease;
                font-size: 0.875rem;
            }
            
            .font-size-btn.active,
            .font-size-btn:focus {
                background: var(--accent-color);
                color: white;
                outline: 2px solid var(--accent-dark);
            }
            
            .font-size-btn:hover {
                background: var(--bg-light);
            }
            
            .accessibility-option {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                background: var(--bg-color);
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 0.5rem;
            }
            
            .accessibility-option:hover,
            .accessibility-option:focus {
                border-color: var(--accent-color);
                background: var(--bg-light);
                outline: 2px solid rgba(52, 152, 219, 0.2);
            }
            
            .accessibility-option.active {
                background: rgba(52, 152, 219, 0.1);
                border-color: var(--accent-color);
            }
            
            .accessibility-option i {
                font-size: 1.125rem;
                color: var(--accent-color);
                width: 20px;
                text-align: center;
            }
            
            /* スクリーンリーダー専用テキスト */
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
            
            /* フォーカス表示強化 */
            *:focus {
                outline: 3px solid var(--accent-color);
                outline-offset: 2px;
            }
            
            /* ハイコントラストモード */
            .high-contrast {
                --bg-color: #000000;
                --text-color: #ffffff;
                --bg-light: #1a1a1a;
                --border-color: #ffffff;
                --accent-color: #ffff00;
                --primary-color: #ffffff;
            }
            
            .high-contrast * {
                transition: none !important;
                animation: none !important;
            }
            
            .high-contrast img {
                filter: contrast(150%) brightness(120%);
            }
            
            /* フォントサイズ調整 */
            .font-large {
                font-size: 1.125em;
            }
            
            .font-large h1 { font-size: 2.5rem; }
            .font-large h2 { font-size: 2.125rem; }
            .font-large h3 { font-size: 1.75rem; }
            .font-large .btn { font-size: 1.125rem; padding: 1rem 1.75rem; }
            
            .font-xlarge {
                font-size: 1.25em;
            }
            
            .font-xlarge h1 { font-size: 2.75rem; }
            .font-xlarge h2 { font-size: 2.375rem; }
            .font-xlarge h3 { font-size: 2rem; }
            .font-xlarge .btn { font-size: 1.25rem; padding: 1.125rem 2rem; }
            
            /* スキップリンク */
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--accent-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: var(--radius-sm);
                z-index: 10001;
            }
            
            .skip-link:focus {
                top: 6px;
            }
            
            /* モバイル対応 */
            @media (max-width: 768px) {
                .accessibility-controls {
                    top: 10px;
                    right: 10px;
                }
                
                .accessibility-toggle {
                    width: 45px;
                    height: 45px;
                    font-size: 1.125rem;
                }
                
                .accessibility-menu {
                    min-width: 280px;
                    max-width: calc(100vw - 40px);
                }
                
                .font-size-controls {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // イベントリスナー設定
    setupAccessibilityEvents() {
        const toggle = document.getElementById('accessibility-toggle');
        const menu = document.getElementById('accessibility-menu');
        const closeBtn = menu.querySelector('.close-accessibility');

        // メニューの開閉
        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.contains('active');
            if (isOpen) {
                this.closeAccessibilityMenu();
            } else {
                this.openAccessibilityMenu();
            }
        });

        closeBtn.addEventListener('click', () => {
            this.closeAccessibilityMenu();
        });

        // 外部クリックで閉じる
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.accessibility-controls')) {
                this.closeAccessibilityMenu();
            }
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('active')) {
                this.closeAccessibilityMenu();
            }
        });

        // フォントサイズコントロール
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFontSize(btn.dataset.size);
            });
        });

        // ハイコントラスト
        document.getElementById('high-contrast-toggle').addEventListener('click', () => {
            this.toggleHighContrast();
        });

        // スクリーンリーダーモード
        document.getElementById('screen-reader-mode').addEventListener('click', () => {
            this.toggleScreenReaderMode();
        });

        // キーボードヘルプ
        document.getElementById('keyboard-navigation-help').addEventListener('click', () => {
            this.showKeyboardHelp();
        });
    }

    // アクセシビリティメニュー開く
    openAccessibilityMenu() {
        const menu = document.getElementById('accessibility-menu');
        const toggle = document.getElementById('accessibility-toggle');
        
        menu.classList.add('active');
        menu.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        
        // 最初のフォーカス可能な要素にフォーカス
        const firstFocusable = menu.querySelector('button, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    // アクセシビリティメニュー閉じる
    closeAccessibilityMenu() {
        const menu = document.getElementById('accessibility-menu');
        const toggle = document.getElementById('accessibility-toggle');
        
        menu.classList.remove('active');
        menu.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
    }

    // フォントサイズ設定
    setFontSize(size) {
        // 既存のフォントサイズクラスを削除
        document.body.classList.remove('font-large', 'font-xlarge');
        
        // 新しいフォントサイズクラスを追加
        if (size !== 'normal') {
            document.body.classList.add(`font-${size}`);
        }
        
        this.fontSize = size;
        
        // ボタンの状態更新
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            const isActive = btn.dataset.size === size;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive.toString());
        });
        
        this.saveUserPreferences();
        this.announceChange(`文字サイズを${this.getFontSizeLabel(size)}に設定しました`);
    }

    getFontSizeLabel(size) {
        const labels = { normal: '標準', large: '大', xlarge: '特大' };
        return labels[size] || '標準';
    }

    // ハイコントラスト切り替え
    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast', this.isHighContrast);
        
        const toggle = document.getElementById('high-contrast-toggle');
        toggle.classList.toggle('active', this.isHighContrast);
        toggle.setAttribute('aria-checked', this.isHighContrast.toString());
        
        this.saveUserPreferences();
        this.announceChange(`ハイコントラストモードを${this.isHighContrast ? '有効' : '無効'}にしました`);
    }

    // スクリーンリーダーモード切り替え
    toggleScreenReaderMode() {
        this.isScreenReaderMode = !this.isScreenReaderMode;
        document.body.classList.toggle('screen-reader-mode', this.isScreenReaderMode);
        
        const toggle = document.getElementById('screen-reader-mode');
        toggle.classList.toggle('active', this.isScreenReaderMode);
        toggle.setAttribute('aria-checked', this.isScreenReaderMode.toString());
        
        if (this.isScreenReaderMode) {
            this.enableScreenReaderOptimizations();
        } else {
            this.disableScreenReaderOptimizations();
        }
        
        this.saveUserPreferences();
        this.announceChange(`スクリーンリーダーモードを${this.isScreenReaderMode ? '有効' : '無効'}にしました`);
    }

    // スクリーンリーダー最適化を有効化
    enableScreenReaderOptimizations() {
        // 装飾的な要素を非表示
        document.querySelectorAll('.emoji, .decoration').forEach(el => {
            el.setAttribute('aria-hidden', 'true');
        });
        
        // アニメーションを無効化
        document.body.style.setProperty('--transition', 'none');
        document.body.style.setProperty('--transition-fast', 'none');
    }

    // スクリーンリーダー最適化を無効化
    disableScreenReaderOptimizations() {
        document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
            if (!el.classList.contains('fa-icon')) {
                el.removeAttribute('aria-hidden');
            }
        });
        
        document.body.style.removeProperty('--transition');
        document.body.style.removeProperty('--transition-fast');
    }

    // キーボードヘルプ表示
    showKeyboardHelp() {
        const helpModal = document.createElement('div');
        helpModal.className = 'keyboard-help-modal';
        helpModal.setAttribute('role', 'dialog');
        helpModal.setAttribute('aria-labelledby', 'keyboard-help-title');
        helpModal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="keyboard-help-title">キーボードショートカット</h2>
                        <button class="close-modal" aria-label="ヘルプを閉じる">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Tab</kbd>
                                <span>次の要素にフォーカス</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Shift + Tab</kbd>
                                <span>前の要素にフォーカス</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Enter / Space</kbd>
                                <span>ボタンやリンクを実行</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>モーダルやメニューを閉じる</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt + A</kbd>
                                <span>アクセシビリティメニューを開く</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt + S</kbd>
                                <span>検索フィールドにフォーカス</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Alt + M</kbd>
                                <span>メインコンテンツにジャンプ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // モーダルスタイル
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-help-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .keyboard-help-modal .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .keyboard-help-modal .modal-content {
                background: var(--bg-color);
                border-radius: var(--radius);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                box-shadow: var(--shadow-lg);
            }
            
            .keyboard-help-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .keyboard-help-modal .modal-body {
                padding: 1.5rem;
            }
            
            .shortcut-list {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .shortcut-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: var(--radius-sm);
            }
            
            .shortcut-item kbd {
                background: var(--bg-light);
                border: 1px solid var(--border-color);
                border-radius: 3px;
                padding: 0.25rem 0.5rem;
                font-family: monospace;
                font-size: 0.875rem;
                min-width: 120px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
        
        // イベントリスナー
        helpModal.querySelector('.close-modal').addEventListener('click', () => {
            helpModal.remove();
            style.remove();
        });
        
        helpModal.querySelector('.modal-overlay').addEventListener('click', () => {
            helpModal.remove();
            style.remove();
        });
        
        // 最初のフォーカス可能な要素にフォーカス
        helpModal.querySelector('.close-modal').focus();
    }

    // ARIA ラベルを追加
    addAriaLabels() {
        // スキップリンク追加
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'メインコンテンツにスキップ';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // メインコンテンツにID追加
        const main = document.querySelector('main') || document.querySelector('.main');
        if (main && !main.id) {
            main.id = 'main-content';
        }

        // ナビゲーションのARIA属性
        const nav = document.querySelector('.nav, nav');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'メインナビゲーション');
        }

        // 商品カードのARIA属性
        document.querySelectorAll('.product-card').forEach((card, index) => {
            card.setAttribute('role', 'article');
            card.setAttribute('aria-labelledby', `product-name-${index}`);
            
            const nameElement = card.querySelector('.product-name, h3');
            if (nameElement) {
                nameElement.id = `product-name-${index}`;
            }
        });

        // フォームのARIA属性
        document.querySelectorAll('input, select, textarea').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`) || 
                         input.closest('.form-group')?.querySelector('label');
            
            if (label && !input.getAttribute('aria-labelledby')) {
                if (!label.id) {
                    label.id = `label-${Math.random().toString(36).substr(2, 9)}`;
                }
                input.setAttribute('aria-labelledby', label.id);
            }
        });
    }

    // キーボードナビゲーション強化
    enhanceKeyboardNavigation() {
        // グローバルキーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'a':
                        e.preventDefault();
                        document.getElementById('accessibility-toggle').click();
                        break;
                    case 's':
                        e.preventDefault();
                        const searchInput = document.querySelector('#header-search, .search-input');
                        if (searchInput) {
                            searchInput.focus();
                        }
                        break;
                    case 'm':
                        e.preventDefault();
                        const mainContent = document.getElementById('main-content');
                        if (mainContent) {
                            mainContent.focus();
                            mainContent.scrollIntoView({ behavior: 'smooth' });
                        }
                        break;
                }
            }
        });

        // Tab キーでフォーカス順序を制御
        this.setupFocusTrap();
    }

    // フォーカストラップ設定
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const modal = document.querySelector('.modal:not([aria-hidden="true"]), .accessibility-menu.active');
            if (modal) {
                this.trapFocus(e, modal);
            }
        });
    }

    // フォーカスをモーダル内に制限
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    // スクリーンリーダーサポート設定
    setupScreenReaderSupport() {
        // Live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    // フォーカス管理
    addFocusManagement() {
        // フォーカス可視化の強化
        document.addEventListener('focusin', (e) => {
            this.focusedElement = e.target;
            e.target.classList.add('focused');
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('focused');
        });

        // マウスクリック時のフォーカスアウトライン非表示
        document.addEventListener('mousedown', () => {
            document.body.classList.add('mouse-navigation');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('mouse-navigation');
            }
        });
    }

    // アナウンス機能
    announceChange(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // 一定時間後にクリア
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // ユーザー設定保存
    saveUserPreferences() {
        const preferences = {
            fontSize: this.fontSize,
            highContrast: this.isHighContrast,
            screenReaderMode: this.isScreenReaderMode
        };
        localStorage.setItem('youkoso_accessibility_preferences', JSON.stringify(preferences));
    }

    // ユーザー設定読み込み
    loadUserPreferences() {
        const saved = localStorage.getItem('youkoso_accessibility_preferences');
        if (saved) {
            const preferences = JSON.parse(saved);
            
            if (preferences.fontSize && preferences.fontSize !== 'normal') {
                this.setFontSize(preferences.fontSize);
            }
            
            if (preferences.highContrast) {
                this.toggleHighContrast();
            }
            
            if (preferences.screenReaderMode) {
                this.toggleScreenReaderMode();
            }
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityEnhancer = new AccessibilityEnhancer();
});