# Youkoso - 日本製品オンラインストア 🎌

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fyoukoso-3d911.web.app)](https://youkoso-3d911.web.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> ✅ **プロジェクト完全完了** - モダンデザイン、PWA、自動デプロイ、ヘッダー・フッター共通化
> 🎨 **デザイン完全統一** - プロフェッショナルなモダンデザインに統一済み

## 📖 概要

**Youkoso**（ようこそ）は、メキシコ向けの本格的な日本製品オンラインストアです。2025年1月に大幅な簡素化を実施し、シンプルで洗練されたモノクロームデザインに統一しました。不要な機能を削除し、コアな商品販売機能に集中した構成になっています。

## 🌟 実装済み機能

### ✅ **コア機能**
- **ヘッダー・フッター共通化**: 全ページで統一されたレイアウト
- **動的カタログ**: 80+ 製品、自動画像生成システム
- **Eコマース機能**: カート、製品詳細、完全なナビゲーション
- **文化ブログ**: 日本文化に関する5記事
- **PWA対応**: インストール可能、オフライン対応

### ✅ **技術実装**
- **レスポンシブデザイン**: モバイルファースト
- **SEO最適化**: メタタグ、JSON-LD、サイトマップ
- **自動デプロイ**: GitHub Actions + Firebase Hosting
- **キャッシュ最適化**: Service Worker、バージョン管理

## 🛠️ 技術スタック

### フロントエンド
```
HTML5    - セマンティック、アクセシブル
CSS3     - CSS変数、Grid、Flexbox、アニメーション
JS ES6+  - モジュール、Fetch API、localStorage
PWA      - Service Worker、Web App Manifest
```

### インフラ
```
Firebase Hosting  - グローバルCDN
GitHub Actions   - CI/CD自動デプロイ
Unsplash API     - 動的画像生成
```

## 📂 プロジェクト構造

```
youkoso/
├── 📄 主要ページ
│   ├── index.html              # ランディングページ
│   ├── products.html           # 製品一覧
│   ├── product-detail.html     # 製品詳細
│   ├── blog.html               # ブログ一覧
│   ├── contact.html            # お問い合わせ
│   └── admin.html              # 管理画面
│
├── 🧩 共通コンポーネント
│   └── components/
│       ├── header.html         # 共通ヘッダー
│       └── footer.html         # 共通フッター
│
├── 🎨 スタイル・スクリプト
│   ├── css/
│   │   └── style-simple.css    # 統一スタイル
│   └── js/
│       ├── core-simple.js      # コア機能
│       ├── main-simple.js      # ホームページ
│       └── products-simple.js  # 製品ページ
│
├── 📊 データ
│   ├── data/data.json          # 製品データ
│   └── data/blogs.json         # ブログデータ
│
└── ⚙️ 設定
    ├── firebase.json           # Firebase設定
    ├── manifest.json           # PWA設定
    └── sw.js                   # Service Worker
```

## 🎨 デザインシステム

### 色彩設計
```css
/* メインカラー */
--primary-color: #2c3e50      /* ダークブルー */
--accent-color: #3498db       /* ブライトブルー */

/* テキスト */
--text-color: #2c3e50         /* メインテキスト */
--text-light: #7f8c8d         /* セカンダリテキスト */

/* 背景 */
--bg-color: #ffffff           /* メイン背景 */
--bg-light: #f8f9fa           /* セカンダリ背景 */
```

### タイポグラフィ
```css
/* フォント */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI'

/* 日本語フォント */
font-family: 'Noto Sans JP', 'Inter', sans-serif
```

## 🔧 最近の重要な更新

### デザイン簡素化 (2025-01-15)
- **ヒーローセクション削除**: 紫色背景と浮遊アイコンを完全削除
- **アクセシビリティ機能削除**: 青い浮遊ボタンと関連機能を削除
- **ダークモード削除**: テーマ切り替え機能を削除、ライトモードのみ
- **商品ページ簡素化**: モノクロームでシンプルなデザインに統一
- **モバイルナビ削除**: フッター下部の5つのアイコンナビゲーションを削除

### 管理者機能強化 (2025-01-15)
- **Firebase認証統合**: 現代的な認証システムを実装
- **管理者ログイン**: フッターに控えめなリンクを配置
- **セキュリティ向上**: 旧認証からFirebase認証へ移行

### ヘッダー・フッター共通化 (2025-01-14)
- 全HTMLページでヘッダー・フッターを共通コンポーネント化
- `components/header.html` と `components/footer.html` を作成
- JavaScript動的読み込みで保守性向上
- ナビゲーションのアクティブクラス自動設定

## 🚀 デプロイ & セットアップ

### ローカル開発
```bash
# ローカルサーバー起動
python3 -m http.server 8000
# または
npx live-server
```

### 本番環境
- **URL**: https://youkoso-3d911.web.app
- **自動デプロイ**: main ブランチへのpush時
- **CDN**: Firebase Hosting グローバル配信

## 📱 PWA機能

- **インストール可能**: ホーム画面に追加
- **オフライン対応**: Service Worker でキャッシュ
- **レスポンシブ**: 全デバイス対応
- **高速読み込み**: 最適化済みアセット

## 🎯 パフォーマンス

- **Lighthouse スコア**: 90+ (全項目)
- **画像最適化**: 遅延読み込み、WebP対応
- **コード分割**: ページ別最適化
- **キャッシュ戦略**: 効率的なリソース管理

## 🔐 セキュリティ

- **CSP**: Content Security Policy実装
- **HTTPS**: 全通信暗号化
- **セキュリティヘッダー**: 包括的な保護

## 📞 サポート

- **バグ報告**: GitHub Issues
- **機能要求**: GitHub Discussions
- **技術的質問**: コードコメント参照

---

**最終更新**: 2025年1月15日
**ステータス**: ✅ 本番稼働中、完全機能（簡素化済み）
**次期バージョン**: 安定運用フェーズ