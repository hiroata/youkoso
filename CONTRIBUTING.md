# Contributing to Youkoso 🤝

## 🎯 プロジェクト概要

Youkosoは**完全機能実装済み**の日本製品オンラインストアです。現在は安定運用フェーズに入っており、メンテナンスと最適化に注力しています。

## ✅ 完了済み機能

- ヘッダー・フッター共通化システム
- モダンデザイン統一（kawaii → professional）
- PWA、SEO、レスポンシブ対応
- 動的製品カタログ（80+ items）
- 自動デプロイ（Firebase Hosting）

## 🛠️ 開発環境セットアップ

### 必要ツール
```bash
# ローカルサーバー（いずれか1つ）
python3 -m http.server 8000
npx live-server
# または VSCode Live Server 拡張機能
```

### プロジェクト構造理解
```
youkoso/
├── components/           # 共通コンポーネント
├── css/style-simple.css  # 統一スタイル
├── js/core-simple.js     # コア機能
├── data/data.json        # 製品データ
└── firebase.json         # デプロイ設定
```

## 📝 コントリビューション可能領域

### 🎨 **UI/UX改善**
- アニメーション追加
- ユーザビリティ向上
- アクセシビリティ強化

### ⚡ **パフォーマンス最適化**
- Lighthouse スコア向上
- 画像最適化
- キャッシュ戦略改善

### 🔧 **機能拡張**
- ユーザー認証システム
- 決済システム統合
- 検索機能強化

## 📋 コーディング規約

### HTML
- セマンティックタグ使用
- アクセシビリティ属性必須
- 多言語対応（es-text, ja-text クラス）

### CSS
- CSS変数活用（:root で定義済み）
- レスポンシブファースト
- コンポーネント指向

### JavaScript
- ES6+ 標準
- 非同期処理（async/await）
- エラーハンドリング必須

## 🔄 コントリビューション手順

### 1. フォーク & クローン
```bash
git clone https://github.com/your-username/youkoso.git
cd youkoso
```

### 2. ブランチ作成
```bash
git checkout -b feature/your-feature-name
```

### 3. 開発 & テスト
- ローカルでの動作確認
- 複数ブラウザでのテスト
- レスポンシブ確認

### 4. コミット
```bash
git add .
git commit -m "feat: your descriptive message"
```

### 5. プルリクエスト
- 明確な説明
- スクリーンショット添付
- 変更理由の記載

## 🔍 テスト要項

### 必須チェック項目
- [ ] ヘッダー・フッターが全ページで表示
- [ ] レスポンシブデザイン動作
- [ ] JavaScript エラーなし
- [ ] キャッシュバスティング確認（CSS?v=3）

### ブラウザ対応
- Chrome/Edge (最新)
- Firefox (最新)
- Safari (最新)
- モバイルブラウザ

## 🚨 セキュリティ

### 報告方法
セキュリティ脆弱性を発見した場合：
- **公開Issue禁止**
- プライベート報告推奨
- 責任ある開示原則

### セキュリティ実装済み
- Content Security Policy
- XSS/CSRF 保護
- セキュリティヘッダー
- HTTPS 強制

## 📞 サポート

### 質問・相談
- **GitHub Issues**: バグ報告・機能要求
- **GitHub Discussions**: 技術的相談
- **Code Review**: プルリクエストでフィードバック

### ドキュメント
- `README.md`: プロジェクト概要
- `DEVELOPMENT.md`: 技術詳細
- `CONTRIBUTING.md`: このファイル

## 🎉 コントリビューター

このプロジェクトに貢献してくださったすべての方に感謝します！

---

**プロジェクト状況**: ✅ 完全機能・本番稼働中  
**フェーズ**: 安定運用・最適化  
**最終更新**: 2025年1月14日