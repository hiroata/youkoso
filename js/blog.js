// ブログ表示用JavaScript

// ブログデータ（後でJSONファイルから読み込む）
const blogData = [
    {
        id: "b001",
        title: "Los 10 Animes Más Populares en Japón Este Año",
        category: "anime",
        date: "2025-04-15",
        author: "María González",
        image: "../assets/images/blog/top-anime.jpg",
        excerpt: "Descubre cuáles son los animes más vistos y aclamados en Japón este 2025. Desde nuevas temporadas de clásicos hasta sorprendentes estrenos.",
        featured: true
    },
    {
        id: "b002",
        title: "Guía para Principiantes: Cómo Empezar a Leer Manga",
        category: "manga",
        date: "2025-04-02",
        author: "Carlos Mendoza",
        image: "../assets/images/blog/manga-guide.jpg",
        excerpt: "¿Quieres empezar en el mundo del manga pero no sabes por dónde? Esta guía te ayudará a entender las bases y encontrar series que se adapten a tus gustos.",
        featured: true
    },
    {
        id: "b003",
        title: "5 Lugares en México Para Encontrar Cultura Japonesa",
        category: "cultura",
        date: "2025-03-20",
        author: "Ana Pérez",
        image: "../assets/images/blog/japanese-culture-mexico.jpg",
        excerpt: "Te mostramos los mejores lugares en México donde puedes experimentar la auténtica cultura japonesa, desde restaurantes hasta exposiciones permanentes.",
        featured: true
    },
    {
        id: "b004",
        title: "Receta Fácil: Cómo Preparar Ramen Casero",
        category: "comida",
        date: "2025-03-10",
        author: "Roberto Sánchez",
        image: "../assets/images/blog/ramen-recipe.jpg",
        excerpt: "Aprende a cocinar un delicioso ramen casero con ingredientes que puedes encontrar en cualquier supermercado mexicano. ¡Más fácil de lo que crees!",
        featured: false
    },
    {
        id: "b005",
        title: "Los Mejores Videojuegos Japoneses de 2025",
        category: "videojuegos",
        date: "2025-02-28",
        author: "Diego Torres",
        image: "../assets/images/blog/japanese-games.jpg",
        excerpt: "Analizamos los lanzamientos más esperados y mejor valorados en la industria de videojuegos japonesa de este año. ¿Cuál será el GOTY?",
        featured: true
    },
    {
        id: "b006",
        title: "Cómo Planificar Tu Primer Viaje a Japón",
        category: "viajes",
        date: "2025-02-15",
        author: "Laura Gómez",
        image: "../assets/images/blog/japan-travel.jpg",
        excerpt: "Todo lo que necesitas saber para organizar un viaje inolvidable a Japón: mejores fechas, presupuesto, lugares imprescindibles y consejos culturales.",
        featured: false
    }
];

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // トップページ用の最新ブログ表示
    const latestPostsContainer = document.getElementById('latest-posts-container');
    if (latestPostsContainer) {
        loadLatestBlogPosts();
    }
    
    // ブログページ用の表示
    const blogPostsContainer = document.getElementById('blog-posts-container');
    if (blogPostsContainer && window.location.pathname.includes('blog')) {
        loadAllBlogPosts();
        setupBlogFilters();
    }
});

