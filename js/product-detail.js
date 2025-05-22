// 商品詳細ページ用JavaScript

// 商品データ（共有データから取得）
let productData = [];

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded in product-detail.js');
    
    // 商品データを読み込む
    await loadProductData();
    
    // URLから商品IDを取得
    const productId = window.utils.getUrlParam('id');
    
    if (!productId) {
        showErrorMessage('No se ha especificado un producto');
        return;
    }
    
    // 対象の商品を検索
    const product = productData.find(p => p.id === productId);
    
    if (!product) {
        showErrorMessage('Producto no encontrado');
        return;
    }
    
    // 商品詳細を表示
    displayProductDetail(product);
    
    // 関連商品を表示
    displayRelatedProducts(product);
    
    // 製品画像ギャラリーの強化
    enhanceProductGallery();
    
    // タブナビゲーションの強化
    enhanceTabNavigation();
    
    // スクロールアニメーションの適用
    initScrollAnimations();
    
    // 製品ページ特有のインタラクション
    enhanceProductInteractions();
});

// 商品データを読み込む関数
async function loadProductData() {
    try {
        // メイン処理でデータが読み込まれているか確認
        if (window.siteData && window.siteData.products && window.siteData.products.length > 0) {
            console.log('Using products from site data');
            productData = window.siteData.products;
            return productData;
        }
        
        // メインデータが読み込まれていない場合は待機
        await waitForSiteData();
        
        // データが読み込まれていれば使用
        if (window.siteData && window.siteData.products) {
            productData = window.siteData.products;
            console.log('Products loaded from site data:', productData.length);
            return productData;
        }
        
        // それでもデータがない場合は個別に読み込む
        console.log('Loading products from individual file');
        const basePath = '../data/products.json';
        
        // 共通ユーティリティ関数を使用してデータを取得
        const data = await window.utils.fetchData(basePath);
        productData = data.products;
        console.log('Products loaded from individual file:', productData.length);
        return productData;
    } catch (error) {
        console.error('商品データの読み込みに失敗しました:', error);
        return [];
    }
}

// サイトデータが読み込まれるのを待つ関数
function waitForSiteData(timeout = 5000) {
    return new Promise((resolve) => {
        // すでに読み込まれている場合はすぐに解決
        if (window.siteData && window.siteData.products && window.siteData.products.length > 0) {
            return resolve();
        }
        
        let timeWaited = 0;
        const interval = 100;
        
        // 定期的にチェック
        const checkInterval = setInterval(() => {
            timeWaited += interval;
            
            // データが読み込まれたか、タイムアウトに達したかをチェック
            if ((window.siteData && window.siteData.products && window.siteData.products.length > 0) || timeWaited >= timeout) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval);
    });
}

// エラーメッセージを表示
function showErrorMessage(message) {
    const container = document.getElementById('product-detail-container');
    if (container) {
        container.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <a href="index.html" class="btn">Ver todos los productos</a>
                </div>
            </div>
        `;
    }
}

// 商品詳細を表示
function displayProductDetail(product) {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    
    // ページタイトルを更新
    document.title = `${product.name} - Hola Japón`;
    
    // 商品画像のパス（相対パスの調整）
    const imagePath = product.image.replace('../', '');
    
    // 商品詳細のHTMLを構築
    container.innerHTML = `
        <div class="container">
            <div class="product-detail-inner">
                <div class="product-detail-image">
                    <img src="../${imagePath}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-detail-info">
                    <h1>${product.name}</h1>
                    <div class="product-detail-price">${window.utils ? window.utils.formatCurrency(product.price) : '$' + product.price.toFixed(2) + ' MXN'}</div>
                    <div class="product-detail-category">Categoría: <span>${getCategoryName(product.category)}</span></div>
                    <div class="product-detail-description">
                        <h3>Descripción:</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-detail-actions">
                        <button class="btn add-to-cart">
                            <span class="es-text">Añadir al Carrito</span>
                            <span class="ja-text">カートに追加</span>
                        </button>
                        <button class="btn light add-to-wishlist">
                            <span class="es-text">Añadir a Favoritos</span>
                            <span class="ja-text">お気に入りに追加</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // カートに追加ボタンのイベントリスナー（実際のプロジェクトでは、ここにカート機能を実装）
    const addToCartBtn = container.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            // ミニカートを表示
            showMiniCart(product);
        });
    }
    
    // お気に入りボタンのイベントリスナー
    const addToWishlistBtn = container.querySelector('.add-to-wishlist');
    if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', function() {
            const isJapanese = document.body.classList.contains('ja');
            const message = isJapanese ? 
                `${product.name}をお気に入りに追加しました` : 
                `${product.name} añadido a favoritos`;
            alert(message);
        });
    }
}

