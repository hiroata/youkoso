# CLAUDE.md - AI引き継ぎドキュメント 🤖

## 📌 プロジェクト現在の状態（2025年1月22日）

### 🏁 完了した主要変更

1. **ヒーローセクション削除** ✅
   - 紫色の背景と浮遊する日本文化アイコンを完全削除
   - 統計セクション（商品数、お客様、配送国、満足度）を削除
   - `js/hero-enhanced.js`を無効化
   - `css/hero-override.css`でCSSレベルでも非表示に

2. **アクセシビリティ機能削除** ✅
   - 青い浮遊ボタンと関連機能を削除
   - `js/accessibility.js`をコメントアウト
   - `css/accessibility-override.css`で完全非表示

3. **ダークモード機能削除** ✅
   - ヘッダーからテーマトグルボタンを削除
   - JavaScript（core-simple.js）から関連コードを削除
   - CSS変数定義を削除

4. **管理者ログイン改善** ✅
   - Firebase認証システムを実装（`js/firebase-auth.js`）
   - admin.htmlをメールベースのログインに更新
   - フッターに控えめなリンクを維持
   - 旧認証: ID=admin, Password=japan2024

5. **デザインのシンプル化** ✅
   - products.htmlをシックなモノクロームデザインに変更
   - `css/products-override-v2.css`で積極的なスタイル上書き
   - カラフルな要素とアニメーションを削除

6. **モバイルボトムナビゲーション削除** ✅
   - フッター下部の5つのアイコンナビゲーションを削除
   - `js/mobile-enhanced.js`で機能を無効化
   - `css/bottom-nav-override.css`で非表示

7. **Firebase Storage統合** ✅
   - 商品画像をFirebase Storageで管理
   - 自動アップロード機能実装
   - 画像圧縮機能（1MB以上）
   - プログレスバー表示

8. **コードクリーンアップ** ✅
   - 未使用ファイル削除（accessibility.js, hero-enhanced.js, filter-enhanced.js）
   - JavaScriptエラー修正
   - console.log文の整理

## 🗂️ プロジェクト構造

```
youkoso/
├── 📄 メインページ
│   ├── index.html          # ホームページ（ヒーロー削除済み）
│   ├── products.html       # 商品一覧（シックなデザイン）
│   ├── admin.html          # 管理画面（Firebase認証）
│   └── contact.html        # お問い合わせ
│
├── 🧩 共通コンポーネント
│   ├── components/
│   │   ├── header.html     # ヘッダー（ダークモード削除済み）
│   │   └── footer.html     # フッター（管理者リンク含む）
│   │
├── 🎨 スタイルシート
│   ├── css/
│   │   ├── style-simple.css            # メインスタイル
│   │   ├── hero-override.css           # ヒーロー無効化
│   │   ├── accessibility-override.css  # アクセシビリティ無効化
│   │   ├── products-override-v2.css    # 商品ページシンプル化
│   │   ├── admin-link-highlight.css    # 管理者リンク調整
│   │   └── bottom-nav-override.css     # ボトムナビ無効化
│   │
├── ⚡ JavaScript
│   ├── js/
│   │   ├── core-simple.js      # コア機能（ダークモード削除済み）
│   │   ├── firebase-auth.js    # Firebase認証システム
│   │   ├── hero-enhanced.js    # ヒーロー機能（無効化）
│   │   ├── remove-hero.js      # ヒーロー削除スクリプト
│   │   └── mobile-enhanced.js  # モバイル機能（ボトムナビ無効）
│   │
└── 📚 ドキュメント
    ├── README.md               # プロジェクト概要
    ├── CLAUDE.md              # このファイル
    ├── DEVELOPMENT.md         # 開発ガイド
    ├── FIREBASE_SETUP.md      # Firebase設定ガイド
    └── CONTRIBUTING.md        # 貢献ガイド
```

## 🛠️ 技術的な詳細

### 削除された機能の無効化方法

