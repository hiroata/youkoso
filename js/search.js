// 高度な検索機能用JavaScript

// 検索エンジンクラス
class SearchEngine {
    constructor() {
        this.searchData = [];
        this.searchHistory = [];
        this.popularSearches = [
            'figura anime', 'manga', 'totoro', 'demon slayer', 
            'pokemon', 'sailor moon', 'peluche', 'videojuegos'
        ];
        this.maxHistoryItems = 10;
        this.debounceTimeout = null;
        
        // 検索設定
        this.searchConfig = {
            minQueryLength: 2,
            maxResults: 20,
            highlightResults: true,
            fuzzySearch: true,
            categoryWeight: 1.2,
            nameWeight: 1.5,
            descriptionWeight: 1.0
        };
        
        this.init();
    }
    
    // 初期化
    async init() {
        await this.loadSearchData();
        this.loadSearchHistory();
        this.setupSearchInterface();
        this.setupKeyboardShortcuts();
    }
    
    // 検索データを読み込む
    async loadSearchData() {
        try {
            // 商品データ
            if (window.siteData && window.siteData.products) {
                this.searchData = [
                    ...window.siteData.products.map(product => ({
                        ...product,
                        type: 'product',
                        url: `products/product-detail.html?id=${product.id}`,
                        searchText: `${product.name} ${product.description} ${product.category}`.toLowerCase()
                    }))
                ];
            }
            
            // ブログ記事データ
            if (window.siteData && window.siteData.posts) {
                this.searchData.push(
                    ...window.siteData.posts.map(post => ({
                        ...post,
                        type: 'post',
                        url: `blog/blog-detail.html?id=${post.id}`,
                        searchText: `${post.title} ${post.excerpt} ${post.category}`.toLowerCase()
                    }))
                );
            }
            
            // カテゴリデータ
            if (window.siteData && window.siteData.categories) {
                this.searchData.push(
                    ...window.siteData.categories.map(category => ({
                        ...category,
                        type: 'category',
                        url: `products/index.html?category=${category.slug}`,
                        searchText: `${category.name} ${category.nameJa || ''}`.toLowerCase()
                    }))
                );
            }
            
            console.log('Search data loaded:', this.searchData.length, 'items');
        } catch (error) {
            console.error('Failed to load search data:', error);
        }
    }
    
    // 検索履歴を読み込む
    loadSearchHistory() {
        if (window.utils) {
            this.searchHistory = window.utils.getFromLocalStorage('search_history', []);
        } else {
            try {
                this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
            } catch (e) {
                this.searchHistory = [];
            }
        }
    }
    
    // 検索履歴を保存
    saveSearchHistory() {
        if (window.utils) {
            window.utils.saveToLocalStorage('search_history', this.searchHistory);
        } else {
            try {
                localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
            } catch (e) {
                console.warn('Failed to save search history');
            }
        }
    }
    
    // 検索履歴に追加
    addToHistory(query) {
        const trimmedQuery = query.trim().toLowerCase();
        if (trimmedQuery.length < this.searchConfig.minQueryLength) return;
        
        // 重複を削除
        this.searchHistory = this.searchHistory.filter(item => item !== trimmedQuery);
        
        // 先頭に追加
        this.searchHistory.unshift(trimmedQuery);
        
        // 最大数を制限
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        this.saveSearchHistory();
    }
    
    // 検索インターフェースをセットアップ
    setupSearchInterface() {
        // 検索フォームがない場合は作成
        this.createSearchForm();
        
        // 既存の検索フィールドを強化
        const searchInputs = document.querySelectorAll('input[type="search"], #search-products, #search-blog');
        
        searchInputs.forEach(input => {
            this.enhanceSearchInput(input);
        });
        
        // グローバル検索ボックスを追加
        this.addGlobalSearchBox();
    }
    
