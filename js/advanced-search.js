// 高度検索・フィルタリング機能
// 商品の詳細検索、フィルタリング、ソート機能を提供

class AdvancedSearch {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentFilters = {
            category: '',
            priceRange: { min: 0, max: Infinity },
            searchQuery: '',
            tags: [],
            sortBy: 'featured',
            inStock: null
        };
        this.searchHistory = [];
        this.isInitialized = false;
    }

    // 初期化
    async init() {
        if (this.isInitialized) return;

        try {
            console.log('Advanced Search: Initializing...');
            
            // 商品データの読み込み
            await this.loadProducts();
            
            // 検索UIの初期化
            this.initializeSearchUI();
            
            // フィルターUIの初期化
            this.initializeFilters();
            
            // 検索履歴の復元
            this.restoreSearchHistory();
            
            // URLパラメータから初期フィルターを設定
            this.setFiltersFromURL();
            
            // 初期検索実行
            this.performSearch();
            
            this.isInitialized = true;
            console.log('Advanced Search: Initialized successfully');
            
        } catch (error) {
            console.error('Advanced Search: Initialization failed', error);
        }
    }

    // 商品データの読み込み
    async loadProducts() {
        try {
            const response = await fetch('/data/data.json');
            const data = await response.json();
            this.products = data.products || [];
            console.log(`Advanced Search: Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('Advanced Search: Failed to load products', error);
            this.products = [];
        }
    }

    // 検索UIの初期化
    initializeSearchUI() {
        // 検索ボックス
        const searchInput = document.getElementById('search-products') || 
                           document.getElementById('main-search') ||
                           document.querySelector('[data-search="input"]');
        
        if (searchInput) {
            // デバウンス検索
            const debouncedSearch = this.debounce((value) => {
                this.currentFilters.searchQuery = value;
                this.performSearch();
                this.saveSearchHistory(value);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value.trim());
            });

            // 検索候補の表示
            searchInput.addEventListener('focus', () => {
                this.showSearchSuggestions(searchInput);
            });

            // Enterキーでの検索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch();
                }
            });
        }

        // 検索ボタン
        const searchButton = document.querySelector('[data-search="button"]');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.performSearch();
            });
        }

        // 音声検索ボタン
        this.initializeVoiceSearch();
    }

    // フィルターUIの初期化
    initializeFilters() {
        // カテゴリフィルター
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.performSearch();
                this.updateURL();
            });
        }

        // ソートフィルター
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.performSearch();
                this.updateURL();
            });
        }

        // 価格範囲フィルター
        this.initializePriceRangeFilter();

        // タグフィルター
        this.initializeTagFilters();

        // 在庫フィルター
        this.initializeStockFilter();

        // フィルタークリアボタン
        this.initializeClearFilters();
    }

    // 価格範囲フィルターの初期化
    initializePriceRangeFilter() {
        const priceRangeContainer = document.querySelector('[data-filter="price-range"]');
        if (!priceRangeContainer) return;

        // 価格範囲の取得
        const prices = this.products.map(p => p.price).filter(p => p > 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // 価格範囲スライダーのHTML作成
        priceRangeContainer.innerHTML = `
            <div class="price-range-filter">
                <label class="filter-label">
                    <span class="es-text">Rango de Precio</span>
                    <span class="ja-text">価格帯</span>
                </label>
                <div class="price-range-inputs">
                    <input type="range" id="price-min" min="${minPrice}" max="${maxPrice}" value="${minPrice}" class="price-slider">
                    <input type="range" id="price-max" min="${minPrice}" max="${maxPrice}" value="${maxPrice}" class="price-slider">
                </div>
                <div class="price-range-values">
                    <span id="price-min-value">$${minPrice}</span>
                    <span>-</span>
                    <span id="price-max-value">$${maxPrice}</span>
                </div>
            </div>
        `;

        // イベントリスナーの追加
        const priceMinSlider = document.getElementById('price-min');
        const priceMaxSlider = document.getElementById('price-max');
        const priceMinValue = document.getElementById('price-min-value');
        const priceMaxValue = document.getElementById('price-max-value');

        const updatePriceRange = () => {
            const min = parseInt(priceMinSlider.value);
            const max = parseInt(priceMaxSlider.value);

            // 最小値が最大値を超えないようにする
            if (min > max) {
                priceMinSlider.value = max;
            }
            if (max < min) {
                priceMaxSlider.value = min;
            }

            const finalMin = parseInt(priceMinSlider.value);
            const finalMax = parseInt(priceMaxSlider.value);

            priceMinValue.textContent = `$${finalMin}`;
            priceMaxValue.textContent = `$${finalMax}`;

            this.currentFilters.priceRange = { min: finalMin, max: finalMax };
            this.performSearch();
            this.updateURL();
        };

        priceMinSlider.addEventListener('input', updatePriceRange);
        priceMaxSlider.addEventListener('input', updatePriceRange);
    }

    // タグフィルターの初期化
    initializeTagFilters() {
        const tagContainer = document.querySelector('[data-filter="tags"]');
        if (!tagContainer) return;

        // 全商品からタグを抽出
        const allTags = new Set();
        this.products.forEach(product => {
            if (product.tags) {
                product.tags.forEach(tag => allTags.add(tag));
            }
        });

        // タグフィルターのHTML作成
        const tagHTML = Array.from(allTags).map(tag => `
            <label class="tag-filter">
                <input type="checkbox" value="${tag}" data-tag="${tag}">
                <span class="tag-label">${tag}</span>
            </label>
        `).join('');

        tagContainer.innerHTML = `
            <div class="tag-filters">
                <label class="filter-label">
                    <span class="es-text">Etiquetas</span>
                    <span class="ja-text">タグ</span>
                </label>
                <div class="tag-list">
                    ${tagHTML}
                </div>
            </div>
        `;

        // イベントリスナーの追加
        tagContainer.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const tag = e.target.value;
                if (e.target.checked) {
                    if (!this.currentFilters.tags.includes(tag)) {
                        this.currentFilters.tags.push(tag);
                    }
                } else {
                    this.currentFilters.tags = this.currentFilters.tags.filter(t => t !== tag);
                }
                this.performSearch();
                this.updateURL();
            }
        });
    }

    // 在庫フィルターの初期化
    initializeStockFilter() {
        const stockContainer = document.querySelector('[data-filter="stock"]');
        if (!stockContainer) return;

        stockContainer.innerHTML = `
            <div class="stock-filter">
                <label class="filter-label">
                    <span class="es-text">Disponibilidad</span>
                    <span class="ja-text">在庫状況</span>
                </label>
                <div class="stock-options">
                    <label class="stock-option">
                        <input type="radio" name="stock" value="all" checked>
                        <span class="es-text">Todos</span>
                        <span class="ja-text">すべて</span>
                    </label>
                    <label class="stock-option">
                        <input type="radio" name="stock" value="in-stock">
                        <span class="es-text">En Stock</span>
                        <span class="ja-text">在庫あり</span>
                    </label>
                    <label class="stock-option">
                        <input type="radio" name="stock" value="out-of-stock">
                        <span class="es-text">Agotado</span>
                        <span class="ja-text">在庫なし</span>
                    </label>
                </div>
            </div>
        `;

        stockContainer.addEventListener('change', (e) => {
            if (e.target.name === 'stock') {
                switch (e.target.value) {
                    case 'all':
                        this.currentFilters.inStock = null;
                        break;
                    case 'in-stock':
                        this.currentFilters.inStock = true;
                        break;
                    case 'out-of-stock':
                        this.currentFilters.inStock = false;
                        break;
                }
                this.performSearch();
                this.updateURL();
            }
        });
    }

    // フィルタークリア機能
    initializeClearFilters() {
        const clearButton = document.querySelector('[data-action="clear-filters"]');
        if (!clearButton) {
            // クリアボタンを動的に作成
            const filtersContainer = document.querySelector('.product-filters');
            if (filtersContainer) {
                const clearBtn = document.createElement('button');
                clearBtn.textContent = 'Limpiar Filtros';
                clearBtn.className = 'btn btn-secondary clear-filters';
                clearBtn.setAttribute('data-action', 'clear-filters');
                filtersContainer.appendChild(clearBtn);
            }
        }

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="clear-filters"]')) {
                this.clearAllFilters();
            }
        });
    }

    // 音声検索の初期化
    initializeVoiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return; // 音声認識がサポートされていない
        }

        const voiceSearchButton = document.querySelector('[data-voice-search]');
        if (!voiceSearchButton) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = document.documentElement.lang || 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceSearchButton.addEventListener('click', () => {
            recognition.start();
            voiceSearchButton.classList.add('listening');
        });

        recognition.addEventListener('result', (e) => {
            const transcript = e.results[0][0].transcript;
            const searchInput = document.getElementById('search-products');
            if (searchInput) {
                searchInput.value = transcript;
                this.currentFilters.searchQuery = transcript;
                this.performSearch();
            }
        });

        recognition.addEventListener('end', () => {
            voiceSearchButton.classList.remove('listening');
        });
    }

    // 検索実行
    performSearch() {
        console.log('Advanced Search: Performing search with filters:', this.currentFilters);

        let results = [...this.products];

        // テキスト検索
        if (this.currentFilters.searchQuery) {
            const query = this.currentFilters.searchQuery.toLowerCase();
            results = results.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                (product.category && product.category.toLowerCase().includes(query)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }

        // カテゴリフィルター
        if (this.currentFilters.category) {
            results = results.filter(product => 
                product.category === this.currentFilters.category
            );
        }

        // 価格範囲フィルター
        results = results.filter(product => 
            product.price >= this.currentFilters.priceRange.min &&
            product.price <= this.currentFilters.priceRange.max
        );

        // タグフィルター
        if (this.currentFilters.tags.length > 0) {
            results = results.filter(product =>
                product.tags && this.currentFilters.tags.some(tag => 
                    product.tags.includes(tag)
                )
            );
        }

        // 在庫フィルター
        if (this.currentFilters.inStock !== null) {
            results = results.filter(product => 
                Boolean(product.inStock) === this.currentFilters.inStock
            );
        }

        // ソート
        results = this.sortResults(results);

        this.filteredProducts = results;
        this.displayResults(results);
        this.updateResultsCount(results.length);
    }

    // 検索結果のソート
    sortResults(results) {
        switch (this.currentFilters.sortBy) {
            case 'price-low':
                return results.sort((a, b) => a.price - b.price);
            case 'price-high':
                return results.sort((a, b) => b.price - a.price);
            case 'name':
                return results.sort((a, b) => a.name.localeCompare(b.name));
            case 'newest':
                return results.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
            case 'rating':
                return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            case 'featured':
            default:
                return results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }
    }

    // 検索結果の表示
    displayResults(results) {
        const container = document.getElementById('products-container') ||
                         document.querySelector('[data-products-container]') ||
                         document.querySelector('.product-grid');

        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }

        const resultHTML = results.map(product => this.createProductCardHTML(product)).join('');
        container.innerHTML = resultHTML;

        // 遅延読み込み画像の処理
        this.initializeLazyLoading();
    }

    // 商品カードのHTML生成
    createProductCardHTML(product) {
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
                    ${!product.inStock ? '<span class="out-of-stock-badge">Agotado</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${this.truncateText(product.description, 100)}</p>
                    <div class="product-price">$${product.price.toLocaleString()}</div>
                    ${product.tags ? `<div class="product-tags">${product.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
                    <div class="product-actions">
                        <button class="btn btn-primary" ${!product.inStock ? 'disabled' : ''}>
                            ${product.inStock ? 'Agregar al Carrito' : 'Agotado'}
                        </button>
                        <a href="/products/product-detail.html?id=${product.id}" class="btn btn-secondary">Ver Detalles</a>
                    </div>
                </div>
            </div>
        `;
    }

    // 結果なしのHTML
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3 class="es-text">No se encontraron productos</h3>
                <h3 class="ja-text">商品が見つかりませんでした</h3>
                <p class="es-text">Intenta ajustar tus filtros de búsqueda</p>
                <p class="ja-text">検索フィルターを調整してみてください</p>
                <button class="btn btn-primary" data-action="clear-filters">
                    <span class="es-text">Limpiar Filtros</span>
                    <span class="ja-text">フィルターをクリア</span>
                </button>
            </div>
        `;
    }

    // 検索候補の表示
    showSearchSuggestions(input) {
        const suggestions = this.generateSearchSuggestions(input.value);
        
        let suggestionContainer = document.querySelector('.search-suggestions');
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'search-suggestions';
            input.parentNode.appendChild(suggestionContainer);
        }

        if (suggestions.length === 0) {
            suggestionContainer.style.display = 'none';
            return;
        }

        const suggestionHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-suggestion="${suggestion}">
                ${suggestion}
            </div>
        `).join('');

        suggestionContainer.innerHTML = suggestionHTML;
        suggestionContainer.style.display = 'block';

        // 候補クリック時の処理
        suggestionContainer.addEventListener('click', (e) => {
            if (e.target.matches('.suggestion-item')) {
                input.value = e.target.dataset.suggestion;
                this.currentFilters.searchQuery = e.target.dataset.suggestion;
                this.performSearch();
                suggestionContainer.style.display = 'none';
            }
        });

        // 外部クリック時に候補を非表示
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionContainer.contains(e.target)) {
                suggestionContainer.style.display = 'none';
            }
        });
    }

    // 検索候補の生成
    generateSearchSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suggestions = new Set();
        const queryLower = query.toLowerCase();

        // 商品名から候補を生成
        this.products.forEach(product => {
            if (product.name.toLowerCase().includes(queryLower)) {
                suggestions.add(product.name);
            }
            if (product.category && product.category.toLowerCase().includes(queryLower)) {
                suggestions.add(product.category);
            }
            if (product.tags) {
                product.tags.forEach(tag => {
                    if (tag.toLowerCase().includes(queryLower)) {
                        suggestions.add(tag);
                    }
                });
            }
        });

        // 検索履歴から候補を追加
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(queryLower)) {
                suggestions.add(historyItem);
            }
        });

        return Array.from(suggestions).slice(0, 8);
    }

    // ユーティリティメソッド
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // フィルターのクリア
    clearAllFilters() {
        this.currentFilters = {
            category: '',
            priceRange: { min: 0, max: Infinity },
            searchQuery: '',
            tags: [],
            sortBy: 'featured',
            inStock: null
        };

        // UIの更新
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) categoryFilter.value = '';

        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) sortFilter.value = 'featured';

        const searchInput = document.getElementById('search-products');
        if (searchInput) searchInput.value = '';

        // チェックボックスのクリア
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            cb.checked = false;
        });

        // ラジオボタンのリセット
        const allStockRadio = document.querySelector('input[name="stock"][value="all"]');
        if (allStockRadio) allStockRadio.checked = true;

        this.performSearch();
        this.updateURL();
    }

    // URLの更新
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.currentFilters.searchQuery) {
            params.set('search', this.currentFilters.searchQuery);
        }
        if (this.currentFilters.category) {
            params.set('category', this.currentFilters.category);
        }
        if (this.currentFilters.sortBy !== 'featured') {
            params.set('sort', this.currentFilters.sortBy);
        }
        if (this.currentFilters.tags.length > 0) {
            params.set('tags', this.currentFilters.tags.join(','));
        }

        const newURL = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newURL);
    }

    // URLからフィルターを設定
    setFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('search')) {
            this.currentFilters.searchQuery = params.get('search');
            const searchInput = document.getElementById('search-products');
            if (searchInput) searchInput.value = this.currentFilters.searchQuery;
        }
        
        if (params.has('category')) {
            this.currentFilters.category = params.get('category');
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) categoryFilter.value = this.currentFilters.category;
        }
        
        if (params.has('sort')) {
            this.currentFilters.sortBy = params.get('sort');
            const sortFilter = document.getElementById('sort-filter');
            if (sortFilter) sortFilter.value = this.currentFilters.sortBy;
        }
        
        if (params.has('tags')) {
            this.currentFilters.tags = params.get('tags').split(',');
        }
    }

    // 検索履歴の管理
    saveSearchHistory(query) {
        if (!query || query.length < 2) return;
        
        // 重複を避けて履歴に追加
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        this.searchHistory.unshift(query);
        
        // 履歴を最大10件に制限
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // ローカルストレージに保存
        try {
            localStorage.setItem('search-history', JSON.stringify(this.searchHistory));
        } catch (e) {
            console.warn('Could not save search history:', e);
        }
    }

    restoreSearchHistory() {
        try {
            const stored = localStorage.getItem('search-history');
            if (stored) {
                this.searchHistory = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not restore search history:', e);
            this.searchHistory = [];
        }
    }

    // 結果数の更新
    updateResultsCount(count) {
        const countElement = document.querySelector('[data-results-count]');
        if (countElement) {
            countElement.textContent = count;
        }

        const resultsInfo = document.querySelector('.results-info');
        if (resultsInfo) {
            resultsInfo.innerHTML = `
                <span class="es-text">${count} productos encontrados</span>
                <span class="ja-text">${count}件の商品が見つかりました</span>
            `;
        }
    }

    // 遅延読み込みの初期化
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 現在のフィルター状態を取得
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    // フィルター結果を取得
    getFilteredProducts() {
        return [...this.filteredProducts];
    }
}

// グローバルAdvancedSearchインスタンス
window.AdvancedSearch = new AdvancedSearch();

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.AdvancedSearch.init();
});