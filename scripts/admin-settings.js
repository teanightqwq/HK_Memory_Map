// 系统设置管理
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 系統設置頁面開始加載...');
    
    // 验证管理员权限（需要超级管理员）
    if (!verifyAdminPermission('super_admin')) {
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    initializeSettingsPage();
});

// 初始化设置页面
function initializeSettingsPage() {
    console.log('🎬 初始化系統設置頁面...');
    
    // 加载管理员列表
    loadAdminsList();
    
    // 加载系统信息
    loadSystemInfo();
    
    // 加载审核日志
    loadReviewLogs();
}

// 加载管理员列表
function loadAdminsList() {
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const container = document.getElementById('adminsList');
    if (!container) return;
    
    container.innerHTML = admins.map(admin => `
        <div class="admin-item">
            <div class="admin-info">
                <div class="admin-avatar">${admin.username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="admin-name">${admin.username}</div>
                    <div class="admin-email">${admin.email}</div>
                </div>
            </div>
            <div class="admin-meta">
                <span class="role-badge role-${admin.role}">${getRoleText(admin.role)}</span>
                <span class="admin-date">創建於 ${formatDateTime(admin.createdAt)}</span>
            </div>
            ${admin.role !== 'super_admin' ? `
                <button class="btn-icon btn-danger" onclick="deleteAdmin('${admin.id}')" title="刪除">
                    🗑️
                </button>
            ` : ''}
        </div>
    `).join('');
}

