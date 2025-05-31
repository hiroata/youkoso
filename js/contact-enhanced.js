// 強化されたお問い合わせ機能

class ContactManager {
    constructor() {
        this.formData = {};
        this.validationRules = {};
        this.attachmentFiles = [];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        this.setupValidationRules();
        this.setupFormHandlers();
        this.setupFileUpload();
        this.setupAutoSave();
        this.setupFormProgress();
    }
    
    // バリデーションルールの設定
    setupValidationRules() {
        this.validationRules = {
            firstName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/,
                message: {
                    es: 'El nombre debe tener al menos 2 caracteres y solo contener letras',
                    ja: '名前は2文字以上で、文字のみを含む必要があります'
                }
            },
            lastName: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/,
                message: {
                    es: 'El apellido debe tener al menos 2 caracteres y solo contener letras',
                    ja: '苗字は2文字以上で、文字のみを含む必要があります'
                }
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: {
                    es: 'Por favor ingresa un email válido',
                    ja: '有効なメールアドレスを入力してください'
                }
            },
            phone: {
                required: false,
                pattern: /^[+]?[0-9\s\-()]{10,}$/,
                message: {
                    es: 'Formato de teléfono inválido',
                    ja: '電話番号の形式が無効です'
                }
            },
            subject: {
                required: true,
                message: {
                    es: 'Por favor selecciona un tema',
                    ja: 'テーマを選択してください'
                }
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 1000,
                message: {
                    es: 'El mensaje debe tener entre 10 y 1000 caracteres',
                    ja: 'メッセージは10〜1000文字である必要があります'
                }
            }
        };
    }
    
    // フォームハンドラーの設定
    setupFormHandlers() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        // リアルタイムバリデーション
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
        
        // フォーム送信
        contactForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 文字数カウンター
        this.setupCharacterCounter();
    }
    
    // ファイルアップロード機能の設定
    setupFileUpload() {
        // ファイルアップロード領域を作成
        this.createFileUploadArea();
    }
    
    // ファイルアップロード領域を作成
    createFileUploadArea() {
        const messageGroup = document.querySelector('#message').closest('.form-group');
        if (!messageGroup) return;
        
        const uploadArea = document.createElement('div');
        uploadArea.className = 'file-upload-area';
        uploadArea.innerHTML = `
            <div class="form-group">
                <label>
                    <span class="es-text">Adjuntar Archivos (Opcional)</span>
                    <span class="ja-text">ファイル添付（任意）</span>
                </label>
                <div class="file-drop-zone" id="file-drop-zone">
                    <div class="drop-zone-content">
                        <div class="upload-icon">📎</div>
                        <p class="drop-text">
                            <span class="es-text">Arrastra archivos aquí o <span class="upload-link">haz clic para seleccionar</span></span>
                            <span class="ja-text">ファイルをここにドラッグするか<span class="upload-link">クリックして選択</span></span>
                        </p>
                        <p class="file-info">
                            <span class="es-text">Máximo 5MB • JPG, PNG, GIF, PDF, TXT</span>
                            <span class="ja-text">最大5MB • JPG、PNG、GIF、PDF、TXT</span>
                        </p>
                    </div>
                    <input type="file" id="file-input" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.txt" style="display: none;">
                </div>
                <div class="uploaded-files" id="uploaded-files"></div>
            </div>
        `;
        
        messageGroup.insertAdjacentElement('afterend', uploadArea);
        
        // イベントリスナーを追加
        this.setupFileUploadHandlers();
        
        // スタイルを追加
        this.addFileUploadStyles();
    }
    
    // ファイルアップロードハンドラーを設定
    setupFileUploadHandlers() {
        const dropZone = document.getElementById('file-drop-zone');
        const fileInput = document.getElementById('file-input');
        const uploadLink = dropZone.querySelector('.upload-link');
        
        // クリックでファイル選択
        uploadLink.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('click', (e) => {
            if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
                fileInput.click();
            }
        });
        
        // ファイル選択
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));
        
        // ドラッグ&ドロップ
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });
    }
    
    // ファイル選択を処理
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addFile(file);
            }
        });
    }
    
    // ファイルをバリデーション
    validateFile(file) {
        const isJapanese = document.body.classList.contains('ja');
        
        // ファイルサイズチェック
        if (file.size > this.maxFileSize) {
            const message = isJapanese ? 
                `ファイル "${file.name}" は5MBを超えています。` :
                `El archivo "${file.name}" excede los 5MB.`;
            this.showError(message);
            return false;
        }
        
        // ファイルタイプチェック
        if (!this.allowedFileTypes.includes(file.type)) {
            const message = isJapanese ?
                `ファイル形式 "${file.type}" は許可されていません。` :
                `Tipo de archivo "${file.type}" no permitido.`;
            this.showError(message);
            return false;
        }
        
        // 重複チェック
        if (this.attachmentFiles.find(f => f.name === file.name && f.size === file.size)) {
            const message = isJapanese ?
                `ファイル "${file.name}" は既に追加されています。` :
                `El archivo "${file.name}" ya está agregado.`;
            this.showError(message);
            return false;
        }
        
        return true;
    }
    
    // ファイルを追加
    addFile(file) {
        this.attachmentFiles.push(file);
        this.updateUploadedFilesList();
    }
    
    // ファイルを削除
    removeFile(index) {
        this.attachmentFiles.splice(index, 1);
        this.updateUploadedFilesList();
    }
    
    // アップロードされたファイルリストを更新
    updateUploadedFilesList() {
        const container = document.getElementById('uploaded-files');
        if (!container) return;
        
        if (this.attachmentFiles.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = this.attachmentFiles.map((file, index) => `
            <div class="uploaded-file">
                <div class="file-info">
                    <span class="file-icon">${this.getFileIcon(file.type)}</span>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button type="button" class="remove-file" onclick="window.contactManager.removeFile(${index})">
                    ✕
                </button>
            </div>
        `).join('');
    }
    
    // ファイルアイコンを取得
    getFileIcon(type) {
        if (type.startsWith('image/')) return '🖼️';
        if (type === 'application/pdf') return '📄';
        if (type.startsWith('text/')) return '📝';
        return '📁';
    }
    
    // ファイルサイズをフォーマット
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 文字数カウンターを設定
    setupCharacterCounter() {
        const messageField = document.getElementById('message');
        if (!messageField) return;
        
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = '<span id="char-count">0</span> / 1000';
        
        messageField.parentNode.appendChild(counter);
        
        messageField.addEventListener('input', () => {
            const count = messageField.value.length;
            document.getElementById('char-count').textContent = count;
            
            if (count > 1000) {
                counter.classList.add('over-limit');
            } else {
                counter.classList.remove('over-limit');
            }
        });
    }
    
    // オートセーブ機能を設定
    setupAutoSave() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.autoSave();
            });
        });
        
        // ページ離脱時に保存
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
        
        // 保存されたデータを復元
        this.restoreFormData();
    }
    
    // オートセーブ
    autoSave() {
        const formData = this.getFormData();
        if (window.utils) {
            window.utils.saveToLocalStorage('contact_form_draft', formData);
        } else {
            localStorage.setItem('contact_form_draft', JSON.stringify(formData));
        }
    }
    
    // フォームデータを復元
    restoreFormData() {
        let savedData;
        if (window.utils) {
            savedData = window.utils.getFromLocalStorage('contact_form_draft');
        } else {
            try {
                savedData = JSON.parse(localStorage.getItem('contact_form_draft') || '{}');
            } catch (e) {
                savedData = {};
            }
        }
        
        if (savedData && Object.keys(savedData).length > 0) {
            // 復元するか確認
            const isJapanese = document.body.classList.contains('ja');
            const message = isJapanese ?
                '保存された下書きがあります。復元しますか？' :
                'Se encontró un borrador guardado. ¿Deseas restaurarlo?';
            
            if (confirm(message)) {
                this.setFormData(savedData);
            }
        }
    }
    
    // フォーム進行状況を設定
    setupFormProgress() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        
        // 進行状況バーを作成
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress';
        progressBar.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill" id="form-progress-fill"></div>
            </div>
            <div class="progress-text">
                <span class="es-text">Progreso del formulario: <span id="progress-percentage">0</span>%</span>
                <span class="ja-text">フォーム進行状況: <span id="progress-percentage-ja">0</span>%</span>
            </div>
        `;
        
        form.insertBefore(progressBar, form.firstChild);
        
        // 入力時に進行状況を更新
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updateFormProgress());
            input.addEventListener('change', () => this.updateFormProgress());
        });
        
        // 初期進行状況を設定
        this.updateFormProgress();
    }
    
    // フォーム進行状況を更新
    updateFormProgress() {
        const form = document.getElementById('contact-form');
        const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
        const completedFields = Array.from(requiredFields).filter(field => {
            return field.value.trim() !== '' && this.validateField(field, false);
        });
        
        const percentage = Math.round((completedFields.length / requiredFields.length) * 100);
        
        const progressFill = document.getElementById('form-progress-fill');
        const progressText = document.getElementById('progress-percentage');
        const progressTextJa = document.getElementById('progress-percentage-ja');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = percentage;
        }
        if (progressTextJa) {
            progressTextJa.textContent = percentage;
        }
    }
    
    // フィールドをバリデーション
    validateField(field, showError = true) {
        const fieldName = field.name;
        const rule = this.validationRules[fieldName];
        
        if (!rule) return true;
        
        const value = field.value.trim();
        const isJapanese = document.body.classList.contains('ja');
        
        // 必須チェック
        if (rule.required && !value) {
            if (showError) {
                this.showFieldError(field, rule.message[isJapanese ? 'ja' : 'es']);
            }
            return false;
        }
        
        // 空の場合は他のチェックをスキップ
        if (!value) return true;
        
        // 最小長チェック
        if (rule.minLength && value.length < rule.minLength) {
            if (showError) {
                this.showFieldError(field, rule.message[isJapanese ? 'ja' : 'es']);
            }
            return false;
        }
        
        // 最大長チェック
        if (rule.maxLength && value.length > rule.maxLength) {
            if (showError) {
                this.showFieldError(field, rule.message[isJapanese ? 'ja' : 'es']);
            }
            return false;
        }
        
        // パターンチェック
        if (rule.pattern && !rule.pattern.test(value)) {
            if (showError) {
                this.showFieldError(field, rule.message[isJapanese ? 'ja' : 'es']);
            }
            return false;
        }
        
        // エラーをクリア
        if (showError) {
            this.clearFieldError(field);
        }
        return true;
    }
    
    // フィールドエラーを表示
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    }
    
    // フィールドエラーをクリア
    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
    
    // フォームデータを取得
    getFormData() {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);
        const data = {};
        
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    // フォームデータを設定
    setFormData(data) {
        Object.keys(data).forEach(key => {
            const field = document.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key];
            }
        });
    }
    
    // フォーム送信を処理
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        // 全フィールドをバリデーション
        const form = event.target;
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showError('Por favor corrige los errores en el formulario');
            return;
        }
        
        // 送信処理
        this.isSubmitting = true;
        await this.submitForm(form);
        this.isSubmitting = false;
    }
    
    // フォームを送信
    async submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const isJapanese = document.body.classList.contains('ja');
        
        // 送信中の表示
        submitBtn.innerHTML = isJapanese ? '送信中...' : 'Enviando...';
        submitBtn.disabled = true;
        
        try {
            // フォームデータを準備
            const formData = this.getFormData();
            
            // ファイルがある場合の処理（実際の実装では適切な API エンドポイントに送信）
            if (this.attachmentFiles.length > 0) {
                formData.attachments = this.attachmentFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }));
            }
            
            // デモ用の遅延
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 成功処理
            this.handleSubmitSuccess(formData);
            
        } catch (error) {
            // エラー処理
            this.handleSubmitError(error);
        } finally {
            // ボタンを元に戻す
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    // 送信成功を処理
    handleSubmitSuccess(formData) {
        const isJapanese = document.body.classList.contains('ja');
        
        // 成功メッセージ
        const message = isJapanese ?
            `${formData.firstName}さん、お問い合わせありがとうございます！24時間以内にご返信いたします。` :
            `¡Gracias ${formData.firstName}! Hemos recibido tu mensaje. Te responderemos dentro de 24 horas.`;
        
        this.showSuccess(message);
        
        // フォームをリセット
        document.getElementById('contact-form').reset();
        this.attachmentFiles = [];
        this.updateUploadedFilesList();
        
        // オートセーブデータをクリア
        if (window.utils) {
            window.utils.saveToLocalStorage('contact_form_draft', {});
        } else {
            localStorage.removeItem('contact_form_draft');
        }
        
        // 進行状況をリセット
        this.updateFormProgress();
        
        // Google Analyticsイベント
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_form_submit', {
                'event_category': 'engagement',
                'event_label': formData.subject
            });
        }
    }
    
    // 送信エラーを処理
    handleSubmitError(error) {
        console.error('Form submission error:', error);
        
        const isJapanese = document.body.classList.contains('ja');
        const message = isJapanese ?
            'エラーが発生しました。もう一度お試しください。' :
            'Ocurrió un error. Por favor intenta nuevamente.';
        
        this.showError(message);
    }
    
    // エラーメッセージを表示
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // 成功メッセージを表示
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    // 通知を表示
    showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.querySelector('.contact-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 新しい通知を作成
        const notification = document.createElement('div');
        notification.className = `contact-notification ${type}`;
        notification.textContent = message;
        
        // フォームの上に追加
        const form = document.getElementById('contact-form');
        form.parentNode.insertBefore(notification, form);
        
        // 自動的に削除
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // スタイルを追加
    addFileUploadStyles() {
        if (document.getElementById('contact-enhanced-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'contact-enhanced-styles';
        style.textContent = `
            .file-drop-zone {
                border: 2px dashed #ccc;
                border-radius: 10px;
                padding: 30px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                background-color: #fafafa;
            }
            
            .file-drop-zone:hover,
            .file-drop-zone.drag-over {
                border-color: var(--primary-color);
                background-color: rgba(0, 122, 255, 0.05);
            }
            
            .upload-icon {
                font-size: 2em;
                margin-bottom: 10px;
            }
            
            .upload-link {
                color: var(--primary-color);
                text-decoration: underline;
                cursor: pointer;
            }
            
            .file-info {
                font-size: 0.9em;
                color: #666;
                margin-top: 10px;
            }
            
            .uploaded-files {
                margin-top: 15px;
            }
            
            .uploaded-file {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px;
                background-color: #f8f9fa;
                border-radius: 5px;
                margin-bottom: 10px;
            }
            
            .uploaded-file .file-info {
                display: flex;
                align-items: center;
                flex: 1;
            }
            
            .file-icon {
                font-size: 1.5em;
                margin-right: 10px;
            }
            
            .file-details {
                flex: 1;
            }
            
            .file-name {
                font-weight: 500;
                margin-bottom: 2px;
            }
            
            .file-size {
                font-size: 0.9em;
                color: #666;
            }
            
            .remove-file {
                background: #ff4757;
                color: white;
                border: none;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8em;
            }
            
            .character-counter {
                text-align: right;
                font-size: 0.9em;
                color: #666;
                margin-top: 5px;
            }
            
            .character-counter.over-limit {
                color: #ff4757;
            }
            
            .form-progress {
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 10px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
                transition: width 0.3s ease;
                border-radius: 4px;
            }
            
            .progress-text {
                font-size: 0.9em;
                color: #666;
            }
            
            .field-error {
                color: #ff4757;
                font-size: 0.9em;
                margin-top: 5px;
            }
            
            .form-group input.error,
            .form-group textarea.error,
            .form-group select.error {
                border-color: #ff4757;
                box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
            }
            
            .contact-notification {
                padding: 15px;
                border-radius: 10px;
                margin-bottom: 20px;
                font-weight: 500;
            }
            
            .contact-notification.success {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
            }
            
            .contact-notification.error {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                color: #721c24;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// ページロード時に ContactManager を初期化
document.addEventListener('DOMContentLoaded', function() {
    window.contactManager = new ContactManager();
});

// エクスポート
window.ContactManager = ContactManager;