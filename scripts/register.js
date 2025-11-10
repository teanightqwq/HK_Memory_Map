// ===========================
// 香港記憶地圖 - 註冊系統腳本
// ===========================

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeRegisterPage();
    setupRegisterHandlers();
});

// 初始化註冊頁面
function initializeRegisterPage() {
    console.log('註冊頁面已加載');
    
    // 檢查是否已登入
    const currentUser = getCurrentUser();
    if (currentUser) {
        // 已登入，重定向到收藏頁面
        window.location.href = 'collection.html';
    }
}

// 獲取當前用戶
function getCurrentUser() {
    const localUser = localStorage.getItem('currentUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    
    if (localUser) {
        return JSON.parse(localUser);
    } else if (sessionUser) {
        return JSON.parse(sessionUser);
    }
    
    return null;
}

// 設置註冊處理器
function setupRegisterHandlers() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // 實時驗證
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const emailInput = document.getElementById('email');
        const usernameInput = document.getElementById('username');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', validatePassword);
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
        }
        
        if (usernameInput) {
            usernameInput.addEventListener('blur', validateUsername);
        }
    }
}

// 處理註冊
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // 驗證所有字段
    if (!validateAllFields(username, email, password, confirmPassword, agreeTerms)) {
        return;
    }
    
    // 檢查用戶名是否已存在
    if (isUsernameExists(username)) {
        showError('該用戶名已被使用，請選擇其他用戶名');
        return;
    }
    
    // 檢查郵箱是否已存在
    if (isEmailExists(email)) {
        showError('該電郵已被註冊，請使用其他電郵或直接登入');
        return;
    }
    
    // 創建新用戶
    const newUser = {
        id: 'user_' + Date.now(),
        username: username,
        email: email,
        password: password, // 注意：實際應用中應該加密
        avatar: getRandomAvatar(),
        registerDate: new Date().toISOString(),
        role: 'user',
        stats: {
            fragments: 0,
            cards: 0,
            submissions: 0
        }
    };
    
    // 保存用戶
    if (saveUser(newUser)) {
        // 自動登入
        const loginUser = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(loginUser));
        
        // 顯示成功消息
        showSuccess('註冊成功！正在跳轉到首頁...');
        
        // 跳轉到首頁
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } else {
        showError('註冊失敗，請稍後再試');
    }
}

// 驗證所有字段
function validateAllFields(username, email, password, confirmPassword, agreeTerms) {
    // 驗證用戶名
    if (!username || username.length < 3) {
        showError('用戶名至少需要3個字符');
        return false;
    }
    
    if (username.length > 20) {
        showError('用戶名不能超過20個字符');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
        showError('用戶名只能包含字母、數字、下劃線和中文');
        return false;
    }
    
    // 驗證郵箱
    if (!email || !isValidEmail(email)) {
        showError('請輸入有效的電郵地址');
        return false;
    }
    
    // 驗證密碼
    if (!password || password.length < 6) {
        showError('密碼至少需要6個字符');
        return false;
    }
    
    if (password.length > 20) {
        showError('密碼不能超過20個字符');
        return false;
    }
    
    // 驗證確認密碼
    if (password !== confirmPassword) {
        showError('兩次輸入的密碼不一致');
        return false;
    }
    
    // 驗證同意條款
    if (!agreeTerms) {
        showError('請閱讀並同意使用條款和隱私政策');
        return false;
    }
    
    return true;
}

// 驗證用戶名
function validateUsername() {
    const username = document.getElementById('username').value.trim();
    const feedback = document.getElementById('usernameFeedback');
    
    if (username.length === 0) return;
    
    if (username.length < 3) {
        showFieldError('username', '用戶名至少需要3個字符');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
        showFieldError('username', '只能包含字母、數字、下劃線和中文');
        return false;
    }
    
    if (isUsernameExists(username)) {
        showFieldError('username', '該用戶名已被使用');
        return false;
    }
    
    showFieldSuccess('username', '用戶名可用 ✓');
    return true;
}

