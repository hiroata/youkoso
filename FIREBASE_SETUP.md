# Firebase認証セットアップガイド

## 🔥 Firebase設定手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名: `youkoso-store`
4. Google Analyticsを有効化（オプション）

### 2. 認証設定

1. Firebaseコンソールで「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで以下を有効化：
   - **メール/パスワード**: 有効
   - **Google**: 有効（OAuth同意画面の設定が必要）

### 3. Firebaseプロジェクト設定

1. プロジェクト設定（歯車アイコン）→「プロジェクトを設定」
2. 「全般」タブで「ウェブアプリ」を追加
3. アプリ名: `Youkoso Web`
4. 表示される設定情報をコピー

### 4. 設定情報の適用

`js/firebase-auth.js`の以下の部分を更新：

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC_REPLACE_WITH_ACTUAL_API_KEY",        // 実際のAPIキーに置換
    authDomain: "youkoso-3d911.firebaseapp.com",
    projectId: "youkoso-3d911",
    storageBucket: "youkoso-3d911.appspot.com",
    messagingSenderId: "REPLACE_WITH_ACTUAL_SENDER_ID",   // 実際のIDに置換
    appId: "REPLACE_WITH_ACTUAL_APP_ID"                   // 実際のIDに置換
};
```

### 5. 最初の管理者アカウント作成

1. `admin.html`を開く
2. ブラウザのコンソール（F12）を開く
3. 以下のコマンドを実行：

```javascript
// 管理者アカウントを作成
await createFirstAdmin('admin@youkoso.com', 'SecurePassword123!', 'サイト管理者');
```

### 6. セキュリティルール設定

Firebaseコンソールで「Firestore Database」→「ルール」：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザー情報
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 管理者情報
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false; // 管理者は手動で設定
    }
    
    // 商品情報（誰でも読み取り可、管理者のみ書き込み可）
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

## 🔐 ログイン情報

### 現在のシステム（レガシー認証）
- **ID**: admin
- **パスワード**: japan2024
- **状態**: ✅ 動作中

### 将来のシステム（Firebase認証）
- **メール**: admin@youkoso.com（または任意のメール）
- **パスワード**: 設定時に指定したパスワード
- **Googleログイン**: 有効
- **状態**: ⏳ 設定待ち（実際のAPIキーが必要）

## 🚀 追加機能

### 管理者の追加
```javascript
// コンソールで実行
await window.firebaseAuth.register(
  'newadmin@youkoso.com',
  'password123',
  '新しい管理者',
  'admin'  // ロールを'admin'に設定
);
```

### パスワードリセット
ログイン画面の「パスワードを忘れた方」リンクから、メールでリセット可能

### セッション管理
- 自動ログイン維持
- タブ間でのセッション共有
- セキュアなトークン管理

## 📝 トラブルシューティング

### エラー: "auth/invalid-api-key"
→ `firebase-auth.js`のAPIキーが正しく設定されているか確認

### エラー: "auth/user-not-found"
→ メールアドレスが登録されているか確認

### エラー: "auth/wrong-password"
→ パスワードが正しいか確認（大文字小文字も区別）

### エラー: "auth/too-many-requests"
→ ログイン試行が多すぎます。しばらく待ってから再試行

## 🔄 移行手順

1. Firebaseプロジェクトを作成
2. 設定情報を`firebase-auth.js`に追加
3. 最初の管理者アカウントを作成
4. 新しいログイン情報でテスト
5. 旧認証コードを段階的に削除

## 🌟 メリット

- **セキュリティ向上**: 業界標準の認証システム
- **複数管理者対応**: 簡単に管理者を追加可能
- **パスワードリセット**: メールで自動リセット
- **ソーシャルログイン**: Google認証対応
- **セッション管理**: 自動的なトークン更新
- **監査ログ**: ログイン履歴の記録