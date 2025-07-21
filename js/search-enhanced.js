// 強化された検索・フィルター機能
class EnhancedSearch {
    constructor() {
        this.searchInput = null;
        this.products = [];
        this.filteredProducts = [];
        this.searchSuggestions = [];
        this.currentFilters = {
            category: '',
            priceRange: '',
            sortBy: 'name'
        };
        this.searchHistory = JSON.parse(localStorage.getItem('youkoso_search_history') || '[]');
        this.init();
    }

    init() {
        this.createHeaderSearch();
        this.loadProducts();
        this.setupEventListeners();
        // this.updateSearchSuggestions(); // Commented out - function doesn't exist yet
    }

    // ヘッダーに検索バーを追加
    createHeaderSearch() {
        const header = document.querySelector('.header-content');
        if (!header || document.getElementById('header-search')) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'header-search-container';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        id="header-search" 
                        class="search-input" 
                        placeholder="商品を検索..."
                        autocomplete="off"
                        aria-label="商品検索"
                        role="searchbox"
                    >
                    <button class="search-clear" id="search-clear" aria-label="検索クリア">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-suggestions" id="search-suggestions" role="listbox"></div>
            </div>
        `;

        // ナビゲーションの前に挿入
        const nav = header.querySelector('.nav');
        if (nav) {
            header.insertBefore(searchContainer, nav);
        } else {
            header.appendChild(searchContainer);
        }

        this.searchInput = document.getElementById('header-search');
        this.addSearchStyles();
    }

    // 検索機能のスタイル追加
    addSearchStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .header-search-container {
                flex: 1;
                max-width: 500px;
                margin: 0 2rem;
                position: relative;
            }
            
            .search-wrapper {
                position: relative;
                width: 100%;
            }
            
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                background: var(--bg-light);
                border: 2px solid var(--border-color);
                border-radius: 25px;
                padding: 0.5rem 1rem;
                transition: all 0.3s ease;
            }
            
            .search-input-wrapper:focus-within {
                border-color: var(--accent-color);
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
                background: var(--bg-color);
            }
            
            .search-icon {
                color: var(--text-light);
                margin-right: 0.75rem;
                font-size: 1rem;
            }
            
            .search-input {
                flex: 1;
                border: none;
                outline: none;
                background: transparent;
                font-size: 1rem;
                color: var(--text-color);
                padding: 0.5rem 0;
            }
            
            .search-input::placeholder {
                color: var(--text-light);
            }
            
            .search-clear {
                background: none;
                border: none;
                color: var(--text-light);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                opacity: 0;
                transition: all 0.3s ease;
                margin-left: 0.5rem;
            }
            
            .search-input:not(:placeholder-shown) + .search-clear {
                opacity: 1;
            }
            
            .search-clear:hover {
                color: var(--text-color);
                background: var(--bg-subtle);
            }
            
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--bg-color);
                border: 1px solid var(--border-color);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                display: none;
                margin-top: 0.5rem;
            }
            
            .search-suggestions.active {
                display: block;
                animation: slideDown 0.2s ease;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .suggestion-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transition: background-color 0.2s ease;
            }
            
            .suggestion-item:hover,
            .suggestion-item.highlighted {
                background: var(--bg-light);
            }
            
            .suggestion-item:last-child {
                border-bottom: none;
            }
            
            .suggestion-icon {
                color: var(--text-light);
                font-size: 0.875rem;
                width: 16px;
            }
            
            .suggestion-text {
                flex: 1;
                font-size: 0.9rem;
            }
            
            .suggestion-type {
                font-size: 0.75rem;
                color: var(--text-light);
                background: var(--bg-subtle);
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
            }
            
            /* モバイル対応 */
            @media (max-width: 768px) {
                .header-search-container {
                    margin: 0.5rem 0;
                    order: 10;
                    flex-basis: 100%;
                }
                
                .search-input-wrapper {
                    padding: 0.75rem 1rem;
                }
                
                .search-input {
                    font-size: 1rem;
                }
            }
            
            @media (max-width: 480px) {
                .header-search-container {
                    margin: 0.5rem 0 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 商品データを読み込み
    async loadProducts() {
        try {
            const response = await fetch('./data/data.json');
            const data = await response.json();
            this.products = data.products || [];
            this.buildSearchIndex();
        } catch (error) {
            console.error('商品データの読み込みに失敗しました:', error);
        }
    }

    // 検索インデックスを構築
    buildSearchIndex() {
        this.searchSuggestions = [];
        
        // 商品名をインデックスに追加
        this.products.forEach(product => {
            this.searchSuggestions.push({
                text: product.name,
                type: 'product',
                icon: 'fas fa-box',
                data: product
            });
        });

        // カテゴリーをインデックスに追加
        const categories = [...new Set(this.products.map(p => p.category))];
        categories.forEach(category => {
            this.searchSuggestions.push({
                text: category,
                type: 'category',
                icon: 'fas fa-tag',
                data: { category }
            });
        });
    }

    // イベントリスナーを設定
    setupEventListeners() {
        if (!this.searchInput) return;

        let searchTimeout;
        
        // リアルタイム検索
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 150);
        });

        // キーボードナビゲーション
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });

        // フォーカス時に履歴表示
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value === '') {
                this.showSearchHistory();
            }
        });

        // クリア外でサジェスト非表示
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                this.hideSuggestions();
            }
        });

        // クリアボタン
        const clearBtn = document.getElementById('search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    }

    // 検索実行
    handleSearch(query) {
        const trimmedQuery = query.trim().toLowerCase();
        
        if (trimmedQuery === '') {
            this.showSearchHistory();
            return;
        }

        const suggestions = this.searchSuggestions.filter(item =>
            item.text.toLowerCase().includes(trimmedQuery)
        ).slice(0, 8);

        this.showSuggestions(suggestions, trimmedQuery);
        
        // 検索結果を商品ページに反映
        if (window.location.pathname.includes('products.html')) {
            this.filterProducts(trimmedQuery);
        }
    }

    // キーボードナビゲーション
    handleKeyNavigation(e) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        const highlighted = document.querySelector('.suggestion-item.highlighted');
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (highlighted) {
                    highlighted.classList.remove('highlighted');
                    const next = highlighted.nextElementSibling;
                    if (next) {
                        next.classList.add('highlighted');
                    } else if (suggestions.length > 0) {
                        suggestions[0].classList.add('highlighted');
                    }
                } else if (suggestions.length > 0) {
                    suggestions[0].classList.add('highlighted');
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (highlighted) {
                    highlighted.classList.remove('highlighted');
                    const prev = highlighted.previousElementSibling;
                    if (prev) {
                        prev.classList.add('highlighted');
                    } else if (suggestions.length > 0) {
                        suggestions[suggestions.length - 1].classList.add('highlighted');
                    }
                }
                break;
                
            case 'Enter':
                e.preventDefault();
                if (highlighted) {
                    this.selectSuggestion(highlighted);
                } else {
                    this.performSearch(this.searchInput.value);
                }
                break;
                
            case 'Escape':
                this.hideSuggestions();
                this.searchInput.blur();
                break;
        }
    }

    // サジェスト表示
    showSuggestions(suggestions, query = '') {
        const container = document.getElementById('search-suggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-search suggestion-icon"></i>
                    <span class="suggestion-text">「${query}」の検索結果が見つかりません</span>
                </div>
            `;
        } else {
            container.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" data-type="${item.type}" data-text="${item.text}">
                    <i class="${item.icon} suggestion-icon"></i>
                    <span class="suggestion-text">${this.highlightMatch(item.text, query)}</span>
                    <span class="suggestion-type">${item.type === 'product' ? '商品' : 'カテゴリー'}</span>
                </div>
            `).join('');
        }

        // クリックイベント追加
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => this.selectSuggestion(item));
        });

        container.classList.add('active');
    }

    // 検索履歴表示
    showSearchHistory() {
        const container = document.getElementById('search-suggestions');
        if (!container || this.searchHistory.length === 0) return;

        container.innerHTML = [
            '<div class="suggestion-header" style="padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px;">最近の検索</div>',
            ...this.searchHistory.slice(0, 5).map(term => `
                <div class="suggestion-item" data-type="history" data-text="${term}">
                    <i class="fas fa-history suggestion-icon"></i>
                    <span class="suggestion-text">${term}</span>
                    <button class="remove-history" data-term="${term}" style="margin-left: auto; background: none; border: none; color: var(--text-light); cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `)
        ].join('');

