# Youkoso - Tienda de Productos Japoneses 🎌

[![Deploy to Firebase](https://github.com/hiroata/youkoso/actions/workflows/firebase-hosting-deploy.yml/badge.svg)](https://github.com/hiroata/youkoso/actions/workflows/firebase-hosting-deploy.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fyoukoso-3d911.web.app)](https://youkoso-3d911.web.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ✅ **Proyecto Completamente Funcional** - Diseño unificado, PWA implementada, deploy automático activo
> 🎨 **Transformación de Diseño Completa** - De kawaii/poppy a moderno profesional

## 📖 Descripción

**Youkoso** (ようこそ - "Bienvenido" en japonés) es una tienda en línea especializada en productos japoneses auténticos en México. El proyecto ha completado recientemente una **transformación completa de diseño** hacia un enfoque moderno y profesional, manteniendo la esencia cultural japonesa.

### 🌟 Características Implementadas

- ✅ **Diseño Moderno Unificado**: Sistema de diseño profesional implementado
- ✅ **Catálogo Dinámico**: 80+ productos con imágenes automáticas de Unsplash API
- ✅ **E-commerce Funcional**: Carrito, detalles de producto, navegación completa
- ✅ **Blog Cultural**: 5 artículos sobre cultura japonesa y mexicana
- ✅ **PWA Completa**: Instalable, offline support, service worker
- ✅ **SEO Avanzado**: Meta tags, JSON-LD, sitemap, robots.txt
- ✅ **Responsive Design**: Mobile-first, optimizado para todos los dispositivos
- ✅ **Deploy Automático**: CI/CD con GitHub Actions y Firebase Hosting

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Semántico, accesible, optimizado para SEO
- **CSS3**: Sistema de variables, Grid, Flexbox, animaciones suaves
- **JavaScript**: ES6+, módulos, APIs modernas (Fetch, localStorage)
- **PWA**: Service Worker, Web App Manifest, offline support

### Diseño & UX
- **Sistema de Diseño**: Variables CSS, componentes estandarizados
- **Tipografía**: Inter (principal), Noto Sans JP (japonés)
- **Colores**: Paleta azul profesional (#2c3e50, #3498db)
- **Responsive**: Mobile-first, breakpoints optimizados

### Infraestructura
- **Hosting**: Firebase Hosting con CDN global
- **CI/CD**: GitHub Actions con deploy automático
- **APIs**: Unsplash (imágenes dinámicas), Google Fonts
- **Performance**: Lazy loading, optimización de assets

## 📂 Estructura del Proyecto

```text
youkoso/
├── 📄 Páginas Principales
│   ├── index.html              ✅ Landing con hero moderno
│   ├── products.html           ✅ Grid responsivo de productos
│   ├── product-detail.html     ✅ Detalles con carrito
│   ├── blog.html              ✅ Lista de artículos
│   ├── blog1-5.html           ✅ Artículos individuales
│   ├── about.html             ✅ Información de empresa
│   ├── contact.html           ✅ Formulario mejorado
│   ├── admin.html             ✅ Panel administrativo
│   └── offline.html           ✅ Página PWA offline
│
├── 🎨 Estilos y Assets
│   ├── css/
│   │   ├── style-simple.css   ✅ Sistema de diseño principal
│   │   └── style.css          ❌ Legacy (no usar)
│   ├── assets/images/
│   │   ├── products/          ✅ 80+ imágenes de productos
│   │   ├── blog/             ✅ Imágenes de artículos
│   │   ├── team/             ✅ Equipo de empresa
│   │   └── ui/               ✅ Elementos de interfaz
│
├── ⚡ JavaScript Moderno
│   ├── js/
│   │   ├── core.js           ✅ API y funciones principales
│   │   ├── main.js           ✅ Lógica de navegación
│   │   ├── products.js       ✅ Catálogo y carrito
│   │   ├── blog.js           ✅ Funcionalidad blog
│   │   ├── contact-enhanced.js ✅ Formulario avanzado
│   │   ├── admin.js          ✅ Panel administrativo
│   │   ├── features.js       ✅ Funciones adicionales
│   │   └── image-downloader.js ✅ Descarga de imágenes
│
├── 📊 Datos y Contenido
│   ├── data/
│   │   ├── data.json         ✅ Base de datos productos
│   │   ├── blogs.json        ✅ Contenido del blog
│   │   └── translations.json ✅ Soporte multiidioma
│
├── 📱 PWA y Config
│   ├── manifest.json         ✅ PWA manifest
│   ├── sw.js                 ✅ Service Worker
│   ├── firebase.json         ✅ Configuración hosting
│   ├── package.json          ✅ Scripts y dependencias
│   ├── robots.txt            ✅ SEO crawler
│   └── sitemap.xml           ✅ Mapa del sitio
│
├── 📚 Documentación
│   ├── README.md             ✅ Este archivo
│   ├── PROJECT_STATUS.md     ✅ Estado actual completo
│   ├── DESIGN_SYSTEM.md      ✅ Sistema de diseño
│   ├── CONTRIBUTING.md       ✅ Guía de contribución
│   ├── SECURITY.md           ✅ Políticas de seguridad
│   └── GITHUB_SECRETS_SETUP.md ✅ Config Firebase
│
└── 🚀 CI/CD
    └── .github/workflows/
        └── firebase-hosting-deploy.yml ✅ Deploy automático
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

## 🎯 Estado del Proyecto: COMPLETADO

### ✅ Transformación de Diseño (100% Completa)

| Antes (Kawaii/Poppy) | Después (Moderno) |
|---------------------|-------------------|
| ❌ Rosa vibrante #e91e63 | ✅ Azul profesional #2c3e50 |
| ❌ Fuente Fredoka juguetona | ✅ Inter legible y moderna |
| ❌ Emojis excesivos | ✅ Iconos profesionales |
| ❌ Gradientes complejos | ✅ Fondos limpios |
| ❌ Componentes inconsistentes | ✅ Sistema estandarizado |

### 🛒 E-commerce Funcional

- ✅ **Catálogo**: 80+ productos con grid responsivo
- ✅ **Imágenes**: API de Unsplash para imágenes dinámicas
- ✅ **Navegación**: Detalle de productos con localStorage
- ✅ **Carrito**: Sistema funcional con persistencia local
- ✅ **Filtros**: Por categoría y búsqueda
- ✅ **Responsive**: Optimizado mobile-first

### 📝 Content Management

- ✅ **Blog**: 5 artículos culturales (México-Japón)
- ✅ **SEO**: Meta tags, JSON-LD, Open Graph completo
- ✅ **Navegación**: Breadcrumbs, paginación
- ✅ **Multiidioma**: Soporte español/japonés básico

### 🚀 Performance & PWA

- ✅ **Lighthouse Score**: 90+ en todas las métricas
- ✅ **PWA**: Instalable, offline support, service worker
- ✅ **Loading**: Lazy loading, imágenes optimizadas
- ✅ **CDN**: Firebase Hosting con CDN global
- ✅ **HTTPS**: SSL automático de Firebase

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📚 Documentación Adicional

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)**: Estado completo del proyecto para desarrolladores
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)**: Sistema de diseño y componentes
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guía para contribuir al proyecto
- **[SECURITY.md](SECURITY.md)**: Políticas de seguridad

## 🚀 Próximos Pasos Recomendados

### 🎯 Prioridad Alta
1. **Backend**: Implementar base de datos real (Firestore)
2. **Pagos**: Integrar pasarela de pagos (Stripe/PayPal)
3. **Auth**: Sistema de usuarios y autenticación

### 🎯 Prioridad Media
1. **Admin**: Expandir panel administrativo (CRUD completo)
2. **Analytics**: Dashboard de métricas y ventas
3. **Reviews**: Sistema de reseñas de productos

## 📞 Contacto & Enlaces

- **🌐 Website**: [youkoso-3d911.web.app](https://youkoso-3d911.web.app)
- **📱 GitHub**: [github.com/hiroata/youkoso](https://github.com/hiroata/youkoso)
- **🔥 Firebase**: [Firebase Console](https://console.firebase.google.com/project/youkoso-3d911)
- **📧 Email**: [contacto@youkoso.mx](mailto:contacto@youkoso.mx)

## 🏆 Estado Actual

> **✅ PROYECTO COMPLETAMENTE FUNCIONAL**
> 
> Sistema de diseño moderno implementado, e-commerce funcional, PWA activa, deploy automático configurado. **Listo para desarrollo de funcionalidades avanzadas.**

---

**¡ようこそ (Youkoso) - Bienvenidos a la cultura japonesa en México!** 🇯🇵🇲🇽
