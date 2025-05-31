// 完全なカート機能

class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.currency = 'MXN';
        this.taxRate = 0.16; // IVA en México
        this.shippingCost = 0;
        this.freeShippingThreshold = 1000;
        this.maxQuantity = 10;
        
        // 割引コード
        this.discountCodes = {
            'WELCOME10': { type: 'percentage', value: 10, minAmount: 500 },
            'FIRST20': { type: 'percentage', value: 20, minAmount: 800 },
            'ANIME15': { type: 'percentage', value: 15, minAmount: 600 },
            'MANGA25': { type: 'fixed', value: 250, minAmount: 1000 }
        };
        
        this.appliedDiscount = null;
        
        this.init();
    }
    
    init() {
        this.loadCart();
        this.createCartUI();
        this.setupEventListeners();
        this.updateCartBadge();
    }
    
    // カートを読み込む
    loadCart() {
        if (window.utils) {
            this.items = window.utils.getFromLocalStorage('shopping_cart', []);
            this.appliedDiscount = window.utils.getFromLocalStorage('applied_discount', null);
        } else {
            try {
                this.items = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
                this.appliedDiscount = JSON.parse(localStorage.getItem('applied_discount') || 'null');
            } catch (e) {
                this.items = [];
                this.appliedDiscount = null;
            }
        }
    }
    
    // カートを保存
    saveCart() {
        if (window.utils) {
            window.utils.saveToLocalStorage('shopping_cart', this.items);
            window.utils.saveToLocalStorage('applied_discount', this.appliedDiscount);
        } else {
            try {
                localStorage.setItem('shopping_cart', JSON.stringify(this.items));
                localStorage.setItem('applied_discount', JSON.stringify(this.appliedDiscount));
            } catch (e) {
                console.warn('Failed to save cart');
            }
        }
    }
    
    // 商品を追加
    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity <= this.maxQuantity) {
                existingItem.quantity = newQuantity;
            } else {
                this.showNotification('Cantidad máxima alcanzada', 'warning');
                return false;
            }
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: window.getCategoryImageUrl ? window.getCategoryImageUrl(product, '60x60') : `https://picsum.photos/60/60?random=${product.id}`,
                category: product.category,
                quantity: Math.min(quantity, this.maxQuantity)
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateCartBadge();
        
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ? 
            `${product.name}をカートに追加しました` : 
            `${product.name} agregado al carrito`;
        
        this.showNotification(message, 'success');
        
        // Google Analytics イベント
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                currency: this.currency,
                value: product.price * quantity,
                items: [{
                    item_id: product.id,
                    item_name: product.name,
                    category: product.category,
                    quantity: quantity,
                    price: product.price
                }]
            });
        }
        
        return true;
    }
    
    // 商品を削除
    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.id === productId);
        
        if (itemIndex > -1) {
            const removedItem = this.items[itemIndex];
            this.items.splice(itemIndex, 1);
            
            this.saveCart();
            this.updateCartUI();
            this.updateCartBadge();
            
            const isJapanese = document.body.classList.contains('ja');
            const message = isJapanese ? 
                `${removedItem.name}をカートから削除しました` : 
                `${removedItem.name} eliminado del carrito`;
            
            this.showNotification(message, 'info');
        }
    }
    
    // 数量を更新
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else if (quantity <= this.maxQuantity) {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartUI();
                this.updateCartBadge();
            } else {
                this.showNotification('Cantidad máxima alcanzada', 'warning');
            }
        }
    }
    
    // カートをクリア
    clearCart() {
        this.items = [];
        this.appliedDiscount = null;
        this.saveCart();
        this.updateCartUI();
        this.updateCartBadge();
        
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ? 'カートが空になりました' : 'Carrito vaciado';
        this.showNotification(message, 'info');
    }
    
    // 小計を計算
    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // 割引を計算
    getDiscountAmount() {
        if (!this.appliedDiscount) return 0;
        
        const subtotal = this.getSubtotal();
        const discount = this.discountCodes[this.appliedDiscount];
        
        if (!discount || subtotal < discount.minAmount) return 0;
        
        if (discount.type === 'percentage') {
            return subtotal * (discount.value / 100);
        } else {
            return discount.value;
        }
    }
    
    // 送料を計算
    getShippingCost() {
        const subtotal = this.getSubtotal();
        return subtotal >= this.freeShippingThreshold ? 0 : this.shippingCost;
    }
    
    // 税金を計算
    getTaxAmount() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        return (subtotal - discount) * this.taxRate;
    }
    
    // 合計を計算
    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const shipping = this.getShippingCost();
        const tax = this.getTaxAmount();
        
        return subtotal - discount + shipping + tax;
    }
    
    // アイテム数を取得
    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // 割引コードを適用
    applyDiscountCode(code) {
        const discount = this.discountCodes[code.toUpperCase()];
        const isJapanese = document.body.classList.contains('ja');
        
        if (!discount) {
            const message = isJapanese ? 
                '無効な割引コードです' : 
                'Código de descuento inválido';
            this.showNotification(message, 'error');
            return false;
        }
        
        const subtotal = this.getSubtotal();
        if (subtotal < discount.minAmount) {
            const message = isJapanese ? 
                `最低注文金額 ${this.formatCurrency(discount.minAmount)} が必要です` : 
                `Monto mínimo de ${this.formatCurrency(discount.minAmount)} requerido`;
            this.showNotification(message, 'warning');
            return false;
        }
        
        this.appliedDiscount = code.toUpperCase();
        this.saveCart();
        this.updateCartUI();
        
        const discountAmount = this.getDiscountAmount();
        const message = isJapanese ? 
            `割引コードが適用されました！ ${this.formatCurrency(discountAmount)} 割引` : 
            `¡Código aplicado! Descuento de ${this.formatCurrency(discountAmount)}`;
        this.showNotification(message, 'success');
        
        return true;
    }
    
    // 割引コードを削除
    removeDiscountCode() {
        this.appliedDiscount = null;
        this.saveCart();
        this.updateCartUI();
        
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ? '割引コードが削除されました' : 'Código de descuento eliminado';
        this.showNotification(message, 'info');
    }
    
    // カートUIを作成
    createCartUI() {
        // カートアイコンとバッジを作成
        this.createCartIcon();
        
        // カートサイドバーを作成
        this.createCartSidebar();
        
        // スタイルを追加
        this.addCartStyles();
    }
    
    // カートアイコンを作成
    createCartIcon() {
        const header = document.querySelector('header nav ul');
        if (!header || document.getElementById('cart-icon')) return;
        
        const cartLi = document.createElement('li');
        cartLi.innerHTML = `
            <button id="cart-icon" class="cart-icon" aria-label="Carrito de compras">
                🛒
                <span class="cart-badge" id="cart-badge">0</span>
            </button>
        `;
        
        header.appendChild(cartLi);
    }
    
    // カートサイドバーを作成
    createCartSidebar() {
        if (document.getElementById('cart-sidebar')) return;
        
        const cartSidebar = document.createElement('div');
        cartSidebar.id = 'cart-sidebar';
        cartSidebar.className = 'cart-sidebar';
        cartSidebar.innerHTML = `
            <div class="cart-header">
                <h3>
                    <span class="es-text">Carrito de Compras</span>
                    <span class="ja-text">ショッピングカート</span>
                </h3>
                <button class="cart-close" id="cart-close">&times;</button>
            </div>
            <div class="cart-body" id="cart-body">
                <div class="cart-empty" id="cart-empty">
                    <div class="empty-icon">🛒</div>
                    <p>
                        <span class="es-text">Tu carrito está vacío</span>
                        <span class="ja-text">カートは空です</span>
                    </p>
                    <a href="products/index.html" class="btn">
                        <span class="es-text">Continuar Comprando</span>
                        <span class="ja-text">買い物を続ける</span>
                    </a>
                </div>
                <div class="cart-items" id="cart-items"></div>
                <div class="cart-discount" id="cart-discount">
                    <div class="discount-form">
                        <input type="text" id="discount-code" placeholder="Código de descuento">
                        <button type="button" id="apply-discount" class="btn-small">
                            <span class="es-text">Aplicar</span>
                            <span class="ja-text">適用</span>
                        </button>
                    </div>
                    <div class="applied-discount" id="applied-discount" style="display: none;">
                        <span class="discount-text"></span>
                        <button type="button" id="remove-discount">&times;</button>
                    </div>
                </div>
                <div class="cart-summary" id="cart-summary"></div>
            </div>
            <div class="cart-footer" id="cart-footer">
                <button class="btn btn-outline" id="clear-cart">
                    <span class="es-text">Vaciar Carrito</span>
                    <span class="ja-text">カートを空にする</span>
                </button>
                <button class="btn btn-primary" id="checkout-btn">
                    <span class="es-text">Finalizar Compra</span>
                    <span class="ja-text">購入手続きへ</span>
                </button>
            </div>
        `;
        
        document.body.appendChild(cartSidebar);
        
        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.id = 'cart-overlay';
        overlay.className = 'cart-overlay';
        document.body.appendChild(overlay);
    }
    
    // イベントリスナーを設定
    setupEventListeners() {
        // カートアイコンクリック
        document.addEventListener('click', (e) => {
            if (e.target.closest('#cart-icon')) {
                this.toggleCart();
            }
        });
        
        // カート閉じるボタン
        document.addEventListener('click', (e) => {
            if (e.target.id === 'cart-close' || e.target.id === 'cart-overlay') {
                this.closeCart();
            }
        });
        
        // カートクリアボタン
        document.addEventListener('click', (e) => {
            if (e.target.closest('#clear-cart')) {
                this.confirmClearCart();
            }
        });
        
        // チェックアウトボタン
        document.addEventListener('click', (e) => {
            if (e.target.closest('#checkout-btn')) {
                this.proceedToCheckout();
            }
        });
        
        // 割引コード適用
        document.addEventListener('click', (e) => {
            if (e.target.closest('#apply-discount')) {
                const code = document.getElementById('discount-code').value;
                this.applyDiscountCode(code);
            }
        });
        
        // 割引コード削除
        document.addEventListener('click', (e) => {
            if (e.target.id === 'remove-discount') {
                this.removeDiscountCode();
            }
        });
        
        // Enterキーで割引コード適用
        document.addEventListener('keypress', (e) => {
            if (e.target.id === 'discount-code' && e.key === 'Enter') {
                this.applyDiscountCode(e.target.value);
            }
        });
        
        // ESCキーでカート閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeCart();
            }
        });
    }
    
    // カートを開く/閉じる
    toggleCart() {
        if (this.isOpen) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }
    
    // カートを開く
    openCart() {
        this.isOpen = true;
        document.getElementById('cart-sidebar').classList.add('open');
        document.getElementById('cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
        this.updateCartUI();
    }
    
    // カートを閉じる
    closeCart() {
        this.isOpen = false;
        document.getElementById('cart-sidebar').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }
    
    // カートUIを更新
    updateCartUI() {
        const cartItems = document.getElementById('cart-items');
        const cartEmpty = document.getElementById('cart-empty');
        const cartSummary = document.getElementById('cart-summary');
        const cartFooter = document.getElementById('cart-footer');
        const discountSection = document.getElementById('cart-discount');
        
        if (this.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
            cartFooter.style.display = 'none';
            discountSection.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
            cartSummary.style.display = 'block';
            cartFooter.style.display = 'flex';
            discountSection.style.display = 'block';
            
            this.renderCartItems();
            this.renderCartSummary();
            this.renderDiscountSection();
        }
    }
    
    // カートアイテムをレンダリング
    renderCartItems() {
        const container = document.getElementById('cart-items');
        
        container.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${this.formatCurrency(item.price)}</p>
                    <div class="quantity-controls">
                        <button class="qty-btn qty-minus" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="item-actions">
                    <div class="item-total">${this.formatCurrency(item.price * item.quantity)}</div>
                    <button class="remove-item" data-id="${item.id}">🗑️</button>
                </div>
            </div>
        `).join('');
        
        // イベントリスナーを追加
        this.addCartItemEventListeners();
    }
    
    // カートサマリーをレンダリング
    renderCartSummary() {
        const container = document.getElementById('cart-summary');
        const isJapanese = document.body.classList.contains('ja');
        
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const shipping = this.getShippingCost();
        const tax = this.getTaxAmount();
        const total = this.getTotal();
        
        let summaryHTML = `
            <div class="summary-line">
                <span>${isJapanese ? '小計' : 'Subtotal'}</span>
                <span>${this.formatCurrency(subtotal)}</span>
            </div>
        `;
        
        if (discount > 0) {
            summaryHTML += `
                <div class="summary-line discount">
                    <span>${isJapanese ? '割引' : 'Descuento'}</span>
                    <span>-${this.formatCurrency(discount)}</span>
                </div>
            `;
        }
        
        summaryHTML += `
            <div class="summary-line">
                <span>${isJapanese ? '送料' : 'Envío'}</span>
                <span>${shipping === 0 ? (isJapanese ? '無料' : 'Gratis') : this.formatCurrency(shipping)}</span>
            </div>
            <div class="summary-line">
                <span>${isJapanese ? '税金 (IVA)' : 'Impuestos (IVA)'}</span>
                <span>${this.formatCurrency(tax)}</span>
            </div>
            <div class="summary-line total">
                <span>${isJapanese ? '合計' : 'Total'}</span>
                <span>${this.formatCurrency(total)}</span>
            </div>
        `;
        
        if (subtotal < this.freeShippingThreshold && subtotal > 0) {
            const remaining = this.freeShippingThreshold - subtotal;
            summaryHTML += `
                <div class="free-shipping-notice">
                    <p>${isJapanese ? 
                        `あと ${this.formatCurrency(remaining)} で送料無料！` : 
                        `¡Agrega ${this.formatCurrency(remaining)} más para envío gratis!`
                    }</p>
                </div>
            `;
        }
        
        container.innerHTML = summaryHTML;
    }
    
    // 割引セクションをレンダリング
    renderDiscountSection() {
        const appliedDiscountDiv = document.getElementById('applied-discount');
        const discountForm = document.querySelector('.discount-form');
        
        if (this.appliedDiscount) {
            const discount = this.discountCodes[this.appliedDiscount];
            const discountAmount = this.getDiscountAmount();
            const isJapanese = document.body.classList.contains('ja');
            
            appliedDiscountDiv.style.display = 'flex';
            appliedDiscountDiv.querySelector('.discount-text').textContent = 
                `${this.appliedDiscount}: -${this.formatCurrency(discountAmount)}`;
            
            discountForm.style.display = 'none';
        } else {
            appliedDiscountDiv.style.display = 'none';
            discountForm.style.display = 'flex';
            document.getElementById('discount-code').value = '';
        }
    }
    
    // カートアイテムイベントリスナーを追加
    addCartItemEventListeners() {
        // 数量変更ボタン
        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });
        
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        // 削除ボタン
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                this.removeItem(productId);
            });
        });
    }
    
    // カートバッジを更新
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.getItemCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }
    
    // カートクリア確認
    confirmClearCart() {
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ? 
            'カートを空にしてもよろしいですか？' : 
            '¿Estás seguro de que quieres vaciar el carrito?';
        
        if (confirm(message)) {
            this.clearCart();
        }
    }
    
    // チェックアウトに進む
    proceedToCheckout() {
        if (this.items.length === 0) return;
        
        // Google Analytics イベント
        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                currency: this.currency,
                value: this.getTotal(),
                items: this.items.map(item => ({
                    item_id: item.id,
                    item_name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    price: item.price
                }))
            });
        }
        
        // デモ用のアラート
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ? 
            '実際のサイトでは、ここで決済ページに移動します。' : 
            'En el sitio real, aquí se dirigiría a la página de pago.';
        
        alert(message);
        
        // 実際の実装では checkout.html に移動
        // window.location.href = 'checkout.html';
    }
    
    // 通貨フォーマット
    formatCurrency(amount) {
        if (window.utils && window.utils.formatCurrency) {
            return window.utils.formatCurrency(amount, this.currency);
        }
        return `$${amount.toFixed(2)} ${this.currency}`;
    }
    
    // 通知を表示
    showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 新しい通知を作成
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // アニメーション
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自動的に削除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // スタイルを追加
    addCartStyles() {
        if (document.getElementById('cart-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'cart-styles';
        style.textContent = `
            .cart-icon {
                position: relative;
                background: none;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                padding: 5px;
            }
            
            .cart-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.7em;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .cart-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 999;
                display: none;
            }
            
            .cart-overlay.open {
                display: block;
            }
            
            .cart-sidebar {
                position: fixed;
                top: 0;
                right: -400px;
                width: 400px;
                height: 100%;
                background: white;
                z-index: 1000;
                display: flex;
                flex-direction: column;
                transition: right 0.3s ease;
                box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            }
            
            .cart-sidebar.open {
                right: 0;
            }
            
            .cart-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .cart-header h3 {
                margin: 0;
                font-size: 1.2em;
            }
            
            .cart-close {
                background: none;
                border: none;
                font-size: 1.5em;
                cursor: pointer;
                padding: 5px;
            }
            
            .cart-body {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }
            
            .cart-empty {
                text-align: center;
                padding: 40px 20px;
            }
            
            .empty-icon {
                font-size: 3em;
                margin-bottom: 20px;
            }
            
            .cart-item {
                display: flex;
                padding: 15px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .item-image {
                width: 60px;
                height: 60px;
                margin-right: 15px;
            }
            
            .item-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h4 {
                margin: 0 0 5px;
                font-size: 0.9em;
            }
            
            .item-price {
                color: var(--primary-color);
                font-weight: 600;
                margin: 0 0 10px;
            }
            
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .qty-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .qty-btn:hover {
                background: #f8f9fa;
            }
            
            .quantity {
                min-width: 30px;
                text-align: center;
                font-weight: 600;
            }
            
            .item-actions {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 10px;
            }
            
            .item-total {
                font-weight: 600;
                color: var(--primary-color);
            }
            
            .remove-item {
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1.2em;
                opacity: 0.6;
            }
            
            .remove-item:hover {
                opacity: 1;
            }
            
            .cart-discount {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .discount-form {
                display: flex;
                gap: 10px;
            }
            
            .discount-form input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            
            .btn-small {
                padding: 8px 15px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9em;
            }
            
            .applied-discount {
                display: flex;
                justify-content: space-between;
                align-items: center;
                color: green;
                font-weight: 600;
            }
            
            .cart-summary {
                margin: 20px 0;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 10px;
            }
            
            .summary-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            
            .summary-line.discount {
                color: green;
            }
            
            .summary-line.total {
                font-weight: 600;
                font-size: 1.1em;
                border-top: 1px solid #ddd;
                padding-top: 10px;
                margin-top: 10px;
            }
            
            .free-shipping-notice {
                margin-top: 15px;
                padding: 10px;
                background: #e3f2fd;
                border-radius: 5px;
                text-align: center;
            }
            
            .free-shipping-notice p {
                margin: 0;
                font-size: 0.9em;
                color: var(--primary-color);
            }
            
            .cart-footer {
                padding: 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }
            
            .btn-outline {
                background: white;
                color: var(--primary-color);
                border: 1px solid var(--primary-color);
            }
            
            .btn-outline:hover {
                background: var(--primary-color);
                color: white;
            }
            
            .btn-primary {
                background: var(--primary-color);
                color: white;
                border: 1px solid var(--primary-color);
            }
            
            .cart-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 1001;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .cart-notification.show {
                transform: translateX(0);
            }
            
            .cart-notification.success {
                background: #28a745;
            }
            
            .cart-notification.error {
                background: #dc3545;
            }
            
            .cart-notification.warning {
                background: #ffc107;
                color: #333;
            }
            
            .cart-notification.info {
                background: #17a2b8;
            }
            
            @media (max-width: 768px) {
                .cart-sidebar {
                    width: 100%;
                    right: -100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// ページロード時にカートを初期化
document.addEventListener('DOMContentLoaded', function() {
    window.shoppingCart = new ShoppingCart();
    
    // 商品の「カートに追加」ボタンにイベントリスナーを追加
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            e.preventDefault();
            
            // 商品情報を取得（商品詳細ページの場合）
            const productCard = e.target.closest('.product-card, .product-detail');
            if (productCard) {
                const productData = extractProductData(productCard);
                if (productData) {
                    window.shoppingCart.addItem(productData);
                }
            }
        }
    });
});

// 商品データを抽出する関数
function extractProductData(element) {
    try {
        // 商品IDを取得
        const productId = element.getAttribute('data-id') || 
                         window.utils?.getUrlParam('id') || 
                         'unknown';
        
        // 商品名を取得
        const nameElement = element.querySelector('h1, h3, .product-name');
        const name = nameElement ? nameElement.textContent.trim() : 'Producto';
        
        // 価格を取得
        const priceElement = element.querySelector('.product-price, .price');
        let price = 0;
        if (priceElement) {
            const priceText = priceElement.textContent.replace(/[^\d.]/g, '');
            price = parseFloat(priceText) || 0;
        }
        
        // 画像を取得
        const imageElement = element.querySelector('img');
        const image = imageElement ? imageElement.src : '';
        
        // カテゴリを取得
        const categoryElement = element.querySelector('.category, .product-category');
        const category = categoryElement ? categoryElement.textContent.trim() : 'general';
        
        return {
            id: productId,
            name: name,
            price: price,
            image: image,
            category: category
        };
    } catch (error) {
        console.error('Error extracting product data:', error);
        return null;
    }
}

// エクスポート
window.ShoppingCart = ShoppingCart;