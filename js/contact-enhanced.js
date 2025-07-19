// contact-enhanced.js - Enhanced Contact Form with Mobile Support

class ContactFormManager {
    constructor() {
        this.form = null;
        this.nameInput = null;
        this.emailInput = null;
        this.messageInput = null;
        this.submitButton = null;
        this.isMobile = window.innerWidth <= 768;
        this.currentLanguage = document.documentElement.getAttribute('data-lang') || 'es';
        
        this.init();
    }

    init() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupResponsive();
    }

    initializeElements() {
        this.form = document.querySelector('.contact-form form');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.messageInput = document.getElementById('message');
        this.submitButton = this.form?.querySelector('button[type="submit"]');

        if (!this.form) {
            // console.warn('Contact form not found');
            return;
        }
    }

    setupEventListeners() {
        if (!this.form) return;

        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        this.nameInput?.addEventListener('blur', () => this.validateField('name'));
        this.emailInput?.addEventListener('blur', () => this.validateField('email'));
        this.messageInput?.addEventListener('blur', () => this.validateField('message'));

        // Character counter for message
        this.messageInput?.addEventListener('input', () => this.updateCharacterCounter());

        // Language change listener
        document.addEventListener('languageChanged', () => {
            this.currentLanguage = document.documentElement.getAttribute('data-lang') || 'es';
        });
    }

    setupResponsive() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768;
            this.adjustForMobile();
        });
        
        this.adjustForMobile();
    }

    adjustForMobile() {
        if (!this.form) return;

        if (this.isMobile) {
            // Adjust form layout for mobile
            this.form.style.padding = '1rem';
            
            // Adjust input heights for better touch interaction
            const inputs = this.form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.style.minHeight = '48px';
                input.style.fontSize = '16px'; // Prevent zoom on iOS
            });

            // Adjust button size
            if (this.submitButton) {
                this.submitButton.style.minHeight = '48px';
                this.submitButton.style.fontSize = '16px';
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            // バリデーションエラーはコンソールログのみ
            return;
        }

        await this.submitForm();
    }

    validateForm() {
        let isValid = true;

        // Validate all fields
        if (!this.validateField('name')) isValid = false;
        if (!this.validateField('email')) isValid = false;
        if (!this.validateField('message')) isValid = false;

        if (!isValid) {
            // console.warn('Contact form validation failed');
        }

        return isValid;
    }

    validateField(fieldName) {
        const field = this[`${fieldName}Input`];
        if (!field) return false;

        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (field.value.trim().length < 2) {
                    isValid = false;
                    errorMessage = this.getErrorMessage('nameMin');
                } else if (field.value.trim().length > 50) {
                    isValid = false;
                    errorMessage = this.getErrorMessage('nameMax');
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    isValid = false;
                    errorMessage = this.getErrorMessage('emailInvalid');
                }
                break;

            case 'message':
                if (field.value.trim().length < 10) {
                    isValid = false;
                    errorMessage = this.getErrorMessage('messageMin');
                } else if (field.value.trim().length > 1000) {
                    isValid = false;
                    errorMessage = this.getErrorMessage('messageMax');
                }
                break;
        }

        if (isValid) {
            this.clearFieldError(field);
        } else {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <span>${message}</span>
        `;
        
        // Enhanced styling for mobile
        errorDiv.style.cssText = `
            color: #e74c3c;
            font-size: ${this.isMobile ? '14px' : '13px'};
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
            animation: slideIn 0.3s ease;
        `;
        
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        field.style.borderColor = '#e74c3c';
        field.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
        
        // Focus on error field for accessibility
        if (this.isMobile) {
            setTimeout(() => field.focus(), 100);
        }
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    updateCharacterCounter() {
        if (!this.messageInput) return;

        const currentLength = this.messageInput.value.length;
        const maxLength = 1000;
        
        let counter = this.messageInput.parentNode.querySelector('.character-counter');
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'character-counter';
            this.messageInput.parentNode.appendChild(counter);
        }

        counter.textContent = `${currentLength}/${maxLength}`;
        counter.style.cssText = `
            font-size: 12px;
            color: ${currentLength > maxLength ? '#e74c3c' : '#666'};
            text-align: right;
            margin-top: 4px;
        `;
    }

    async submitForm() {
        if (!this.submitButton) return;

        // Show loading state
        const originalButtonText = this.submitButton.innerHTML;
        this.submitButton.disabled = true;
        this.submitButton.innerHTML = `
            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
            <span class="es-text">Enviando...</span>
            <span class="ja-text">送信中...</span>
        `;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success - コンソールログのみ
            // console.log('Contact form submitted successfully');
            this.form.reset();
            this.clearAllErrors();

        } catch (error) {
            // Error - コンソールログのみ
            console.error('Contact form submission error:', error);
        } finally {
            // Restore button
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = originalButtonText;
        }
    }

    clearAllErrors() {
        const errorDivs = this.form.querySelectorAll('.field-error');
        errorDivs.forEach(div => div.remove());

        const fields = [this.nameInput, this.emailInput, this.messageInput];
        fields.forEach(field => {
            if (field) {
                field.style.borderColor = '';
                field.style.boxShadow = '';
            }
        });
    }

    getErrorMessage(key) {
        const messages = {
            nameMin: {
                es: 'El nombre debe tener al menos 2 caracteres',
                ja: '名前は2文字以上で入力してください'
            },
            nameMax: {
                es: 'El nombre no puede exceder 50 caracteres',
                ja: '名前は50文字以内で入力してください'
            },
            emailInvalid: {
                es: 'Por favor ingresa un email válido',
                ja: '有効なメールアドレスを入力してください'
            },
            messageMin: {
                es: 'El mensaje debe tener al menos 10 caracteres',
                ja: 'メッセージは10文字以上で入力してください'
            },
            messageMax: {
                es: 'El mensaje no puede exceder 1000 caracteres',
                ja: 'メッセージは1000文字以内で入力してください'
            },
            validationError: {
                es: 'Por favor corrige los errores del formulario',
                ja: 'フォームのエラーを修正してください'
            },
            submitError: {
                es: 'Error al enviar el mensaje. Inténtalo de nuevo.',
                ja: 'メッセージの送信に失敗しました。もう一度お試しください。'
            }
        };

        return messages[key]?.[this.currentLanguage] || messages[key]?.es || 'Error';
    }

    getSuccessMessage() {
        const messages = {
            es: '¡Gracias por tu mensaje! Te responderemos en 24 horas.',
            ja: 'お問い合わせありがとうございます！24時間以内にご返信いたします。'
        };

        return messages[this.currentLanguage] || messages.es;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a contact page
    if (document.querySelector('.contact-form')) {
        new ContactFormManager();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactFormManager;
}