// ミニカートを表示する関数
function showMiniCart(product) {
    // すでにミニカートがあれば削除
    let miniCart = document.getElementById('mini-cart');
    if (miniCart) {
        miniCart.remove();
    }
    
    // ミニカートを作成
    miniCart = document.createElement('div');
    miniCart.id = 'mini-cart';
    miniCart.className = 'mini-cart';
    
    // 現在の言語を取得
    const isJapanese = document.body.classList.contains('ja');
    
    // カートのHTMLを設定
    miniCart.innerHTML = `
        <div class="mini-cart-header">
            <h3>${isJapanese ? 'カート' : 'Carrito'}</h3>
            <button class="close-btn">&times;</button>
        </div>
        <div class="mini-cart-items">
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <h4>${product.name}</h4>
                    <div class="cart-item-price">${window.utils ? window.utils.formatCurrency(product.price) : '$' + product.price.toFixed(2) + ' MXN'}</div>
                    <div class="cart-item-quantity">
                        <label>${isJapanese ? '数量' : 'Cantidad'}:</label>
                        <select>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="mini-cart-footer">
            <div class="mini-cart-total">
                <span>${isJapanese ? '合計' : 'Total'}:</span>
                <span>${window.utils ? window.utils.formatCurrency(product.price) : '$' + product.price.toFixed(2) + ' MXN'}</span>
            </div>
            <button class="btn checkout-btn">
                <span class="es-text">Finalizar Compra</span>
                <span class="ja-text">購入手続きへ</span>
            </button>
            <button class="btn light continue-btn">
                <span class="es-text">Seguir Comprando</span>
                <span class="ja-text">買い物を続ける</span>
            </button>
        </div>
    `;
    
    // ドキュメントに追加
    document.body.appendChild(miniCart);
    
    // 閉じるボタンのイベントリスナー
    const closeBtn = miniCart.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            miniCart.remove();
        });
    }
    
    // 買い物を続けるボタンのイベントリスナー
    const continueBtn = miniCart.querySelector('.continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            miniCart.remove();
        });
    }
    
    // チェックアウトボタンのイベントリスナー
    const checkoutBtn = miniCart.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const message = isJapanese ? 
                'この機能はデモバージョンでは利用できません。' : 
                'Esta función no está disponible en la versión demo.';
            alert(message);
            miniCart.remove();
        });
    }
    
    // 数量変更時のイベントリスナー
    const quantitySelect = miniCart.querySelector('.cart-item-quantity select');
    if (quantitySelect) {
        quantitySelect.addEventListener('change', function() {
            const quantity = parseInt(this.value);
            const totalPrice = product.price * quantity;
            const totalElement = miniCart.querySelector('.mini-cart-total span:last-child');
            if (totalElement) {
                totalElement.textContent = window.utils ? 
                    window.utils.formatCurrency(totalPrice) : 
                    '$' + totalPrice.toFixed(2) + ' MXN';
            }
        });
    }
    
    // エスケープキーでカートを閉じる
    const escKeyHandler = function(e) {
        if (e.key === 'Escape') {
            miniCart.remove();
            document.removeEventListener('keydown', escKeyHandler);
        }
    };
    document.addEventListener('keydown', escKeyHandler);
    
    // アニメーション付きで表示
    setTimeout(() => {
        miniCart.classList.add('show');
    }, 10);
}

