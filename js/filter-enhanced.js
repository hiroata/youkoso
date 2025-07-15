// 強化されたフィルター機能
class EnhancedFilters {
    constructor() {
        this.activeFilters = new Map();
        this.filterElements = new Map();
        this.init();
    }

    init() {
        this.createFilterBadges();
        this.enhanceFilterUI();
        this.setupEventListeners();
    }

    // アクティブフィルターバッジを作成
    createFilterBadges() {
        const filtersSection = document.querySelector('.filters-section');
        if (!filtersSection) return;

        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'active-filters-container';
        badgeContainer.innerHTML = `
            <div class="active-filters-header">
                <h3 class="active-filters-title">
                    <i class="fas fa-filter"></i>
                    アクティブフィルター
                </h3>
                <button class="clear-all-filters" id="clear-all-filters">
                    <i class="fas fa-times"></i>
                    すべてクリア
                </button>
            </div>
            <div class="active-filters-list" id="active-filters-list"></div>
        `;

        filtersSection.insertBefore(badgeContainer, filtersSection.firstChild);
        this.addFilterBadgeStyles();
    }

    // フィルターバッジのスタイル
    addFilterBadgeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .active-filters-container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: var(--radius-lg);
                padding: 1.5rem;
                margin-bottom: 2rem;
                color: white;
                box-shadow: var(--shadow-lg);
                display: none;
                animation: slideInDown 0.3s ease;
            }
            
            .active-filters-container.visible {
                display: block;
            }
            
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .active-filters-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            
            .active-filters-title {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0;
            }
            
            .clear-all-filters {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                backdrop-filter: blur(10px);
            }
            
            .clear-all-filters:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .active-filters-list {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
            }
            
            .filter-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.9);
                color: var(--primary-color);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
                animation: badgeSlideIn 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.5);
            }
            
            @keyframes badgeSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .filter-badge-remove {
                background: none;
                border: none;
                color: var(--text-light);
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                font-size: 0.75rem;
            }
            
            .filter-badge-remove:hover {
                background: rgba(0, 0, 0, 0.1);
                color: var(--error-color);
            }
            
            /* 強化されたフィルターUI */
            .filter-group {
                position: relative;
                margin-bottom: 1.5rem;
            }
            
            .filter-group.active .filter-label {
                color: var(--accent-color);
                font-weight: 600;
            }
            
            .filter-group.active .filter-control {
                border-color: var(--accent-color);
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }
            
            .filter-control {
                width: 100%;
                padding: 0.75rem 1rem;
                border: 2px solid var(--border-color);
                border-radius: var(--radius);
                font-family: inherit;
                font-size: 1rem;
                transition: all 0.3s ease;
                background: var(--bg-color);
                position: relative;
            }
            
            .filter-control:focus {
                outline: none;
                border-color: var(--accent-color);
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }
            
            .filter-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: var(--text-color);
                transition: all 0.3s ease;
            }
            
            /* カスタムセレクト */
            .custom-select {
                position: relative;
            }
            
            .custom-select select {
                appearance: none;
                background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23666' d='M8 12L3 7h10l-5 5z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 1rem center;
                background-size: 16px;
                padding-right: 3rem;
            }
            
            /* プライスレンジスライダー */
            .price-range-slider {
                margin: 1rem 0;
            }
            
            .price-range-values {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.875rem;
                color: var(--text-light);
            }
            
            .price-range-input {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: var(--bg-subtle);
                outline: none;
                appearance: none;
            }
            
            .price-range-input::-webkit-slider-thumb {
                appearance: none;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--accent-color);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: all 0.2s ease;
            }
            
            .price-range-input::-webkit-slider-thumb:hover {
                background: var(--accent-dark);
                transform: scale(1.1);
            }
            
            .price-range-input::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: var(--accent-color);
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            /* アニメーション効果 */
            .filter-group {
                animation: filterSlideIn 0.3s ease;
            }
            
            @keyframes filterSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* モバイル対応 */
            @media (max-width: 768px) {
                .active-filters-header {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }
                
                .active-filters-title {
                    justify-content: center;
                }
                
                .clear-all-filters {
                    justify-content: center;
                }
                
                .active-filters-list {
                    justify-content: center;
                }
                
                .filter-badge {
                    font-size: 0.8rem;
                    padding: 0.4rem 0.8rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // フィルターUIを強化
    enhanceFilterUI() {
        const filterControls = document.querySelectorAll('select, input[type="range"]');
        
        filterControls.forEach(control => {
            const group = control.closest('.filter-group');
            if (!group) return;

            // セレクトボックスをカスタムスタイルに
            if (control.tagName === 'SELECT') {
                control.parentElement.classList.add('custom-select');
            }

            // レンジスライダーにラベル追加
            if (control.type === 'range') {
                this.enhancePriceRange(control);
            }
        });
    }

    // プライスレンジを強化
    enhancePriceRange(rangeInput) {
        const group = rangeInput.closest('.filter-group');
        if (!group) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'price-range-slider';
        
        const valuesDiv = document.createElement('div');
        valuesDiv.className = 'price-range-values';
        valuesDiv.innerHTML = `
            <span>¥0</span>
            <span id="current-price-value">¥${rangeInput.value}</span>
            <span>¥${rangeInput.max}</span>
        `;
        
        rangeInput.parentNode.insertBefore(wrapper, rangeInput);
        wrapper.appendChild(valuesDiv);
        wrapper.appendChild(rangeInput);
        
        rangeInput.classList.add('price-range-input');
        
        // 値の更新
        rangeInput.addEventListener('input', () => {
            document.getElementById('current-price-value').textContent = `¥${rangeInput.value}`;
        });
    }

    // イベントリスナー設定
    setupEventListeners() {
        // フィルター変更監視
        document.addEventListener('change', (e) => {
            if (e.target.matches('.filter-control')) {
                this.handleFilterChange(e.target);
            }
        });

        // 全クリアボタン
        document.addEventListener('click', (e) => {
            if (e.target.closest('#clear-all-filters')) {
                this.clearAllFilters();
            }
        });

        // バッジ削除
        document.addEventListener('click', (e) => {
            if (e.target.closest('.filter-badge-remove')) {
                const badge = e.target.closest('.filter-badge');
                this.removeFilter(badge.dataset.filterType, badge.dataset.filterValue);
            }
        });
    }

    // フィルター変更処理
    handleFilterChange(element) {
        const filterType = element.name || element.id;
        const filterValue = element.value;
        const filterLabel = this.getFilterLabel(element);

        if (filterValue && filterValue !== '' && filterValue !== '0') {
            this.addActiveFilter(filterType, filterValue, filterLabel);
        } else {
            this.removeActiveFilter(filterType);
        }

        this.updateActiveFiltersDisplay();
        this.updateFilterGroupState(element);
    }

    // フィルターラベル取得
    getFilterLabel(element) {
        const option = element.selectedOptions?.[0];
        if (option) {
            return option.textContent;
        }
        
        if (element.type === 'range') {
            return `¥${element.value}以下`;
        }
        
        return element.value;
    }

    // アクティブフィルター追加
    addActiveFilter(type, value, label) {
        this.activeFilters.set(type, { value, label });
    }

    // アクティブフィルター削除
    removeActiveFilter(type) {
        this.activeFilters.delete(type);
    }

    // アクティブフィルター表示更新
    updateActiveFiltersDisplay() {
        const container = document.querySelector('.active-filters-container');
        const list = document.getElementById('active-filters-list');
        
        if (!container || !list) return;

        if (this.activeFilters.size === 0) {
            container.classList.remove('visible');
            return;
        }

        container.classList.add('visible');
        
        list.innerHTML = Array.from(this.activeFilters.entries()).map(([type, data]) => `
            <div class="filter-badge" data-filter-type="${type}" data-filter-value="${data.value}">
                <span>${data.label}</span>
                <button class="filter-badge-remove" aria-label="フィルターを削除">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // フィルターグループ状態更新
    updateFilterGroupState(element) {
        const group = element.closest('.filter-group');
        if (!group) return;

        if (element.value && element.value !== '' && element.value !== '0') {
            group.classList.add('active');
        } else {
            group.classList.remove('active');
        }
    }

    // 個別フィルター削除
    removeFilter(type, value) {
        this.removeActiveFilter(type);
        
        // 対応するフォーム要素をリセット
        const element = document.querySelector(`[name="${type}"], #${type}`);
        if (element) {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else {
                element.value = element.defaultValue || '';
            }
            
            // change イベントを発火
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        this.updateActiveFiltersDisplay();
        this.updateFilterGroupState(element);
    }

    // 全フィルタークリア
    clearAllFilters() {
        this.activeFilters.clear();
        
        // 全フィルター要素をリセット
        document.querySelectorAll('.filter-control').forEach(element => {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else {
                element.value = element.defaultValue || '';
            }
            
            const group = element.closest('.filter-group');
            if (group) {
                group.classList.remove('active');
            }
        });
        
        this.updateActiveFiltersDisplay();
        
        // フィルタークリアイベントを発火
        document.dispatchEvent(new CustomEvent('filtersCleared'));
        
        // 商品フィルターをリセット
        if (typeof window.resetProductFilters === 'function') {
            window.resetProductFilters();
        }
    }

    // フィルター数取得
    getActiveFilterCount() {
        return this.activeFilters.size;
    }

    // フィルター状態取得
    getActiveFilters() {
        return Object.fromEntries(this.activeFilters);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedFilters = new EnhancedFilters();
});