// リンク切れチェック機能
class LinkChecker {
    constructor() {
        this.brokenLinks = [];
        this.checkedLinks = new Set();
        this.isChecking = false;
    }

    // 全ページのリンクをチェック
    async checkAllLinks() {
        if (this.isChecking) return;
        
        this.isChecking = true;
        this.brokenLinks = [];
        this.checkedLinks.clear();
        
        console.log('🔍 リンク切れチェックを開始します...');
        this.showCheckingModal();

        try {
            // 現在のページのリンクをチェック
            await this.checkPageLinks(window.location.href);
            
            // 他のページもチェック（同一ドメインのみ）
            const siteLinks = this.getAllSiteLinks();
            for (const link of siteLinks) {
                await this.checkPageLinks(link);
            }
            
            this.displayResults();
        } catch (error) {
            console.error('リンクチェック中にエラーが発生しました:', error);
        } finally {
            this.isChecking = false;
            this.hideCheckingModal();
        }
    }

    // ページ内のリンクをチェック
    async checkPageLinks(pageUrl) {
        try {
            const response = await fetch(pageUrl);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const links = doc.querySelectorAll('a[href]');
            
            for (const link of links) {
                const href = link.getAttribute('href');
                if (href && !this.checkedLinks.has(href)) {
                    await this.checkSingleLink(href, pageUrl);
                    this.checkedLinks.add(href);
                }
            }
        } catch (error) {
            console.warn(`ページ ${pageUrl} の取得に失敗しました:`, error);
        }
    }

    // 単一リンクをチェック
    async checkSingleLink(href, sourcePage) {
        // 相対URLを絶対URLに変換
        const absoluteUrl = new URL(href, sourcePage).href;
        
        // メールリンクやTelリンクはスキップ
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
            return;
        }

