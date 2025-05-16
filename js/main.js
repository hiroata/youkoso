// メインJavaScriptファイル

// DOMがロードされた後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hola Japón - Sitio web cargado');
    
    // ヘッダーのスクロール効果
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // ソーシャルメディアアイコンのロード
    loadSocialIcons();
});

// ソーシャルメディアアイコンを読み込む関数
function loadSocialIcons() {
    // ソーシャルアイコンの配列
    const socialIcons = [
        { name: 'facebook', url: 'https://facebook.com/holajapon' },
        { name: 'instagram', url: 'https://instagram.com/holajapon' },
        { name: 'twitter', url: 'https://twitter.com/holajapon' }
    ];
    
    const socialLinksContainers = document.querySelectorAll('.social-links');
    
    // 一時的に簡単なアイコンを使用（実際はアイコン画像をassetsフォルダに配置する）
    socialLinksContainers.forEach(container => {
        // 既存のリンクをクリア
        container.innerHTML = '';
        
        // 各ソーシャルメディアのアイコンを追加
        socialIcons.forEach(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = `<span class="social-icon ${social.name}">${social.name.charAt(0).toUpperCase()}</span>`;
            container.appendChild(link);
        });
    });
}

// URLパラメータを取得する関数
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// 要素の表示・非表示を切り替える関数
function toggleVisibility(element, isVisible) {
    if (element) {
        element.style.display = isVisible ? 'block' : 'none';
    }
}

// お客様の声をランダムに表示する関数
function displayRandomTestimonials(count = 3) {
    // お客様の声のデータ（後でJSONファイルから読み込む）
    const testimonials = [
        {
            id: 1,
            name: "Carlos Rodríguez",
            location: "Ciudad de México",
            avatar: "../assets/images/ui/avatar-1.jpg",
            comment: "¡Los productos llegaron perfectamente empaquetados! Mi colección de figuras de anime ha crecido gracias a Hola Japón. El envío fue rápido y seguro."
        },
        {
            id: 2,
            name: "Alejandra Morales",
            location: "Guadalajara",
            avatar: "../assets/images/ui/avatar-2.jpg",
            comment: "Encontré mangas que no pude conseguir en ninguna otra tienda. La calidad es excelente y los precios son muy razonables. ¡Volveré a comprar seguro!"
        },
        {
            id: 3,
            name: "Miguel Ángel Pérez",
            location: "Monterrey",
            avatar: "../assets/images/ui/avatar-3.jpg",
            comment: "Como fan de Dragon Ball, estaba buscando figuras auténticas y no falsificaciones. En Hola Japón encontré exactamente lo que buscaba. ¡Súper recomendado!"
        },
        {
            id: 4,
            name: "Laura Torres",
            location: "Puebla",
            avatar: "../assets/images/ui/avatar-4.jpg",
            comment: "Pedí varios peluches kawaii para mi hija y está encantada. El material es muy suave y los colores son vibrantes. El servicio al cliente también es excelente."
        },
        {
            id: 5,
            name: "Fernando Gutiérrez",
            location: "Cancún",
            avatar: "../assets/images/ui/avatar-5.jpg",
            comment: "Los videojuegos llegaron en perfecto estado y son originales. Los precios son competitivos y el envío fue muy rápido. ¡Definitivamente mi tienda favorita!"
        }
    ];
    
    const testimonialSlider = document.getElementById('testimonial-slider');
    if (!testimonialSlider) return;
    
    // 要素をランダムに並べ替え
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);
    
    // スライダーに追加
    testimonialSlider.innerHTML = '';
    selected.forEach(item => {
        testimonialSlider.innerHTML += `
            <div class="testimonial-card">
                <div class="testimonial-content">
                    "${item.comment}"
                </div>
                <div class="testimonial-author">
                    <div class="testimonial-avatar" style="background-image: url(${item.avatar})"></div>
                    <div class="testimonial-author-info">
                        <h4>${item.name}</h4>
                        <p>${item.location}</p>
                    </div>
                </div>
            </div>
        `;
    });
}

// ページが読み込まれたときに実行
window.addEventListener('load', function() {
    // お客様の声を表示
    displayRandomTestimonials(3);
});
