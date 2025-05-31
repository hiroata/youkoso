// ブログ表示用JavaScript

// ブログデータ（共有データから取得）
let blogData = [];

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded in blog.js');
    
    // ブログデータを読み込む
    await loadBlogData();
    
    // トップページ用の最新ブログ表示
    const latestPostsContainer = document.getElementById('latest-posts-container');
    if (latestPostsContainer) {
        loadLatestBlogPosts();
    }
    
    // ブログページ用の表示
    const blogPostsContainer = document.getElementById('blog-posts-container');
    if (blogPostsContainer && window.location.pathname.includes('/blog/')) {
        loadAllBlogPosts();
        setupBlogFilters();
    }
});

// ブログデータを読み込む関数
async function loadBlogData() {
    try {
        // 統一されたDataLoaderを使用
        blogData = await window.utils.dataLoader.loadData('posts');
        return blogData;
    } catch (error) {
        console.error('ブログデータの読み込みに失敗しました:', error);
        return [];
    }
}


// 最新のブログ投稿をロードする関数
function loadLatestBlogPosts(count = 3) {
    const latestPostsContainer = document.getElementById('latest-posts-container');
    if (!latestPostsContainer) return;
    
    // 日付で並べ替え（新しい順）- 共通ユーティリティ関数を使用
    const sortedPosts = window.utils.sortItems(blogData, 'date', 'desc');
    
    // 表示する投稿数を制限
    const postsToShow = sortedPosts.slice(0, count);
    
    // コンテナをクリア
    latestPostsContainer.innerHTML = '';
    
    // ブログカードを追加（components.jsで定義した関数を使用）
    const relativePath = window.location.pathname.includes('/blog/') ? '../' : '';
    postsToShow.forEach(post => {
        latestPostsContainer.innerHTML += window.createBlogCardComponent(post, relativePath);
    });
}

// すべてのブログ投稿をロードする関数
function loadAllBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts-container');
    if (!blogPostsContainer) return;
    
    // コンテナをクリア
    blogPostsContainer.innerHTML = '';
    
    // URLからフィルタとソートパラメータを取得
    const categoryFilter = window.utils.getUrlParam('category');
    const searchQuery = window.utils.getUrlParam('q');
    
    // フィルタリング条件を作成
    const filters = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (searchQuery) filters.search = searchQuery;
    
    // 共通ユーティリティ関数を使用してフィルタリング
    const filteredPosts = window.utils.filterItems(blogData, filters);
    
    // 投稿がない場合
    if (filteredPosts.length === 0) {
        blogPostsContainer.innerHTML = '<div class="no-posts">No se encontraron artículos con estos criterios de búsqueda.</div>';
        return;
    }
    
    // 日付で並べ替え（新しい順）- 共通ユーティリティ関数を使用
    const sortedPosts = window.utils.sortItems(filteredPosts, 'date', 'desc');
    
    // ページネーションの設定
    const currentPage = parseInt(window.utils.getUrlParam('page')) || 1;
    const pageSize = 6;
    
    // 表示する投稿を取得
    const paginatedPosts = window.utils.paginateItems(sortedPosts, pageSize, currentPage);
    
    // ブログカードを追加（components.jsで定義した関数を使用）
    const relativePath = '../';
    paginatedPosts.forEach(post => {
        blogPostsContainer.innerHTML += window.createBlogCardComponent(post, relativePath);
    });
    
    // ページネーションを設定
    setupPagination(filteredPosts.length, pageSize);
}

// ページネーションを設定する関数
function setupPagination(totalItems, pageSize = 6) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // 現在のページを取得（デフォルトは1）
    const currentPage = parseInt(window.utils.getUrlParam('page')) || 1;
    
    // ページネーションコントロールを生成
    let paginationHTML = '<div class="pagination-controls">';
    
    // 戻るボタン
    if (currentPage > 1) {
        paginationHTML += `<button data-page="${currentPage - 1}">Anterior</button>`;
    }
    
    // ページ番号（表示を5ページまでに制限）
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button data-page="${i}" class="${activeClass}">${i}</button>`;
    }
    
    // 次へボタン
    if (currentPage < totalPages) {
        paginationHTML += `<button data-page="${currentPage + 1}">Siguiente</button>`;
    }
    
    paginationHTML += '</div>';
    
    // ページネーションを挿入
    paginationContainer.innerHTML = paginationHTML;
    
    // ページネーションボタンのイベントリスナーを設定
    const pageButtons = paginationContainer.querySelectorAll('button');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // URLパラメータを更新して再読み込み
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            window.location.href = url.toString();
        });
    });
}

// ブログフィルターの設定
function setupBlogFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-blog');
    
    // カテゴリーフィルター
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            
            // URLパラメータを更新
            const url = new URL(window.location);
            if (selectedCategory) {
                url.searchParams.set('category', selectedCategory);
            } else {
                url.searchParams.delete('category');
            }
            window.location.href = url.toString();
        });
    }
    
    // 検索フィルター
    if (searchInput) {
        // Enter キーで検索を実行
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                // URLパラメータを更新
                const url = new URL(window.location);
                if (this.value.trim()) {
                    url.searchParams.set('q', this.value.trim());
                } else {
                    url.searchParams.delete('q');
                }
                window.location.href = url.toString();
            }
        });
        
        // テキスト入力でリアルタイム検索
        searchInput.addEventListener('input', function() {
            // 遅延してからブログ投稿を再ロード
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                loadAllBlogPosts();
            }, 300);
        });
    }
}