// 関連商品を表示
function displayRelatedProducts(currentProduct) {
    const container = document.getElementById('related-products-container');
    if (!container) return;
    
    // 同じカテゴリの商品をフィルタリング
    let relatedProducts = productData.filter(p => 
        p.category === currentProduct.category && p.id !== currentProduct.id
    );
    
    // 足りない場合は他のカテゴリからも追加
    if (relatedProducts.length < 4) {
        const otherProducts = productData.filter(p => 
            p.category !== currentProduct.category && p.id !== currentProduct.id
        );
        
        // ランダムに並べ替え
        const shuffled = [...otherProducts].sort(() => 0.5 - Math.random());
        
        // 必要な数だけ追加
        relatedProducts = [
            ...relatedProducts,
            ...shuffled.slice(0, 4 - relatedProducts.length)
        ];
    } else {
        // 多すぎる場合は最大4つまで
        relatedProducts = relatedProducts.slice(0, 4);
    }
    
    // コンテナをクリア
    container.innerHTML = '<h2>Productos Relacionados</h2><div class="product-grid"></div>';
    
    const productGrid = container.querySelector('.product-grid');
    
    // 関連商品がない場合
    if (relatedProducts.length === 0) {
        productGrid.innerHTML = '<p>No hay productos relacionados disponibles.</p>';
        return;
    }
    
    // 関連商品を表示（components.jsで定義した関数を使用）
    relatedProducts.forEach(product => {
        productGrid.innerHTML += window.createProductCardComponent(product, '../');
    });
}

// カテゴリ名を取得（siteDataから取得するよう改善）
function getCategoryName(categorySlug) {
    // siteDataからカテゴリ情報を取得
    if (window.siteData && window.siteData.categories) {
        const category = window.siteData.categories.find(cat => cat.slug === categorySlug);
        if (category) {
            return category.name;
        }
    }
    
    // フォールバック
    const categories = {
        'figuras': 'Figuras de Anime',
        'manga': 'Manga',
        'peluches': 'Peluches',
        'videojuegos': 'Videojuegos',
        'ropa': 'Ropa y Accesorios',
        'cartas': 'Cartas Coleccionables',
        'comida': 'Comida Japonesa'
    };
    
    return categories[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
}

// ミニカートのスタイルを追加
document.addEventListener('DOMContentLoaded', function() {
    // すでにスタイルがあるか確認
    if (!document.querySelector('style#mini-cart-styles')) {
        const style = document.createElement('style');
        style.id = 'mini-cart-styles';
        style.textContent = `
            .mini-cart {
                position: fixed;
                top: 0;
                right: -350px;
                width: 350px;
                height: 100vh;
                background-color: white;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: right 0.3s ease;
            }
            
            .mini-cart.show {
                right: 0;
            }
            
            .mini-cart-header {
                padding: 15px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .mini-cart-header h3 {
                margin: 0;
            }
            
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
            }
            
            .mini-cart-items {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
            }
            
            .cart-item {
                display: flex;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #eee;
            }
            
            .cart-item-image {
                width: 80px;
                margin-right: 15px;
            }
            
            .cart-item-image img {
                width: 100%;
                height: auto;
                border-radius: 5px;
            }
            
            .cart-item-info {
                flex: 1;
            }
            
            .cart-item-info h4 {
                font-size: 16px;
                margin: 0 0 5px;
            }
            
            .cart-item-price {
                font-weight: 600;
                color: var(--primary-color);
                margin-bottom: 10px;
            }
            
            .cart-item-quantity {
                display: flex;
                align-items: center;
            }
            
            .cart-item-quantity label {
                margin-right: 10px;
            }
            
            .cart-item-quantity select {
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            
            .mini-cart-footer {
                padding: 15px;
                border-top: 1px solid #eee;
            }
            
            .mini-cart-total {
                display: flex;
                justify-content: space-between;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .checkout-btn, .continue-btn {
                width: 100%;
                margin-bottom: 10px;
            }
        `;
        document.head.appendChild(style);
    }
});

// Apple風の製品詳細ページJavaScript強化
document.addEventListener('DOMContentLoaded', function() {
    // 既存のコード
    
    // 製品画像ギャラリーの強化
    enhanceProductGallery();
    
    // タブナビゲーションの強化
    enhanceTabNavigation();
    
    // スクロールアニメーションの適用
    initScrollAnimations();
    
    // 製品ページ特有のインタラクション
    enhanceProductInteractions();
});

/**
 * 製品ギャラリーの強化
 */
function enhanceProductGallery() {
    const mainImage = document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (!mainImage || thumbnails.length === 0) return;
    
    // サムネイルクリックイベント
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // アクティブクラスの切り替え
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // メイン画像を切り替え
            const newSrc = this.querySelector('img').getAttribute('src');
            
            // スムーズなトランジション
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.setAttribute('src', newSrc);
                mainImage.style.opacity = '1';
            }, 300);
        });
    });
    
    // ズーム効果（メイン画像）
    if (mainImage) {
        const mainImageContainer = mainImage.parentElement;
        
        mainImageContainer.addEventListener('mousemove', e => {
            const { left, top, width, height } = mainImageContainer.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            
            // マウス位置に基づいて画像を微妙に移動
            mainImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
            mainImage.style.transform = 'scale(1.1)';
        });
        
        mainImageContainer.addEventListener('mouseleave', () => {
            mainImage.style.transform = 'scale(1)';
        });
    }
}

