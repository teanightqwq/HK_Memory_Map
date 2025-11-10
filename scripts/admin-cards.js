// 卡片管理系統
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 卡片管理頁面開始加載...');
    
    // 验证管理员权限
    if (!verifyAdminPermission()) {
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    initializeCardsPage();
});

let currentRarity = 'all';
let allCards = [];

// 初始化卡片管理页面
function initializeCardsPage() {
    console.log('🎬 初始化卡片管理頁面...');
    
    // 加载卡片数据
    loadCardsData();
    
    // 加载统计数据
    loadCardStats();
    
    // 设置事件监听器
    setupEventListeners();
}

// 加载卡片数据
function loadCardsData() {
    const cardsData = localStorage.getItem('userCards');
    if (!cardsData) {
        allCards = [];
        return;
    }
    
    const cardsObj = JSON.parse(cardsData);
    
    // 转换为数组格式
    allCards = [];
    Object.entries(cardsObj).forEach(([userId, cards]) => {
        if (Array.isArray(cards)) {
            cards.forEach(card => {
                allCards.push({
                    ...card,
                    userId: userId
                });
            });
        }
    });
    
    console.log('📦 已加載', allCards.length, '張卡片');
    
    // 显示卡片列表
    displayCards();
}

// 加载统计数据
function loadCardStats() {
    const totalCards = allCards.length;
    const cardsByRarity = {
        common: allCards.filter(c => c.rarity === 'common').length,
        rare: allCards.filter(c => c.rarity === 'rare').length,
        epic: allCards.filter(c => c.rarity === 'epic').length,
        legendary: allCards.filter(c => c.rarity === 'legendary').length
    };
    
    const statsContainer = document.getElementById('cardStats');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">🎴</div>
            <div class="stat-info">
                <div class="stat-label">總卡片數</div>
                <div class="stat-value">${totalCards}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">⚪</div>
            <div class="stat-info">
                <div class="stat-label">普通卡片</div>
                <div class="stat-value">${cardsByRarity.common}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🔵</div>
            <div class="stat-info">
                <div class="stat-label">稀有卡片</div>
                <div class="stat-value">${cardsByRarity.rare}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🟣</div>
            <div class="stat-info">
                <div class="stat-label">史詩卡片</div>
                <div class="stat-value">${cardsByRarity.epic}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🟡</div>
            <div class="stat-info">
                <div class="stat-label">傳說卡片</div>
                <div class="stat-value">${cardsByRarity.legendary}</div>
            </div>
        </div>
    `;
}

// 显示卡片列表
function displayCards() {
    const cardsList = document.getElementById('cardsList');
    if (!cardsList) return;
    
    // 过滤卡片
    let filteredCards = allCards;
    if (currentRarity !== 'all') {
        filteredCards = allCards.filter(c => c.rarity === currentRarity);
    }
    
    // 搜索过滤
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredCards = filteredCards.filter(c => 
            (c.title && c.title.toLowerCase().includes(searchTerm)) ||
            (c.description && c.description.toLowerCase().includes(searchTerm)) ||
            (c.location && c.location.toLowerCase().includes(searchTerm))
        );
    }
    
    if (filteredCards.length === 0) {
        cardsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎴</div>
                <p>沒有找到符合條件的卡片</p>
            </div>
        `;
        return;
    }
    
    // 按时间倒序排列
    filteredCards.sort((a, b) => new Date(b.obtainedTime) - new Date(a.obtainedTime));
    
    cardsList.innerHTML = filteredCards.map(card => {
        const user = getUserById(card.userId);
        const rarityInfo = getRarityInfo(card.rarity);
        
        return `
            <div class="card-item rarity-${card.rarity}" data-id="${card.id}">
                <div class="card-rarity-badge" style="background: ${rarityInfo.gradient}">
                    ${rarityInfo.icon} ${rarityInfo.name}
                </div>
                <div class="card-header">
                    <h3>${card.title || '未命名'}</h3>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="viewCardDetail('${card.id}')" title="查看詳情">
                            👁
                        </button>
                        <button class="btn-icon" onclick="editCard('${card.id}')" title="編輯">
                            ✏️
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteCard('${card.id}')" title="刪除">
                            🗑️
                        </button>
                    </div>
                </div>
                <p class="card-description">${card.description ? (card.description.length > 80 ? card.description.substring(0, 80) + '...' : card.description) : '無描述'}</p>
                <div class="card-meta">
                    <span>📍 ${card.location || '未知'}</span>
                    <span>👤 ${user ? user.username : '未知用戶'}</span>
                </div>
                <div class="card-meta">
                    <span>🧩 需要 ${card.fragmentsRequired || 3} 個碎片</span>
                    <span>📅 ${formatDateTime(card.obtainedTime)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// 设置事件监听器
function setupEventListeners() {
    // 稀有度过滤
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentRarity = this.dataset.rarity;
            
            // 更新按钮状态
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 重新显示
            displayCards();
        });
    });
    
    // 搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            displayCards();
        });
    }
}

// 查看卡片详情
function viewCardDetail(cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
        showMessage('卡片不存在！', 'error');
        return;
    }
    
    const user = getUserById(card.userId);
    const rarityInfo = getRarityInfo(card.rarity);
    
    // 创建详情对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog">
            <div class="dialog-header">
                <h3>🎴 卡片詳情</h3>
                <button class="dialog-close" onclick="closeCardDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="card-detail">
                    <div class="detail-section">
                        <div class="card-rarity-badge" style="background: ${rarityInfo.gradient}; display: inline-block; margin-bottom: 15px;">
                            ${rarityInfo.icon} ${rarityInfo.name}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>基本信息</h4>
                        <p><strong>卡片名稱：</strong>${card.title || '未命名'}</p>
                        <p><strong>地點：</strong>${card.location || '未知'}</p>
                        <p><strong>稀有度：</strong>${rarityInfo.name}</p>
                        <p><strong>需要碎片：</strong>${card.fragmentsRequired || 3} 個</p>
                        <p><strong>獲得時間：</strong>${formatDateTime(card.obtainedTime)}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>卡片描述</h4>
                        <p>${card.description || '無描述'}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>其他信息</h4>
                        <p><strong>所屬用戶：</strong>${user ? user.username : '未知'} (${card.userId})</p>
                        <p><strong>來源碎片：</strong>${card.fromFragments ? card.fromFragments.length : 0} 個</p>
                    </div>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeCardDialog()">關閉</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 关闭卡片详情对话框
function closeCardDialog() {
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

// 编辑卡片
function editCard(cardId) {
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
        showMessage('卡片不存在！', 'error');
        return;
    }
    
    // 创建编辑对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog" style="max-width: 600px;">
            <div class="dialog-header">
                <h3>✏️ 編輯卡片</h3>
                <button class="dialog-close" onclick="closeEditCardDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="form-group">
                    <label for="editCardTitle">卡片名稱 *</label>
                    <input type="text" id="editCardTitle" value="${card.title || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCardLocation">地點 *</label>
                    <input type="text" id="editCardLocation" value="${card.location || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="editCardRarity">稀有度 *</label>
                    <select id="editCardRarity">
                        <option value="common" ${card.rarity === 'common' ? 'selected' : ''}>⚪ 普通</option>
                        <option value="rare" ${card.rarity === 'rare' ? 'selected' : ''}>🔵 稀有</option>
                        <option value="epic" ${card.rarity === 'epic' ? 'selected' : ''}>🟣 史詩</option>
                        <option value="legendary" ${card.rarity === 'legendary' ? 'selected' : ''}>🟡 傳說</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editCardFragments">需要碎片數量 *</label>
                    <input type="number" id="editCardFragments" value="${card.fragmentsRequired || 3}" min="1" required>
                </div>
                
                <div class="form-group">
                    <label for="editCardDescription">卡片描述 *</label>
                    <textarea id="editCardDescription" rows="6" required>${card.description || ''}</textarea>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeEditCardDialog()">取消</button>
                <button class="btn-confirm" onclick="confirmEditCard('${cardId}')">保存修改</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// 关闭编辑卡片对话框
function closeEditCardDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 确认编辑卡片
function confirmEditCard(cardId) {
    const title = document.getElementById('editCardTitle').value.trim();
    const location = document.getElementById('editCardLocation').value.trim();
    const rarity = document.getElementById('editCardRarity').value;
    const fragmentsRequired = parseInt(document.getElementById('editCardFragments').value);
    const description = document.getElementById('editCardDescription').value.trim();
    
    if (!title || !location || !description || !fragmentsRequired) {
        alert('請填寫必填欄位！');
        return;
    }
    
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
        showMessage('卡片不存在！', 'error');
        closeEditCardDialog();
        return;
    }
    
    // 更新卡片信息
    card.title = title;
    card.location = location;
    card.rarity = rarity;
    card.fragmentsRequired = fragmentsRequired;
    card.description = description;
    card.lastModified = new Date().toISOString();
    
    // 保存到 localStorage
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    const userId = card.userId;
    
    if (cardsData[userId]) {
        const index = cardsData[userId].findIndex(c => c.id === cardId);
        if (index !== -1) {
            cardsData[userId][index] = card;
            localStorage.setItem('userCards', JSON.stringify(cardsData));
            
            // 记录日志
            recordAdminLog('edit', '編輯了卡片', title, { 
                cardId: cardId, 
                rarity, 
                location 
            });
            
            showMessage('卡片已更新！', 'success');
            closeEditCardDialog();
            
            // 重新显示
            setTimeout(() => {
                displayCards();
            }, 500);
        }
    }
}

// 删除卡片
function deleteCard(cardId) {
    if (!confirm('確定要刪除這張卡片嗎？此操作不可恢復！')) {
        return;
    }
    
    const card = allCards.find(c => c.id === cardId);
    if (!card) {
        showMessage('卡片不存在！', 'error');
        return;
    }
    
    // 从 localStorage 中删除
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    const userId = card.userId;
    
    if (cardsData[userId]) {
        cardsData[userId] = cardsData[userId].filter(c => c.id !== cardId);
        localStorage.setItem('userCards', JSON.stringify(cardsData));
        
        // 记录日志
        recordAdminLog('delete', '刪除了卡片', card.title || '未命名', { 
            cardId: cardId, 
            userId: card.userId,
            rarity: card.rarity 
        });
    }
    
    showMessage('卡片已刪除', 'success');
    
    // 重新加载
    setTimeout(() => {
        loadCardsData();
        loadCardStats();
    }, 500);
}

// 获取用户信息
function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.id === userId);
}

// 获取稀有度信息
function getRarityInfo(rarity) {
    const rarityMap = {
        'common': {
            name: '普通',
            icon: '⚪',
            gradient: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
        },
        'rare': {
            name: '稀有',
            icon: '🔵',
            gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
        },
        'epic': {
            name: '史詩',
            icon: '🟣',
            gradient: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)'
        },
        'legendary': {
            name: '傳說',
            icon: '🟡',
            gradient: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)'
        }
    };
    return rarityMap[rarity] || rarityMap.common;
}

// 导出函数
window.viewCardDetail = viewCardDetail;
window.closeCardDialog = closeCardDialog;
window.editCard = editCard;
window.closeEditCardDialog = closeEditCardDialog;
window.confirmEditCard = confirmEditCard;
window.deleteCard = deleteCard;
