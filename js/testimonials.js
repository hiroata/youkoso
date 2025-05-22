// お客様の声表示用JavaScript

// お客様の声データ（共有データから取得）
let testimonialsData = [];

// アバターのデフォルトパス
const DEFAULT_AVATAR = 'assets/images/ui/default-avatar.png';

// ページング関連の変数
let currentPage = 1;
const itemsPerPage = 3; // 1ページあたりの表示件数

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded in testimonials.js');
    
    // アバター画像の存在チェックとエラーハンドリング
    createDefaultAvatar();
    
    // お客様の声データを読み込む
    await loadTestimonialsData();
    
    // インデックスページ用のスライダー表示
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (testimonialSlider) {
        loadTestimonialSlider();
    }
    
    // お客様の声ページ用の表示
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (testimonialsContainer && window.location.pathname.includes('testimonials.html')) {
        loadAllTestimonials();
    }
    
    // フォームの送信イベントを設定
    setupTestimonialForm();
});

// デフォルトアバター画像がない場合の対応
function createDefaultAvatar() {
    // 画像の読み込みエラー時の処理を設定
    document.addEventListener('error', function(e) {
        const target = e.target;
        if (target.tagName.toLowerCase() === 'img') {
            console.log('Image error, replacing with default:', target.src);
            // アバター画像のエラー時、デフォルト画像に差し替え
            if (target.src.includes('avatar')) {
                target.src = DEFAULT_AVATAR;
            }
        }
    }, true);
}

// お客様の声スライダーを表示する関数
function loadTestimonialSlider() {
    const slider = document.getElementById('testimonial-slider');
    if (!slider || testimonialsData.length === 0) return;
    
    // スライダーをクリア
    slider.innerHTML = '';
    
    // 表示するお客様の声（最大3件）
    const testimonialsToShow = testimonialsData.slice(0, 3);
    
    // スライダーにお客様の声を追加
    testimonialsToShow.forEach(testimonial => {
        const slide = createTestimonialSlide(testimonial);
        slider.appendChild(slide);
    });
    
    // 基本的なスライダー機能を設定
    setupSimpleSlider(slider);
}

// すべてのお客様の声を表示する関数（ページング対応）
function loadAllTestimonials() {
    const container = document.getElementById('testimonials-container');
    if (!container || testimonialsData.length === 0) return;
    
    // コンテナをクリア
    container.innerHTML = '';
    
    // 現在のページに表示するお客様の声を計算
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, testimonialsData.length);
    const testimonialsToShow = testimonialsData.slice(startIndex, endIndex);
    
    // お客様の声を表示
    testimonialsToShow.forEach(testimonial => {
        const card = createTestimonialCard(testimonial);
        container.appendChild(card);
    });

    // ページング要素の追加
    addPagination(container);
}