// 驗證郵箱
function validateEmail() {
    const email = document.getElementById('email').value.trim();
    
    if (email.length === 0) return;
    
    if (!isValidEmail(email)) {
        showFieldError('email', '請輸入有效的電郵地址');
        return false;
    }
    
    if (isEmailExists(email)) {
        showFieldError('email', '該電郵已被註冊');
        return false;
    }
    
    showFieldSuccess('email', '電郵可用 ✓');
    return true;
}

// 驗證密碼
function validatePassword() {
    const password = document.getElementById('password').value;
    
    if (password.length === 0) return;
    
    if (password.length < 6) {
        showFieldError('password', '密碼至少需要6個字符');
        return false;
    }
    
    // 密碼強度檢測
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const strengthText = ['弱', '中', '強', '很強'][Math.min(strength, 3)];
    const strengthColor = ['#c62828', '#e65100', '#2e7d32', '#1976d2'][Math.min(strength, 3)];
    
    showFieldSuccess('password', `密碼強度：${strengthText}`, strengthColor);
    return true;
}

// 驗證確認密碼
function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (confirmPassword.length === 0) return;
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', '兩次輸入的密碼不一致');
        return false;
    }
    
    showFieldSuccess('confirmPassword', '密碼匹配 ✓');
    return true;
}

// 顯示字段錯誤
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.style.borderColor = '#c62828';
    
    let feedback = document.getElementById(`${fieldId}Feedback`);
    if (!feedback) {
        feedback = document.createElement('small');
        feedback.id = `${fieldId}Feedback`;
        feedback.className = 'field-feedback error';
        field.parentElement.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = 'field-feedback error';
    feedback.style.display = 'block';
}

// 顯示字段成功
function showFieldSuccess(fieldId, message, color = '#2e7d32') {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    field.style.borderColor = color;
    
    let feedback = document.getElementById(`${fieldId}Feedback`);
    if (!feedback) {
        feedback = document.createElement('small');
        feedback.id = `${fieldId}Feedback`;
        feedback.className = 'field-feedback success';
        field.parentElement.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.className = 'field-feedback success';
    feedback.style.color = color;
    feedback.style.display = 'block';
}

// 檢查用戶名是否存在
function isUsernameExists(username) {
    const users = getAllUsers();
    return users.some(u => u.username === username);
}

// 檢查郵箱是否存在
function isEmailExists(email) {
    const users = getAllUsers();
    return users.some(u => u.email === email);
}

// 驗證郵箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 獲取所有用戶
function getAllUsers() {
    const usersStr = localStorage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
}

// 保存用戶
function saveUser(user) {
    try {
        const users = getAllUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    } catch (error) {
        console.error('保存用戶失敗:', error);
        return false;
    }
}

// 獲取隨機頭像
function getRandomAvatar() {
    const avatars = ['👤', '🎭', '🏛️', '🍜', '📸', '⭐', '🎨', '🎪', '🎬', '🎯'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

// 顯示錯誤消息
function showError(message) {
    let errorDiv = document.querySelector('.auth-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    addAuthMessageStyles();
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// 顯示成功消息
function showSuccess(message) {
    let successDiv = document.querySelector('.auth-success');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'auth-success';
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(successDiv, form.firstChild);
        }
    }
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    addAuthMessageStyles();
}

// 添加消息樣式
function addAuthMessageStyles() {
    const styleId = 'auth-message-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .auth-error,
        .auth-success {
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.95rem;
            display: none;
            animation: slideIn 0.3s ease;
        }
        
        .auth-error {
            background-color: #ffebee;
            color: #c62828;
            border: 1px solid #ef5350;
        }
        
        .auth-success {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #66bb6a;
        }
        
        .field-feedback {
            display: block;
            margin-top: 5px;
            font-size: 0.85rem;
        }
        
        .field-feedback.error {
            color: #c62828;
        }
        
        .field-feedback.success {
            color: #2e7d32;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}
