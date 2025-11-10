// 用户管理系统
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 用戶管理頁面開始加載...');
    
    // 验证管理员权限
    if (!verifyAdminPermission()) {
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    initializeUsersPage();
});

let allUsers = [];

// 初始化用户管理页面
function initializeUsersPage() {
    console.log('🎬 初始化用戶管理頁面...');
    
    // 加载用户数据
    loadUsersData();
    
    // 加载统计数据
    loadUserStats();
    
    // 设置事件监听器
    setupEventListeners();
}

// 加载用户数据
function loadUsersData() {
    allUsers = JSON.parse(localStorage.getItem('users')) || [];
    console.log('📦 已加載', allUsers.length, '個用戶');
    
    // 显示用户列表
    displayUsers();
}

// 加载统计数据
function loadUserStats() {
    const totalUsers = allUsers.length;
    const activeUsers = getActiveUsersCount();
    const totalFragments = getTotalFragmentsCount();
    const totalSubmissions = getTotalSubmissionsCount();
    
    const statsContainer = document.getElementById('userStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <div class="stat-label">總用戶數</div>
                <div class="stat-value">${totalUsers}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">✨</div>
            <div class="stat-info">
                <div class="stat-label">活躍用戶</div>
                <div class="stat-value">${activeUsers}</div>
                <div class="stat-trend">最近7天有活動</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🧩</div>
            <div class="stat-info">
                <div class="stat-label">總碎片數</div>
                <div class="stat-value">${totalFragments}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📸</div>
            <div class="stat-info">
                <div class="stat-label">總提交數</div>
                <div class="stat-value">${totalSubmissions}</div>
            </div>
        </div>
    `;
}

// 显示用户列表
function displayUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    // 搜索过滤
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    let filteredUsers = allUsers;
    
    if (searchTerm) {
        filteredUsers = allUsers.filter(u => 
            (u.username && u.username.toLowerCase().includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredUsers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div class="empty-icon">👥</div>
                    <p>沒有找到符合條件的用戶</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // 按注册时间倒序排列
    filteredUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    tableBody.innerHTML = filteredUsers.map(user => {
        const userFragments = getUserFragmentsCount(user.id);
        const userCards = getUserCardsCount(user.id);
        const userSubmissions = getUserSubmissionsCount(user.id);
        const isActive = isUserActive(user.id);
        
        return `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                        <div>
                            <div class="user-name">${user.username}</div>
                            <div class="user-id">ID: ${user.id}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td>${formatDateTime(user.createdAt)}</td>
                <td><span class="badge badge-primary">${userFragments}</span></td>
                <td><span class="badge badge-success">${userCards}</span></td>
                <td><span class="badge badge-info">${userSubmissions}</span></td>
                <td>
                    <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
                        ${isActive ? '活躍' : '不活躍'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="viewUserDetail('${user.id}')" title="查看詳情">
                            👁
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteUser('${user.id}')" title="刪除用戶">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            displayUsers();
        });
    }
}

// 查看用户详情
function viewUserDetail(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('用戶不存在！', 'error');
        return;
    }
    
    const userFragments = getUserFragmentsCount(user.id);
    const userCards = getUserCardsCount(user.id);
    const userSubmissions = getUserSubmissionsCount(user.id);
    const submissions = getUserSubmissions(user.id);
    
    // 创建详情对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog" style="max-width: 800px;">
            <div class="dialog-header">
                <h3>👤 用戶詳情</h3>
                <button class="dialog-close" onclick="closeUserDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="user-detail">
                    <div class="detail-section">
                        <h4>基本信息</h4>
                        <p><strong>用戶名：</strong>${user.username}</p>
                        <p><strong>郵箱：</strong>${user.email}</p>
                        <p><strong>用戶ID：</strong>${user.id}</p>
                        <p><strong>註冊時間：</strong>${formatDateTime(user.createdAt)}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>統計數據</h4>
                        <div class="stats-row">
                            <div class="stat-item">
                                <span class="stat-label">記憶碎片</span>
                                <span class="stat-number">${userFragments}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">記憶卡</span>
                                <span class="stat-number">${userCards}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">提交數</span>
                                <span class="stat-number">${userSubmissions}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>提交記錄</h4>
                        ${submissions.length > 0 ? `
                            <div class="submissions-list">
                                ${submissions.slice(0, 5).map(sub => `
                                    <div class="submission-item-mini">
                                        <span class="status-badge status-${sub.status}">${getStatusText(sub.status)}</span>
                                        <span>${sub.title}</span>
                                        <span class="submission-date">${formatDateTime(sub.submitTime)}</span>
                                    </div>
                                `).join('')}
                                ${submissions.length > 5 ? `<p class="text-muted">還有 ${submissions.length - 5} 條記錄...</p>` : ''}
                            </div>
                        ` : '<p class="text-muted">暫無提交記錄</p>'}
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeUserDialog()">關閉</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 记录管理操作日志
function recordAdminLog(operationType, description, targetName = '', details = {}) {
    const logs = JSON.parse(localStorage.getItem('adminOperationLogs')) || [];
    
    const currentAdmin = JSON.parse(sessionStorage.getItem('adminSession') || localStorage.getItem('adminSession'));
    
    logs.push({
        id: `admin-log-${Date.now()}`,
        operationType: operationType,
        description: description,
        targetName: targetName,
        details: details,
        operator: currentAdmin ? currentAdmin.username : 'unknown',
        operationTime: new Date().toISOString()
    });
    
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('adminOperationLogs', JSON.stringify(logs));
}

