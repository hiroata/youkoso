// Enhanced Blog Manager with Card-based Design
class BlogManager {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 9;
        this.currentCategory = 'all';
        this.blogPosts = [];
        this.isLoading = false;
        this.searchTerm = '';
        this.isMobile = window.innerWidth <= 768;
        
        // Add window resize listener for responsive behavior
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.adjustForMobile();
        });
        
        this.init();
    }

    async init() {
        await this.loadBlogData();
        this.setupEventListeners();
        this.renderPosts();
        this.initializeAnimations();
        this.adjustForMobile();
    }

    async loadBlogData() {
        try {
            const response = await fetch('data/blogs.json');
            const data = await response.json();
            this.blogPosts = data.blogs || this.generateSamplePosts();
            
            // Sort by date (newest first)
            this.blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading blog data:', error);
            this.blogPosts = this.generateSamplePosts();
        }
    }

    generateSamplePosts() {
        return [
            {
                id: 'ghibli-magic',
                title: {
                    es: 'La Magia de Studio Ghibli: Análisis de las Obras Maestras',
                    ja: 'スタジオジブリの魔法：傑作の分析'
                },
                excerpt: {
                    es: 'Explora las películas más icónicas de Studio Ghibli y descubre los secretos detrás de su magia cinematográfica única que ha cautivado a audiencias globales.',
                    ja: 'スタジオジブリの最も象徴的な映画を探索し、世界中の観客を魅了したその独特な映画的魔法の秘密を発見してください。'
                },
                category: 'anime',
                author: 'Akira Miyazaki',
                date: '2024-06-02',
                readTime: '12 min',
                image: 'assets/images/blog/ghibli.jpg',
                views: 3245,
                likes: 278,
                tags: ['ghibli', 'miyazaki', 'animación'],
                url: 'blog2.html'
            },
            {
                id: 'ramen-culture',
                title: {
                    es: 'La Cultura del Ramen: Más que una Simple Sopa',
                    ja: 'ラーメン文化：単なるスープ以上のもの'
                },
                excerpt: {
                    es: 'Sumérgete en la rica historia y tradición del ramen japonés, desde sus humildes orígenes hasta convertirse en un fenómeno gastronómico mundial.',
                    ja: '日本のラーメンの豊かな歴史と伝統に飛び込み、その謙虚な起源から世界的な美食現象になるまでを探ります。'
                },
                category: 'gastronomia',
                author: 'Hiroshi Noodle',
                date: '2024-06-01',
                readTime: '8 min',
                image: 'assets/images/blog/ramen.jpg',
                views: 2156,
                likes: 189,
                tags: ['ramen', 'gastronomía', 'cultura'],
                url: 'blog3.html'
            },
            {
                id: 'manga-evolution',
                title: {
                    es: 'La Evolución del Manga: De Hokusai a One Piece',
                    ja: 'マンガの進化：北斎からワンピースまで'
                },
                excerpt: {
                    es: 'Un viaje fascinante a través de la historia del manga, desde sus raíces artísticas tradicionales hasta los bestsellers modernos que definen la cultura pop.',
                    ja: 'その伝統的な芸術的ルーツから現代のポップカルチャーを定義するベストセラーまで、マンガの歴史を通る魅力的な旅。'
                },
                category: 'manga',
                author: 'Kenji Artista',
                date: '2024-05-30',
                readTime: '10 min',
                image: 'assets/images/blog/manga.jpg',
                views: 1987,
                likes: 145,
                tags: ['manga', 'historia', 'arte'],
                url: 'blog2.html'
            },
            {
                id: 'tea-ceremony',
                title: {
                    es: 'El Arte de la Ceremonia del Té: Tradición y Espiritualidad',
                    ja: '茶道の芸術：伝統と精神性'
                },
                excerpt: {
                    es: 'Descubre los secretos de la ceremonia del té japonesa, una práctica milenaria que combina arte, filosofía y espiritualidad en perfecta armonía.',
                    ja: '芸術、哲学、精神性を完璧に調和させた何千年もの実践である日本の茶道の秘密を発見してください。'
                },
                category: 'cultura',
                author: 'Sensei Cha',
                date: '2024-05-28',
                readTime: '7 min',
                image: 'assets/images/blog/tea-ceremony.jpg',
                views: 2445,
                likes: 198,
                tags: ['tea', 'ceremonia', 'tradición'],
                url: 'blog1.html'
            },
            {
                id: 'kawaii-culture',
                title: {
                    es: 'Cultura Kawaii: El Poder de lo Adorable en Japón',
                    ja: 'カワイイ文化：日本における可愛らしさの力'
                },
                excerpt: {
                    es: 'Explora cómo la estética kawaii ha influenciado no solo la moda japonesa, sino toda la cultura contemporánea y el diseño global moderno.',
                    ja: 'カワイイ美学が日本のファッションだけでなく、現代文化全体と現代のグローバルデザインにどのように影響を与えたかを探ります。'
                },
                category: 'cultura',
                author: 'Miki Cute',
                date: '2024-05-26',
                readTime: '6 min',
                image: 'assets/images/blog/kawaii.jpg',
                views: 3134,
                likes: 267,
                tags: ['kawaii', 'moda', 'cultura pop'],
                url: 'blog3.html'
            },
            {
                id: 'japanese-games',
                title: {
                    es: 'Videojuegos Japoneses: Innovación y Creatividad',
                    ja: '日本のビデオゲーム：革新と創造性'
                },
                excerpt: {
                    es: 'Desde Nintendo hasta PlayStation, descubre cómo Japón ha revolucionado la industria de los videojuegos con innovación constante y narrativas únicas.',
                    ja: '任天堂からプレイステーションまで、日本が継続的な革新とユニークな物語で、どのようにビデオゲーム業界を革命化したかを発見してください。'
                },
                category: 'gaming',
                author: 'Game Master Yuki',
                date: '2024-05-24',
                readTime: '9 min',
                image: 'assets/images/blog/japanese-games.jpg',
                views: 2876,
                likes: 234,
                tags: ['gaming', 'nintendo', 'innovación'],
                url: 'blog1.html'
            },
            {
                id: 'harajuku-fashion',
                title: {
                    es: 'Moda Harajuku: Expresión y Rebeldía Creativa',
                    ja: '原宿ファッション：表現と創造的反逆'
                },
                excerpt: {
                    es: 'Sumérgete en el vibrante mundo de la moda Harajuku, donde la autoexpresión no tiene límites y cada outfit cuenta una historia única.',
                    ja: '自己表現に限界がなく、すべてのアウトフィットがユニークな物語を語る、原宿ファッションの活気ある世界に飛び込みましょう。'
                },
                category: 'cultura',
                author: 'Fashion Rebel',
                date: '2024-05-22',
                readTime: '8 min',
                image: 'assets/images/blog/harajuku.jpg',
                views: 2567,
                likes: 201,
                tags: ['harajuku', 'moda', 'expresión'],
                url: 'blog2.html'
            },
            {
                id: 'matsuri-festivals',
                title: {
                    es: 'Matsuri: La Alegría de los Festivales Japoneses',
                    ja: '祭り：日本の祭りの喜び'
                },
                excerpt: {
                    es: 'Experimenta la magia de los matsuri japoneses, celebraciones que unen tradición ancestral con la alegría comunitaria en espectáculos inolvidables.',
                    ja: '祖先の伝統と地域の喜びを忘れられないスペクタクルで結ぶ祝祭である日本の祭りの魔法を体験してください。'
                },
                category: 'cultura',
                author: 'Festival Guide',
                date: '2024-05-20',
                readTime: '11 min',
                image: 'assets/images/blog/matsuri.jpg',
                views: 1876,
                likes: 167,
                tags: ['matsuri', 'festivales', 'tradición'],
                url: 'blog3.html'
            },
            {
                id: 'one-piece-phenomenon',
                title: {
                    es: 'One Piece: El Fenómeno Manga que Conquistó el Mundo',
                    ja: 'ワンピース：世界を征服したマンガ現象'
                },
                excerpt: {
                    es: 'Analiza el increíble éxito de One Piece, la obra maestra de Eiichiro Oda que ha redefinido lo que significa ser un manga de aventuras épicas.',
                    ja: '冒険叙事詩マンガであることの意味を再定義した尾田栄一郎の傑作、ワンピースの驚くべき成功を分析します。'
                },
                category: 'manga',
                author: 'Pirate King Fan',
                date: '2024-05-18',
                readTime: '13 min',
                image: 'assets/images/blog/onepiece.jpg',
                views: 4123,
                likes: 356,
                tags: ['onepiece', 'manga', 'aventura'],
                url: 'blog1.html'
            }
        ];
    }

    setupEventListeners() {
        // Enhanced filter functionality
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryChange(btn.dataset.category);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMorePosts();
            });
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                this.handleNewsletterSubmit(e);
            });
        }

        // Scroll animations
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in', 'visible');
                    // Unobserve after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        const animateElements = document.querySelectorAll('.blog-card, .featured-article, .filter-btn, .blog-stat');
        animateElements.forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });

        // Parallax effect for hero section (if not mobile)
        const heroSection = document.querySelector('.blog-hero');
        if (heroSection && !this.isMobile) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
            });
        }
    }

    handleCategoryChange(category) {
        // Update active button with smooth transition
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const categoryBtn = document.querySelector(`[data-category="${category}"]`);
        if (categoryBtn) {
            categoryBtn.classList.add('active');
        }

        this.currentCategory = category;
        this.currentPage = 1;
        
        // Smooth transition for grid
        const blogGrid = document.getElementById('blog-articles-grid');
        if (blogGrid) {
            blogGrid.style.opacity = '0.6';
            blogGrid.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                this.renderPosts();
                blogGrid.style.opacity = '1';
                blogGrid.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    getFilteredPosts() {
        let filtered = this.blogPosts;
        
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(post => post.category === this.currentCategory);
        }
        
        if (this.searchTerm) {
            filtered = filtered.filter(post => 
                this.getLocalizedText(post.title).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                this.getLocalizedText(post.excerpt).toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }

    getCurrentLanguage() {
        return document.documentElement.getAttribute('data-lang') || 'es';
    }

    getLocalizedText(textObj) {
        const lang = this.getCurrentLanguage();
        if (typeof textObj === 'object' && textObj !== null) {
            return textObj[lang] || textObj.es || textObj.ja || '';
        }
        return textObj || '';
    }

    renderPosts() {
        const blogGrid = document.getElementById('blog-articles-grid');
        if (!blogGrid) return;

        const filteredPosts = this.getFilteredPosts();
        const startIndex = 0;
        const endIndex = this.currentPage * this.postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        // Show loading state for first page
        if (this.currentPage === 1) {
            blogGrid.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">
                        <span class="es-text">Cargando artículos increíbles...</span>
                        <span class="ja-text">素晴らしい記事を読み込み中...</span>
                    </p>
                </div>
            `;
        }

        const renderDelay = this.currentPage === 1 ? 800 : 0;
        
        setTimeout(() => {
            if (this.currentPage === 1) {
                blogGrid.innerHTML = '';
            }

            if (postsToShow.length === 0) {
                blogGrid.innerHTML = `
                    <div class="empty-state-container">
                        <div class="empty-state-icon">📝</div>
                        <h3>
                            <span class="es-text">No hay artículos en esta categoría</span>
                            <span class="ja-text">このカテゴリーには記事がありません</span>
                        </h3>
                        <p>
                            <span class="es-text">Prueba con otra categoría o vuelve más tarde</span>
                            <span class="ja-text">他のカテゴリーを試すか、後でもう一度お試しください</span>
                        </p>
                    </div>
                `;
                return;
            }

            // Render posts with staggered animation
            postsToShow.forEach((post, index) => {
                if (this.currentPage > 1 && index < (this.currentPage - 1) * this.postsPerPage) {
                    return;
                }
                
                const postElement = this.createPostCard(post);
                postElement.style.opacity = '0';
                postElement.style.transform = 'translateY(40px)';
                blogGrid.appendChild(postElement);
                
                const animationDelay = (index % this.postsPerPage) * 100;
                
                setTimeout(() => {
                    postElement.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    postElement.style.opacity = '1';
                    postElement.style.transform = 'translateY(0)';
                }, animationDelay);
            });

            this.updateLoadMoreButton(filteredPosts.length, endIndex);
        }, renderDelay);
    }

    createPostCard(post) {
        const article = document.createElement('a');
        article.href = post.url;
        article.className = 'blog-card';
        article.setAttribute('data-category', post.category);
        
        const title = this.getLocalizedText(post.title);
        const excerpt = this.getLocalizedText(post.excerpt);
        const formattedDate = this.formatDate(post.date);
        const categoryName = this.getCategoryName(post.category);

        article.innerHTML = `
            <div class="blog-card-image-container">
                <img src="${post.image}" 
                     alt="${title}" 
                     class="blog-card-image"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="blog-card-image-placeholder" style="display: none;">
                    ${this.getCategoryIcon(post.category)}
                </div>
                <div class="blog-card-category">${categoryName}</div>
                <div class="blog-card-read-time">
                    <span class="es-text">${post.readTime}</span>
                    <span class="ja-text">${post.readTime}</span>
                </div>
            </div>
            <div class="blog-card-content">
                <h3 class="blog-card-title">
                    <span class="es-text">${post.title.es}</span>
                    <span class="ja-text">${post.title.ja}</span>
                </h3>
                <p class="blog-card-excerpt">
                    <span class="es-text">${post.excerpt.es}</span>
                    <span class="ja-text">${post.excerpt.ja}</span>
                </p>
                <div class="blog-card-meta">
                    <div class="blog-card-author">
                        <i class="fas fa-user"></i>
                        <span>${post.author}</span>
                    </div>
                    <div class="blog-card-stats">
                        <div class="blog-card-stat">
                            <i class="fas fa-eye"></i>
                            <span>${this.formatNumber(post.views)}</span>
                        </div>
                        <div class="blog-card-stat">
                            <i class="fas fa-heart"></i>
                            <span>${this.formatNumber(post.likes)}</span>
                        </div>
                    </div>
                </div>
                <div class="blog-card-footer">
                    <div class="blog-card-date">${formattedDate}</div>
                    <div class="blog-card-arrow">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        `;
        
        // Enhanced hover effects for desktop
        if (!this.isMobile) {
            article.addEventListener('mouseenter', () => {
                article.style.transform = 'translateY(-12px)';
            });
            
            article.addEventListener('mouseleave', () => {
                article.style.transform = 'translateY(0)';
            });
        }
        
        return article;
    }

    getCategoryName(category) {
        const names = {
            anime: 'Anime',
            manga: 'Manga', 
            cultura: 'Cultura',
            gastronomia: 'Gastronomía',
            viajes: 'Viajes',
            gaming: 'Gaming'
        };
        return names[category] || category;
    }

    getCategoryIcon(category) {
        const icons = {
            anime: '🎌',
            manga: '📚',
            cultura: '🏮',
            gastronomia: '🍜',
            viajes: '🗾',
            gaming: '🎮'
        };
        return icons[category] || '📝';
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const currentLang = this.getCurrentLanguage();
        
        if (currentLang === 'ja') {
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        } else {
            const months = [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
    }

    updateLoadMoreButton(totalPosts, currentlyShown) {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (!loadMoreBtn) return;

        const remainingPosts = totalPosts - currentlyShown;
        
        if (remainingPosts <= 0) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.innerHTML = `
                <span class="es-text">Cargar Más Artículos (${remainingPosts})</span>
                <span class="ja-text">もっと記事を読み込む (${remainingPosts}件)</span>
            `;
        }
    }

    loadMorePosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <span class="es-text">Cargando...</span>
                <span class="ja-text">読み込み中...</span>
            `;
        }
        
        setTimeout(() => {
            this.renderPosts();
            this.isLoading = false;
            
            if (loadMoreBtn) {
                loadMoreBtn.disabled = false;
            }
        }, 1200);
    }

    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const email = e.target.querySelector('input[type="email"]').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        if (!email || !this.isValidEmail(email)) {
            console.warn('Invalid email address provided');
            return;
        }
        
        submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span class="es-text">Enviando...</span>
            <span class="ja-text">送信中...</span>
        `;
        submitBtn.disabled = true;
        
        setTimeout(() => {
            console.log('Newsletter subscription successful');
            e.target.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    adjustForMobile() {
        if (this.isMobile) {
            this.postsPerPage = 6;
        } else {
            this.postsPerPage = 9;
        }
    }

    initializeAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .fade-in.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            @media (prefers-reduced-motion: reduce) {
                .fade-in {
                    transition: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a blog page
    if (document.getElementById('blog-articles-grid')) {
        new BlogManager();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogManager;
}