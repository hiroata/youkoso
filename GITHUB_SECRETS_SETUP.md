# GitHub Secrets設定手順

## Firebase自動デプロイの設定

### 1. GitHubリポジトリにアクセス
https://github.com/hiroata/youkoso

### 2. Settings タブをクリック

### 3. 左サイドバーで "Secrets and variables" > "Actions" をクリック

### 4. "New repository secret" ボタンをクリック

### 5. 以下の情報を入力:

**Name:**
```
FIREBASE_SERVICE_ACCOUNT_YOUKOSO_3D911
```

**Secret (サービスアカウントキーのJSONをそのまま貼り付け):**
```json
{
  "type": "service_account",
  "project_id": "youkoso-3d911",
  "private_key_id": "YOUR_PRIVATE_KEY_ID",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@youkoso-3d911.iam.gserviceaccount.com",
  "client_id": "YOUR_CLIENT_ID",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40youkoso-3d911.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

⚠️ **注意**: 実際のサービスアカウントキーの値は既に提供されたJSONファイルから取得してください。

### 6. "Add secret" ボタンをクリック

## 確認方法

### 1. GitHubリポジトリの "Actions" タブで自動デプロイが動作することを確認

### 2. 次回のPushで自動的にFirebaseにデプロイされることを確認

### 3. デプロイ後のサイト確認URL
https://youkoso-3d911.web.app

---

## ⚠️ セキュリティ重要事項

- このサービスアカウントキーは機密情報です
- 絶対に公開リポジトリや不適切な場所に保存しないでください
- GitHub Secretsは暗号化されて安全に保存されます
- 必要に応じて新しいサービスアカウントキーを生成し、古いものを無効にできます