        // イベントリスナー追加
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-history')) {
                    this.selectSuggestion(item);
                }
            });
        });

        container.querySelectorAll('.remove-history').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromHistory(btn.dataset.term);
            });
        });

        container.classList.add('active');
    }

    // マッチ部分をハイライト
    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    // サジェスト選択
    selectSuggestion(item) {
        const text = item.dataset.text;
        const type = item.dataset.type;
        
        this.searchInput.value = text;
        this.hideSuggestions();
        
        // 履歴に追加
        this.addToHistory(text);
        
        if (type === 'category') {
            this.filterByCategory(text);
        } else {
            this.performSearch(text);
        }
    }

    // 検索実行
    performSearch(query) {
        this.addToHistory(query);
        
        if (window.location.pathname.includes('products.html')) {
            this.filterProducts(query);
        } else {
            // 商品ページにリダイレクト
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }

    // カテゴリフィルター
    filterByCategory(category) {
        if (window.location.pathname.includes('products.html')) {
            this.currentFilters.category = category;
            this.applyFilters();
        } else {
            window.location.href = `products.html?category=${encodeURIComponent(category)}`;
        }
    }

    // 商品フィルタリング
    filterProducts(query) {
        if (typeof window.filterProducts === 'function') {
            window.filterProducts(query);
        }
    }

    // フィルター適用
    applyFilters() {
        if (typeof window.applyAllFilters === 'function') {
            window.applyAllFilters(this.currentFilters);
        }
    }

    // サジェスト非表示
    hideSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.remove('active');
        }
    }

    // 検索クリア
    clearSearch() {
        this.searchInput.value = '';
        this.hideSuggestions();
        this.searchInput.focus();
        
        // フィルターリセット
        if (window.location.pathname.includes('products.html')) {
            this.currentFilters = { category: '', priceRange: '', sortBy: 'name' };
            this.applyFilters();
        }
    }

    // 履歴管理
    addToHistory(term) {
        if (!term || this.searchHistory.includes(term)) return;
        
        this.searchHistory.unshift(term);
        this.searchHistory = this.searchHistory.slice(0, 10);
        localStorage.setItem('youkoso_search_history', JSON.stringify(this.searchHistory));
    }

    removeFromHistory(term) {
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        localStorage.setItem('youkoso_search_history', JSON.stringify(this.searchHistory));
        this.showSearchHistory();
    }

    // URL パラメータから初期検索
    handleInitialSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTerm = urlParams.get('search');
        const category = urlParams.get('category');
        
        if (searchTerm) {
            this.searchInput.value = searchTerm;
            this.filterProducts(searchTerm);
        } else if (category) {
            this.currentFilters.category = category;
            this.applyFilters();
        }
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedSearch = new EnhancedSearch();
    
    // URL パラメータ処理
    setTimeout(() => {
        if (window.enhancedSearch) {
            window.enhancedSearch.handleInitialSearch();
        }
    }, 100);
});