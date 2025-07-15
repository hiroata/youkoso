// 強化されたヒーローセクションとマイクロインタラクション
class HeroEnhancer {
    constructor() {
        this.heroSection = null;
        this.animationElements = [];
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createHeroSection();
        this.addMicroInteractions();
        this.setupScrollAnimations();
        this.startFloatingElements();
    }

    // ヒーローセクションを作成
    createHeroSection() {
        const existingHero = document.querySelector('.hero-modern');
        if (existingHero) {
            existingHero.remove();
        }

        // ヒーローセクションをメインコンテンツの最初に挿入
        const main = document.querySelector('main, .main');
        if (!main) return;

        this.heroSection = document.createElement('section');
        this.heroSection.className = 'hero-enhanced';
        this.heroSection.innerHTML = `
            <div class="hero-background">
                <div class="floating-elements">
                    <div class="floating-icon" data-icon="🎌">🎌</div>
                    <div class="floating-icon" data-icon="🗾">🗾</div>
                    <div class="floating-icon" data-icon="🏮">🏮</div>
                    <div class="floating-icon" data-icon="🌸">🌸</div>
                    <div class="floating-icon" data-icon="🎋">🎋</div>
                    <div class="floating-icon" data-icon="🎪">🎪</div>
                    <div class="floating-icon" data-icon="🎨">🎨</div>
                    <div class="floating-icon" data-icon="🎭">🎭</div>
                </div>
                <div class="hero-gradient-overlay"></div>
            </div>
            
            <div class="container">
                <div class="hero-content-wrapper">
                    <div class="hero-main">
                        <div class="hero-badge animate-fade-in">
                            <i class="fas fa-star"></i>
                            <span class="ja-text">本格的な日本の商品</span>
                            <span class="es-text">Productos Japoneses Auténticos</span>
                            <span class="en-text">Authentic Japanese Products</span>
                        </div>
                        
                        <h1 class="hero-headline animate-slide-up">
                            <span class="gradient-text">
                                <span class="ja-text">ようこそ、日本文化の世界へ</span>
                                <span class="es-text">Bienvenido al Mundo de la Cultura Japonesa</span>
                                <span class="en-text">Welcome to the World of Japanese Culture</span>
                            </span>
                        </h1>
                        
                        <p class="hero-subtitle animate-slide-up delay-1">
                            <span class="ja-text">アニメ、マンガ、フィギュア、ぬいぐるみなど、日本から直輸入の本物の商品をメキシコでお楽しみください。</span>
                            <span class="es-text">Disfruta de productos auténticos importados directamente de Japón: anime, manga, figuras, peluches y más en México.</span>
                            <span class="en-text">Enjoy authentic products imported directly from Japan: anime, manga, figures, plushies and more in Mexico.</span>
                        </p>
                        
                        <div class="hero-actions animate-slide-up delay-2">
                            <a href="products.html" class="hero-btn hero-btn-primary">
                                <i class="fas fa-shopping-bag"></i>
                                <span class="ja-text">商品を見る</span>
                                <span class="es-text">Ver Productos</span>
                                <span class="en-text">Shop Now</span>
                            </a>
                            <a href="about.html" class="hero-btn hero-btn-ghost">
                                <i class="fas fa-info-circle"></i>
                                <span class="ja-text">私たちについて</span>
                                <span class="es-text">Sobre Nosotros</span>
                                <span class="en-text">Learn More</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        main.insertBefore(this.heroSection, main.firstChild);
        this.addHeroStyles();
        this.setupHeroInteractions();
    }

    // ヒーローセクションのスタイル
    addHeroStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .hero-enhanced {
                position: relative;
                min-height: 90vh;
                display: flex;
                align-items: center;
                overflow: hidden;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .hero-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
            }
            
            .floating-elements {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
            }
            
            .floating-icon {
                position: absolute;
                font-size: 2rem;
                opacity: 0.6;
                animation: float 6s ease-in-out infinite;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
            }
            
            .floating-icon:hover {
                opacity: 1;
                transform: scale(1.2);
                animation-play-state: paused;
            }
            
            .floating-icon:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
            .floating-icon:nth-child(2) { top: 20%; right: 15%; animation-delay: 1s; }
            .floating-icon:nth-child(3) { top: 60%; left: 5%; animation-delay: 2s; }
            .floating-icon:nth-child(4) { top: 80%; right: 20%; animation-delay: 3s; }
            .floating-icon:nth-child(5) { top: 30%; left: 70%; animation-delay: 4s; }
            .floating-icon:nth-child(6) { top: 70%; left: 80%; animation-delay: 5s; }
            .floating-icon:nth-child(7) { top: 15%; left: 50%; animation-delay: 2.5s; }
            .floating-icon:nth-child(8) { top: 85%; left: 50%; animation-delay: 1.5s; }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-20px) rotate(5deg); }
                50% { transform: translateY(-10px) rotate(-5deg); }
                75% { transform: translateY(-15px) rotate(3deg); }
            }
            
            .hero-gradient-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.2);
                z-index: 2;
            }
            
            .hero-content-wrapper {
                position: relative;
                z-index: 3;
                color: white;
                text-align: center;
                max-width: 1000px;
                margin: 0 auto;
                padding: 2rem;
            }
            
            .hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                padding: 0.75rem 1.5rem;
                border-radius: 50px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                margin-bottom: 2rem;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .hero-headline {
                font-size: clamp(2.5rem, 5vw, 4rem);
                font-weight: 700;
                line-height: 1.1;
                margin-bottom: 1.5rem;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .gradient-text {
                background: linear-gradient(45deg, #fff, #f0f8ff, #fff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                animation: textShimmer 3s ease-in-out infinite;
            }
            
            @keyframes textShimmer {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            .hero-subtitle {
                font-size: 1.25rem;
                line-height: 1.6;
                margin-bottom: 3rem;
                opacity: 0.95;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            }
            
            .hero-actions {
                display: flex;
                gap: 1.5rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 4rem;
            }
            
            .hero-btn {
                display: inline-flex;
                align-items: center;
                gap: 0.75rem;
                padding: 1rem 2rem;
                border-radius: 50px;
                text-decoration: none;
                font-weight: 600;
                font-size: 1.1rem;
                transition: all 0.3s ease;
                border: 2px solid transparent;
                position: relative;
                overflow: hidden;
            }
            
            .hero-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                transition: left 0.5s ease;
            }
            
            .hero-btn:hover::before {
                left: 100%;
            }
            
            .hero-btn-primary {
                background: rgba(255, 255, 255, 0.9);
                color: var(--primary-color);
                backdrop-filter: blur(10px);
            }
            
            .hero-btn-primary:hover {
                background: white;
                transform: translateY(-3px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
            
            .hero-btn-ghost {
                color: white;
                border-color: rgba(255, 255, 255, 0.5);
                backdrop-filter: blur(10px);
            }
            
            .hero-btn-ghost:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: white;
                transform: translateY(-3px);
            }
            
            
            /* アニメーションクラス */
            .animate-fade-in {
                opacity: 0;
                animation: fadeIn 1s ease forwards;
            }
            
            .animate-slide-up {
                opacity: 0;
                transform: translateY(30px);
                animation: slideUp 1s ease forwards;
            }
            
            .delay-1 { animation-delay: 0.2s; }
            .delay-2 { animation-delay: 0.4s; }
            .delay-3 { animation-delay: 0.6s; }
            
            @keyframes fadeIn {
                to {
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* パーティクル効果 */
            .particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                animation: particle 2s linear forwards;
            }
            
            @keyframes particle {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) scale(0);
                    opacity: 0;
                }
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .hero-enhanced {
                    min-height: 80vh;
                    padding-top: 2rem;
                }
                
                .hero-content-wrapper {
                    padding: 1rem;
                }
                
                .hero-headline {
                    font-size: 2.5rem;
                }
                
                .hero-subtitle {
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                }
                
                .hero-actions {
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .hero-btn {
                    width: 100%;
                    max-width: 280px;
                    justify-content: center;
                }
                
                .floating-icon {
                    font-size: 1.5rem;
                }
            }
            
            @media (max-width: 480px) {
                .floating-icon {
                    font-size: 1.2rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ヒーローインタラクション設定
    setupHeroInteractions() {
        // 浮遊要素のクリックエフェクト
        const floatingIcons = this.heroSection.querySelectorAll('.floating-icon');
        floatingIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                this.createParticleEffect(e.clientX, e.clientY);
                this.addIconBounce(icon);
            });
        });

        // スクロールパララックス効果
        this.setupParallaxEffect();
    }

    // パーティクル効果
    createParticleEffect(x, y) {
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.animationDelay = i * 0.1 + 's';
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }

    // アイコンバウンス効果
    addIconBounce(icon) {
        icon.style.animation = 'none';
        icon.style.transform = 'scale(1.3) rotate(15deg)';
        
        setTimeout(() => {
            icon.style.transform = '';
            icon.style.animation = '';
        }, 300);
    }

    // パララックス効果
    setupParallaxEffect() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            const floatingElements = this.heroSection.querySelector('.floating-elements');
            if (floatingElements) {
                floatingElements.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // マイクロインタラクション追加
    addMicroInteractions() {
        this.enhanceButtons();
        this.addHoverEffects();
        this.setupClickFeedback();
    }

    // ボタン強化
    enhanceButtons() {
        const buttons = document.querySelectorAll('.btn, button, .hero-btn');
        
        buttons.forEach(btn => {
            // リップル効果
            btn.addEventListener('click', (e) => {
                this.createRippleEffect(e, btn);
            });
            
            // マウス追従効果
            btn.addEventListener('mousemove', (e) => {
                this.addMouseTrackingEffect(e, btn);
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.setProperty('--mouse-x', '50%');
                btn.style.setProperty('--mouse-y', '50%');
            });
        });
    }

    // リップル効果
    createRippleEffect(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    // マウス追従効果
    addMouseTrackingEffect(e, element) {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        element.style.setProperty('--mouse-x', x + '%');
        element.style.setProperty('--mouse-y', y + '%');
    }

    // ホバー効果
    addHoverEffects() {
        const cards = document.querySelectorAll('.product-card, .category-card, .card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addCardGlow(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeCardGlow(card);
            });
        });
    }

    // カードグロー効果
    addCardGlow(card) {
        card.style.boxShadow = '0 10px 30px rgba(52, 152, 219, 0.3)';
        card.style.transform = 'translateY(-5px) scale(1.02)';
    }

    removeCardGlow(card) {
        card.style.boxShadow = '';
        card.style.transform = '';
    }

    // クリックフィードバック
    setupClickFeedback() {
        document.addEventListener('click', (e) => {
            const clickable = e.target.closest('button, .btn, a, .clickable');
            if (clickable) {
                this.addClickFeedback(clickable);
            }
        });
    }

    // クリックフィードバック効果
    addClickFeedback(element) {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }

    // スクロールアニメーション設定
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // アニメーション対象要素の監視
        const animateElements = document.querySelectorAll(
            '.product-card, .category-card, .section-header, .about-content'
        );
        
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });

        this.addScrollAnimationStyles();
    }

    // スクロールアニメーションスタイル
    addScrollAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .animate-on-scroll {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease;
            }
            
            .animate-on-scroll.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* マウス追従グラデーション */
            .btn {
                background: radial-gradient(
                    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
                    rgba(255, 255, 255, 0.1) 0%,
                    transparent 70%
                ),
                var(--btn-bg, var(--primary-color));
            }
        `;
        document.head.appendChild(style);
    }

    // 浮遊要素アニメーション開始
    startFloatingElements() {
        const icons = this.heroSection.querySelectorAll('.floating-icon');
        
        icons.forEach((icon, index) => {
            // ランダムな初期位置設定
            const randomDelay = Math.random() * 2;
            icon.style.animationDelay = randomDelay + 's';
            
            // 定期的な位置変更
            setInterval(() => {
                if (!icon.matches(':hover')) {
                    this.randomizeIconPosition(icon);
                }
            }, 8000 + Math.random() * 4000);
        });
    }

    // アイコン位置ランダム化
    randomizeIconPosition(icon) {
        const newTop = Math.random() * 80 + 10; // 10-90%
        const newLeft = Math.random() * 80 + 10; // 10-90%
        
        icon.style.transition = 'all 2s ease-in-out';
        icon.style.top = newTop + '%';
        icon.style.left = newLeft + '%';
        
        setTimeout(() => {
            icon.style.transition = '';
        }, 2000);
    }

}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.heroEnhancer = new HeroEnhancer();
});