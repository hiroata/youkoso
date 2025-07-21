# Youkoso Project Overview 🎌

## 📁 Project Documentation

### Core Documentation
- **[README.md](README.md)** - Project overview and quick start
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development setup and guidelines
- **[CLAUDE.md](CLAUDE.md)** - AI handover document (latest project state)

### Firebase Documentation
- **[FIREBASE_SETUP.md](FIREBASE_SETUP.md)** - Firebase authentication setup
- **[FIREBASE_STORAGE_SETUP.md](FIREBASE_STORAGE_SETUP.md)** - Firebase Storage integration

### Project Guidelines
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** - Community standards
- **[SECURITY.md](SECURITY.md)** - Security policies

## 🏗️ Current Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Pure CSS with CSS Variables
- **Backend**: Firebase (Auth, Storage, Database)
- **Hosting**: Firebase Hosting
- **CI/CD**: GitHub Actions

### Key Features (January 2025)
1. **Simplified Design**: Monochrome, minimalist aesthetic
2. **Removed Features**: 
   - Hero section
   - Accessibility widget
   - Dark mode
   - Bottom navigation
3. **Active Features**:
   - Product catalog with filtering
   - Admin dashboard with Firebase auth
   - Multi-language support (ES/JA/EN)
   - Shopping cart
   - PWA capabilities

## 📂 Directory Structure

```
youkoso/
├── 📁 assets/
│   └── images/
│       ├── products/    # Product images
│       └── ui/         # UI elements
├── 📁 components/      # Shared HTML components
│   ├── header.html
│   └── footer.html
├── 📁 css/
│   ├── style-simple.css         # Main styles
│   └── *-override.css          # Feature overrides
├── 📁 data/
│   ├── data.json              # Product data
│   ├── blogs.json             # Blog content
│   └── translations.json      # i18n strings
├── 📁 js/
│   ├── core-simple.js         # Core utilities
│   ├── products-simple.js     # Product logic
│   ├── admin.js              # Admin panel
│   ├── firebase-auth.js      # Authentication
│   └── firebase-storage.js   # Image storage
├── 📄 Core Pages
│   ├── index.html            # Homepage
│   ├── products.html         # Product catalog
│   ├── admin.html           # Admin dashboard
│   └── contact.html         # Contact form
└── 📄 Configuration
    ├── firebase.json        # Firebase config
    ├── manifest.json       # PWA manifest
    └── sw.js              # Service worker
```

## 🔐 Security & Access

### Admin Access
- URL: `/admin.html`
- Legacy auth: ID=`admin`, Password=`japan2024`
- Firebase Auth integration ready

### Firebase Storage Rules
```javascript
// Public read, authenticated write
match /products/{allPaths=**} {
  allow read;
  allow write: if request.auth != null;
}
```

## 🚀 Deployment

### Automatic (Recommended)
```bash
git push origin main  # Triggers GitHub Actions
```

### Manual
```bash
firebase deploy --only hosting
```

## 📊 Performance Metrics

- **Lighthouse Score**: 90+ (Performance)
- **Page Load**: < 3s (3G network)
- **First Paint**: < 1.5s
- **Bundle Size**: < 500KB (excluding images)

## 🐛 Known Issues

1. **Firebase Config**: API keys need to be added
2. **Image Optimization**: Some product images need compression
3. **Cache Management**: Browser cache may need manual clearing

## 🔄 Recent Updates (January 2025)

1. ✅ Removed hero section completely
2. ✅ Disabled accessibility features
3. ✅ Removed dark mode toggle
4. ✅ Simplified to monochrome design
5. ✅ Added Firebase Storage integration
6. ✅ Fixed JavaScript errors
7. ✅ Cleaned up unused files

## 📞 Quick Links

- **Live Site**: [https://youkoso-3d911.web.app](https://youkoso-3d911.web.app)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **GitHub Actions**: Check `.github/workflows/`

## 💡 Development Tips

1. **Local Server**: Use `python3 -m http.server 8000`
2. **Clear Cache**: Add `?v=X` to CSS/JS files
3. **Debug Mode**: Check console for helper functions
4. **Test Firebase**: Use `test-firebase-storage.html`

---

Last Updated: January 22, 2025