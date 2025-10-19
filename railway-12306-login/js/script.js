// 12306登录界面JavaScript交互功能

class Railway12306Login {
    constructor() {
        this.init();
        this.bindEvents();
        this.generateCaptcha();
    }

    init() {
        // 获取DOM元素
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.loginForms = document.querySelectorAll('.login-form');
        this.passwordToggles = document.querySelectorAll('.password-toggle');
        this.captchaCanvas = document.getElementById('captcha-canvas');
        this.refreshCaptchaBtn = document.querySelector('.refresh-captcha');
        this.sendSmsBtn = document.querySelector('.send-sms-btn');
        this.loginBtns = document.querySelectorAll('.login-btn');
        
        // 初始化状态
        this.currentTab = 'account';
        this.captchaCode = '';
        this.smsCountdown = 0;
        this.smsTimer = null;
    }

    bindEvents() {
        // 标签页切换
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e));
        });

        // 密码显示/隐藏
        this.passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePassword(e));
        });

        // 验证码刷新
        if (this.refreshCaptchaBtn) {
            this.refreshCaptchaBtn.addEventListener('click', () => this.generateCaptcha());
        }

        // 验证码画布点击刷新
        if (this.captchaCanvas) {
            this.captchaCanvas.addEventListener('click', () => this.generateCaptcha());
        }

        // 发送短信验证码
        if (this.sendSmsBtn) {
            this.sendSmsBtn.addEventListener('click', () => this.sendSmsCode());
        }

        // 登录按钮
        this.loginBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLogin(e));
        });

        // 表单输入验证
        this.bindFormValidation();

        // 回车键登录
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const activeForm = document.querySelector('.login-form:not(.hidden)');
                if (activeForm) {
                    const loginBtn = activeForm.querySelector('.login-btn');
                    if (loginBtn) {
                        loginBtn.click();
                    }
                }
            }
        });
    }

    // 标签页切换
    switchTab(e) {
        const targetTab = e.target.dataset.tab;
        
        // 更新按钮状态
        this.tabBtns.forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');

        // 切换表单显示
        this.loginForms.forEach(form => {
            form.classList.add('hidden');
        });
        
        const targetForm = document.getElementById(`${targetTab}-login`);
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }

        this.currentTab = targetTab;
    }

    // 密码显示/隐藏切换
    togglePassword(e) {
        const toggle = e.target;
        const passwordInput = toggle.previousElementSibling;
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggle.textContent = '👁️';
        }
    }

    // 生成验证码
    generateCaptcha() {
        if (!this.captchaCanvas) return;

        const ctx = this.captchaCanvas.getContext('2d');
        const width = this.captchaCanvas.width;
        const height = this.captchaCanvas.height;

        // 清空画布
        ctx.clearRect(0, 0, width, height);

        // 设置背景
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, width, height);

        // 生成随机验证码
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        this.captchaCode = '';
        for (let i = 0; i < 4; i++) {
            this.captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // 绘制验证码文字
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < this.captchaCode.length; i++) {
            const x = (width / 4) * i + (width / 8);
            const y = height / 2 + (Math.random() - 0.5) * 10;
            const angle = (Math.random() - 0.5) * 0.5;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
            ctx.fillText(this.captchaCode[i], 0, 0);
            ctx.restore();
        }

        // 添加干扰线
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 60%)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(Math.random() * width, Math.random() * height);
            ctx.lineTo(Math.random() * width, Math.random() * height);
            ctx.stroke();
        }

        // 添加干扰点
        for (let i = 0; i < 30; i++) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 60%)`;
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // 发送短信验证码
    sendSmsCode() {
        const phoneInput = document.getElementById('phone');
        const phone = phoneInput.value.trim();

        // 验证手机号
        if (!this.validatePhone(phone)) {
            this.showMessage('请输入正确的手机号码', 'error');
            return;
        }

        // 开始倒计时
        this.smsCountdown = 60;
        this.sendSmsBtn.disabled = true;
        this.updateSmsButton();

        this.smsTimer = setInterval(() => {
            this.smsCountdown--;
            this.updateSmsButton();

            if (this.smsCountdown <= 0) {
                clearInterval(this.smsTimer);
                this.sendSmsBtn.disabled = false;
                this.sendSmsBtn.textContent = '发送验证码';
            }
        }, 1000);

        // 模拟发送短信
        this.showMessage('验证码已发送，请注意查收', 'success');
    }

    // 更新短信按钮文字
    updateSmsButton() {
        if (this.smsCountdown > 0) {
            this.sendSmsBtn.textContent = `${this.smsCountdown}秒后重发`;
        }
    }

    // 处理登录
    handleLogin(e) {
        e.preventDefault();
        const form = e.target.closest('.login-form');
        const formData = new FormData(form);
        
        // 添加加载状态
        const loginBtn = e.target;
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;

        // 验证表单
        if (!this.validateForm(form)) {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            return;
        }

        // 模拟登录请求
        setTimeout(() => {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            
            // 模拟登录成功
            this.showMessage('登录成功！正在跳转...', 'success');
            
            setTimeout(() => {
                // 这里可以跳转到实际页面
                console.log('登录成功，跳转到主页');
            }, 1500);
        }, 2000);
    }

    // 表单验证
    validateForm(form) {
        const formId = form.id;
        let isValid = true;

        if (formId === 'account-login') {
            // 账号登录验证
            const username = form.querySelector('#username').value.trim();
            const password = form.querySelector('#password').value.trim();
            const captcha = form.querySelector('#captcha').value.trim();

            if (!username) {
                this.showMessage('请输入用户名', 'error');
                isValid = false;
            } else if (!password) {
                this.showMessage('请输入密码', 'error');
                isValid = false;
            } else if (!captcha) {
                this.showMessage('请输入验证码', 'error');
                isValid = false;
            } else if (captcha.toUpperCase() !== this.captchaCode) {
                this.showMessage('验证码错误', 'error');
                this.generateCaptcha();
                isValid = false;
            }
        } else if (formId === 'phone-login') {
            // 手机登录验证
            const phone = form.querySelector('#phone').value.trim();
            const smsCode = form.querySelector('#sms-code').value.trim();

            if (!this.validatePhone(phone)) {
                this.showMessage('请输入正确的手机号码', 'error');
                isValid = false;
            } else if (!smsCode) {
                this.showMessage('请输入短信验证码', 'error');
                isValid = false;
            } else if (smsCode !== '123456') { // 模拟验证码
                this.showMessage('短信验证码错误', 'error');
                isValid = false;
            }
        }

        return isValid;
    }

    // 手机号验证
    validatePhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    // 表单输入验证绑定
    bindFormValidation() {
        // 实时验证用户名
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => {
                const value = usernameInput.value.trim();
                if (value && value.length < 3) {
                    this.showFieldError(usernameInput, '用户名至少3个字符');
                } else {
                    this.clearFieldError(usernameInput);
                }
            });
        }

        // 实时验证手机号
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                const value = phoneInput.value.trim();
                if (value && !this.validatePhone(value)) {
                    this.showFieldError(phoneInput, '请输入正确的手机号码');
                } else {
                    this.clearFieldError(phoneInput);
                }
            });
        }

        // 密码强度检查
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                const value = passwordInput.value;
                if (value.length > 0 && value.length < 6) {
                    this.showFieldError(passwordInput, '密码至少6个字符');
                } else {
                    this.clearFieldError(passwordInput);
                }
            });
        }
    }

    // 显示字段错误
    showFieldError(input, message) {
        this.clearFieldError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = 'color: #dc3545; font-size: 12px; margin-top: 5px;';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#dc3545';
    }

    // 清除字段错误
    clearFieldError(input) {
        const errorDiv = input.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.style.borderColor = '#e0e0e0';
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMessage = document.querySelector('.message-toast');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-toast';
        messageDiv.textContent = message;

        // 设置样式
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };

        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;

        // 添加动画样式
        if (!document.querySelector('#message-styles')) {
            const style = document.createElement('style');
            style.id = 'message-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageDiv);

        // 自动移除
        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }, 3000);
    }

    // 生成二维码（模拟）
    generateQRCode() {
        const qrCode = document.querySelector('.qr-code');
        if (qrCode) {
            // 这里可以集成真实的二维码生成库
            qrCode.innerHTML = `
                <div style="width: 150px; height: 150px; background: #fff; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; text-align: center;">
                    二维码登录<br>
                    (演示模式)
                </div>
            `;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new Railway12306Login();
});

// 页面可见性变化时刷新验证码
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        const login = window.railway12306Login;
        if (login && login.generateCaptcha) {
            login.generateCaptcha();
        }
    }
});

// 防止右键和F12（可选的安全措施）
document.addEventListener('contextmenu', (e) => {
    // e.preventDefault(); // 取消注释以禁用右键菜单
});

document.addEventListener('keydown', (e) => {
    // 禁用F12, Ctrl+Shift+I, Ctrl+U等开发者工具快捷键（可选）
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')) {
        // e.preventDefault(); // 取消注释以禁用开发者工具
    }
});