// 最新のブログ投稿をロードする関数
function loadLatestBlogPosts(count = 3) {
    const latestPostsContainer = document.getElementById('latest-posts-container');
    if (!latestPostsContainer) return;
    
    // 日付で並べ替え（新しい順）
    const sortedPosts = [...blogData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 表示する投稿数を制限
    const postsToShow = sortedPosts.slice(0, count);
    
    // コンテナをクリア
    latestPostsContainer.innerHTML = '';
    
    // ブログカードを追加
    postsToShow.forEach(post => {
        latestPostsContainer.appendChild(createBlogCard(post));
    });
}

// すべてのブログ投稿をロードする関数
function loadAllBlogPosts() {
    const blogPostsContainer = document.getElementById('blog-posts-container');
    if (!blogPostsContainer) return;
    
    // コンテナをクリア
    blogPostsContainer.innerHTML = '';
    
    // URLからカテゴリフィルタを取得
    const categoryFilter = getUrlParameter('category');
    
    // 投稿をフィルタリング
    let filteredPosts = blogData;
    if (categoryFilter) {
        filteredPosts = blogData.filter(post => post.category === categoryFilter);
        
        // カテゴリフィルタのセレクトボックスを更新
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.value = categoryFilter;
        }
    }
    
    // 投稿がない場合
    if (filteredPosts.length === 0) {
        blogPostsContainer.innerHTML = '<div class="no-posts">No se encontraron artículos en esta categoría.</div>';
        return;
    }
    
    // 日付で並べ替え（新しい順）
    const sortedPosts = [...filteredPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // ブログカードを追加
    sortedPosts.forEach(post => {
        blogPostsContainer.appendChild(createBlogCard(post));
    });
    
    // シンプルなページネーションを設定
    setupBlogPagination(filteredPosts.length);
}

// ブログカードを作成する関数
function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-id', post.id);
    card.setAttribute('data-category', post.category);
    
    // ブログ詳細ページへのリンクパス
    const detailPath = window.location.pathname.includes('blog') ? 
                      `blog-detail.html?id=${post.id}` : 
                      `blog/blog-detail.html?id=${post.id}`;
    
    // 画像のパス（相対パスの調整）
    const imagePath = window.location.pathname.includes('blog') ? 
                     post.image.replace('../', '') : 
                     post.image;
    
    // 日付のフォーマット
    const date = new Date(post.date);
    const formattedDate = date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    card.innerHTML = `
        <div class="blog-image" style="background-image: url('${imagePath}')"></div>
        <div class="blog-info">
            <h3>${post.title}</h3>
            <div class="blog-meta">
                <span class="blog-date">${formattedDate}</span>
                <span class="blog-author">Por: ${post.author}</span>
            </div>
            <div class="blog-excerpt">${post.excerpt}</div>
            <a href="${detailPath}" class="btn">Leer Más</a>
        </div>
    `;
    
    return card;
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
            window.history.pushState({}, '', url);
            
            // ブログ投稿を再ロード
            loadAllBlogPosts();
        });
    }
    
    // 検索フィルター
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // 実際のプロジェクトでは、ここに検索機能を実装
            console.log('Search for: ' + this.value);
            // 遅延してからブログ投稿を再ロード
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                loadAllBlogPosts();
            }, 300);
        });
    }
}

// ブログページネーションの設定
function setupBlogPagination(totalItems, itemsPerPage = 6) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    // コンテナをクリア
    paginationControls.innerHTML = '';
    
    // ページ数を計算
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // ページネーションが必要ない場合
    if (totalPages <= 1) return;
    
    // シンプルなページネーションコントロールを作成
    const prevButton = document.createElement('button');
    prevButton.textContent = '←';
    prevButton.className = 'pagination-prev';
    prevButton.disabled = true;
    paginationControls.appendChild(prevButton);
    
    // ページ番号ボタン
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === 1 ? 'active' : '';
        pageButton.addEventListener('click', function() {
            // 実際のプロジェクトでは、ここにページ切り替え機能を実装
            console.log('Go to page: ' + i);
            
            // すべてのボタンからactiveクラスを削除
            document.querySelectorAll('#pagination-controls button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // クリックされたボタンにactiveクラスを追加
            this.classList.add('active');
            
            // 前へ/次へボタンの状態を更新
            prevButton.disabled = i === 1;
            nextButton.disabled = i === totalPages;
        });
        paginationControls.appendChild(pageButton);
    }
    
    // 次へボタン
    const nextButton = document.createElement('button');
    nextButton.textContent = '→';
    nextButton.className = 'pagination-next';
    nextButton.disabled = totalPages === 1;
    paginationControls.appendChild(nextButton);
    
    // 前へボタンのイベントリスナー
    prevButton.addEventListener('click', function() {
        const activeButton = document.querySelector('#pagination-controls button.active');
        if (activeButton && activeButton.previousElementSibling && activeButton.previousElementSibling.tagName === 'BUTTON') {
            activeButton.previousElementSibling.click();
        }
    });
    
    // 次へボタンのイベントリスナー
    nextButton.addEventListener('click', function() {
        const activeButton = document.querySelector('#pagination-controls button.active');
        if (activeButton && activeButton.nextElementSibling && activeButton.nextElementSibling.tagName === 'BUTTON') {
            activeButton.nextElementSibling.click();
        }
    });
}