/**
 * タブナビゲーションの強化
 */
function enhanceTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length === 0 || tabContents.length === 0) return;
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // アクティブタブの切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // コンテンツの切り替え
            const target = this.getAttribute('data-target');
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.opacity = '0';
            });
            
            // スムーズなフェードイン
            const activeContent = document.getElementById(target);
            if (activeContent) {
                setTimeout(() => {
                    activeContent.classList.add('active');
                    setTimeout(() => {
                        activeContent.style.opacity = '1';
                    }, 50);
                }, 300);
            }
        });
    });
}

/**
 * スクロールアニメーションの初期化
 */
function initScrollAnimations() {
    // 製品詳細要素
    const animatedElements = [
        { selector: '.product-detail', className: 'fade-in' },
        { selector: '.product-gallery', className: 'slide-from-left' },
        { selector: '.product-info', className: 'slide-from-right' },
        { selector: '.product-features', className: 'fade-in', delay: 300 },
        { selector: '.product-actions', className: 'fade-in', delay: 400 },
        { selector: '.shipping-info', className: 'fade-in', delay: 500 },
        { selector: '.product-tabs', className: 'fade-in' },
        { selector: '.related-products', className: 'fade-in' },
        { selector: '.product-information', className: 'fade-in' }
    ];
    
    // 要素にアニメーションクラスを適用
    animatedElements.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(element => {
            element.classList.add('animate-on-scroll');
            element.classList.add(item.className.replace('fade-in', 'fade-up'));
            if (item.delay) {
                element.style.transitionDelay = `${item.delay}ms`;
            }
        });
    });
    
    // IntersectionObserverの設定
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    // 要素の監視を開始
    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

/**
 * 製品ページ特有のインタラクション強化
 */
function enhanceProductInteractions() {
    // 数量セレクタの強化
    const quantityInput = document.querySelector('.quantity-controls input');
    const decreaseBtn = document.querySelector('.quantity-controls .decrease');
    const increaseBtn = document.querySelector('.quantity-controls .increase');
    
    if (quantityInput && decreaseBtn && increaseBtn) {
        // 減少ボタン
        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                value--;
                quantityInput.value = value;
                
                // アニメーション効果
                quantityInput.classList.add('pulse');
                setTimeout(() => {
                    quantityInput.classList.remove('pulse');
                }, 300);
            }
        });
        
        // 増加ボタン
        increaseBtn.addEventListener('click', () => {
            let value = parseInt(quantityInput.value);
            value++;
            quantityInput.value = value;
            
            // アニメーション効果
            quantityInput.classList.add('pulse');
            setTimeout(() => {
                quantityInput.classList.remove('pulse');
            }, 300);
        });
        
        // 入力値の検証
        quantityInput.addEventListener('change', () => {
            let value = parseInt(quantityInput.value);
            if (isNaN(value) || value < 1) {
                quantityInput.value = 1;
            }
        });
    }
    
    // カートに追加ボタンの強化
    const addToCartBtn = document.querySelector('.add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // リップルエフェクト
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // 実際のカート機能の処理はここに追加
            console.log('Product added to cart');
        });
    }
}

// カスタムスタイルをヘッダーに追加
function addCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .pulse {
            animation: pulse 0.3s ease-in-out;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .ripple-effect {
            position: absolute;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

// スタイルを追加
addCustomStyles();