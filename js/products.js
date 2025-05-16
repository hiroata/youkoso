// 商品表示用JavaScript

// 商品データ（後でJSONファイルから読み込む）
const productData = [
    {
        id: "p001",
        name: "Figura Demon Slayer - Tanjiro Kamado",
        category: "figuras",
        price: 1299,
        image: "../assets/images/products/tanjiro.jpg",
        description: "Figura de colección de Tanjiro Kamado de Demon Slayer (Kimetsu no Yaiba). Alta calidad, 18cm de altura.",
        featured: true
    },
    {
        id: "p002",
        name: "Manga My Hero Academia Vol. 1-5",
        category: "manga",
        price: 850,
        image: "../assets/images/products/myhero.jpg",
        description: "Colección de los primeros 5 volúmenes del manga My Hero Academia en español.",
        featured: true
    },
    {
        id: "p003",
        name: "Peluche Totoro Grande",
        category: "peluches",
        price: 599,
        image: "../assets/images/products/totoro.jpg",
        description: "Peluche oficial de Mi Vecino Totoro, 40cm, super suave y de alta calidad.",
        featured: true
    },
    {
        id: "p004",
        name: "Nintendo Switch Edición Pokémon",
        category: "videojuegos",
        price: 7999,
        image: "../assets/images/products/switch.jpg",
        description: "Nintendo Switch edición especial Pokémon. Incluye el juego Pokémon Legends Arceus.",
        featured: false
    },
    {
        id: "p005",
        name: "Camiseta Dragon Ball Z",
        category: "ropa",
        price: 449,
        image: "../assets/images/products/dbz-shirt.jpg",
        description: "Camiseta oficial de Dragon Ball Z con diseño de Goku en Super Saiyan. 100% algodón.",
        featured: true
    },
    {
        id: "p006",
        name: "Set de Cartas Pokémon Japonés",
        category: "cartas",
        price: 899,
        image: "../assets/images/products/pokemon-cards.jpg",
        description: "Set de 50 cartas Pokémon originales en japonés. Incluye cartas raras y holofoil.",
        featured: false
    },
    {
        id: "p007",
        name: "Figura Sailor Moon",
        category: "figuras",
        price: 1199,
        image: "../assets/images/products/sailormoon.jpg",
        description: "Figura de colección de Sailor Moon. Edición limitada, 20cm de altura.",
        featured: true
    },
    {
        id: "p008",
        name: "Manga Death Note Colección Completa",
        category: "manga",
        price: 1499,
        image: "../assets/images/products/deathnote.jpg",
        description: "Colección completa del manga Death Note en español. Edición Black Edition.",
        featured: false
    }
];

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // トップページ用の特集商品表示
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (featuredProductsContainer) {
        loadFeaturedProducts();
    }
    
    // 商品一覧ページ用の表示
    const productsContainer = document.getElementById('products-container');
    if (productsContainer && window.location.pathname.includes('products')) {
        loadAllProducts();
        setupFilters();
    }
});

// 特集商品をロードする関数
function loadFeaturedProducts() {
    const featuredProductsContainer = document.getElementById('featured-products-container');
    if (!featuredProductsContainer) return;
    
    // 特集商品をフィルタリング
    const featuredProducts = productData.filter(product => product.featured);
    
    // 空の場合は、最初の4つを表示
    const productsToShow = featuredProducts.length > 0 ? featuredProducts : productData.slice(0, 4);
    
    // コンテナをクリア
    featuredProductsContainer.innerHTML = '';
    
    // 商品カードを追加
    productsToShow.forEach(product => {
        featuredProductsContainer.appendChild(createProductCard(product));
    });
}

// すべての商品をロードする関数
function loadAllProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    // コンテナをクリア
    productsContainer.innerHTML = '';
    
    // URLからカテゴリフィルタを取得
    const categoryFilter = getUrlParameter('category');
    
    // 商品をフィルタリング
    let filteredProducts = productData;
    if (categoryFilter) {
        filteredProducts = productData.filter(product => product.category === categoryFilter);
        
        // カテゴリフィルタのセレクトボックスを更新
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            categorySelect.value = categoryFilter;
        }
    }
    
    // 商品がない場合
    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No se encontraron productos en esta categoría.</div>';
        return;
    }
    
    // 商品カードを追加
    filteredProducts.forEach(product => {
        productsContainer.appendChild(createProductCard(product));
    });
    
    // シンプルなページネーションを設定（実際のプロジェクトではより複雑な実装が必要）
    setupPagination(filteredProducts.length);
}

// 商品カードを作成する関数
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.setAttribute('data-category', product.category);
    
    // 商品の詳細ページへのリンクパス
    const detailPath = window.location.pathname.includes('products') ? 
                      `product-detail.html?id=${product.id}` : 
                      `products/product-detail.html?id=${product.id}`;
    
    // 商品画像のパス（相対パスの調整）
    const imagePath = window.location.pathname.includes('products') ? 
                     product.image.replace('../', '') : 
                     product.image;
    
    card.innerHTML = `
        <div class="product-image" style="background-image: url('${imagePath}')"></div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-price">$${product.price.toFixed(2)} MXN</div>
            <a href="${detailPath}" class="btn">Ver Detalles</a>
        </div>
    `;
    
    return card;
}

// フィルターの設定
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-products');
    
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
            
            // 商品を再ロード
            loadAllProducts();
        });
    }
    
    // ソートフィルター
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            // 実際のプロジェクトでは、ここにソート機能を実装
            console.log('Sort by: ' + this.value);
            // ソートしてから商品を再ロード
            loadAllProducts();
        });
    }
    
    // 検索フィルター
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // 実際のプロジェクトでは、ここに検索機能を実装
            console.log('Search for: ' + this.value);
            // 遅延してから商品を再ロード
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                loadAllProducts();
            }, 300);
        });
    }
}

// シンプルなページネーションの設定
function setupPagination(totalItems, itemsPerPage = 8) {
    const paginationControls = document.getElementById('pagination-controls');
    if (!paginationControls) return;
    
    // コンテナをクリア
    paginationControls.innerHTML = '';
    
    // ページ数を計算
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // ページネーションが必要ない場合
    if (totalPages <= 1) return;
    
    // 前へボタン
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