1. **JavaScript機能の無効化**
   ```javascript
   // コメントアウトで無効化
   // <script src="js/accessibility.js"></script>
   
   // 関数呼び出しの無効化
   // this.addBottomNavigation();
   ```

2. **CSS上書きパターン**
   ```css
   /* 完全非表示パターン */
   .unwanted-element {
       display: none !important;
       visibility: hidden !important;
       opacity: 0 !important;
   }
   ```

3. **HTML要素の削除**
   - 直接HTMLから削除、またはJavaScriptで動的削除

### 現在の色彩設計

```css
/* ライトモードのみ（ダークモード削除済み） */
--primary-color: #2c3e50;    /* ダークブルー */
--accent-color: #3498db;     /* ブライトブルー */
--text-color: #2c3e50;       /* メインテキスト */
--bg-color: #ffffff;         /* 背景白 */
```

## ⚠️ 注意事項

### 重要な制約

1. **削除された機能を復活させない**
   - ヒーローセクション
   - アクセシビリティ機能
   - ダークモード
   - モバイルボトムナビゲーション

2. **デザインの方向性**
   - シンプル、ミニマル、モノクローム
   - カラフルな要素やアニメーションは避ける
   - プロフェッショナルな外観を維持

3. **Firebase設定**
   - 実際のAPIキーは`js/firebase-auth.js`に追加必要
   - FIREBASE_SETUP.mdの手順に従って設定

## 🔄 最近の変更履歴

### 2025年1月22日
- Firebase Storage統合完了
- 商品画像の自動アップロード機能実装
- JavaScriptエラー修正（未使用ファイル削除）
- ドキュメント統廃合とブラッシュアップ

### 2025年1月15日
- ヒーローセクション完全削除
- アクセシビリティ機能削除
- ダークモード機能削除
- 商品ページのデザインをシンプル化
- モバイルボトムナビゲーション削除
- 管理者ログインリンクを控えめに調整

## 📋 今後の推奨タスク

### 短期的な改善
1. **パフォーマンス最適化**
   - 不要なJavaScriptファイルの完全削除
   - CSSファイルの統合と最小化
   - 画像の最適化とWebP対応

2. **コードクリーンアップ**
   - コメントアウトされたコードの削除
   - 未使用のCSSクラスの削除
   - JavaScriptの最適化

### 長期的な検討事項
1. **機能追加**
   - 在庫管理システム
   - 注文管理機能
   - レビューシステム

2. **技術的アップグレード**
   - TypeScript導入
   - ビルドシステム（Webpack/Vite）
   - テストフレームワーク

## 🚨 既知の問題

1. **Firebase設定未完了**
   - APIキーの設定が必要（firebase-auth.js内のプレースホルダーを置換）
   - 本番環境でのセキュリティルール設定

2. **パフォーマンス最適化**
   - 一部の画像が最適化されていない
   - 大量のDOMクエリがキャッシュされていない

## 💡 開発のヒント

### ローカル開発
```bash
# Python
python3 -m http.server 8000

# Node.js
npx live-server
```

### デバッグ
```javascript
// ヘッダー・フッター読み込み確認
console.log(document.getElementById('header-placeholder'));
utils.loadHeaderFooter();
```

### キャッシュクリア
- ブラウザ: Ctrl+Shift+R
- CSS/JS: バージョンパラメータ更新（?v=4）

## 📞 連絡先とリソース

- **プロジェクトURL**: https://youkoso-3d911.web.app
- **GitHub Actions**: 自動デプロイ設定済み
- **Firebase Console**: 認証とホスティング管理

---

**最終更新**: 2025年1月22日  
**作成者**: Claude Assistant  
**目的**: 次のAIアシスタントへの引き継ぎ

## 📎 関連ドキュメント

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - プロジェクト全体の概要
- [FIREBASE_STORAGE_SETUP.md](FIREBASE_STORAGE_SETUP.md) - Firebase Storage設定ガイド
- [DEVELOPMENT.md](DEVELOPMENT.md) - 開発環境セットアップ