# Security Policy 🔒

## サポート対象バージョン

| Version | Supported |
|---------|-----------|
| 1.x.x   | ✅ Yes    |
| < 1.0   | ❌ No     |

## セキュリティ脆弱性の報告

### 報告方法
セキュリティ脆弱性を発見した場合：
- **GitHub Security Advisory** を使用してプライベート報告
- **公開Issue作成は禁止** - 責任ある開示にご協力ください

### 実装済みセキュリティ対策

#### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
    font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
    img-src 'self' data: https:;
">
```

#### セキュリティヘッダー
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff  
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

#### HTTPS強制
- Firebase Hosting による自動HTTPS
- HTTP → HTTPS リダイレクト
- HSTS（HTTP Strict Transport Security）

### 脆弱性対応プロセス

1. **報告受理** - 24時間以内に確認
2. **影響評価** - 72時間以内に初期評価
3. **修正開発** - 重要度に応じて1-7日
4. **リリース** - 自動デプロイメント
5. **開示** - 修正後に詳細公開

### 責任ある開示

セキュリティ研究者の皆様へ：
- **プライベート報告を推奨**
- 修正前の公開開示はご遠慮ください
- 貢献者として適切にクレジット

---

**最終更新**: 2025年1月14日  
**セキュリティ担当**: Development Team