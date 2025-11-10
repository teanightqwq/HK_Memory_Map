// ===========================
// 香港記憶地圖 - 認證系統腳本
// ===========================

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
    setupAuthHandlers();
});

// 初始化認證頁面
function initializeAuthPage() {
    console.log('認證頁面已加載');
    
    // 檢查是否已登入
    const currentUser = getCurrentUser();
    if (currentUser) {
        // 已登入，重定向到收藏頁面
        window.location.href = 'collection.html';
    }
}

// 設置認證處理器
function setupAuthHandlers() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// 處理登入
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    // 驗證輸入
    if (!username || !password) {
        showError('請填寫所有必填字段');
        return;
    }
    
    // 獲取所有用戶
    const users = getAllUsers();
    
    // 查找匹配的用戶（支持用戶名或郵箱）
    const user = users.find(u => 
        (u.username === username || u.email === username) && u.password === password
    );
    
    if (user) {
        // 登入成功
        const loginUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar || '👤',
            loginTime: new Date().toISOString()
        };
        
        // 保存登入狀態
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(loginUser));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(loginUser));
        }
        
        // 記錄登入歷史
        recordLoginHistory(user.id);
        
        // 顯示成功消息
        showSuccess('登入成功！正在跳轉...');
        
        // 跳轉到首頁
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    } else {
        // 登入失敗
        showError('用戶名或密碼錯誤');
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

// 獲取所有用戶
function getAllUsers() {
    const usersStr = localStorage.getItem('users');
    let users = usersStr ? JSON.parse(usersStr) : [];
    
    // 如果沒有用戶，創建默認測試用戶
    if (users.length === 0) {
        users = createDefaultUsers();
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return users;
}

// 創建默認用戶（用於測試）
function createDefaultUsers() {
    return [
        {
            id: 'user_demo1',
            username: 'demo',
            email: 'demo@hkmemory.com',
            password: '123456',
            avatar: '👤',
            registerDate: new Date().toISOString(),
            role: 'user'
        },
        {
            id: 'user_test',
            username: 'test',
            email: 'test@hkmemory.com',
            password: 'test123',
            avatar: '🎭',
            registerDate: new Date().toISOString(),
            role: 'user'
        }
    ];
}

// 記錄登入歷史
function recordLoginHistory(userId) {
    const historyStr = localStorage.getItem('loginHistory');
    const history = historyStr ? JSON.parse(historyStr) : [];
    
    history.push({
        userId: userId,
        loginTime: new Date().toISOString(),
        userAgent: navigator.userAgent
    });
    
    // 只保留最近100條記錄
    if (history.length > 100) {
        history.shift();
    }
    
    localStorage.setItem('loginHistory', JSON.stringify(history));
}

// 登出
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// 顯示錯誤消息
function showError(message) {
    // 創建或更新錯誤提示
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
    
    // 添加樣式（如果還沒有）
    addAuthMessageStyles();
    
    // 3秒後自動隱藏
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
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
    
    // 添加樣式（如果還沒有）
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

// 社交登入（模擬）
function handleSocialLogin(provider) {
    alert(`${provider} 登入功能開發中，敬請期待！`);
}

// 導出函數
window.logout = logout;
window.handleSocialLogin = handleSocialLogin;
