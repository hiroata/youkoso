// Firebase認証システム
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    collection,
    query,
    where,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase設定
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "youkoso-store.firebaseapp.com",
    projectId: "youkoso-store",
    storageBucket: "youkoso-store.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// 認証管理クラス
class FirebaseAuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.userRole = null;
        this.init();
    }

    init() {
        // 認証状態の監視
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.currentUser = user;
                await this.checkUserRole(user.uid);
                this.handleAuthSuccess(user);
            } else {
                this.currentUser = null;
                this.isAdmin = false;
                this.userRole = null;
                this.handleAuthLogout();
            }
        });
    }

    // ユーザー登録
    async register(email, password, displayName, role = 'customer') {
        try {
            // ユーザー作成
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // プロフィール更新
            await updateProfile(user, { displayName });

            // Firestoreにユーザー情報保存
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                role: role,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                isActive: true,
                preferences: {
                    language: 'ja',
                    theme: 'light',
                    notifications: true
                }
            });

            // 管理者権限の場合、別途管理者コレクションにも登録
            if (role === 'admin') {
                await setDoc(doc(db, 'admins', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    permissions: ['read', 'write', 'delete'],
                    createdAt: new Date().toISOString()
                });
            }

            return { success: true, user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // ログイン
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 最終ログイン時刻更新
            await this.updateLastLogin(user.uid);

            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // Googleログイン
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // 初回ログイン時はユーザー情報を作成
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    role: 'customer',
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    isActive: true,
                    preferences: {
                        language: 'ja',
                        theme: 'light',
                        notifications: true
                    }
                });
            } else {
                await this.updateLastLogin(user.uid);
            }

            return { success: true, user };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // ログアウト
    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // パスワードリセット
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'パスワードリセットメールを送信しました' };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    // ユーザーロール確認
    async checkUserRole(uid) {
        try {
            // ユーザー情報取得
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.userRole = userData.role;
                this.isAdmin = userData.role === 'admin';

                // 管理者の場合、権限も確認
                if (this.isAdmin) {
                    const adminDoc = await getDoc(doc(db, 'admins', uid));
                    if (adminDoc.exists()) {
                        this.adminPermissions = adminDoc.data().permissions;
                    }
                }
            }
        } catch (error) {
            console.error('Role check error:', error);
        }
    }

    // 最終ログイン時刻更新
    async updateLastLogin(uid) {
        try {
            const userRef = doc(db, 'users', uid);
            await setDoc(userRef, {
                lastLogin: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error('Update last login error:', error);
        }
    }

    // 認証成功時の処理
    handleAuthSuccess(user) {
        console.log('Auth success:', user.email);
        
        // 管理者ページの場合
        if (window.location.pathname.includes('admin.html')) {
            if (this.isAdmin) {
                this.showAdminDashboard();
            } else {
                this.showAccessDenied();
            }
        }
        
        // 認証イベント発火
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user, isAdmin: this.isAdmin }
        }));
    }

    // ログアウト時の処理
    handleAuthLogout() {
        console.log('User logged out');
        
        // 管理者ページの場合はログイン画面に戻す
        if (window.location.pathname.includes('admin.html')) {
            this.showLoginForm();
        }
        
        // ログアウトイベント発火
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { user: null, isAdmin: false }
        }));
    }

    // 管理画面表示
    showAdminDashboard() {
        const loginSection = document.getElementById('login-section');
        const adminDashboard = document.getElementById('admin-dashboard');
        
        if (loginSection) loginSection.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        
        // ユーザー情報表示
        this.updateUserInfo();
    }

    // アクセス拒否表示
    showAccessDenied() {
        alert('管理者権限がありません。管理者アカウントでログインしてください。');
        this.logout();
    }

    // ログインフォーム表示
    showLoginForm() {
        const loginSection = document.getElementById('login-section');
        const adminDashboard = document.getElementById('admin-dashboard');
        
        if (loginSection) loginSection.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';
    }

    // ユーザー情報更新
    updateUserInfo() {
        const userInfoElements = document.querySelectorAll('.user-info');
        userInfoElements.forEach(el => {
            if (this.currentUser) {
                el.textContent = this.currentUser.displayName || this.currentUser.email;
            }
        });
    }

    // エラーメッセージ取得
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
            'auth/invalid-email': 'メールアドレスが無効です',
            'auth/operation-not-allowed': 'この操作は許可されていません',
            'auth/weak-password': 'パスワードが弱すぎます（6文字以上必要）',
            'auth/user-disabled': 'このアカウントは無効化されています',
            'auth/user-not-found': 'ユーザーが見つかりません',
            'auth/wrong-password': 'パスワードが間違っています',
            'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています',
            'auth/too-many-requests': 'ログイン試行が多すぎます。しばらく待ってから再試行してください',
            'auth/network-request-failed': 'ネットワークエラーが発生しました'
        };
        
        return errorMessages[errorCode] || 'エラーが発生しました';
    }

    // 管理者権限チェック
    hasPermission(permission) {
        return this.isAdmin && this.adminPermissions && this.adminPermissions.includes(permission);
    }

    // 現在のユーザー取得
    getCurrentUser() {
        return this.currentUser;
    }

    // 管理者かどうか
    getIsAdmin() {
        return this.isAdmin;
    }
}

// グローバルインスタンス作成
window.firebaseAuth = new FirebaseAuthManager();

// 管理者ログインフォーム処理
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-id').value;
            const password = document.getElementById('login-pass').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            
            // ローディング状態
            submitBtn.disabled = true;
            submitBtn.textContent = 'ログイン中...';
            
            // ログイン実行
            const result = await window.firebaseAuth.login(email, password);
            
            if (result.success) {
                // 成功（handleAuthSuccessで画面遷移される）
                submitBtn.textContent = 'ログイン成功！';
            } else {
                // エラー表示
                alert(result.error);
                submitBtn.disabled = false;
                submitBtn.textContent = 'ログイン';
            }
        });
    }

    // Googleログインボタン
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            const result = await window.firebaseAuth.loginWithGoogle();
            if (!result.success) {
                alert(result.error);
            }
        });
    }

    // ログアウトボタン
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('ログアウトしますか？')) {
                await window.firebaseAuth.logout();
            }
        });
    });

    // パスワードリセットリンク
    const resetPasswordLink = document.getElementById('reset-password-link');
    if (resetPasswordLink) {
        resetPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = prompt('パスワードリセット用のメールアドレスを入力してください：');
            if (email) {
                const result = await window.firebaseAuth.resetPassword(email);
                alert(result.success ? result.message : result.error);
            }
        });
    }
});

// 最初の管理者アカウント作成用（開発時のみ使用）
window.createFirstAdmin = async function(email, password, displayName) {
    const result = await window.firebaseAuth.register(email, password, displayName, 'admin');
    if (result.success) {
        console.log('管理者アカウントが作成されました');
    } else {
        console.error('エラー:', result.error);
    }
};