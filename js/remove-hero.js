// ヒーローセクションとアクセシビリティ機能を削除するスクリプト
document.addEventListener('DOMContentLoaded', () => {
    // ヒーローセクションに関連する可能性のある要素をすべて削除
    const heroSelectors = [
        '.hero-enhanced',
        '.hero-modern', 
        '.hero',
        '.hero-section',
        '.hero-wrapper',
        '.hero-container',
        '[class*="hero-"]',
        'section:first-child' // メインコンテンツ内の最初のセクション（ヒーローの可能性が高い）
    ];
    
    heroSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // ヒーローセクションの特徴を持つ要素のみ削除
            const hasHeroContent = 
                element.textContent.includes('Welcome to the World') ||
                element.textContent.includes('ようこそ') ||
                element.textContent.includes('Japanese Culture') ||
                element.querySelector('.floating-icon') ||
                element.querySelector('.hero-btn') ||
                element.classList.contains('hero-enhanced');
                
            if (hasHeroContent) {
                console.log('Removing hero section:', element);
                element.remove();
            }
        });
    });
    
    // 浮遊要素も削除
    const floatingElements = document.querySelectorAll('.floating-elements, .floating-icon');
    floatingElements.forEach(el => el.remove());
    
    // アクセシビリティ関連要素を削除
    const accessibilityElements = [
        '.accessibility-controls',
        '.accessibility-menu',
        '.accessibility-toggle',
        '#accessibility-toggle',
        '#accessibility-menu',
        '.skip-link',
        '#live-region',
        '.keyboard-help-modal'
    ];
    
    accessibilityElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            console.log('Removing accessibility element:', el);
            el.remove();
        });
    });
    
    // アクセシビリティ関連のクラスを削除
    document.body.classList.remove('high-contrast', 'font-large', 'font-xlarge', 'screen-reader-mode');
});