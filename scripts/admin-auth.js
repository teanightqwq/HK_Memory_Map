// 管理员认证系统
console.log('🔧 admin-auth.js 腳本開始加載...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 管理員認證系統已加載');
    
    const loginForm = document.getElementById('adminLoginForm');
    
    if (loginForm) {
        console.log('✅ 找到登錄表單，綁定事件');
        loginForm.addEventListener('submit', handleAdminLogin);
        console.log('✅ Submit 事件已綁定到 handleAdminLogin');
    } else {
        console.warn('⚠️ 未找到登錄表單 #adminLoginForm');
    }
    
    // 初始化默认管理员账号
    initializeAdminAccounts();
    
    // 检查当前登录状态
    const admin = checkAdminLogin();
    if (admin) {
        console.log('👤 當前已登錄:', admin.username, '角色:', admin.role);
    } else {
        console.log('👤 當前未登錄');
    }
});

console.log('🔧 admin-auth.js 腳本加載完成');


// 初始化默认管理员账号
function initializeAdminAccounts() {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // 如果没有管理员账号，创建默认账号
    if (admins.length === 0) {
        console.log('🔧 初始化默認管理員賬號...');
        
        const defaultAdmins = [
            {
                id: 'admin-001',
                username: 'admin',
                password: 'admin123456',
                email: 'admin@hkmemory.com',
                role: 'super_admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 'admin-002',
                username: 'reviewer',
                password: 'review123456',
                email: 'reviewer@hkmemory.com',
                role: 'reviewer',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('admins', JSON.stringify(defaultAdmins));
        console.log('✅ 默認管理員賬號已創建:', defaultAdmins.length, '個');
    } else {
        console.log('✅ 管理員賬號已存在:', admins.length, '個');
    }
}

// 处理管理员登录
function handleAdminLogin(e) {
    console.log('🎯 handleAdminLogin 函數被調用了！');
    console.log('🎯 Event 對象:', e);
    console.log('🎯 Event type:', e ? e.type : 'undefined');
    
    // 立即阻止默认行为和事件传播
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('✅ 已阻止表單默認提交行為');
    } else {
        console.error('❌ Event 對象為 null/undefined！');
        return false;
    }
    
    console.log('🔐 開始處理管理員登錄...');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    console.log('📝 登錄信息:', { username, rememberMe });
    
    // 验证管理员账号
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    console.log('📊 管理員數據庫:', admins.length, '個管理員');
    
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
        console.log('✅ 驗證成功:', admin.username, '角色:', admin.role);
        
        // 登录成功
        const adminSession = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            loginTime: new Date().toISOString()
        };
        
        // 保存会话
        if (rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify(adminSession));
            console.log('💾 會話已保存到 localStorage');
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(adminSession));
            console.log('💾 會話已保存到 sessionStorage');
        }
        
        // 验证保存
        const savedSession = rememberMe ? 
            localStorage.getItem('adminSession') : 
            sessionStorage.getItem('adminSession');
        console.log('✔️ 驗證保存:', savedSession ? '成功' : '失敗');
        
        // 记录登录历史
        recordAdminLogin(admin.id);
        
        showMessage('登录成功！', 'success');
        
        // 跳转到仪表板
        console.log('🚀 準備跳轉到 dashboard.html');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        console.error('❌ 驗證失敗: 用戶名或密碼錯誤');
        console.log('輸入的用戶名:', username);
        console.log('可用的管理員:', admins.map(a => a.username));
        showMessage('用户名或密码错误！', 'error');
    }
}

// 记录管理员登录历史
function recordAdminLogin(adminId) {
    const loginHistory = JSON.parse(localStorage.getItem('adminLoginHistory')) || [];
    loginHistory.push({
        adminId: adminId,
        loginTime: new Date().toISOString(),
        ip: 'localhost' // 实际应用中应该获取真实IP
    });
    
    // 只保留最近100条记录
    if (loginHistory.length > 100) {
        loginHistory.shift();
    }
    
    localStorage.setItem('adminLoginHistory', JSON.stringify(loginHistory));
}

