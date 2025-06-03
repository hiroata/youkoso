// ===== IMAGE DOWNLOADER UTILITY =====

class ImageDownloader {
    constructor() {
        this.downloadQueue = [];
        this.isDownloading = false;
        this.maxConcurrentDownloads = 3;
        this.downloadHistory = new Set();
    }

    // 日本のぬいぐるみ画像URLのサンプル（実際の使用時は適切なAPIまたは画像サーバーのURLに変更）
    getPlushieImageUrls() {
        return [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Pokemon plushie
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', // Cute plushie
            'https://images.unsplash.com/photo-1558618666-fbd1092c9986?w=400&h=400&fit=crop', // Kawaii plushie
            'https://images.unsplash.com/photo-1580890180854-733ca3a45735?w=400&h=400&fit=crop', // Animal plushie
            'https://images.unsplash.com/photo-1597048534512-1c28c4af5639?w=400&h=400&fit=crop', // Bear plushie
        ];
    }

    // マンガ全巻セット画像URLのサンプル
    getMangaImageUrls() {
        return [
            'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=400&h=400&fit=crop', // Manga collection
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', // Manga volumes
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop', // Anime books
            'https://images.unsplash.com/photo-1558618666-fbd1092c9986?w=400&h=400&fit=crop', // Japanese comics
            'https://images.unsplash.com/photo-1580890180854-733ca3a45735?w=400&h=400&fit=crop', // Comic collection
        ];
    }

    // 画像をfetchでダウンロード
    async downloadImage(url, filename) {
        try {
            console.log(`画像をダウンロード中: ${filename}`);
            
            // CORSエラーを避けるため、プロキシサーバーを使用することもできます
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            
            // ブラウザでダウンロードを開始
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            console.log(`画像ダウンロード完了: ${filename}`);
            return { success: true, filename, url };

        } catch (error) {
            console.error(`画像ダウンロードエラー (${filename}):`, error);
            return { success: false, filename, url, error: error.message };
        }
    }

    // 複数の画像を順次ダウンロード
    async downloadMultipleImages(urls, prefix = 'image') {
        const results = [];
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const filename = `${prefix}-${i + 1}.jpg`;
            
            const result = await this.downloadImage(url, filename);
            results.push(result);
            
            // ダウンロード間隔を設ける（サーバー負荷軽減）
            if (i < urls.length - 1) {
                await this.delay(1000); // 1秒待機
            }
        }
        
