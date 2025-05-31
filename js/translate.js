// 翻訳機能用JavaScript - 最適化版

// 言語データ（インメモリでのキャッシュ用）
const translations = {
    es: {},  // スペイン語テキスト（オリジナル）
    ja: {}   // 日本語翻訳
};

// 初期化済みフラグ
let translationInitialized = false;

// 現在の言語
let currentLanguage = 'es';

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded in translate.js');
    
    // 翻訳データをロード
    loadTranslationData();
    
    // 言語切り替えボタンのセットアップ
    setupLanguageToggle();
    
    // ローカルストレージから言語設定を復元
    restoreLanguageSettings();
    
    // 言語切り替えイベントのリスナー
    listenForLanguageChangeEvents();
});

/**
 * 翻訳データをロードする関数
 */
async function loadTranslationData() {
    try {
        // ローカルストレージから翻訳データをチェック
        const cachedTranslations = window.utils ? window.utils.getFromLocalStorage('translations_data') : null;
        
        if (cachedTranslations) {
            console.log('Using cached translation data');
            
            // キャッシュデータをロード
            Object.assign(translations, cachedTranslations);
            translationInitialized = true;
            
            // バックグラウンドでデータ更新
            setTimeout(fetchTranslationData, 3000);
            
            return;
        }
        
        // キャッシュがなければデータを取得
        await fetchTranslationData();
        
    } catch (error) {
        console.error('Failed to load translation data:', error);
        
        // フォールバック翻訳を使用
        setupFallbackTranslations();
    }
}

/**
 * 翻訳データをサーバーから取得
 */
async function fetchTranslationData() {
    try {
        const pathPrefix = getPathPrefix();
        const dataPath = `${pathPrefix}data/translations.json`;
        
        console.log('Fetching translation data from:', dataPath);
        
        try {
            // 翻訳ファイルがあればそれを使用
            const data = await window.utils.fetchData(dataPath);
            Object.assign(translations, data);
        } catch (e) {
            console.warn('Translation file not found, using dynamic translation');
            
            // 翻訳ファイルがなければページから動的に生成
            generateTranslationsFromPage();
        }
        
        translationInitialized = true;
        
        // キャッシュに保存
        if (window.utils) {
            window.utils.saveToLocalStorage('translations_data', translations);
        }
        
        // 現在の言語に適用
        if (currentLanguage !== 'es') {
            applyTranslations(currentLanguage);
        }
        
        console.log('Translation data loaded successfully');
    } catch (error) {
        console.error('Failed to fetch translation data:', error);
        setupFallbackTranslations();
    }
}

/**
 * ページから動的に翻訳データを生成する関数
 */
function generateTranslationsFromPage() {
    // ナビゲーションリンク
    translations.ja['Inicio'] = 'ホーム';
    translations.ja['Productos'] = '商品';
    translations.ja['Blog'] = 'ブログ';
    translations.ja['Testimonios'] = 'レビュー';
    translations.ja['Sobre Nosotros'] = '会社概要';
    translations.ja['Contacto'] = 'お問い合わせ';
    
    // ヘッダー/フッター
    translations.ja['Hola Japón'] = 'オラ・ハポン';
    translations.ja['Tienda de Productos Japoneses en México'] = '日本商品専門店（メキシコ）';
    translations.ja['Traemos lo mejor de la cultura japonesa directamente a México desde 2023.'] = '2023年から日本の文化の最高のものをメキシコへ直接お届けしています。';
    
    // フッター
    translations.ja['Enlaces Rápidos'] = 'クイックリンク';
    translations.ja['Síguenos'] = 'フォローする';
    translations.ja['Todos los derechos reservados.'] = '無断複写・転載を禁じます。';
    
    // メインページ
    translations.ja['Productos Populares'] = '人気商品';
    translations.ja['Productos Destacados'] = '注目商品';
    translations.ja['Ver todos'] = 'すべて見る';
    translations.ja['Categorías'] = 'カテゴリー';
    translations.ja['Nuestro Blog'] = 'ブログ記事';
    translations.ja['Leer más'] = '続きを読む';
    translations.ja['Opiniones de Clientes'] = 'お客様の声';
    
    // 商品ページ
    translations.ja['Filtrar por:'] = '絞り込み:';
    translations.ja['Categoría'] = 'カテゴリー';
    translations.ja['Precio'] = '価格';
    translations.ja['Disponibilidad'] = '在庫状況';
    translations.ja['En stock'] = '在庫あり';
    translations.ja['Agotado'] = '在庫なし';
    translations.ja['Ordenar por:'] = '並び替え:';
    translations.ja['Más reciente'] = '新着順';
    translations.ja['Precio: menor a mayor'] = '価格: 安い順';
    translations.ja['Precio: mayor a menor'] = '価格: 高い順';
    translations.ja['Popularidad'] = '人気順';
    translations.ja['Añadir al carrito'] = 'カートに追加';
    translations.ja['Comprar ahora'] = '今すぐ購入';
    
    // カテゴリー名
    translations.ja['Figuras de Anime'] = 'アニメフィギュア';
    translations.ja['Manga'] = '漫画';
    translations.ja['Peluches'] = 'ぬいぐるみ';
    translations.ja['Videojuegos'] = 'ビデオゲーム';
    translations.ja['Ropa y Accesorios'] = '服・アクセサリー';
    translations.ja['Cartas Coleccionables'] = 'トレーディングカード';
    translations.ja['Comida Japonesa'] = '日本食';
    
    console.log('Generated translations from page');
}

