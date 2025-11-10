// 碎片管理系統
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 碎片管理頁面開始加載...');
    
    // 验证管理员权限
    if (!verifyAdminPermission()) {
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    initializeFragmentsPage();
});

let currentCategory = 'all';
let allFragments = [];

// 初始化碎片管理页面
function initializeFragmentsPage() {
    console.log('🎬 初始化碎片管理頁面...');
    
    // 加载碎片数据
    loadFragmentsData();
    
    // 加载统计数据
    loadFragmentStats();
    
    // 设置事件监听器
    setupEventListeners();
}

// 加载碎片数据
function loadFragmentsData() {
    const fragmentsData = localStorage.getItem('userFragments');
    if (!fragmentsData) {
        allFragments = [];
        return;
    }
    
    const fragmentsObj = JSON.parse(fragmentsData);
    
    // 转换为数组格式
    allFragments = [];
    Object.entries(fragmentsObj).forEach(([userId, fragments]) => {
        if (Array.isArray(fragments)) {
            fragments.forEach(fragment => {
                allFragments.push({
                    ...fragment,
                    userId: userId
                });
            });
        }
    });
    
    console.log('📦 已加載', allFragments.length, '個碎片');
    
    // 显示碎片列表
    displayFragments();
}

// 加载统计数据
function loadFragmentStats() {
    const totalFragments = allFragments.length;
    const fragmentsByCategory = {
        food: allFragments.filter(f => f.category === 'food').length,
        culture: allFragments.filter(f => f.category === 'culture').length,
        architecture: allFragments.filter(f => f.category === 'architecture').length
    };
    
    const statsContainer = document.getElementById('fragmentStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">🧩</div>
            <div class="stat-info">
                <div class="stat-label">總碎片數</div>
                <div class="stat-value">${totalFragments}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🍜</div>
            <div class="stat-info">
                <div class="stat-label">餐飲系列</div>
                <div class="stat-value">${fragmentsByCategory.food}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-info">
                <div class="stat-label">文化系列</div>
                <div class="stat-value">${fragmentsByCategory.culture}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🏛️</div>
            <div class="stat-info">
                <div class="stat-label">建築系列</div>
                <div class="stat-value">${fragmentsByCategory.architecture}</div>
            </div>
        </div>
    `;
}

// 显示碎片列表
function displayFragments() {
    const fragmentsList = document.getElementById('fragmentsList');
    if (!fragmentsList) return;
    
    // 过滤碎片
    let filteredFragments = allFragments;
    if (currentCategory !== 'all') {
        filteredFragments = allFragments.filter(f => f.category === currentCategory);
    }
    
    // 搜索过滤
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredFragments = filteredFragments.filter(f => 
            (f.title && f.title.toLowerCase().includes(searchTerm)) ||
            (f.location && f.location.toLowerCase().includes(searchTerm)) ||
            (f.description && f.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredFragments.length === 0) {
        fragmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧩</div>
                <p>沒有找到符合條件的碎片</p>
            </div>
        `;
        return;
    }
    
    // 按时间倒序排列
    filteredFragments.sort((a, b) => new Date(b.obtainedTime) - new Date(a.obtainedTime));
    
    fragmentsList.innerHTML = filteredFragments.map(fragment => {
        const user = getUserById(fragment.userId);
        const tags = Array.isArray(fragment.tags) ? fragment.tags : 
                     (fragment.tags ? fragment.tags.split(',').map(t => t.trim()) : []);
        
        return `
            <div class="fragment-card" data-id="${fragment.id}">
                <div class="fragment-image">
                    <img src="${fragment.image}" alt="${fragment.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjVmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjZDRhNTc0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+nqSDnorPniYc8L3RleHQ+PC9zdmc+'">
                    <span class="category-badge category-${fragment.category}">
                        ${getCategoryName(fragment.category)}
                    </span>
                </div>
                <div class="fragment-card-content">
                    <div class="fragment-card-header">
                        <h3>${fragment.title || '未命名'}</h3>
                        <div class="fragment-actions">
                            <button class="btn-icon" onclick="viewFragmentDetail('${fragment.id}')" title="查看詳情">
                                👁
                            </button>
                            <button class="btn-icon" onclick="editFragment('${fragment.id}')" title="編輯">
                                ✏️
                            </button>
                            <button class="btn-icon btn-danger" onclick="deleteFragment('${fragment.id}')" title="刪除">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <p class="fragment-description">${fragment.description ? (fragment.description.length > 100 ? fragment.description.substring(0, 100) + '...' : fragment.description) : '無描述'}</p>
                    <div class="fragment-meta">
                        <span>📍 ${fragment.location || '未知'}</span>
                        <span>👤 ${user ? user.username : '未知用戶'}</span>
                    </div>
                    <div class="fragment-meta">
                        <span>📅 ${formatDateTime(fragment.obtainedTime)}</span>
                    </div>
                    ${tags.length > 0 ? `
                        <div class="fragment-tags">
                            ${tags.slice(0, 3).map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            ${tags.length > 3 ? `<span class="tag">+${tags.length - 3}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 设置事件监听器
function setupEventListeners() {
    // 分类过滤
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            
            // 更新按钮状态
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 重新显示
            displayFragments();
        });
    });
    
    // 搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            displayFragments();
        });
    }
}

// 查看碎片详情
function viewFragmentDetail(fragmentId) {
    const fragment = allFragments.find(f => f.id === fragmentId);
    if (!fragment) {
        showMessage('碎片不存在！', 'error');
        return;
    }
    
    const user = getUserById(fragment.userId);
    const tags = Array.isArray(fragment.tags) ? fragment.tags : 
                 (fragment.tags ? fragment.tags.split(',').map(t => t.trim()) : []);
    
    // 创建详情对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog">
            <div class="dialog-header">
                <h3>🧩 碎片詳情</h3>
                <button class="dialog-close" onclick="closeFragmentDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="fragment-detail">
                    <img src="${fragment.image}" alt="${fragment.title}" style="width: 100%; border-radius: 8px; margin-bottom: 20px;">
                    
                    <div class="detail-section">
                        <h4>基本信息</h4>
                        <p><strong>標題：</strong>${fragment.title || '未命名'}</p>
                        <p><strong>地點：</strong>${fragment.location || '未知'}</p>
                        <p><strong>地址：</strong>${fragment.address || '未填寫'}</p>
                        <p><strong>分類：</strong>${getCategoryName(fragment.category)} - ${fragment.subcategory}</p>
                        <p><strong>獲得時間：</strong>${formatDateTime(fragment.obtainedTime)}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>故事描述</h4>
                        <p>${fragment.description || '無描述'}</p>
                    </div>
                    
                    ${tags.length > 0 ? `
                        <div class="detail-section">
                            <h4>標籤</h4>
                            <div class="fragment-tags">
                                ${tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="detail-section">
                        <h4>其他信息</h4>
                        <p><strong>所屬用戶：</strong>${user ? user.username : '未知'} (${fragment.userId})</p>
                        <p><strong>來源提交：</strong>${fragment.fromSubmission || '未知'}</p>
                        <p><strong>審核人：</strong>${fragment.reviewedBy || '未知'}</p>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeFragmentDialog()">關閉</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 关闭碎片详情对话框
function closeFragmentDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
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

// 编辑碎片
function editFragment(fragmentId) {
    const fragment = allFragments.find(f => f.id === fragmentId);
    if (!fragment) {
        showMessage('碎片不存在！', 'error');
        return;
    }
    
    const tags = Array.isArray(fragment.tags) ? fragment.tags.join(', ') : 
                 (fragment.tags || '');
    
    // 创建编辑对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog" style="max-width: 600px;">
            <div class="dialog-header">
                <h3>✏️ 編輯碎片</h3>
                <button class="dialog-close" onclick="closeEditDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="form-group">
                    <label for="editTitle">標題 *</label>
                    <input type="text" id="editTitle" value="${fragment.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="editLocation">地點 *</label>
                    <input type="text" id="editLocation" value="${fragment.location || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="editAddress">詳細地址</label>
                    <input type="text" id="editAddress" value="${fragment.address || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editCategory">分類 *</label>
                    <select id="editCategory">
                        <option value="food" ${fragment.category === 'food' ? 'selected' : ''}>🍜 餐飲</option>
                        <option value="culture" ${fragment.category === 'culture' ? 'selected' : ''}>🎭 文化</option>
                        <option value="architecture" ${fragment.category === 'architecture' ? 'selected' : ''}>🏛️ 建築</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editSubcategory">子分類</label>
                    <input type="text" id="editSubcategory" value="${fragment.subcategory || ''}">
                </div>
                
                <div class="form-group">
                    <label for="editDescription">故事描述 *</label>
                    <textarea id="editDescription" rows="6" required>${fragment.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editTags">標籤（用逗號分隔）</label>
                    <input type="text" id="editTags" value="${tags}" placeholder="例如：懷舊, 老字號, 傳統">
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeEditDialog()">取消</button>
                <button class="btn-confirm" onclick="confirmEditFragment('${fragmentId}')">保存修改</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 关闭编辑对话框
function closeEditDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 确认编辑碎片
function confirmEditFragment(fragmentId) {
    const title = document.getElementById('editTitle').value.trim();
    const location = document.getElementById('editLocation').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const category = document.getElementById('editCategory').value;
    const subcategory = document.getElementById('editSubcategory').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const tagsInput = document.getElementById('editTags').value.trim();
    
    if (!title || !location || !description) {
        alert('請填寫必填欄位！');
        return;
    }
    
    const fragment = allFragments.find(f => f.id === fragmentId);
    if (!fragment) {
        showMessage('碎片不存在！', 'error');
        closeEditDialog();
        return;
    }
    
    // 更新碎片信息
    fragment.title = title;
    fragment.location = location;
    fragment.address = address;
    fragment.category = category;
    fragment.subcategory = subcategory;
    fragment.description = description;
    fragment.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    fragment.lastModified = new Date().toISOString();
    
    // 保存到 localStorage
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    const userId = fragment.userId;
    
    if (fragmentsData[userId]) {
        const index = fragmentsData[userId].findIndex(f => f.id === fragmentId);
        if (index !== -1) {
            fragmentsData[userId][index] = fragment;
            localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
            
            // 记录日志
            recordAdminLog('edit', '編輯了碎片', title, { 
                fragmentId: fragmentId, 
                category, 
                location 
            });
            
            showMessage('碎片已更新！', 'success');
            closeEditDialog();
            
            // 重新显示
            setTimeout(() => {
                displayFragments();
            }, 500);
        }
    }
}

// 删除碎片
function deleteFragment(fragmentId) {
    if (!confirm('確定要刪除這個碎片嗎？此操作不可恢復！')) {
        return;
    }
    
    const fragment = allFragments.find(f => f.id === fragmentId);
    if (!fragment) {
        showMessage('碎片不存在！', 'error');
        return;
    }
    
    // 从 localStorage 中删除
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    const userId = fragment.userId;
    
    if (fragmentsData[userId]) {
        fragmentsData[userId] = fragmentsData[userId].filter(f => f.id !== fragmentId);
        localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
        
        // 记录日志
        recordAdminLog('delete', '刪除了碎片', fragment.title || '未命名', { 
            fragmentId: fragmentId, 
            userId: fragment.userId,
            location: fragment.location 
        });
    }
    
    showMessage('碎片已刪除', 'success');
    
    // 重新加载
    setTimeout(() => {
        loadFragmentsData();
        loadFragmentStats();
    }, 500);
}

// 获取用户信息
function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.id === userId);
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'food': '🍜 餐飲',
        'culture': '🎭 文化',
        'architecture': '🏛️ 建築'
    };
    return names[category] || category;
}

// 导出函数
window.viewFragmentDetail = viewFragmentDetail;
window.closeFragmentDialog = closeFragmentDialog;
window.editFragment = editFragment;
window.closeEditDialog = closeEditDialog;
window.confirmEditFragment = confirmEditFragment;
window.deleteFragment = deleteFragment;