// 检查管理员登录状态
function checkAdminLogin() {
    try {
        // 先检查 localStorage
        const localSession = localStorage.getItem('adminSession');
        if (localSession) {
            console.log('🔍 在 localStorage 找到會話');
            try {
                const admin = JSON.parse(localSession);
                console.log('✅ localStorage 會話解析成功:', admin.username);
                return admin;
            } catch (parseError) {
                console.error('❌ localStorage 會話解析失敗:', parseError);
                localStorage.removeItem('adminSession'); // 清除损坏的数据
            }
        }
        
        // 再检查 sessionStorage
        const sessionSession = sessionStorage.getItem('adminSession');
        if (sessionSession) {
            console.log('🔍 在 sessionStorage 找到會話');
            try {
                const admin = JSON.parse(sessionSession);
                console.log('✅ sessionStorage 會話解析成功:', admin.username);
                return admin;
            } catch (parseError) {
                console.error('❌ sessionStorage 會話解析失敗:', parseError);
                sessionStorage.removeItem('adminSession'); // 清除损坏的数据
            }
        }
        
        console.log('⚪ 未找到任何管理員會話');
        return null;
    } catch (error) {
        console.error('❌ checkAdminLogin 錯誤:', error);
        return null;
    }
}

// 验证管理员权限
function verifyAdminPermission(requiredRole = null) {
    console.log('🔐 開始驗證管理員權限...');
    
    const admin = checkAdminLogin();
    
    if (!admin) {
        // 未登录，跳转到登录页
        console.error('❌ 管理员未登录，準備跳轉到登錄頁');
        console.log('📍 當前頁面:', window.location.href);
        console.log('📍 將跳轉到: login.html');
        
        alert('請先登入管理員賬號！\n\n您可以使用：\nadmin / admin123456');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('✅ 管理员已登录:', admin.username, '角色:', admin.role);
    console.log('📦 會話來源:', localStorage.getItem('adminSession') ? 'LocalStorage' : 'SessionStorage');
    
    // 如果需要特定角色
    if (requiredRole) {
        const roleHierarchy = {
            'super_admin': 3,
            'reviewer': 2,
            'viewer': 1
        };
        
        if (!roleHierarchy[admin.role] || roleHierarchy[admin.role] < roleHierarchy[requiredRole]) {
            console.error('❌ 权限不足:', admin.role, '<', requiredRole);
            showMessage('权限不足！', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            return false;
        }
    }
    
    return true;
}

// 管理员登出
function handleAdminLogout() {
    if (confirm('确定要登出吗？')) {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }
}

// 更新管理员导航栏
function updateAdminNavbar() {
    const admin = checkAdminLogin();
    const navbarRight = document.querySelector('.navbar-right');
    
    if (!navbarRight) return;
    
    if (admin) {
        navbarRight.innerHTML = `
            <div class="admin-user-menu">
                <span class="admin-username">👤 ${admin.username}</span>
                <span class="admin-role">[${getRoleText(admin.role)}]</span>
                <a href="#" class="admin-logout-link" onclick="handleAdminLogout(); return false;">登出</a>
            </div>
        `;
    }
}

// 获取角色文本
function getRoleText(role) {
    const roleTexts = {
        'super_admin': '超级管理员',
        'reviewer': '审核员',
        'viewer': '查看员'
    };
    return roleTexts[role] || '管理员';
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 移除现有消息
    const existingMessage = document.querySelector('.message-box');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建消息框
    const messageBox = document.createElement('div');
    messageBox.className = `message-box message-${type}`;
    messageBox.textContent = message;
    
    document.body.appendChild(messageBox);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageBox.classList.add('fade-out');
        setTimeout(() => {
            messageBox.remove();
        }, 300);
    }, 3000);
}

// 格式化日期时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 导出函数供其他文件使用
window.checkAdminLogin = checkAdminLogin;
window.verifyAdminPermission = verifyAdminPermission;
window.handleAdminLogout = handleAdminLogout;
window.updateAdminNavbar = updateAdminNavbar;
window.showMessage = showMessage;
window.formatDateTime = formatDateTime;