/**
 * フォールバック翻訳を設定
 */
function setupFallbackTranslations() {
    // 基本的な翻訳のみを含む
    translations.ja['Inicio'] = 'ホーム';
    translations.ja['Productos'] = '商品';
    translations.ja['Blog'] = 'ブログ';
    translations.ja['Sobre Nosotros'] = '会社概要';
    translations.ja['Hola Japón'] = 'オラ・ハポン';
    
    translationInitialized = true;
    
    // 現在の言語に適用
    if (currentLanguage !== 'es') {
        applyTranslations(currentLanguage);
    }
    
    console.log('Fallback translations set up');
}

/**
 * 言語切り替えボタンのイベントリスナーを設定
 */
function setupLanguageToggle() {
    const languageBtns = document.querySelectorAll('.lang-btn');
    
    if (languageBtns.length === 0) {
        console.log('Language buttons not found, using the language-switcher');
        const languageSwitcher = document.getElementById('language-switcher');
        
        if (languageSwitcher) {
            languageSwitcher.addEventListener('click', function() {
                const newLang = currentLanguage === 'es' ? 'ja' : 'es';
                switchLanguage(newLang);
            });
        }
        return;
    }
    
    // 通常の言語ボタン
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            console.log('Changing language to:', lang);
            
            // アクティブクラスを更新
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // 言語を切り替え
            switchLanguage(lang);
        });
    });
}

/**
 * 言語切り替えイベントをリッスン
 */
function listenForLanguageChangeEvents() {
    document.addEventListener('languageChanged', function(e) {
        const lang = e.detail.language;
        console.log('Language change event received:', lang);
        
        if (lang !== currentLanguage) {
            switchLanguage(lang);
        }
    });
}

/**
 * 言語を切り替える関数
 */
function switchLanguage(lang) {
    // 現在と同じ言語なら何もしない
    if (lang === currentLanguage) return;
    
    currentLanguage = lang;
    console.log(`Switching to ${lang === 'ja' ? 'Japanese' : 'Spanish'}`);
    
    // ボディクラスを更新
    if (lang === 'ja') {
        document.body.classList.add('ja');
    } else {
        document.body.classList.remove('ja');
    }
    
    // 翻訳を適用
    applyTranslations(lang);
    
    // 設定を保存
    if (window.utils) {
        window.utils.saveToLocalStorage('preferredLanguage', lang);
    } else {
        localStorage.setItem('preferredLanguage', lang);
    }
    
    // ページタイトルも更新
    updatePageTitle(lang);
    
    // ヘッダーとフッターも更新されるよう他コンポーネントに通知
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    document.dispatchEvent(event);
}

/**
 * 翻訳を適用
 */
function applyTranslations(lang) {
    if (!translationInitialized) {
        console.log('Translations not initialized yet, will apply later');
        return;
    }
    
    if (lang === 'es') {
        // スペイン語の場合は元に戻すだけ
        translateElementsToSpanish();
    } else {
        // 日本語の場合は翻訳を適用
        translateElementsToJapanese();
    }
}

/**
 * すべての要素を日本語に翻訳
 */
function translateElementsToJapanese() {
    console.log('Translating elements to Japanese');
    
    // 翻訳マップが空ならページから生成
    if (Object.keys(translations.ja).length === 0) {
        generateTranslationsFromPage();
    }
    
    // すべてのテキストノードをチェック
    translateTextNodes(document.body, 'es', 'ja');
    
    // プレースホルダーテキストを翻訳
    translatePlaceholders('es', 'ja');
    
    // ボタンテキストを翻訳
    translateButtonValues('es', 'ja');
}

/**
 * すべての要素をスペイン語に戻す
 */
function translateElementsToSpanish() {
    console.log('Translating elements back to Spanish');
    
    // データ属性から元のテキストを復元
    const translatedElements = document.querySelectorAll('[data-original-text]');
    translatedElements.forEach(el => {
        el.textContent = el.getAttribute('data-original-text');
        el.removeAttribute('data-original-text');
    });
    
    // プレースホルダーを復元
    const translatedPlaceholders = document.querySelectorAll('[data-original-placeholder]');
    translatedPlaceholders.forEach(el => {
        el.setAttribute('placeholder', el.getAttribute('data-original-placeholder'));
        el.removeAttribute('data-original-placeholder');
    });
    
    // ボタン値を復元
    const translatedButtons = document.querySelectorAll('[data-original-value]');
    translatedButtons.forEach(el => {
        el.value = el.getAttribute('data-original-value');
        el.removeAttribute('data-original-value');
    });
}