// 关闭用户详情对话框
function closeUserDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 删除用户
function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        showMessage('用戶不存在！', 'error');
        return;
    }
    
    if (!confirm(`確定要刪除用戶 "${user.username}" 嗎？\n\n此操作將同時刪除該用戶的所有碎片、卡片和提交記錄！\n此操作不可恢復！`)) {
        return;
    }
    
    // 删除用户
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // 删除用户的碎片
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    delete fragments[userId];
    localStorage.setItem('userFragments', JSON.stringify(fragments));
    
    // 删除用户的卡片
    const cards = JSON.parse(localStorage.getItem('userCards')) || {};
    delete cards[userId];
    localStorage.setItem('userCards', JSON.stringify(cards));
    
    // 删除用户的提交
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const updatedSubmissions = submissions.filter(s => s.userId !== userId);
    localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));
    
    // 记录日志
    recordAdminLog('delete', '刪除了用戶', user.username, { 
        userId: userId, 
        email: user.email 
    });
    
    showMessage('用戶已刪除', 'success');
    
    // 重新加载
    setTimeout(() => {
        loadUsersData();
        loadUserStats();
    }, 500);
}

// 获取活跃用户数量
function getActiveUsersCount() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const activeUserIds = new Set();
    
    submissions.forEach(sub => {
        if (new Date(sub.submitTime) > sevenDaysAgo) {
            activeUserIds.add(sub.userId);
        }
    });
    
    return activeUserIds.size;
}

// 判断用户是否活跃
function isUserActive(userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    return submissions.some(sub => 
        sub.userId === userId && new Date(sub.submitTime) > sevenDaysAgo
    );
}

// 获取总碎片数
function getTotalFragmentsCount() {
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    let total = 0;
    Object.values(fragments).forEach(userFragments => {
        if (Array.isArray(userFragments)) {
            total += userFragments.length;
        }
    });
    return total;
}

// 获取总提交数
function getTotalSubmissionsCount() {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    return submissions.length;
}

// 获取用户碎片数
function getUserFragmentsCount(userId) {
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    return fragments[userId] ? fragments[userId].length : 0;
}

// 获取用户卡片数
function getUserCardsCount(userId) {
    const cards = JSON.parse(localStorage.getItem('userCards')) || {};
    return cards[userId] ? cards[userId].length : 0;
}

// 获取用户提交数
function getUserSubmissionsCount(userId) {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    return submissions.filter(s => s.userId === userId).length;
}

// 获取用户提交记录
function getUserSubmissions(userId) {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    return submissions.filter(s => s.userId === userId).sort((a, b) => 
        new Date(b.submitTime) - new Date(a.submitTime)
    );
}

// 获取状态文本
function getStatusText(status) {
    const texts = {
        'pending': '待審核',
        'approved': '已批准',
        'rejected': '已拒絕'
    };
    return texts[status] || status;
}

// 导出函数
window.viewUserDetail = viewUserDetail;
window.closeUserDialog = closeUserDialog;
window.deleteUser = deleteUser;
