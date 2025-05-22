// 共通ユーティリティ関数

/**
 * データをフェッチする汎用関数
 * @param {string} url - データを取得するURL
 * @returns {Promise<Object>} - 取得したデータのPromise
 */
async function fetchData(url) {
    try {
        console.log(`Fetching data from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Data fetched successfully from: ${url}`);
        
        // ローカルストレージにキャッシュ
        try {
            localStorage.setItem(`cache_${url}`, JSON.stringify({
                timestamp: new Date().getTime(),
                data: data
            }));
        } catch (e) {
            console.warn('Could not cache data in localStorage:', e);
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        
        // エラー時にキャッシュからデータを取得を試みる
        try {
            const cachedData = localStorage.getItem(`cache_${url}`);
            if (cachedData) {
                const parsedCache = JSON.parse(cachedData);
                console.log(`Returning cached data for ${url}`);
                return parsedCache.data;
            }
        } catch (e) {
            console.error('Could not retrieve cached data:', e);
        }
        
        throw error;
    }
}

/**
 * データをフィルタリングする関数
 * @param {Array} items - フィルタリングするアイテムの配列
 * @param {Object} filters - フィルタリング条件 {キー: 値}
 * @returns {Array} - フィルタリングされたアイテムの配列
 */
function filterItems(items, filters = {}) {
    console.log('Filtering items with filters:', filters);
    
    return items.filter(item => {
        // すべてのフィルター条件に一致するかチェック
        return Object.entries(filters).every(([key, value]) => {
            // フィルター値が空または未定義の場合はフィルタリングしない
            if (value === '' || value === undefined || value === null || value === 'all') {
                return true;
            }
            
            // 検索フィルター（文字列に部分一致するか）
            if (key === 'search' && typeof value === 'string') {
                const searchFields = ['name', 'title', 'description', 'excerpt', 'content'];
                return searchFields.some(field => {
                    return item[field] && item[field].toLowerCase().includes(value.toLowerCase());
                });
            }
            
            // カテゴリフィルター
            if (key === 'category') {
                return item.category === value;
            }
            
            // その他の完全一致フィルター
            return item[key] === value;
        });
    });
}

/**
 * データをソートする関数
 * @param {Array} items - ソートするアイテムの配列
 * @param {string} sortBy - ソート基準となるプロパティ名
 * @param {string} sortOrder - ソート順（'asc' または 'desc'）
 * @returns {Array} - ソートされたアイテムの配列
 */
function sortItems(items, sortBy = 'id', sortOrder = 'asc') {
    console.log(`Sorting items by ${sortBy} in ${sortOrder} order`);
    
    const sortedItems = [...items].sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];
        
        // 日付文字列の場合は日付オブジェクトに変換
        if (sortBy === 'date' && typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = new Date(valueA).getTime();
            valueB = new Date(valueB).getTime();
        }
        
        // 数値型に変換可能な場合は数値として比較
        if (!isNaN(Number(valueA)) && !isNaN(Number(valueB))) {
            valueA = Number(valueA);
            valueB = Number(valueB);
        }
        
        // 文字列の場合は大文字小文字を区別せず比較
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (valueA < valueB) {
            return sortOrder === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    return sortedItems;
}

/**
 * データをページネーションする関数
 * @param {Array} items - ページネーションするアイテムの配列
 * @param {number} pageSize - 1ページあたりのアイテム数
 * @param {number} currentPage - 現在のページ番号（1始まり）
 * @returns {Array} - 現在のページのアイテム
 */
function paginateItems(items, pageSize = 10, currentPage = 1) {
    console.log(`Paginating items: page ${currentPage}, size ${pageSize}`);
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return items.slice(startIndex, endIndex);
}

/**
 * パラメータからURLクエリパラメータを取得する関数
 * @param {string} param - 取得するパラメータ名
 * @returns {string|null} - パラメータの値
 */
function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * 数値を通貨形式にフォーマットする関数
 * @param {number} amount - フォーマットする金額
 * @param {string} currencyCode - 通貨コード（デフォルト: 'MXN'）
 * @returns {string} - フォーマットされた金額
 */
function formatCurrency(amount, currencyCode = 'MXN') {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currencyCode
    }).format(amount);
}

/**
 * 日付文字列をローカライズされた形式にフォーマットする関数
 * @param {string} dateString - フォーマットする日付文字列
 * @param {string} locale - ロケール（デフォルト: 'es-MX'）
 * @returns {string} - フォーマットされた日付
 */
function formatDate(dateString, locale = 'es-MX') {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * 文字列を指定した長さに切り詰める関数
 * @param {string} text - 切り詰める文字列
 * @param {number} maxLength - 最大長
 * @returns {string} - 切り詰められた文字列
 */
function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

/**
 * ローカルストレージにデータを保存する関数
 * @param {string} key - キー
 * @param {*} value - 保存する値
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * ローカルストレージからデータを取得する関数
 * @param {string} key - キー
 * @param {*} defaultValue - デフォルト値
 * @returns {*} - 取得した値
 */
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return defaultValue;
    }
}

/**
 * 画像をプリロードする関数
 * @param {string} src - プリロードする画像のURL
 * @returns {Promise<HTMLImageElement>} - プリロードされた画像のPromise
 */
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

/**
 * 複数の画像を並行してプリロードする関数
 * @param {Array<string>} sources - プリロードする画像のURL配列
 * @returns {Promise<Array<HTMLImageElement|null>>} - プリロードされた画像の配列
 */