/**
 * テキストノードを翻訳
 */
function translateTextNodes(element, fromLang, toLang) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodesToTranslate = [];
    let node;
    
    // 最初にすべてのテキストノードを収集
    while ((node = walker.nextNode())) {
        const text = node.nodeValue.trim();
        if (text && translations[toLang][text]) {
            nodesToTranslate.push(node);
        }
    }
    
    // 次に翻訳を適用
    nodesToTranslate.forEach(node => {
        const originalText = node.nodeValue.trim();
        if (translations[toLang][originalText]) {
            // 親要素にオリジナルテキストを保存
            if (node.parentElement && !node.parentElement.hasAttribute('data-original-text')) {
                node.parentElement.setAttribute('data-original-text', originalText);
            }
            
            // テキストを翻訳
            node.nodeValue = node.nodeValue.replace(originalText, translations[toLang][originalText]);
        }
    });
    
    // 子要素にも適用
    for (let i = 0; i < element.children.length; i++) {
        translateTextNodes(element.children[i], fromLang, toLang);
    }
}

/**
 * プレースホルダーを翻訳
 */
function translatePlaceholders(fromLang, toLang) {
    const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    
    inputElements.forEach(el => {
        const originalPlaceholder = el.getAttribute('placeholder');
        
        if (originalPlaceholder && translations[toLang][originalPlaceholder]) {
            // オリジナルプレースホルダーを保存
            if (!el.hasAttribute('data-original-placeholder')) {
                el.setAttribute('data-original-placeholder', originalPlaceholder);
            }
            
            // プレースホルダーを翻訳
            el.setAttribute('placeholder', translations[toLang][originalPlaceholder]);
        }
    });
}

/**
 * ボタン値を翻訳
 */
function translateButtonValues(fromLang, toLang) {
    const buttons = document.querySelectorAll('input[type="submit"], input[type="button"]');
    
    buttons.forEach(btn => {
        const originalValue = btn.value;
        
        if (originalValue && translations[toLang][originalValue]) {
            // オリジナル値を保存
            if (!btn.hasAttribute('data-original-value')) {
                btn.setAttribute('data-original-value', originalValue);
            }
            
            // 値を翻訳
            btn.value = translations[toLang][originalValue];
        }
    });
}

/**
 * ページタイトルを言語に合わせて更新
 */
function updatePageTitle(lang) {
    let title = document.title;
    
    if (lang === 'ja') {
        // スペイン語のタイトルを日本語に変更
        if (title.includes('Hola Japón')) {
            title = title.replace('Hola Japón', 'オラ・ハポン');
            
            // 一般的なページタイトルの翻訳
            title = title.replace('Tienda de Productos Japoneses en México', '日本商品専門店（メキシコ）');
            title = title.replace('Productos', '商品');
            title = title.replace('Blog', 'ブログ');
            title = title.replace('Sobre Nosotros', '会社概要');
            title = title.replace('Testimonios', 'お客様の声');
        }
    } else {
        // 日本語のタイトルをスペイン語に戻す
        if (title.includes('オラ・ハポン')) {
            title = title.replace('オラ・ハポン', 'Hola Japón');
            
            // 一般的なページタイトルの翻訳を戻す
            title = title.replace('日本商品専門店（メキシコ）', 'Tienda de Productos Japoneses en México');
            title = title.replace('商品', 'Productos');
            title = title.replace('ブログ', 'Blog');
            title = title.replace('会社概要', 'Sobre Nosotros');
            title = title.replace('お客様の声', 'Testimonios');
        }
    }
    
    document.title = title;
}

/**
 * ローカルストレージから言語設定を復元
 */
function restoreLanguageSettings() {
    // ローカルストレージから言語設定を取得
    let savedLang;
    
    if (window.utils) {
        savedLang = window.utils.getFromLocalStorage('preferredLanguage');
    } else {
        savedLang = localStorage.getItem('preferredLanguage');
    }
    
    // 言語設定がない場合はブラウザの言語から判断
    if (!savedLang) {
        const browserLang = navigator.language.toLowerCase();
        savedLang = browserLang.startsWith('ja') ? 'ja' : 'es';
        console.log('Using browser language:', savedLang);
    } else {
        console.log('Restoring saved language:', savedLang);
    }
    
    // ボタンの状態を更新
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 言語を切り替え
    switchLanguage(savedLang);
}

/**
 * カレントディレクトリに基づいてパスのプレフィックスを取得する関数
 */
function getPathPrefix() {
    const path = window.location.pathname;
    if (path.includes('/products/') || path.includes('/blog/')) {
        return '../';
    }
    return '';
}