// モバイル最適化とタッチジェスチャー機能
class MobileEnhancer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isSwipeActive = false;
        this.swipeThreshold = 50;
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.addMobileOptimizations();
            this.setupTouchGestures();
            this.enhanceMobileNavigation();
            this.optimizeForTouch();
            this.addMobileStyles();
        }
        this.addResponsiveImages();
        this.setupOrientationHandler();
    }

    // モバイルデバイス検出
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    // モバイル最適化を追加
    addMobileOptimizations() {
        document.body.classList.add('mobile-optimized');
        
        // ビューポート設定確認
        this.ensureViewportMeta();
        
        // タッチディレイ削除
        this.removeTouchDelay();
        
        // スクロール最適化
        this.optimizeScrolling();
        
        // モバイル用メタタグ追加
        this.addMobileMeta();
    }

    // ビューポートメタタグ確認
    ensureViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0';
            document.head.appendChild(viewport);
        }
    }

    // タッチディレイ削除
    removeTouchDelay() {
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // FastClick風の実装
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .btn, a, input[type="submit"], input[type="button"]')) {
                e.preventDefault();
                e.target.click();
            }
        }, { passive: false });
    }

    // スクロール最適化
    optimizeScrolling() {
        // スムーススクロール有効化
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // iOS Safari でのバウンススクロール無効化（必要に応じて）
        document.body.style.overscrollBehavior = 'contain';
        
        // スクロール位置の復元
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

    // モバイル用メタタグ追加
    addMobileMeta() {
        const metas = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
            { name: 'theme-color', content: '#2c3e50' },
            { name: 'msapplication-navbutton-color', content: '#2c3e50' },
            { name: 'apple-mobile-web-app-title', content: 'Youkoso' }
        ];

        metas.forEach(meta => {
            if (!document.querySelector(`meta[name="${meta.name}"]`)) {
                const metaEl = document.createElement('meta');
                metaEl.name = meta.name;
                metaEl.content = meta.content;
                document.head.appendChild(metaEl);
            }
        });
    }

    // タッチジェスチャー設定
    setupTouchGestures() {
        // スワイプナビゲーション
        this.setupSwipeNavigation();
        
        // ピンチズーム（商品画像用）
        this.setupPinchZoom();
        
        // ロングタップ（コンテキストメニュー）
        this.setupLongTap();
        
        // プルツーリフレッシュ
        this.setupPullToRefresh();
    }

    // スワイプナビゲーション
    setupSwipeNavigation() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isSwipeActive = true;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!this.isSwipeActive) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = this.touchStartX - currentX;
            const diffY = this.touchStartY - currentY;
            
            // 縦スクロールを優先
            if (Math.abs(diffY) > Math.abs(diffX)) {
                this.isSwipeActive = false;
                return;
            }
            
            // 横スワイプが一定距離を超えた場合
            if (Math.abs(diffX) > this.swipeThreshold) {
                this.handleSwipe(diffX > 0 ? 'left' : 'right', e);
                this.isSwipeActive = false;
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            this.isSwipeActive = false;
        }, { passive: true });
    }

    // スワイプ処理
    handleSwipe(direction, e) {
        const target = e.target.closest('.product-card, .swipeable');
        
        if (target) {
            if (direction === 'left') {
                this.showCardActions(target);
            } else {
                this.hideCardActions(target);
            }
        } else {
            // グローバルスワイプナビゲーション
            if (direction === 'right' && window.location.pathname !== '/index.html') {
                this.navigateBack();
            }
        }
    }

    // カードアクション表示
    showCardActions(card) {
        let actions = card.querySelector('.card-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'card-actions';
            actions.innerHTML = `
                <button class="card-action favorite" aria-label="お気に入りに追加">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="card-action cart" aria-label="カートに追加">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="card-action share" aria-label="共有">
                    <i class="fas fa-share"></i>
                </button>
            `;
            card.appendChild(actions);
        }
        
        actions.classList.add('visible');
        card.classList.add('actions-visible');
        
        // 自動で隠す
        setTimeout(() => {
            this.hideCardActions(card);
        }, 3000);
    }

    // カードアクション非表示
    hideCardActions(card) {
        const actions = card.querySelector('.card-actions');
        if (actions) {
            actions.classList.remove('visible');
            card.classList.remove('actions-visible');
        }
    }

    // ピンチズーム設定
    setupPinchZoom() {
        const images = document.querySelectorAll('.product-image img, .zoomable');
        
        images.forEach(img => {
            let scale = 1;
            let initialDistance = 0;
            let isZooming = false;
            
            img.addEventListener('touchstart', (e) => {
                if (e.touches.length === 2) {
                    isZooming = true;
                    initialDistance = this.getDistance(e.touches[0], e.touches[1]);
                    img.style.transition = 'none';
                }
            }, { passive: true });
            
            img.addEventListener('touchmove', (e) => {
                if (isZooming && e.touches.length === 2) {
                    e.preventDefault();
                    const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                    const newScale = scale * (currentDistance / initialDistance);
                    
                    if (newScale >= 1 && newScale <= 3) {
                        img.style.transform = `scale(${newScale})`;
                    }
                }
            }, { passive: false });
            
            img.addEventListener('touchend', (e) => {
                if (isZooming) {
                    isZooming = false;
                    img.style.transition = 'transform 0.3s ease';
                    
                    // スケールを正規化
                    const currentScale = parseFloat(img.style.transform.replace(/[^0-9.]/g, '')) || 1;
                    if (currentScale < 1.2) {
                        img.style.transform = 'scale(1)';
                        scale = 1;
                    } else if (currentScale > 2.5) {
                        img.style.transform = 'scale(2.5)';
                        scale = 2.5;
                    } else {
                        scale = currentScale;
                    }
                }
            }, { passive: true });
        });
    }

    // 2点間の距離計算
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // ロングタップ設定
    setupLongTap() {
        let longTapTimer;
        let isTapping = false;
        
        document.addEventListener('touchstart', (e) => {
            isTapping = true;
            longTapTimer = setTimeout(() => {
                if (isTapping) {
                    this.handleLongTap(e);
                }
            }, 500);
        }, { passive: true });
        
        document.addEventListener('touchmove', () => {
            isTapping = false;
            clearTimeout(longTapTimer);
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            isTapping = false;
            clearTimeout(longTapTimer);
        }, { passive: true });
    }

    // ロングタップ処理
    handleLongTap(e) {
        const target = e.target.closest('.product-card, .long-tappable');
        if (target) {
            this.showContextMenu(target, e);
        }
    }

    // コンテキストメニュー表示
    showContextMenu(target, e) {
        // 既存のコンテキストメニューを削除
        document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="favorite">
                <i class="fas fa-heart"></i>
                お気に入りに追加
            </div>
            <div class="context-menu-item" data-action="share">
                <i class="fas fa-share"></i>
                共有
            </div>
            <div class="context-menu-item" data-action="details">
                <i class="fas fa-info-circle"></i>
                詳細を見る
            </div>
        `;
        
        // 位置設定
        const touch = e.touches[0];
        menu.style.position = 'fixed';
        menu.style.left = `${touch.clientX}px`;
        menu.style.top = `${touch.clientY}px`;
        menu.style.zIndex = '10000';
        
        document.body.appendChild(menu);
        
        // クリックイベント
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextAction(action, target);
            }
            menu.remove();
        });
        
        // 外部クリックで閉じる
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    }

    // コンテキストアクション処理
    handleContextAction(action, target) {
        switch (action) {
            case 'favorite':
                this.toggleFavorite(target);
                break;
            case 'share':
                this.shareProduct(target);
                break;
            case 'details':
                this.showProductDetails(target);
                break;
        }
    }

    // プルツーリフレッシュ設定
    setupPullToRefresh() {
        let startY = 0;
        let isPulling = false;
        const pullThreshold = 100;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (isPulling && window.scrollY === 0) {
                const currentY = e.touches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > 0) {
                    this.showPullIndicator(pullDistance, pullThreshold);
                }
            }
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (isPulling) {
                const currentY = e.changedTouches[0].clientY;
                const pullDistance = currentY - startY;
                
                if (pullDistance > pullThreshold) {
                    this.triggerRefresh();
                } else {
                    this.hidePullIndicator();
                }
                
                isPulling = false;
            }
        }, { passive: true });
    }

    // プル表示
    showPullIndicator(distance, threshold) {
        let indicator = document.getElementById('pull-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'pull-indicator';
            indicator.innerHTML = `
                <div class="pull-icon">
                    <i class="fas fa-arrow-down"></i>
                </div>
                <div class="pull-text">引っ張って更新</div>
            `;
            document.body.insertBefore(indicator, document.body.firstChild);
        }
        
        const progress = Math.min(distance / threshold, 1);
        indicator.style.opacity = progress;
        indicator.style.transform = `translateY(${Math.min(distance - 50, 0)}px)`;
        
        if (progress >= 1) {
            indicator.querySelector('.pull-text').textContent = '離して更新';
            indicator.classList.add('ready');
        } else {
            indicator.querySelector('.pull-text').textContent = '引っ張って更新';
            indicator.classList.remove('ready');
        }
    }

    // プル表示非表示
    hidePullIndicator() {
        const indicator = document.getElementById('pull-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(-50px)';
            setTimeout(() => indicator.remove(), 300);
        }
    }

    // リフレッシュ実行
    triggerRefresh() {
        this.hidePullIndicator();
        
        // ローディング表示
        const loading = document.createElement('div');
        loading.className = 'refresh-loading';
        loading.innerHTML = `
            <div class="loading-spinner"></div>
            <div>更新中...</div>
        `;
        document.body.insertBefore(loading, document.body.firstChild);
        
        // 実際の更新処理（例：ページリロード）
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    // モバイルナビゲーション強化
    enhanceMobileNavigation() {
        // ボトムナビゲーション追加
        this.addBottomNavigation();
        
        // ハンバーガーメニュー強化
        this.enhanceHamburgerMenu();
    }

    // ボトムナビゲーション追加
    addBottomNavigation() {
        const bottomNav = document.createElement('nav');
        bottomNav.className = 'bottom-navigation';
        bottomNav.innerHTML = `
            <a href="index.html" class="bottom-nav-item ${window.location.pathname.includes('index') ? 'active' : ''}">
                <i class="fas fa-home"></i>
                <span>ホーム</span>
            </a>
            <a href="products.html" class="bottom-nav-item ${window.location.pathname.includes('products') ? 'active' : ''}">
                <i class="fas fa-shopping-bag"></i>
                <span>商品</span>
            </a>
            <button class="bottom-nav-item search-btn">
                <i class="fas fa-search"></i>
                <span>検索</span>
            </button>
            <a href="about.html" class="bottom-nav-item ${window.location.pathname.includes('about') ? 'active' : ''}">
                <i class="fas fa-info-circle"></i>
                <span>情報</span>
            </a>
            <a href="contact.html" class="bottom-nav-item ${window.location.pathname.includes('contact') ? 'active' : ''}">
                <i class="fas fa-envelope"></i>
                <span>連絡</span>
            </a>
        `;
        
        document.body.appendChild(bottomNav);
        
        // 検索ボタンイベント
        bottomNav.querySelector('.search-btn').addEventListener('click', () => {
            const searchInput = document.querySelector('#header-search');
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // タッチ最適化
    optimizeForTouch() {
        // タッチフレンドリーなボタンサイズ確保
        const touchElements = document.querySelectorAll('button, .btn, a, input[type="submit"]');
        touchElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.height < 44) {
                el.style.minHeight = '44px';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
            }
        });
        
        // タッチハイライト色設定
        document.documentElement.style.setProperty('-webkit-tap-highlight-color', 'rgba(52, 152, 219, 0.3)');
    }

    // レスポンシブ画像
    addResponsiveImages() {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }
    }

    // 画面向き変更対応
    setupOrientationHandler() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    // 向き変更処理
    handleOrientationChange() {
        // レイアウト再計算
        this.recalculateLayout();
        
        // フォーカス要素を再調整
        if (document.activeElement) {
            document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // レイアウト再計算
    recalculateLayout() {
        // グリッドレイアウトの再計算
        const grids = document.querySelectorAll('.products-grid, .categories-grid');
        grids.forEach(grid => {
            grid.style.display = 'none';
            grid.offsetHeight; // Reflow強制
            grid.style.display = '';
        });
    }

    // モバイルスタイル追加
    addMobileStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-optimized {
                touch-action: manipulation;
                -webkit-overflow-scrolling: touch;
            }
            
            .bottom-navigation {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--bg-color);
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: space-around;
                padding: 0.5rem 0;
                z-index: 1000;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .bottom-nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 0.5rem;
                color: var(--text-light);
                text-decoration: none;
                border: none;
                background: none;
                cursor: pointer;
                transition: color 0.2s ease;
                min-width: 60px;
            }
            
            .bottom-nav-item.active,
            .bottom-nav-item:focus {
                color: var(--accent-color);
            }
            
            .bottom-nav-item i {
                font-size: 1.25rem;
                margin-bottom: 0.25rem;
            }
            
            .bottom-nav-item span {
                font-size: 0.75rem;
            }
            
            .card-actions {
                position: absolute;
                right: -80px;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                transition: right 0.3s ease;
                z-index: 10;
            }
            
            .card-actions.visible {
                right: 1rem;
            }
            
            .card-action {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: var(--shadow);
                transition: transform 0.2s ease;
            }
            
            .card-action:active {
                transform: scale(0.95);
            }
            
            .card-action.favorite { background: #e74c3c; }
            .card-action.cart { background: var(--accent-color); }
            .card-action.share { background: var(--success-color); }
            
            .context-menu {
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                overflow: hidden;
                animation: contextMenuSlide 0.2s ease;
            }
            
            @keyframes contextMenuSlide {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .context-menu-item {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                transition: background-color 0.2s ease;
                min-width: 180px;
            }
            
            .context-menu-item:last-child {
                border-bottom: none;
            }
            
            .context-menu-item:hover {
                background: var(--bg-light);
            }
            
            .context-menu-item i {
                color: var(--accent-color);
                width: 16px;
            }
            
            #pull-indicator {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: 0 0 var(--radius) var(--radius);
                padding: 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 1001;
            }
            
            #pull-indicator.ready .pull-icon {
                transform: rotate(180deg);
                color: var(--success-color);
            }
            
            .pull-icon {
                transition: transform 0.3s ease;
            }
            
            .refresh-loading {
                position: fixed;
                top: 1rem;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: var(--shadow-lg);
                z-index: 1001;
            }
            
            /* スマートフォン用のパディング調整 */
            .mobile-optimized .container {
                padding-bottom: 80px; /* ボトムナビ分の余白 */
            }
            
            /* タッチフィードバック */
            .mobile-optimized button:active,
            .mobile-optimized .btn:active {
                transform: scale(0.95);
            }
            
            /* スクロールバー非表示（Webkit） */
            .mobile-optimized *::-webkit-scrollbar {
                display: none;
            }
            
            .mobile-optimized * {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ユーティリティ関数
    navigateBack() {
        if (history.length > 1) {
            history.back();
        } else {
            window.location.href = '/';
        }
    }

    toggleFavorite(target) {
        target.classList.toggle('favorited');
        // お気に入り状態をローカルストレージに保存
        const productId = target.dataset.productId;
        if (productId) {
            const favorites = JSON.parse(localStorage.getItem('youkoso_favorites') || '[]');
            if (favorites.includes(productId)) {
                const index = favorites.indexOf(productId);
                favorites.splice(index, 1);
            } else {
                favorites.push(productId);
            }
            localStorage.setItem('youkoso_favorites', JSON.stringify(favorites));
        }
    }

    shareProduct(target) {
        if (navigator.share) {
            const productName = target.querySelector('.product-name')?.textContent || 'Youkoso商品';
            navigator.share({
                title: productName,
                text: `${productName} - Youkosoで見つけた素晴らしい商品です！`,
                url: window.location.href
            });
        } else {
            // フォールバック：クリップボードにコピー
            navigator.clipboard.writeText(window.location.href);
            this.showToast('リンクをクリップボードにコピーしました');
        }
    }

    showProductDetails(target) {
        const productName = target.querySelector('.product-name')?.textContent;
        const productPrice = target.querySelector('.product-price')?.textContent;
        const productImage = target.querySelector('img')?.src;
        
        // 詳細モーダル表示（簡易版）
        alert(`商品名: ${productName}\n価格: ${productPrice}`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--text-color);
            color: var(--bg-color);
            padding: 1rem;
            border-radius: var(--radius);
            z-index: 10001;
            animation: toastSlide 3s ease forwards;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.mobileEnhancer = new MobileEnhancer();
});