        try {
            const response = await fetch(absoluteUrl, {
                method: 'HEAD',
                mode: 'cors'
            });
            
            if (!response.ok) {
                this.brokenLinks.push({
                    url: href,
                    absoluteUrl: absoluteUrl,
                    status: response.status,
                    sourcePage: sourcePage,
                    error: `HTTPエラー: ${response.status} ${response.statusText}`
                });
            }
        } catch (error) {
            // CORSエラーの場合は外部リンクとして扱う
            if (error.name === 'TypeError' && error.message.includes('CORS')) {
                console.log(`外部リンク（CORS制限）: ${absoluteUrl}`);
                return;
            }
            
            this.brokenLinks.push({
                url: href,
                absoluteUrl: absoluteUrl,
                status: 'ERROR',
                sourcePage: sourcePage,
                error: error.message
            });
        }
    }

    // サイト内の全リンクを取得
    getAllSiteLinks() {
        return [
            'index.html',
            'products.html',
            'about.html',
            'contact.html',
            'blog.html',
            'admin.html'
        ].map(page => new URL(page, window.location.origin).href);
    }

    // チェック中のモーダルを表示
    showCheckingModal() {
        const modal = document.createElement('div');
        modal.id = 'link-checking-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="loading-spinner"></div>
                    <h3>リンク切れをチェック中...</h3>
                    <p>しばらくお待ちください</p>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #link-checking-modal .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            #link-checking-modal .modal-content {
                background: var(--bg-color);
                padding: 2rem;
                border-radius: var(--radius);
                text-align: center;
                box-shadow: var(--shadow-lg);
                max-width: 400px;
                width: 90%;
            }
            
            #link-checking-modal .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top: 4px solid var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 1rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
    }

    // チェック中のモーダルを非表示
    hideCheckingModal() {
        const modal = document.getElementById('link-checking-modal');
        if (modal) {
            modal.remove();
        }
    }

    // 結果を表示
    displayResults() {
        const resultModal = document.createElement('div');
        resultModal.id = 'link-check-results';
        
        const brokenCount = this.brokenLinks.length;
        const totalChecked = this.checkedLinks.size;
        
        resultModal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3>🔍 リンクチェック結果</h3>
                        <button class="close-btn" onclick="this.closest('#link-check-results').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="results-summary">
                            <p><strong>チェック総数:</strong> ${totalChecked}個のリンク</p>
                            <p class="${brokenCount === 0 ? 'success' : 'error'}">
                                <strong>問題のあるリンク:</strong> ${brokenCount}個
                            </p>
                        </div>
                        
                        ${brokenCount === 0 ? 
                            '<div class="alert alert-success">✅ すべてのリンクが正常です！</div>' :
                            `<div class="broken-links-list">
                                <h4>🚨 問題のあるリンク</h4>
                                ${this.brokenLinks.map(link => `
                                    <div class="broken-link-item">
                                        <div class="link-url">${link.url}</div>
                                        <div class="link-error">${link.error}</div>
                                        <div class="link-source">参照元: ${link.sourcePage}</div>
                                    </div>
                                `).join('')}
                            </div>`
                        }
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('#link-check-results').remove()">
                            閉じる
                        </button>
                        ${brokenCount > 0 ? 
                            '<button class="btn btn-primary" onclick="linkChecker.exportResults()">結果をエクスポート</button>' : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            #link-check-results .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            #link-check-results .modal-content {
                background: var(--bg-color);
                border-radius: var(--radius);
                box-shadow: var(--shadow-lg);
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            #link-check-results .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            #link-check-results .close-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
                line-height: 1;
                color: var(--text-light);
            }
            
            #link-check-results .modal-body {
                padding: 1.5rem;
                overflow-y: auto;
                flex: 1;
            }
            
            #link-check-results .results-summary {
                background: var(--bg-light);
                padding: 1rem;
                border-radius: var(--radius);
                margin-bottom: 1.5rem;
            }
            
            #link-check-results .results-summary .success {
                color: var(--success-color);
            }
            
            #link-check-results .results-summary .error {
                color: var(--error-color);
            }
            
            #link-check-results .broken-links-list h4 {
                color: var(--error-color);
                margin-bottom: 1rem;
            }
            
            #link-check-results .broken-link-item {
                background: rgba(231, 76, 60, 0.1);
                border: 1px solid rgba(231, 76, 60, 0.2);
                border-radius: var(--radius);
                padding: 1rem;
                margin-bottom: 1rem;
            }
            
            #link-check-results .link-url {
                font-weight: 600;
                color: var(--error-color);
                margin-bottom: 0.5rem;
            }
            
            #link-check-results .link-error {
                color: var(--text-color);
                margin-bottom: 0.5rem;
            }
            
            #link-check-results .link-source {
                font-size: 0.875rem;
                color: var(--text-light);
            }
            
            #link-check-results .modal-footer {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
            }
            
            @media (max-width: 768px) {
                #link-check-results .modal-content {
                    width: 95%;
                    max-height: 90vh;
                }
                
                #link-check-results .modal-footer {
                    flex-direction: column;
                }
                
                #link-check-results .modal-footer .btn {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(resultModal);
    }

    // 結果をエクスポート
    exportResults() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const results = {
            timestamp: new Date().toISOString(),
            totalChecked: this.checkedLinks.size,
            brokenLinksCount: this.brokenLinks.length,
            brokenLinks: this.brokenLinks
        };
        
        const blob = new Blob([JSON.stringify(results, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `link-check-results-${timestamp}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // 管理画面用のボタンを追加
    addCheckButton() {
        const header = document.querySelector('.header-actions');
        if (header && !document.getElementById('link-check-btn')) {
            const button = document.createElement('button');
            button.id = 'link-check-btn';
            button.className = 'btn btn-outline';
            button.innerHTML = '🔗 リンクチェック';
            button.onclick = () => this.checkAllLinks();
            header.appendChild(button);
        }
    }
}

// グローバルインスタンスを作成
const linkChecker = new LinkChecker();

// ページ読み込み時にボタンを追加
document.addEventListener('DOMContentLoaded', () => {
    linkChecker.addCheckButton();
});