    // 検索フォームを作成
    createSearchForm() {
        if (document.getElementById('global-search-form')) return;
        
        const searchForm = document.createElement('form');
        searchForm.id = 'global-search-form';
        searchForm.className = 'global-search-form';
        searchForm.innerHTML = `
            <div class="search-container">
                <input type="search" id="global-search" placeholder="Buscar productos, artículos..." autocomplete="off">
                <button type="submit" class="search-btn">
                    <span class="search-icon">🔍</span>
                </button>
                <div class="search-suggestions" id="search-suggestions"></div>
            </div>
        `;
        
        // ヘッダーに追加
        const header = document.querySelector('header nav');
        if (header) {
            header.appendChild(searchForm);
        }
        
        // イベントリスナーを追加
        this.enhanceSearchInput(searchForm.querySelector('#global-search'));
        
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchForm.querySelector('#global-search').value.trim();
            if (query) {
                this.performSearch(query);
            }
        });
    }
    
    // グローバル検索ボックスを追加
    addGlobalSearchBox() {
        // ページ上部に固定検索ボックスのスタイルを追加
        if (!document.getElementById('global-search-styles')) {
            const style = document.createElement('style');
            style.id = 'global-search-styles';
            style.textContent = `
                .global-search-form {
                    position: relative;
                    margin-left: 20px;
                }
                
                .search-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                #global-search {
                    width: 250px;
                    padding: 8px 40px 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 20px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    background-color: rgba(255, 255, 255, 0.9);
                }
                
                #global-search:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
                    width: 300px;
                }
                
                .search-btn {
                    position: absolute;
                    right: 5px;
                    background: none;
                    border: none;
                    padding: 5px;
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .search-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-top: none;
                    border-radius: 0 0 10px 10px;
                    max-height: 400px;
                    overflow-y: auto;
                    z-index: 1000;
                    display: none;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }
                
                .search-suggestions.show {
                    display: block;
                }
                
                .suggestion-item {
                    padding: 12px 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    align-items: center;
                    transition: background-color 0.2s;
                }
                
                .suggestion-item:hover,
                .suggestion-item.selected {
                    background-color: #f8f9fa;
                }
                
                .suggestion-icon {
                    margin-right: 10px;
                    opacity: 0.6;
                }
                
                .suggestion-text {
                    flex: 1;
                }
                
                .suggestion-text strong {
                    color: var(--primary-color);
                }
                
                .suggestion-type {
                    font-size: 12px;
                    color: #666;
                    margin-left: 10px;
                }
                
                .search-section {
                    padding: 10px 15px;
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #666;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                
                @media (max-width: 768px) {
                    .global-search-form {
                        margin-left: 0;
                        margin-top: 10px;
                        width: 100%;
                    }
                    
                    #global-search {
                        width: 100%;
                    }
                    
                    #global-search:focus {
                        width: 100%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 検索入力フィールドを強化
    enhanceSearchInput(input) {
        if (!input || input.hasAttribute('data-enhanced')) return;
        
        input.setAttribute('data-enhanced', 'true');
        
        // サジェスト用のコンテナを作成
        let suggestionsContainer = input.nextElementSibling;
        if (!suggestionsContainer || !suggestionsContainer.classList.contains('search-suggestions')) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            input.parentNode.insertBefore(suggestionsContainer, input.nextSibling);
        }
        
        // イベントリスナーを追加
        input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.handleSearchInput(e.target, suggestionsContainer);
            }, 300);
        });
        
        input.addEventListener('focus', (e) => {
            this.showSearchSuggestions(e.target, suggestionsContainer);
        });
        
        input.addEventListener('blur', () => {
            // 遅延してサジェストを非表示（クリックイベントを処理するため）
            setTimeout(() => {
                this.hideSearchSuggestions(suggestionsContainer);
            }, 200);
        });
        
        input.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e, suggestionsContainer);
        });
    }
    
    // 検索入力を処理
    handleSearchInput(input, suggestionsContainer) {
        const query = input.value.trim();
        
        if (query.length >= this.searchConfig.minQueryLength) {
            const suggestions = this.generateSuggestions(query);
            this.displaySuggestions(suggestions, suggestionsContainer, query);
        } else {
            this.showDefaultSuggestions(suggestionsContainer);
        }
    }
    
    // サジェストを生成
    generateSuggestions(query) {
        const normalizedQuery = this.normalizeText(query);
        const results = [];
        
        // 検索データから候補を検索
        this.searchData.forEach(item => {
            const score = this.calculateRelevanceScore(item, normalizedQuery);
            if (score > 0) {
                results.push({ ...item, score });
            }
        });
        
        // スコア順にソート
        results.sort((a, b) => b.score - a.score);
        
        // 上位結果を返す
        return results.slice(0, 8);
    }
    
    // 関連性スコアを計算
    calculateRelevanceScore(item, query) {
        let score = 0;
        const searchText = this.normalizeText(item.searchText);
        
        // 完全一致
        if (searchText.includes(query)) {
            score += 10;
        }
        
        // 部分一致
        const words = query.split(' ');
        words.forEach(word => {
            if (searchText.includes(word)) {
                score += 3;
            }
        });
        
        // タイプ別重み付け
        if (item.type === 'product') {
            if (this.normalizeText(item.name).includes(query)) {
                score += 5 * this.searchConfig.nameWeight;
            }
            if (this.normalizeText(item.category).includes(query)) {
                score += 3 * this.searchConfig.categoryWeight;
            }
        }
        
        // ファジー検索
        if (this.searchConfig.fuzzySearch) {
            score += this.fuzzyMatch(query, searchText) * 2;
        }
        
        return score;
    }
    
    // テキストを正規化
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n');
    }
    
    // ファジーマッチング
    fuzzyMatch(pattern, text) {
        const patternLength = pattern.length;
        const textLength = text.length;
        
        if (patternLength === 0) return textLength === 0 ? 1 : 0;
        if (textLength === 0) return 0;
        
        let matches = 0;
        let patternIndex = 0;
        
        for (let i = 0; i < textLength && patternIndex < patternLength; i++) {
            if (text[i] === pattern[patternIndex]) {
                matches++;
                patternIndex++;
            }
        }
        
        return matches / patternLength;
    }
    
    // サジェストを表示
    displaySuggestions(suggestions, container, query) {
        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="suggestion-item">
                    <span class="suggestion-icon">❌</span>
                    <span class="suggestion-text">No se encontraron resultados para "${query}"</span>
                </div>
            `;
        } else {
            const groupedSuggestions = this.groupSuggestionsByType(suggestions);
            container.innerHTML = this.renderGroupedSuggestions(groupedSuggestions, query);
        }
        
        container.classList.add('show');
        this.addSuggestionClickHandlers(container);
    }
    
    // デフォルトサジェストを表示
    showDefaultSuggestions(container) {
        const sections = [];
        
        // 人気検索
        if (this.popularSearches.length > 0) {
            sections.push({
                title: 'Búsquedas Populares',
                items: this.popularSearches.slice(0, 4).map(search => ({
                    text: search,
                    icon: '🔥',
                    type: 'popular'
                }))
            });
        }
        
        // 検索履歴
        if (this.searchHistory.length > 0) {
            sections.push({
                title: 'Búsquedas Recientes',
                items: this.searchHistory.slice(0, 4).map(search => ({
                    text: search,
                    icon: '🕒',
                    type: 'history'
                }))
            });
        }
        
        container.innerHTML = this.renderSuggestionSections(sections);
        container.classList.add('show');
        this.addSuggestionClickHandlers(container);
    }
    
    // タイプ別にサジェストをグループ化
    groupSuggestionsByType(suggestions) {
        const groups = {
            product: [],
            post: [],
            category: []
        };
        
        suggestions.forEach(item => {
            if (groups[item.type]) {
                groups[item.type].push(item);
            }
        });
        
        return groups;
    }
    
    // グループ化されたサジェストをレンダリング
    renderGroupedSuggestions(groups, query) {
        let html = '';
        
        if (groups.product.length > 0) {
            html += '<div class="search-section">Productos</div>';
            groups.product.slice(0, 3).forEach(item => {
                html += this.renderSuggestionItem(item, '🛍️', 'producto', query);
            });
        }
        
        if (groups.post.length > 0) {
            html += '<div class="search-section">Artículos</div>';
            groups.post.slice(0, 2).forEach(item => {
                html += this.renderSuggestionItem(item, '📝', 'artículo', query);
            });
        }
        
        if (groups.category.length > 0) {
            html += '<div class="search-section">Categorías</div>';
            groups.category.slice(0, 2).forEach(item => {
                html += this.renderSuggestionItem(item, '📂', 'categoría', query);
            });
        }
        
        return html;
    }
    
    // サジェストアイテムをレンダリング
    renderSuggestionItem(item, icon, type, query = '') {
        const title = item.title || item.name;
        const highlightedTitle = query ? this.highlightText(title, query) : title;
        
        return `
            <div class="suggestion-item" data-url="${item.url}" data-query="${title}">
                <span class="suggestion-icon">${icon}</span>
                <span class="suggestion-text">${highlightedTitle}</span>
                <span class="suggestion-type">${type}</span>
            </div>
        `;
    }
    
    // セクション形式でサジェストをレンダリング
    renderSuggestionSections(sections) {
        let html = '';
        
        sections.forEach(section => {
            html += `<div class="search-section">${section.title}</div>`;
            section.items.forEach(item => {
                html += `
                    <div class="suggestion-item" data-query="${item.text}">
                        <span class="suggestion-icon">${item.icon}</span>
                        <span class="suggestion-text">${item.text}</span>
                    </div>
                `;
            });
        });
        
        return html;
    }
    
    // テキストをハイライト
    highlightText(text, query) {
        if (!query || !this.searchConfig.highlightResults) return text;
        
        const normalizedQuery = this.normalizeText(query);
        const normalizedText = this.normalizeText(text);
        const index = normalizedText.indexOf(normalizedQuery);
        
        if (index >= 0) {
            const before = text.substring(0, index);
            const match = text.substring(index, index + query.length);
            const after = text.substring(index + query.length);
            return `${before}<strong>${match}</strong>${after}`;
        }
        
        return text;
    }
    
    // サジェストクリックハンドラーを追加
    addSuggestionClickHandlers(container) {
        const items = container.querySelectorAll('.suggestion-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                const url = item.getAttribute('data-url');
                const query = item.getAttribute('data-query');
                
                if (url) {
                    // URLがある場合は直接移動
                    window.location.href = url;
                } else if (query) {
                    // クエリがある場合は検索を実行
                    this.performSearch(query);
                }
                
                this.hideSearchSuggestions(container);
            });
        });
    }
    
    // キーボードナビゲーションを処理
    handleKeyNavigation(event, container) {
        const items = container.querySelectorAll('.suggestion-item');
        const currentSelected = container.querySelector('.suggestion-item.selected');
        let selectedIndex = -1;
        
        if (currentSelected) {
            selectedIndex = Array.from(items).indexOf(currentSelected);
        }
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                this.updateSelection(items, selectedIndex);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                this.updateSelection(items, selectedIndex);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (currentSelected) {
                    currentSelected.click();
                } else {
                    const query = event.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                }
                break;
                
            case 'Escape':
                this.hideSearchSuggestions(container);
                event.target.blur();
                break;
        }
    }
    
    // 選択を更新
    updateSelection(items, selectedIndex) {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }
    
    // サジェストを表示
    showSearchSuggestions(input, container) {
        const query = input.value.trim();
        
        if (query.length >= this.searchConfig.minQueryLength) {
            this.handleSearchInput(input, container);
        } else {
            this.showDefaultSuggestions(container);
        }
    }
    
    // サジェストを非表示
    hideSearchSuggestions(container) {
        container.classList.remove('show');
    }
    
    // 検索を実行
    performSearch(query) {
        this.addToHistory(query);
        
        // 検索結果ページに移動
        const searchUrl = `products/index.html?search=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
        
        // Google Analyticsイベント（実際のサイトで使用）
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search', {
                'search_term': query
            });
        }
    }
    
    // キーボードショートカットをセットアップ
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K で検索フォーカス
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('#global-search, input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
        });
    }
}

// ページロード時に検索エンジンを初期化
document.addEventListener('DOMContentLoaded', function() {
    window.searchEngine = new SearchEngine();
});

// エクスポート
window.SearchEngine = SearchEngine;