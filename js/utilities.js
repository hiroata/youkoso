// ユーティリティ関数集
// 共通で使用される便利な関数をまとめたファイル

/**
 * データをフェッチする汎用関数
 * @param {string} url - データを取得するURL
 * @param {Object} options - フェッチオプション
 * @returns {Promise<Object>} - 取得したデータのPromise
 */
async function fetchData(url, options = {}) {
    try {
        console.log(`Fetching data from: ${url}`);
        
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Data fetched successfully from: ${url}`);
        
        // ローカルストレージにキャッシュ（オプション）
        if (options.cache !== false) {
            try {
                localStorage.setItem(`cache_${url}`, JSON.stringify({
                    timestamp: new Date().getTime(),
                    data: data
                }));
            } catch (e) {
                console.warn('Could not cache data in localStorage:', e);
            }
        }
        
        return data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        
        // エラー時にキャッシュからデータを取得を試みる
        if (options.useCache !== false) {
            try {
                const cachedData = localStorage.getItem(`cache_${url}`);
                if (cachedData) {
                    const parsedCache = JSON.parse(cachedData);
                    const ageLimit = options.cacheAgeLimit || 3600000; // 1時間
                    
                    if (new Date().getTime() - parsedCache.timestamp < ageLimit) {
                        console.log(`Returning cached data for ${url}`);
                        return parsedCache.data;
                    }
                }
            } catch (e) {
                console.error('Could not retrieve cached data:', e);
            }
        }
        
        throw error;
    }
}

/**
 * 要素の表示/非表示を切り替える
 * @param {HTMLElement|string} element - 要素またはセレクタ
 * @param {boolean} show - 表示するかどうか
 */
function toggleElement(element, show = null) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    if (show === null) {
        el.style.display = el.style.display === 'none' ? '' : 'none';
    } else {
        el.style.display = show ? '' : 'none';
    }
}

/**
 * 要素をフェードイン/フェードアウト
 * @param {HTMLElement|string} element - 要素またはセレクタ
 * @param {boolean} fadeIn - フェードインするかどうか
 * @param {number} duration - アニメーション時間（ms）
 */
function fadeElement(element, fadeIn = true, duration = 300) {
    const el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return;

    const start = fadeIn ? 0 : 1;
    const end = fadeIn ? 1 : 0;
    const startTime = performance.now();

    el.style.opacity = start;
    el.style.display = fadeIn ? '' : el.style.display;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        el.style.opacity = start + (end - start) * progress;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (!fadeIn) {
            el.style.display = 'none';
        }
    }

    requestAnimationFrame(animate);
}

/**
 * デバウンス関数 - 連続した関数呼び出しを制限
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ms）
 * @returns {Function} - デバウンスされた関数
 */
function debounce(func, wait) {
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
 * スロットル関数 - 関数の実行頻度を制限
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ms）
 * @returns {Function} - スロットルされた関数
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 配列をシャッフル
 * @param {Array} array - シャッフルする配列
 * @returns {Array} - シャッフルされた新しい配列
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 価格を通貨形式でフォーマット
 * @param {number} price - 価格
 * @param {string} currency - 通貨コード
 * @param {string} locale - ロケール
 * @returns {string} - フォーマットされた価格
 */
function formatPrice(price, currency = 'MXN', locale = 'es-MX') {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(price);
}

/**
 * 日付をフォーマット
 * @param {Date|string} date - 日付
 * @param {string} locale - ロケール
 * @param {Object} options - フォーマットオプション
 * @returns {string} - フォーマットされた日付
 */
function formatDate(date, locale = 'es-MX', options = {}) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    
    return dateObj.toLocaleDateString(locale, defaultOptions);
}

/**
 * 文字列を省略
 * @param {string} text - 省略する文字列
 * @param {number} maxLength - 最大長
 * @param {string} suffix - 省略時の接尾辞
 * @returns {string} - 省略された文字列
 */
function truncateText(text, maxLength = 100, suffix = '...') {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 要素がビューポート内にあるかチェック
 * @param {HTMLElement} element - チェックする要素
 * @param {number} offset - オフセット（px）
 * @returns {boolean} - ビューポート内にあるかどうか
 */
function isElementInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= -offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}

/**
 * スムーズスクロール
 * @param {HTMLElement|string} target - スクロール先の要素またはセレクタ
 * @param {Object} options - スクロールオプション
 */
function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        ...options
    };

    element.scrollIntoView(defaultOptions);
}

/**
 * ローカルストレージの安全な操作
 */
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Could not save to localStorage:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Could not read from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Could not remove from localStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Could not clear localStorage:', e);
            return false;
        }
    }
};

/**
 * Cookie操作
 */
const Cookie = {
    set(name, value, days = 30) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    remove(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
};

/**
 * URLパラメータの操作
 */
const URLParams = {
    get(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    set(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    remove(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    },

    getAll() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    }
};

/**
 * フォームデータの処理
 */
const FormUtils = {
    serialize(form) {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData) {
            data[key] = value;
        }
        return data;
    },

    validate(form, rules = {}) {
        const data = this.serialize(form);
        const errors = {};

        Object.keys(rules).forEach(field => {
            const rule = rules[field];
            const value = data[field];

            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = 'Este campo es requerido';
            }

            if (value && rule.minLength && value.length < rule.minLength) {
                errors[field] = `Mínimo ${rule.minLength} caracteres`;
            }

            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `Máximo ${rule.maxLength} caracteres`;
            }

            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || 'Formato inválido';
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
            data
        };
    }
};

// グローバルに公開
window.Utils = {
    fetchData,
    toggleElement,
    fadeElement,
    debounce,
    throttle,
    shuffleArray,
    formatPrice,
    formatDate,
    truncateText,
    isElementInViewport,
    smoothScrollTo,
    Storage,
    Cookie,
    URLParams,
    FormUtils
};