# Youkoso - Tienda de Productos Japoneses 🎌

[![Deploy to Firebase](https://github.com/hiroata/youkoso/actions/workflows/firebase-hosting-deploy.yml/badge.svg)](https://github.com/hiroata/youkoso/actions/workflows/firebase-hosting-deploy.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fyoukoso-3d911.web.app)](https://youkoso-3d911.web.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> 🔥 **Firebase Hosting Auto-Deploy Ready** - 自動デプロイ設定完了！

## 📖 Descripción

**Youkoso** (ようこそ - "Bienvenido" en japonés) es una tienda en línea especializada en productos japoneses auténticos en México. Ofrecemos una amplia selección de artículos de anime, manga, figuras, peluches y productos culturales japoneses.

### 🌟 Características

- **Productos Auténticos**: Artículos originales directamente de Japón
- **Amplio Catálogo**: Anime, manga, figuras, peluches, y productos culturales
- **Interfaz Moderna**: Diseño responsivo y optimizado para móviles
- **SEO Optimizado**: Metaetiquetas completas y estructura semántica
- **PWA Ready**: Funcionalidad de aplicación web progresiva
- **Multiidioma**: Soporte para español y japonés

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Diseño**: CSS Grid, Flexbox, Responsive Design
- **PWA**: Service Worker, Web App Manifest
- **SEO**: Open Graph, Twitter Cards, JSON-LD
- **Deploy**: Firebase Hosting con GitHub Actions

## 📂 Estructura del Proyecto

```text
youkoso/
├── index.html              # Página principal
├── products.html           # Catálogo de productos
├── product-detail.html     # Detalle de producto
├── blog.html              # Blog principal
├── contact.html           # Página de contacto
├── about.html             # Acerca de nosotros
├── admin.html             # Panel administrativo
├── assets/
│   ├── images/            # Imágenes del sitio
│   │   ├── products/      # Imágenes de productos
│   │   ├── blog/          # Imágenes del blog
│   │   └── ui/            # Elementos de interfaz
├── css/
│   └── style.css          # Estilos principales
├── js/
│   ├── main.js            # Lógica principal
│   ├── products.js        # Gestión de productos
│   ├── blog.js            # Funcionalidad del blog
│   └── core.js            # Funciones core
├── data/
│   ├── data.json          # Datos de productos
│   ├── blogs.json         # Contenido del blog
│   └── translations.json  # Traducciones
├── package.json           # Configuración de dependencias
├── firebase.json          # Configuración de Firebase Hosting
├── .firebaserc            # Configuración de proyecto Firebase
├── manifest.json          # Web App Manifest
├── sw.js                  # Service Worker
└── .github/
    └── workflows/
        └── firebase-hosting-deploy.yml  # GitHub Actions
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Navegador web moderno
- Node.js (v16 o superior)
- Firebase CLI (opcional para desarrollo local)

### Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/hiroata/youkoso.git
   cd youkoso
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   ```

3. **Inicia un servidor local**

   ```bash
   # Con npm script
   npm run dev
   
   # Con Firebase CLI (recomendado)
   npm run firebase:serve
   
   # Con Python
   python -m http.server 8000
   ```

4. **Abre en el navegador**

   ```text
   http://localhost:3000    # npm run dev
   http://localhost:5000    # firebase serve
   http://localhost:8000    # python server
   ```

## 📱 PWA (Progressive Web App)

El sitio funciona como una PWA con las siguientes características:

- **Instalable**: Se puede instalar como una app en dispositivos móviles
- **Offline**: Funcionalidad básica disponible sin conexión
- **Responsive**: Optimizado para todos los tamaños de pantalla
- **Fast**: Carga rápida con Service Worker

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run start            # Servidor de producción (puerto 8080)
npm run firebase:serve   # Servidor Firebase local
npm run firebase:deploy  # Deploy manual a Firebase
```

### Configuración de Variables

Para el deploy en Firebase, asegúrate de tener configuradas las siguientes variables en GitHub Secrets:

```env
FIREBASE_SERVICE_ACCOUNT_YOUKOSO_3D911=tu_service_account_json
```

## � Firebase Hosting

Este proyecto está desplegado en Firebase Hosting, que ofrece:

### Características de Firebase Hosting

- **CDN Global**: Entrega rápida de contenido en todo el mundo
- **SSL Automático**: HTTPS habilitado por defecto
- **Dominio Personalizado**: Soporte para dominios custom
- **Cache Inteligente**: Optimización automática de assets
- **Headers de Seguridad**: Configuración avanzada de seguridad
- **Rollback Rápido**: Capacidad de revertir deployments
- **Preview Channels**: URLs de preview para testing

### Configuración del Proyecto

```json
{
  "hosting": {
    "public": ".",
    "cleanUrls": true,
    "trailingSlash": false,
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options", 
            "value": "DENY"
          }
        ]
      }
    ]
  }
}
```

## �🚀 Deploy

### Deploy Automático

El proyecto se despliega automáticamente en Firebase Hosting mediante GitHub Actions:

- **Push a `main`**: Deploy a producción
- **Pull Request**: Preview del deploy (opcional)

### Deploy Manual

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Deploy
npm run firebase:deploy
# o
firebase deploy
```

## 📊 Características del Proyecto

### SEO y Performance

- ✅ Meta tags optimizados
- ✅ Open Graph completo
- ✅ JSON-LD structured data
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Imágenes optimizadas
- ✅ Lazy loading

### Funcionalidades

- 🛒 Catálogo de productos interactivo
- 📝 Sistema de blog integrado
- 📞 Formulario de contacto
- 🔍 Búsqueda de productos
- 🏷️ Filtros por categoría
- 📱 Diseño móvil-first
- 🌐 Soporte multiidioma

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **Website**: [youkoso-3d911.web.app](https://youkoso-3d911.web.app)
- **GitHub**: [@hiroata](https://github.com/hiroata)
- **Email**: [contacto@youkoso.mx](mailto:contacto@youkoso.mx)

## 🙏 Agradecimientos

- Productos y marcas japonesas por la inspiración
- Comunidad anime y manga de México
- Contribuidores y usuarios de la plataforma

---

**¡ようこそ (Youkoso) - Bienvenidos a la cultura japonesa en México!** 🇯🇵🇲🇽