function preloadImages(sources) {
    console.log(`Preloading ${sources.length} images`);
    return Promise.all(sources.map(src => {
        return preloadImage(src).catch(error => {
            console.warn(error.message);
            return null; // エラー時はnullを返して処理を続行
        });
    }));
}

/**
 * 指定された要素内の画像を遅延読み込みするよう設定する関数
 * @param {Element} container - 画像を含むコンテナ要素（デフォルト: document）
 */
function setupLazyLoading(container = document) {
    console.log('Setting up lazy loading for images');
    const lazyImages = container.querySelectorAll('img[loading="lazy"], img[data-src]');
    
    // IntersectionObserverが利用可能な場合
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    
                    // data-srcがある場合はそれをsrcに設定
                    if (lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.removeAttribute('data-src');
                    }
                    
                    // data-srcsetがある場合はそれをsrcsetに設定
                    if (lazyImage.dataset.srcset) {
                        lazyImage.srcset = lazyImage.dataset.srcset;
                        lazyImage.removeAttribute('data-srcset');
                    }
                    
                    lazyImage.classList.add('loaded');
                    imageObserver.unobserve(lazyImage);
                }
            });
        });
        
        lazyImages.forEach(image => {
            // src属性がなくdata-srcがある場合はプレースホルダーを設定
            if ((!image.src || image.src === '') && image.dataset.src) {
                image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // 透明な1x1 GIF
            }
            imageObserver.observe(image);
        });
    } else {
        // IntersectionObserverが利用できない場合のフォールバック
        lazyImages.forEach(image => {
            if (image.dataset.src) {
                image.src = image.dataset.src;
                image.removeAttribute('data-src');
            }
            if (image.dataset.srcset) {
                image.srcset = image.dataset.srcset;
                image.removeAttribute('data-srcset');
            }
        });
    }
}

/**
 * 画像のエラーハンドリング
 * @param {Element} container - 画像を含むコンテナ要素（デフォルト: document）
 * @param {string} fallbackSrc - エラー時のフォールバック画像URL
 */
function handleImageErrors(container = document, fallbackSrc = 'assets/images/ui/placeholder.jpg') {
    console.log('Setting up image error handling');
    const images = container.querySelectorAll('img');
    
    images.forEach(img => {
        // すでにエラーハンドラーが設定されていない場合のみ追加
        if (!img.hasAttribute('data-error-handled')) {
            img.setAttribute('data-error-handled', 'true');
            
            img.addEventListener('error', function() {
                console.warn(`Image failed to load: ${this.src}`);
                if (fallbackSrc && this.src !== fallbackSrc) {
                    this.src = fallbackSrc;
                    this.classList.add('img-fallback');
                }
            });
        }
    });
}

/**
 * パフォーマンスを測定する関数
 * @param {string} label - 測定ラベル
 * @param {Function} fn - 測定する関数
 * @param {Array} args - 関数に渡す引数
 * @returns {*} - 関数の戻り値
 */
function measurePerformance(label, fn, ...args) {
    console.time(label);
    const result = fn(...args);
    console.timeEnd(label);
    return result;
}

/**
 * 非同期関数のパフォーマンスを測定する関数
 * @param {string} label - 測定ラベル
 * @param {Function} asyncFn - 測定する非同期関数
 * @param {Array} args - 関数に渡す引数
 * @returns {Promise<*>} - 関数の戻り値のPromise
 */
async function measureAsyncPerformance(label, asyncFn, ...args) {
    console.time(label);
    try {
        const result = await asyncFn(...args);
        console.timeEnd(label);
        return result;
    } catch (error) {
        console.timeEnd(label);
        throw error;
    }
}

/**
 * 要素の表示/非表示を切り替える関数
 * @param {Element|string} element - 対象の要素またはセレクタ
 * @param {boolean} isVisible - 表示するかどうか
 */
function toggleElementVisibility(element, isVisible) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (el) {
        el.style.display = isVisible ? '' : 'none';
    }
}

/**
 * コールバック関数をデバウンスする関数
 * @param {Function} func - デバウンスする関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} - デバウンスされた関数
 */
function debounce(func, wait = 300) {
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

/**
 * コンソールログを拡張する関数（開発モードでのみ出力）
 * @param {string} message - ログメッセージ
 * @param {any} data - 追加データ
 */
function log(message, data = '') {
    const isDevMode = localStorage.getItem('dev_mode') === 'true';
    if (isDevMode) {
        console.log(`[DEV] ${message}`, data);
    }
}

// グローバルに公開
window.utils = {
    fetchData,
    filterItems,
    sortItems,
    paginateItems,
    getUrlParam,
    formatCurrency,
    formatDate,
    truncateText,
    saveToLocalStorage,
    getFromLocalStorage,
    preloadImage,
    preloadImages,
    setupLazyLoading,
    handleImageErrors,
    measurePerformance,
    measureAsyncPerformance,
    toggleElementVisibility,
    debounce,
    log
};

// DOMロード時に実行
document.addEventListener('DOMContentLoaded', () => {
    // 画像の遅延読み込みをセットアップ
    window.utils.setupLazyLoading();
    
    // 画像のエラーハンドリングをセットアップ
    window.utils.handleImageErrors();
    
    // パフォーマンス計測のための開発モード設定
    if (window.location.search.includes('dev=true')) {
        window.utils.saveToLocalStorage('dev_mode', true);
        window.utils.log('Development mode enabled');
    }
});