// 加载系统信息
function loadSystemInfo() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    const cards = JSON.parse(localStorage.getItem('userCards')) || {};
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // 计算碎片总数
    let totalFragments = 0;
    Object.values(fragments).forEach(userFragments => {
        if (Array.isArray(userFragments)) {
            totalFragments += userFragments.length;
        }
    });
    
    // 计算卡片总数
    let totalCards = 0;
    Object.values(cards).forEach(userCards => {
        if (Array.isArray(userCards)) {
            totalCards += userCards.length;
        }
    });
    
    // 计算 localStorage 使用量
    let storageSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            storageSize += localStorage[key].length + key.length;
        }
    }
    const storageMB = (storageSize / 1024 / 1024).toFixed(2);
    
    const container = document.getElementById('systemInfo');
    if (!container) return;
    
    container.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">👥 用戶數量</span>
                <span class="info-value">${users.length}</span>
            </div>
            <div class="info-item">
                <span class="info-label">🧩 碎片數量</span>
                <span class="info-value">${totalFragments}</span>
            </div>
            <div class="info-item">
                <span class="info-label">🎴 卡片數量</span>
                <span class="info-value">${totalCards}</span>
            </div>
            <div class="info-item">
                <span class="info-label">📸 提交數量</span>
                <span class="info-value">${submissions.length}</span>
            </div>
            <div class="info-item">
                <span class="info-label">👮 管理員數量</span>
                <span class="info-value">${admins.length}</span>
            </div>
            <div class="info-item">
                <span class="info-label">💾 存儲使用</span>
                <span class="info-value">${storageMB} MB</span>
            </div>
            <div class="info-item">
                <span class="info-label">📅 系統版本</span>
                <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
                <span class="info-label">🕐 當前時間</span>
                <span class="info-value">${new Date().toLocaleString('zh-HK')}</span>
            </div>
        </div>
    `;
}

// 加载审核日志
function loadReviewLogs() {
    const reviewLogs = JSON.parse(localStorage.getItem('reviewLogs')) || [];
    const adminLogs = JSON.parse(localStorage.getItem('adminOperationLogs')) || [];
    
    // 合并两种日志
    const allLogs = [
        ...reviewLogs.map(log => ({ ...log, logType: 'review' })),
        ...adminLogs.map(log => ({ ...log, logType: 'admin' }))
    ];
    
    // 按时间排序
    allLogs.sort((a, b) => new Date(b.reviewTime || b.operationTime) - new Date(a.reviewTime || a.operationTime));
    
    const container = document.getElementById('reviewLogs');
    if (!container) return;
    
    if (allLogs.length === 0) {
        container.innerHTML = '<p class="text-muted">暫無操作日誌</p>';
        return;
    }
    
    // 显示最近30条
    const recentLogs = allLogs.slice(0, 30);
    
    container.innerHTML = `
        <div class="logs-list">
            ${recentLogs.map(log => {
                if (log.logType === 'review') {
                    // 审核日志
                    return `
                        <div class="log-item">
                            <span class="log-icon ${log.action === 'approved' ? 'log-success' : 'log-danger'}">
                                ${log.action === 'approved' ? '✅' : '❌'}
                            </span>
                            <div class="log-content">
                                <div class="log-text">
                                    <strong>${log.reviewer}</strong> ${log.action === 'approved' ? '批准' : '拒絕'}了提交 
                                    <code>${log.submissionId}</code>
                                    ${log.submissionTitle ? `<span style="color: #666;"> - ${log.submissionTitle}</span>` : ''}
                                    ${log.reason ? `<br><small style="color: #888;">原因：${log.reason}</small>` : ''}
                                </div>
                                <div class="log-time">${formatDateTime(log.reviewTime)}</div>
                            </div>
                        </div>
                    `;
                } else {
                    // 管理操作日志
                    const icons = {
                        'create': '➕',
                        'edit': '✏️',
                        'delete': '🗑️',
                        'ban': '🚫',
                        'unban': '✅'
                    };
                    const colors = {
                        'create': 'log-success',
                        'edit': 'log-info',
                        'delete': 'log-danger',
                        'ban': 'log-warning',
                        'unban': 'log-success'
                    };
                    return `
                        <div class="log-item">
                            <span class="log-icon ${colors[log.operationType] || 'log-info'}">
                                ${icons[log.operationType] || '📝'}
                            </span>
                            <div class="log-content">
                                <div class="log-text">
                                    <strong>${log.operator}</strong> ${log.description}
                                    ${log.targetName ? `<span style="color: #666;"> - ${log.targetName}</span>` : ''}
                                </div>
                                <div class="log-time">${formatDateTime(log.operationTime)}</div>
                            </div>
                        </div>
                    `;
                }
            }).join('')}
        </div>
        <p class="text-muted" style="margin-top: 15px;">總共 ${allLogs.length} 條日誌（審核 ${reviewLogs.length}，管理 ${adminLogs.length}）</p>
    `;
}

// 记录管理操作日志
function recordAdminLog(operationType, description, targetName = '', details = {}) {
    const logs = JSON.parse(localStorage.getItem('adminOperationLogs')) || [];
    
    const currentAdmin = checkAdminLogin();
    
    logs.push({
        id: `admin-log-${Date.now()}`,
        operationType: operationType, // create, edit, delete, ban, unban
        description: description,
        targetName: targetName,
        details: details,
        operator: currentAdmin ? currentAdmin.username : 'unknown',
        operationTime: new Date().toISOString()
    });
    
    // 只保留最近1000条日志
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('adminOperationLogs', JSON.stringify(logs));
}

// 导出所有数据
function exportAllData() {
    const data = {
        users: JSON.parse(localStorage.getItem('users')) || [],
        submissions: JSON.parse(localStorage.getItem('submissions')) || [],
        userFragments: JSON.parse(localStorage.getItem('userFragments')) || {},
        userCards: JSON.parse(localStorage.getItem('userCards')) || {},
        admins: JSON.parse(localStorage.getItem('admins')) || [],
        reviewLogs: JSON.parse(localStorage.getItem('reviewLogs')) || [],
        adminOperationLogs: JSON.parse(localStorage.getItem('adminOperationLogs')) || [],
        exportTime: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hk-memory-map-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showMessage('數據已導出！', 'success');
}

// 导入数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!confirm('導入數據將覆蓋現有數據，確定繼續嗎？')) {
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!data.users || !data.submissions) {
                throw new Error('數據格式錯誤');
            }
            
            // 导入数据
            localStorage.setItem('users', JSON.stringify(data.users));
            localStorage.setItem('submissions', JSON.stringify(data.submissions));
            localStorage.setItem('userFragments', JSON.stringify(data.userFragments || {}));
            localStorage.setItem('userCards', JSON.stringify(data.userCards || {}));
            localStorage.setItem('reviewLogs', JSON.stringify(data.reviewLogs || []));
            
            if (data.adminOperationLogs) {
                localStorage.setItem('adminOperationLogs', JSON.stringify(data.adminOperationLogs));
            }
            
            showMessage('數據導入成功！', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } catch (error) {
            showMessage('數據導入失敗：' + error.message, 'error');
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// 清除所有数据
function clearAllData() {
    if (!confirm('⚠️ 警告！\n\n確定要清除所有數據嗎？\n這將刪除所有用戶、碎片、提交記錄等！\n此操作不可恢復！')) {
        return;
    }
    
    if (!confirm('最後確認：真的要清除所有數據嗎？')) {
        return;
    }
    
    // 清除数据但保留管理员账号
    localStorage.removeItem('users');
    localStorage.removeItem('submissions');
    localStorage.removeItem('userFragments');
    localStorage.removeItem('userCards');
    localStorage.removeItem('reviewLogs');
    localStorage.removeItem('adminOperationLogs');
    localStorage.removeItem('adminLoginHistory');
    
    showMessage('數據已清除！', 'success');
    
    setTimeout(() => {
        location.reload();
    }, 1500);
}

// 显示添加管理员对话框
function showAddAdminDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog">
            <div class="dialog-header">
                <h3>➕ 添加管理員</h3>
                <button class="dialog-close" onclick="closeAddAdminDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="form-group">
                    <label for="newAdminUsername">用戶名</label>
                    <input type="text" id="newAdminUsername" placeholder="請輸入用戶名">
                </div>
                <div class="form-group">
                    <label for="newAdminEmail">郵箱</label>
                    <input type="email" id="newAdminEmail" placeholder="請輸入郵箱">
                </div>
                <div class="form-group">
                    <label for="newAdminPassword">密碼</label>
                    <input type="password" id="newAdminPassword" placeholder="請輸入密碼">
                </div>
                <div class="form-group">
                    <label for="newAdminRole">角色</label>
                    <select id="newAdminRole">
                        <option value="reviewer">審核員</option>
                        <option value="super_admin">超級管理員</option>
                    </select>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeAddAdminDialog()">取消</button>
                <button class="btn-confirm" onclick="confirmAddAdmin()">確認添加</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 关闭添加管理员对话框
function closeAddAdminDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 确认添加管理员
function confirmAddAdmin() {
    const username = document.getElementById('newAdminUsername').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPassword').value;
    const role = document.getElementById('newAdminRole').value;
    
    if (!username || !email || !password) {
        alert('請填寫所有欄位！');
        return;
    }
    
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    
    // 检查用户名是否已存在
    if (admins.some(a => a.username === username)) {
        alert('用戶名已存在！');
        return;
    }
    
    // 添加新管理员
    const newAdmin = {
        id: `admin-${Date.now()}`,
        username: username,
        password: password,
        email: email,
        role: role,
        createdAt: new Date().toISOString()
    };
    
    admins.push(newAdmin);
    localStorage.setItem('admins', JSON.stringify(admins));
    
    // 记录日志
    recordAdminLog('create', '添加了新管理員', username, { email, role });
    
    showMessage('管理員已添加！', 'success');
    closeAddAdminDialog();
    
    setTimeout(() => {
        loadAdminsList();
    }, 500);
}

// 删除管理员
function deleteAdmin(adminId) {
    if (!confirm('確定要刪除這個管理員嗎？')) {
        return;
    }
    
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const deletedAdmin = admins.find(a => a.id === adminId);
    const updatedAdmins = admins.filter(a => a.id !== adminId);
    
    localStorage.setItem('admins', JSON.stringify(updatedAdmins));
    
    // 记录日志
    if (deletedAdmin) {
        recordAdminLog('delete', '刪除了管理員', deletedAdmin.username, { email: deletedAdmin.email, role: deletedAdmin.role });
    }
    
    showMessage('管理員已刪除！', 'success');
    
    setTimeout(() => {
        loadAdminsList();
    }, 500);
}

// 获取角色文本
function getRoleText(role) {
    const texts = {
        'super_admin': '超級管理員',
        'reviewer': '審核員',
        'viewer': '查看員'
    };
    return texts[role] || role;
}

// 导出函数
window.exportAllData = exportAllData;
window.importData = importData;
window.clearAllData = clearAllData;
window.showAddAdminDialog = showAddAdminDialog;
window.closeAddAdminDialog = closeAddAdminDialog;
window.confirmAddAdmin = confirmAddAdmin;
window.deleteAdmin = deleteAdmin;