// ページングボタンの追加
function addPagination(container) {
    // 既存のページングボタンを削除
    const existingPagination = document.getElementById('testimonials-pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    // 総ページ数を計算
    const totalPages = Math.ceil(testimonialsData.length / itemsPerPage);
    
    // 最終ページの場合は「もっと見る」ボタンを表示しない
    if (currentPage >= totalPages) return;
    
    // ページングコンテナを作成
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'testimonials-pagination';
    paginationContainer.className = 'testimonials-pagination';
    
    // 「反復処理を続行しますか？」メッセージ
    const paginationMessage = document.createElement('p');
    paginationMessage.className = 'pagination-message';
    
    const esText = document.createElement('span');
    esText.className = 'es-text';
    esText.textContent = '¿Deseas continuar viendo más testimonios?';
    
    const jaText = document.createElement('span');
    jaText.className = 'ja-text';
    jaText.textContent = '反復処理を続行しますか？';
    
    paginationMessage.appendChild(esText);
    paginationMessage.appendChild(jaText);
    paginationContainer.appendChild(paginationMessage);
    
    // ボタングループ
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'pagination-buttons';
    
    // はいボタン
    const yesButton = document.createElement('button');
    yesButton.className = 'btn btn-primary';
    
    const yesEsText = document.createElement('span');
    yesEsText.className = 'es-text';
    yesEsText.textContent = 'Sí, mostrar más';
    
    const yesJaText = document.createElement('span');
    yesJaText.className = 'ja-text';
    yesJaText.textContent = 'はい、続ける';
    
    yesButton.appendChild(yesEsText);
    yesButton.appendChild(yesJaText);
    yesButton.addEventListener('click', () => {
        currentPage++;
        loadAllTestimonials();
        // ページの一番下にスクロール
        window.scrollTo(0, document.body.scrollHeight);
    });
    
    // いいえボタン
    const noButton = document.createElement('button');
    noButton.className = 'btn btn-secondary';
    
    const noEsText = document.createElement('span');
    noEsText.className = 'es-text';
    noEsText.textContent = 'No, gracias';
    
    const noJaText = document.createElement('span');
    noJaText.className = 'ja-text';
    noJaText.textContent = 'いいえ、結構です';
    
    noButton.appendChild(noEsText);
    noButton.appendChild(noJaText);
    noButton.addEventListener('click', () => {
        // お客様の声フォームまでスクロール
        const reviewForm = document.querySelector('.review-form');
        if (reviewForm) {
            reviewForm.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    buttonGroup.appendChild(yesButton);
    buttonGroup.appendChild(noButton);
    paginationContainer.appendChild(buttonGroup);
    
    container.appendChild(paginationContainer);
}

// お客様の声スライド要素を作成する関数
function createTestimonialSlide(testimonial) {
    const slide = document.createElement('div');
    slide.className = 'testimonial-slide';
    
    // 日本語コメントかどうかを判断
    const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(testimonial.comment);
    
    // 翻訳されたコメント
    let translatedComment = '';
    if (isJapanese) {
        translatedComment = translateTestimonial(testimonial.comment, 'ja-to-es');
    } else {
        translatedComment = translateTestimonial(testimonial.comment, 'es-to-ja');
    }
    
    // アバター画像のパスを設定（なければデフォルト）
    const avatarPath = testimonial.avatar || DEFAULT_AVATAR;
    
    slide.innerHTML = `
        <div class="testimonial-content">
            <div class="quote-icon">"</div>
            <blockquote>
                <p class="${isJapanese ? 'ja-text' : 'es-text'}">${testimonial.comment}</p>
                <p class="${isJapanese ? 'es-text' : 'ja-text'}">${translatedComment}</p>
            </blockquote>
            <div class="testimonial-author">
                <div class="avatar">
                    <img src="${avatarPath}" alt="${testimonial.name}" onerror="this.src='${DEFAULT_AVATAR}'">
                </div>
                <div class="author-info">
                    <strong>${testimonial.name}</strong>
                    <span>${testimonial.location}</span>
                </div>
            </div>
        </div>
    `;
    
    return slide;
}

// お客様の声カード要素を作成する関数
function createTestimonialCard(testimonial) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    // 日本語コメントかどうかを判断
    const isJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(testimonial.comment);
    
    // 翻訳されたコメント
    let translatedComment = '';
    if (isJapanese) {
        translatedComment = translateTestimonial(testimonial.comment, 'ja-to-es');
    } else {
        translatedComment = translateTestimonial(testimonial.comment, 'es-to-ja');
    }
    
    // アバター画像のパスを設定（なければデフォルト）
    const avatarPath = testimonial.avatar || DEFAULT_AVATAR;
    
    card.innerHTML = `
        <div class="testimonial-content">
            <div class="quote-icon">"</div>
            <blockquote>
                <p class="${isJapanese ? 'ja-text' : 'es-text'}">${testimonial.comment}</p>
                <p class="${isJapanese ? 'es-text' : 'ja-text'}">${translatedComment}</p>
            </blockquote>
            <div class="testimonial-author">
                <div class="avatar">
                    <img src="${avatarPath}" alt="${testimonial.name}" onerror="this.src='${DEFAULT_AVATAR}'">
                </div>
                <div class="author-info">
                    <strong>${testimonial.name}</strong>
                    <span>${testimonial.location}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// 簡易スライダー機能
function setupSimpleSlider(sliderElement) {
    // スライダーのセットアップコード
    // 現在はシンプルに表示するだけ
    console.log('Slider setup completed');
}

// お客様の声フォームの送信イベント設定
function setupTestimonialForm() {
    const form = document.getElementById('testimonial-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // フォームデータを取得
        const name = document.getElementById('name').value;
        const location = document.getElementById('location').value;
        const comment = document.getElementById('comment').value;
        
        // 実際のアプリケーションではここでAPIにデータを送信
        alert('感謝します！レビューが送信されました。（デモのため、実際には保存されません）');
        
        // フォームをリセット
        form.reset();
    });
}

// お客様の声の翻訳
function translateTestimonial(text, direction) {
    // 実際のアプリケーションでは翻訳APIを使用
    // このデモでは簡易的な翻訳マッピングを使用
    
    const translations = {
        'ja-to-es': {
            'スペインで日本の商品を見つけるのは難しいですが、このお店のおかげで懐かしい日本の味を楽しむことができました。梅干しと緑茶が特に気に入っています。迅速な配送にも感謝します！': 
            'Es difícil encontrar productos japoneses en España, pero gracias a esta tienda he podido disfrutar de los nostálgicos sabores japoneses. Me encantan especialmente las ciruelas encurtidas y el té verde. ¡Gracias también por la rápida entrega!',
            
            'モンチッチのぬいぐるみを購入しました。子供の頃に持っていたものと同じで、懐かしい気持ちになりました。スペインにいながら日本の商品が簡単に手に入るのは本当にありがたいです。': 
            'Compré un peluche Monchhichi. Es igual al que tenía cuando era niño y me trae recuerdos nostálgicos. Es realmente maravilloso poder obtener productos japoneses fácilmente mientras estoy en España.',
            
            '日本食材が豊富に揃っているのでとても助かっています。特に調味料は本当に日本のものと変わらない味で、スペインでも本格的な日本料理を作ることができます。これからも利用させていただきます。': 
            'Me ayuda mucho que haya una gran variedad de ingredientes japoneses. Especialmente los condimentos tienen un sabor idéntico a los japoneses, y puedo hacer auténtica cocina japonesa en España. Seguiré utilizando esta tienda.'
        },
        'es-to-ja': {
            '¡Los peluches Labubu son increíbles! Mi hija está encantada con ellos. La calidad es excelente y el envío fue muy rápido. Definitivamente volveré a comprar en Hola Japón.': 
            'ラブブのぬいぐるみは素晴らしいです！娘はとても喜んでいます。品質は素晴らしく、配送も非常に早かったです。間違いなくまたオラ・ハポンで購入します。',
            
            'He comprado varios mangas y figuras de anime. Los precios son muy competitivos y la atención al cliente es excelente. Siempre responden rápido a mis dudas y los productos llegan bien empaquetados.': 
            'いくつかの漫画とアニメフィギュアを購入しました。価格はとても競争力があり、カスタマーサービスも素晴らしいです。質問にはいつも迅速に対応してくれ、商品は丁寧に梱包されています。',
            
            'Los productos de cosmética japonesa son increíbles. He probado varias mascarillas faciales y la diferencia es notable. La información en español sobre cómo usar cada producto fue muy útil.': 
            '日本の化粧品は素晴らしいです。いくつかのフェイスマスクを試しましたが、その違いは明らかです。各製品の使い方についてのスペイン語の情報がとても役立ちました。'
        }
    };
    
    // 翻訳データがある場合は翻訳テキストを返す
    if (translations[direction] && translations[direction][text]) {
        return translations[direction][text];
    }
    
    // 翻訳がない場合は原文を返す
    return text;
}

// お客様の声データを読み込む関数
async function loadTestimonialsData() {
    try {
        // メイン処理でデータが読み込まれているか確認
        if (window.siteData && window.siteData.testimonials && window.siteData.testimonials.length > 0) {
            console.log('Using testimonials from site data');
            testimonialsData = window.siteData.testimonials;
            return testimonialsData;
        }
        
        // メインデータが読み込まれていない場合は待機
        await waitForSiteData();
        
        // データが読み込まれていれば使用
        if (window.siteData && window.siteData.testimonials) {
            testimonialsData = window.siteData.testimonials;
            console.log('Testimonials loaded from site data:', testimonialsData.length);
            return testimonialsData;
        }
        
        // それでもデータがない場合は個別に読み込む
        console.log('Loading testimonials from individual file');
        const dataPath = 'data/testimonials.json';
        
        // 共通ユーティリティ関数を使用してデータを取得
        const data = await window.utils.fetchData(dataPath);
        testimonialsData = data.testimonials;
        console.log('Testimonials loaded from individual file:', testimonialsData.length);
        return testimonialsData;
    } catch (error) {
        console.error('お客様の声データの読み込みに失敗しました:', error);
        return [];
    }
}

// サイトデータが読み込まれるのを待つ関数
function waitForSiteData(timeout = 5000) {
    return new Promise((resolve) => {
        // すでに読み込まれている場合はすぐに解決
        if (window.siteData && window.siteData.testimonials && window.siteData.testimonials.length > 0) {
            return resolve();
        }
        
        let timeWaited = 0;
        const interval = 100;
        
        // 定期的にチェック
        const checkInterval = setInterval(() => {
            timeWaited += interval;
            
            // データが読み込まれたか、タイムアウトに達したかをチェック
            if ((window.siteData && window.siteData.testimonials && window.siteData.testimonials.length > 0) || timeWaited >= timeout) {
                clearInterval(checkInterval);
                resolve();
            }
        }, interval);
    });
}

// すべてのお客様の声をロードする関数
function loadAllTestimonials() {
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (!testimonialsContainer) return;
    
    // コンテナをクリア
    testimonialsContainer.innerHTML = '';
    
    // 評価で並べ替え（高い順）- 共通ユーティリティ関数を使用
    const sortedTestimonials = window.utils.sortItems(testimonialsData, 'rating', 'desc');
    
    // お客様の声カードを追加（components.jsで定義した関数を使用）
    sortedTestimonials.forEach(testimonial => {
        testimonialsContainer.innerHTML += window.createTestimonialCardComponent(testimonial);
    });
    
    // 統計情報を更新
    updateTestimonialStats(sortedTestimonials);
}

// お客様の声の統計情報を更新する関数
function updateTestimonialStats(testimonials) {
    const statsContainer = document.getElementById('testimonial-stats');
    if (!statsContainer) return;
    
    // 総評価数
    const totalRatings = testimonials.length;
    
    // 平均評価
    const averageRating = testimonials.reduce((sum, item) => sum + item.rating, 0) / totalRatings;
    
    // 評価の分布（5段階評価）
    const ratingDistribution = [0, 0, 0, 0, 0];
    testimonials.forEach(item => {
        const ratingIndex = Math.min(Math.max(Math.floor(item.rating) - 1, 0), 4);
        ratingDistribution[ratingIndex]++;
    });
    
    // 評価分布のパーセンテージ
    const ratingPercentages = ratingDistribution.map(count => (count / totalRatings) * 100);
    
    // HTMLを生成
    let statsHTML = `
        <div class="rating-summary">
            <div class="average-rating">
                <span class="rating-number">${averageRating.toFixed(1)}</span>
                <div class="stars">
                    ${generateStars(averageRating)}
                </div>
                <p>${totalRatings} valoraciones</p>
            </div>
            <div class="rating-bars">
    `;
    
    // 評価バーを追加
    for (let i = 5; i >= 1; i--) {
        const percentage = ratingPercentages[i - 1] || 0;
        statsHTML += `
            <div class="rating-bar-row">
                <span>${i} estrellas</span>
                <div class="rating-bar">
                    <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${Math.round(percentage)}%</span>
            </div>
        `;
    }
    
    statsHTML += `
            </div>
        </div>
    `;
    
    // 統計情報を挿入
    statsContainer.innerHTML = statsHTML;
}

// 星評価を生成する関数
function generateStars(rating) {
    let starsHTML = '';
    
    // 整数部分と小数部分を分離
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    // 満星
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    // 半星
    if (halfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // 空星
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return starsHTML;
}

// お客様の声フォームの初期化関数
function initTestimonialForm() {
    const testimonialForm = document.getElementById('testimonial-form');
    if (!testimonialForm) return;
    
    testimonialForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // フォームデータを取得
        const name = document.getElementById('review-name').value;
        const location = document.getElementById('review-location').value;
        const rating = document.querySelector('input[name="rating"]:checked')?.value || 5;
        const content = document.getElementById('review-content').value;
        
        // 入力検証
        if (!name || !content) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }
        
        // 成功メッセージを表示（実際にはサーバーに送信する処理を追加）
        const formContainer = document.querySelector('.testimonial-form .container');
        formContainer.innerHTML = `
            <div class="success-message">
                <h2>¡Gracias por tu comentario!</h2>
                <p>Tu opinión es muy importante para nosotros y nos ayuda a mejorar.</p>
            </div>
        `;
        
        // テスト用にコンソールに表示
        console.log('お客様の声を送信しました:', {
            name,
            location,
            rating: parseInt(rating),
            content
        });
    });
    
    // 星評価のイベントリスナー
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach(input => {
        input.addEventListener('change', function() {
            // 選択された評価に対応する星を強調表示
            const rating = parseInt(this.value);
            updateRatingStars(rating);
        });
    });
}

// 評価星の表示を更新する関数
function updateRatingStars(selectedRating) {
    const ratingStars = document.querySelectorAll('.rating-select label');
    
    ratingStars.forEach((star, index) => {
        if (index < selectedRating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}