        return results;
    }

    // 商品データに新しい画像を追加
    async updateProductImages(productCategory) {
        let imageUrls = [];
        let prefix = '';
        
        switch (productCategory) {
            case 'plushies':
                imageUrls = this.getPlushieImageUrls();
                prefix = 'plushie';
                break;
            case 'manga':
                imageUrls = this.getMangaImageUrls();
                prefix = 'manga-complete';
                break;
            default:
                console.error('未対応の商品カテゴリ:', productCategory);
                return;
        }

        console.log(`${productCategory}の画像ダウンロードを開始...`);
        
        // ダウンロード進行状況を表示
        this.showDownloadProgress(imageUrls.length);
        
        const results = await this.downloadMultipleImages(imageUrls, prefix);
        
        // 結果を表示
        this.displayDownloadResults(results);
        
        return results;
    }

    // ダウンロード進行状況を表示
    showDownloadProgress(totalImages) {
        const progressContainer = document.createElement('div');
        progressContainer.id = 'download-progress';
        progressContainer.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 9999;
                min-width: 300px;
            ">
                <h4>🖼️ 画像ダウンロード中...</h4>
                <div id="progress-bar" style="
                    width: 100%;
                    height: 10px;
                    background: #333;
                    border-radius: 5px;
                    overflow: hidden;
                    margin: 10px 0;
                ">
                    <div style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
                        transition: width 0.3s ease;
                    " id="progress-fill"></div>
                </div>
                <p id="progress-text">準備中...</p>
            </div>
        `;
        
        document.body.appendChild(progressContainer);
    }

    // ダウンロード結果を表示
    displayDownloadResults(results) {
        const progressElement = document.getElementById('download-progress');
        if (progressElement) {
            progressElement.remove();
        }

        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;

        const resultsContainer = document.createElement('div');
        resultsContainer.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 9999;
                min-width: 300px;
                max-height: 400px;
                overflow-y: auto;
            ">
                <h4>📥 ダウンロード完了</h4>
                <p>成功: ${successCount}/${totalCount} 画像</p>
                <div style="margin: 10px 0;">
                    ${results.map(result => `
                        <div style="
                            padding: 5px;
                            margin: 5px 0;
                            background: ${result.success ? '#4ecdc4' : '#ff6b6b'};
                            border-radius: 3px;
                            font-size: 12px;
                        ">
                            ${result.success ? '✅' : '❌'} ${result.filename}
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    width: 100%;
                ">閉じる</button>
            </div>
        `;
        
        document.body.appendChild(resultsContainer);
        
        // 10秒後に自動で閉じる
        setTimeout(() => {
            resultsContainer.remove();
        }, 10000);
    }

    // Base64形式で画像をプレビュー表示
    async createImagePreview(url) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('プレビュー作成エラー:', error);
            return null;
        }
    }

    // 遅延関数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 既存の商品カードの画像を更新
    async updateProductCard(productId, newImageUrl) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) {
            console.error('商品カードが見つかりません:', productId);
            return;
        }

        const imgElement = productCard.querySelector('.product-image');
        const placeholder = productCard.querySelector('.product-placeholder');
        
        if (imgElement) {
            // 新しい画像のプレビューを作成
            const previewUrl = await this.createImagePreview(newImageUrl);
            if (previewUrl) {
                imgElement.src = previewUrl;
                imgElement.style.display = 'block';
                if (placeholder) {
                    placeholder.style.display = 'none';
                }
            }
        }
    }
}

// グローバルインスタンスを作成
window.imageDownloader = new ImageDownloader();

// 使用例関数
window.downloadPlushieImages = () => {
    window.imageDownloader.updateProductImages('plushies');
};

window.downloadMangaImages = () => {
    window.imageDownloader.updateProductImages('manga');
};

console.log('Image Downloader utility loaded successfully');

// 画像管理パネルを追加
function createImageManagementPanel() {
    const panel = document.createElement('div');
    panel.id = 'image-management-panel';
    panel.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 9999;
            min-width: 280px;
            font-family: 'Arial', sans-serif;
        ">
            <h3 style="margin: 0 0 15px 0; text-align: center;">
                🎌 画像管理パネル
            </h3>
            <div style="margin-bottom: 15px;">
                <button onclick="downloadPlushieImages()" style="
                    width: 100%;
                    padding: 12px;
                    margin: 5px 0;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'">
                    🧸 ぬいぐるみ画像をダウンロード
                </button>
                <button onclick="downloadMangaImages()" style="
                    width: 100%;
                    padding: 12px;
                    margin: 5px 0;
                    background: #4ecdc4;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#26a69a'" onmouseout="this.style.background='#4ecdc4'">
                    📚 マンガ全巻画像をダウンロード
                </button>
                <button onclick="updateExistingCards()" style="
                    width: 100%;
                    padding: 12px;
                    margin: 5px 0;
                    background: #ffa726;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#ff9800'" onmouseout="this.style.background='#ffa726'">
                    🔄 既存カードを更新
                </button>
            </div>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
                <button onclick="toggleImagePanel()" style="
                    width: 100%;
                    padding: 8px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                ">
                    パネルを非表示
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// パネルの表示/非表示を切り替え
window.toggleImagePanel = function() {
    const panel = document.getElementById('image-management-panel');
    if (panel) {
        panel.remove();
        // 小さなボタンを作成して再表示できるようにする
        createToggleButton();
    }
};

// 小さな再表示ボタンを作成
function createToggleButton() {
    const button = document.createElement('button');
    button.innerHTML = '🎌';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
    `;
    
    button.onclick = function() {
        this.remove();
        createImageManagementPanel();
    };
    
    button.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
    };
    
    button.onmouseout = function() {
        this.style.transform = 'scale(1)';
    };
    
    document.body.appendChild(button);
}

// 既存のカードを更新する機能
window.updateExistingCards = async function() {
    const plushieUrls = window.imageDownloader.getPlushieImageUrls();
    const mangaUrls = window.imageDownloader.getMangaImageUrls();
    
    // ぬいぐるみカテゴリの商品を更新
    const plushieProducts = allProducts.filter(p => p.category === 'peluches');
    for (let i = 0; i < Math.min(plushieProducts.length, plushieUrls.length); i++) {
        await window.imageDownloader.updateProductCard(plushieProducts[i].id, plushieUrls[i]);
    }
    
    // マンガカテゴリの商品を更新
    const mangaProducts = allProducts.filter(p => p.category === 'manga');
    for (let i = 0; i < Math.min(mangaProducts.length, mangaUrls.length); i++) {
        await window.imageDownloader.updateProductCard(mangaProducts[i].id, mangaUrls[i]);
    }
    
    // 成功メッセージを表示
    const message = document.createElement('div');
    message.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.95);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            font-size: 16px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        ">
            ✅ 商品カードの画像を更新しました！
        </div>
    `;
    
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 3000);
};

// ページ読み込み時にパネルを作成
document.addEventListener('DOMContentLoaded', function() {
    // 画像管理パネルを非表示にするためコメントアウト
    // 少し遅延してパネルを表示（他のスクリプトが読み込まれるのを待つ）
    // setTimeout(createImageManagementPanel, 1000);
});