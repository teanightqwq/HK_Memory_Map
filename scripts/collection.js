// ===========================
// 香港記憶地圖 - 收藏頁面腳本
// ===========================

// 分類和子分類配置
const categoryConfig = {
    food: {
        name: '餐飲系列',
        icon: '🍜',
        subcategories: [
            { value: 'restaurant', label: '傳統茶餐廳' },
            { value: 'snack', label: '老字號小食店' },
            { value: 'bakery', label: '傳統餅店' },
            { value: 'wetmarket', label: '街市大排檔' }
        ]
    },
    culture: {
        name: '文化系列',
        icon: '🎭',
        subcategories: [
            { value: 'opera', label: '粵劇文化' },
            { value: 'temple', label: '傳統廟宇' },
            { value: 'festival', label: '民俗節慶' },
            { value: 'craft', label: '傳統工藝' }
        ]
    },
    architecture: {
        name: '建築系列',
        icon: '🏛️',
        subcategories: [
            { value: 'tenement', label: '唐樓' },
            { value: 'colonial', label: '殖民地建築' },
            { value: 'village', label: '圍村建築' },
            { value: 'industrial', label: '工業遺產' }
        ]
    }
};

// 全局變量
let currentUser = null;
let userFragments = [];
let userCards = [];
let userSubmissions = [];
let currentTab = 'fragments';
let currentFilter = 'all';
let currentSubFilter = 'all'; // 新增：子分類過濾器
let currentCardFilter = 'all'; // 新增：卡片過濾器
let currentCardSubFilter = 'all'; // 新增：卡片子分類過濾器
let currentStatus = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('收藏頁面已加載');
    
    initializeCollectionPage();
    loadUserData();
    updateStatistics();
    setupEventListeners();
    checkUrlParameters();
    
    // 初始加载碎片显示
    displayFragments();
    
    console.log('✅ 收藏頁面初始化完成');
    console.log('📊 用戶碎片數量:', userFragments.length);
    console.log('🎴 用戶卡片數量:', userCards.length);
});

// 初始化收藏頁面
function initializeCollectionPage() {
    console.log('收藏頁面已加載');
    
    // 獲取當前用戶
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('請先登入');
        window.location.href = 'login.html';
        return;
    }
    
    // 更新導航欄
    updateNavbar(currentUser);
}

// 更新導航欄
function updateNavbar(user) {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        const userMenu = createUserMenu(user);
        loginBtn.parentElement.innerHTML = userMenu;
        
        // 添加登出事件
        const logoutBtn = document.querySelector('.logout-link');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }
}

// 創建用戶菜單
function createUserMenu(user) {
    return `
        <div class="user-menu">
            <a href="collection.html" class="user-link">
                <span class="user-avatar">${user.avatar || '👤'}</span>
                <span class="user-name">${user.username}</span>
            </a>
            <a href="#" class="logout-link">登出</a>
        </div>
    `;
}

// 處理登出
function handleLogout() {
    if (confirm('確定要登出嗎？')) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        alert('已成功登出');
        window.location.href = 'login.html';
    }
}

// 獲取當前用戶
function getCurrentUser() {
    // 先檢查 localStorage，再檢查 sessionStorage
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 檢查URL參數
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const category = urlParams.get('category');
    
    // 切換到指定標籤
    if (tab) {
        switchTab(tab);
    }
    
    // 應用分類過濾
    if (category) {
        currentFilter = category;
        highlightFilterButton(category);
        displayFragments();
    }
}

// 加載用戶數據
function loadUserData() {
    if (!currentUser) return;
    
    // 加載碎片
    userFragments = getUserFragments(currentUser.id);
    
    // 加載記憶卡
    userCards = getUserCards(currentUser.id);
    
    // 加載提交記錄
    userSubmissions = getUserSubmissions(currentUser.id);
    
    // 更新全局變量供成就系統使用
    window.userCards = userCards;
}

// 獲取用戶碎片
function getUserFragments(userId) {
    const fragmentsStr = localStorage.getItem('userFragments');
    if (!fragmentsStr) return [];
    
    const allFragments = JSON.parse(fragmentsStr);
    
    // 判断数据结构：如果是对象（按用户ID分组），返回该用户的数组
    if (allFragments && typeof allFragments === 'object' && !Array.isArray(allFragments)) {
        return allFragments[userId] || [];
    }
    
    // 如果是数组（旧格式），按 userId 过滤
    if (Array.isArray(allFragments)) {
        return allFragments.filter(f => f.userId === userId);
    }
    
    return [];
}

// 獲取用戶記憶卡
function getUserCards(userId) {
    const cardsStr = localStorage.getItem('userCards');
    if (!cardsStr) return [];
    
    const allCards = JSON.parse(cardsStr);
    
    // 判断数据结构：如果是对象（按用户ID分组），返回该用户的数组
    if (allCards && typeof allCards === 'object' && !Array.isArray(allCards)) {
        return allCards[userId] || [];
    }
    
    // 如果是数组（旧格式），按 userId 过滤
    if (Array.isArray(allCards)) {
        return allCards.filter(c => c.userId === userId);
    }
    
    return [];
}

// 獲取用戶提交記錄
function getUserSubmissions(userId) {
    const submissionsStr = localStorage.getItem('submissions');
    const allSubmissions = submissionsStr ? JSON.parse(submissionsStr) : [];
    return allSubmissions.filter(s => s.userId === userId).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
}

// 更新統計數據
function updateStatistics() {
    // 更新碎片數量
    const totalFragments = document.getElementById('totalFragments');
    if (totalFragments) {
        totalFragments.textContent = userFragments.length;
    }
    
    // 更新記憶卡數量
    const totalCards = document.getElementById('totalCards');
    if (totalCards) {
        totalCards.textContent = userCards.length;
    }
    
    // 更新排名（從排行榜數據獲取）
    updateUserRank();
}

// 更新用戶排名
function updateUserRank() {
    const userRankElement = document.getElementById('userRank');
    if (!userRankElement || !currentUser) return;
    
    // 獲取所有用戶的碎片數量並排序
    const allUsers = getAllUsersFragmentCount();
    const userRank = allUsers.findIndex(u => u.userId === currentUser.id) + 1;
    
    userRankElement.textContent = userRank > 0 ? userRank : '-';
}

// 獲取所有用戶碎片數量
function getAllUsersFragmentCount() {
    const fragmentsStr = localStorage.getItem('userFragments');
    if (!fragmentsStr) return [];
    
    const allFragments = JSON.parse(fragmentsStr);
    
    // 統計每個用戶的碎片數量
    const userCounts = {};
    
    // 判断数据结构
    if (allFragments && typeof allFragments === 'object' && !Array.isArray(allFragments)) {
        // 对象格式：{userId: [fragments]}
        Object.entries(allFragments).forEach(([userId, fragments]) => {
            if (Array.isArray(fragments)) {
                userCounts[userId] = fragments.length;
            }
        });
    } else if (Array.isArray(allFragments)) {
        // 数组格式（旧格式）
        allFragments.forEach(fragment => {
            userCounts[fragment.userId] = (userCounts[fragment.userId] || 0) + 1;
        });
    }
    
    // 轉換為數組並排序
    return Object.entries(userCounts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count);
}

// 設置事件監聽器
function setupEventListeners() {
    console.log('🔧 設置事件監聽器...');
    
    // 標籤切換
    const tabButtons = document.querySelectorAll('.tab-btn');
    console.log('📑 找到', tabButtons.length, '個標籤按鈕');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            console.log('🔄 切換到標籤:', tab);
            switchTab(tab);
        });
    });
    
    // 分類過濾
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('🔍 找到', filterButtons.length, '個過濾按鈕');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.filter;
            currentSubFilter = 'all'; // 重置子分類過濾器
            console.log('🏷️ 切換過濾器:', currentFilter);
            highlightFilterButton(currentFilter);
            updateSubcategoryFilters(currentFilter); // 更新子分類過濾器
            displayFragments();
        });
    });
    
    // 狀態過濾
    const statusButtons = document.querySelectorAll('.status-btn');
    statusButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentStatus = this.dataset.status;
            highlightStatusButton(currentStatus);
            displaySubmissions();
        });
    });
    
    // 合成按鈕
    const synthesizeButtons = document.querySelectorAll('.btn-synthesize');
    synthesizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.closest('.progress-card').querySelector('h4').textContent;
            handleSynthesize(category);
        });
    });
}

// 切換標籤
function switchTab(tabName) {
    currentTab = tabName;
    
    // 更新按鈕狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // 更新內容顯示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
    
    // 加載對應內容
    switch(tabName) {
        case 'fragments':
            displayFragments();
            break;
        case 'cards':
            displayCards();
            updateSynthesisProgress();
            // 重新绑定卡片过滤器事件
            setupCardFilterListeners();
            break;
        case 'submissions':
            displaySubmissions();
            break;
    }
}

// 更新子分類過濾器
function updateSubcategoryFilters(category) {
    const container = document.getElementById('subcategoryFilters');
    if (!container) return;
    
    if (category === 'all' || !categoryConfig[category]) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    const config = categoryConfig[category];
    const subcategories = config.subcategories;
    
    container.style.display = 'flex';
    container.innerHTML = `
        <button class="filter-btn active" data-subfilter="all">全部${config.name}</button>
        ${subcategories.map(sub => `
            <button class="filter-btn" data-subfilter="${sub.value}">${sub.label}</button>
        `).join('')}
    `;
    
    // 綁定子分類過濾器事件
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentSubFilter = this.dataset.subfilter;
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayFragments();
        });
    });
}

// 更新卡片子分類過濾器
function updateCardSubcategoryFilters(category) {
    const container = document.getElementById('cardSubcategoryFilters');
    if (!container) return;
    
    if (category === 'all' || !categoryConfig[category]) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    
    const config = categoryConfig[category];
    const subcategories = config.subcategories;
    
    container.style.display = 'flex';
    container.innerHTML = `
        <button class="filter-btn active" data-subfilter="all">全部${config.name}</button>
        ${subcategories.map(sub => `
            <button class="filter-btn" data-subfilter="${sub.value}">${sub.label}</button>
        `).join('')}
    `;
    
    // 綁定子分類過濾器事件
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentCardSubFilter = this.dataset.subfilter;
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            displayCards();
        });
    });
}

// 設置卡片過濾器監聽器
function setupCardFilterListeners() {
    const cardsTab = document.getElementById('cardsTab');
    if (!cardsTab) return;
    
    const filterButtons = cardsTab.querySelectorAll('.filter-bar:first-of-type .filter-btn');
    filterButtons.forEach(btn => {
        // 移除旧的事件监听器（如果有）
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // 重新获取并添加新的事件监听器
    const newFilterButtons = cardsTab.querySelectorAll('.filter-bar:first-of-type .filter-btn');
    newFilterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentCardFilter = this.dataset.filter;
            currentCardSubFilter = 'all'; // 重置子分類過濾器
            console.log('🎴 切換卡片過濾器:', currentCardFilter);
            
            // 高亮当前按钮
            newFilterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新子分類過濾器
            updateCardSubcategoryFilters(currentCardFilter);
            
            // 重新显示卡片
            displayCards();
        });
    });
}

// 顯示碎片
function displayFragments() {
    const fragmentsGrid = document.getElementById('fragmentsGrid');
    if (!fragmentsGrid) return;
    
    // 過濾碎片 - 主分類
    let filteredFragments = userFragments;
    if (currentFilter !== 'all') {
        filteredFragments = userFragments.filter(f => f.category === currentFilter);
    }
    
    // 過濾碎片 - 子分類
    if (currentSubFilter !== 'all') {
        filteredFragments = filteredFragments.filter(f => f.subcategory === currentSubFilter);
    }
    
    // 如果沒有碎片，顯示空狀態
    if (filteredFragments.length === 0) {
        const filterText = currentSubFilter !== 'all' 
            ? getSubcategoryLabel(currentFilter, currentSubFilter)
            : (currentFilter === 'all' ? '任何' : '這個分類的');
        fragmentsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧩</div>
                <p>您還沒有收集${filterText}記憶碎片</p>
                <a href="upload.html" class="btn-primary">開始記錄</a>
            </div>
        `;
        return;
    }
    
    // 顯示碎片
    fragmentsGrid.innerHTML = filteredFragments.map(fragment => `
        <div class="fragment-card" onclick="viewFragmentDetail('${fragment.id}')">
            <div class="fragment-image">
                <img src="${fragment.image || fragment.photo || ''}" alt="${fragment.title || fragment.location || '記憶碎片'}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjVmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjZDRhNTc0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+nqSDorrDmhobnorpP54mHPC90ZXh0Pjwvc3ZnPg=='">
                <div class="fragment-overlay">
                    <span class="fragment-category">${getCategoryName(fragment.category)}</span>
                </div>
            </div>
            <div class="fragment-info">
                <h4>${fragment.title || fragment.location || '未命名碎片'}</h4>
                <p class="fragment-story">${fragment.description || fragment.story || '暫無描述'}</p>
                <div class="fragment-meta">
                    <span>📍 ${fragment.location || '未知地點'}</span>
                    <span>📅 ${formatDate(fragment.obtainedTime || fragment.obtainedDate)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 顯示記憶卡
function displayCards() {
    const cardsGrid = document.getElementById('cardsGrid');
    if (!cardsGrid) return;
    
    // 過濾卡片 - 主分類
    let filteredCards = userCards;
    if (currentCardFilter !== 'all') {
        filteredCards = userCards.filter(c => c.category === currentCardFilter);
    }
    
    // 過濾卡片 - 子分類
    if (currentCardSubFilter !== 'all') {
        filteredCards = filteredCards.filter(c => c.subcategory === currentCardSubFilter);
    }
    
    if (filteredCards.length === 0) {
        const filterText = currentCardSubFilter !== 'all' 
            ? getSubcategoryLabel(currentCardFilter, currentCardSubFilter)
            : (currentCardFilter === 'all' ? '任何' : '這個分類的');
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎴</div>
                <p>您還沒有合成${filterText}記憶卡</p>
                <p class="text-muted">收集3個同類碎片即可合成卡片！</p>
            </div>
        `;
        return;
    }
    
    // 按稀有度和时间排序
    const sortedCards = [...filteredCards].sort((a, b) => {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        const rarityDiff = (rarityOrder[a.rarity] || 3) - (rarityOrder[b.rarity] || 3);
        if (rarityDiff !== 0) return rarityDiff;
        return new Date(b.obtainedTime) - new Date(a.obtainedTime);
    });
    
    // 顯示記憶卡
    cardsGrid.innerHTML = sortedCards.map(card => {
        const rarityInfo = getRarityInfo(card.rarity);
        return `
            <div class="card-item rarity-${card.rarity}" onclick="viewCardDetail('${card.id}')">
                <div class="card-rarity-indicator" style="background: ${rarityInfo.color}">
                    ${rarityInfo.icon} ${rarityInfo.name}
                </div>
                <div class="card-header">
                    <h4>${card.title || card.name || '記憶卡'}</h4>
                    <div class="card-badge">${getCategoryIcon(card.category)} ${getCategoryName(card.category)}</div>
                </div>
                <p class="card-description">${card.description}</p>
                <div class="card-footer">
                    <span class="card-location">� ${card.location}</span>
                    <span class="card-date">📅 ${formatDate(card.obtainedTime || card.obtainedDate)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // 添加記憶卡樣式
    addCardStyles();
}

// 更新合成進度
function updateSynthesisProgress() {
    const progressContainer = document.querySelector('.synthesis-progress');
    if (!progressContainer) return;
    
    let progressHTML = '';
    
    // 遍歷每個主分類
    Object.keys(categoryConfig).forEach(categoryKey => {
        const config = categoryConfig[categoryKey];
        const subcategories = config.subcategories;
        
        progressHTML += `<div class="category-progress-section">
            <h4>${config.icon} ${config.name}</h4>`;
        
        // 遍歷每個子分類
        subcategories.forEach(sub => {
            // 只計算未使用的碎片
            const availableFragments = userFragments.filter(f => 
                f.category === categoryKey && 
                f.subcategory === sub.value && 
                !f.usedForSynthesis
            );
            
            // 檢查是否已擁有該子分類的記憶卡
            const existingCards = userCards.filter(c => 
                c.category === categoryKey && 
                c.subcategory === sub.value
            );
            
            const count = availableFragments.length;
            const needed = 3;
            const percentage = Math.min((count / needed) * 100, 100);
            const canSynthesize = count >= needed;
            const hasCard = existingCards.length > 0;
            
            progressHTML += `
                <div class="progress-card ${hasCard ? 'completed' : ''}">
                    <h5>
                        ${sub.label}
                        ${hasCard ? `<span class="complete-badge">✓ ${existingCards.length}張</span>` : ''}
                    </h5>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%; background: ${hasCard ? '#4CAF50' : '#2196F3'}"></div>
                    </div>
                    <p>${count}/${needed} 可用碎片</p>
                    <button class="btn-synthesize ${canSynthesize ? '' : 'disabled'}" 
                            ${canSynthesize ? '' : 'disabled'}
                            onclick="handleSubcategorySynthesize('${categoryKey}', '${sub.value}')">
                        ${canSynthesize ? '🎲 合成卡片' : `還需 ${needed - count} 個碎片`}
                    </button>
                </div>
            `;
        });
        
        progressHTML += `</div>`;
    });
    
    progressContainer.innerHTML = progressHTML;
}

// 處理子分類合成
function handleSubcategorySynthesize(category, subcategory) {
    // 获取该子分类的可用碎片（未被使用的）
    const availableFragments = userFragments.filter(f => 
        f.category === category && 
        f.subcategory === subcategory && 
        !f.usedForSynthesis
    );
    
    const requiredCount = 3;
    
    if (availableFragments.length < requiredCount) {
        const subLabel = getSubcategoryLabel(category, subcategory);
        alert(`可用碎片數量不足！\n需要：${requiredCount} 個未使用的${subLabel}碎片\n當前：${availableFragments.length} 個`);
        return;
    }
    
    const subLabel = getSubcategoryLabel(category, subcategory);
    
    // 確認合成
    if (!confirm(`確定要使用 ${requiredCount} 個${subLabel}碎片合成記憶卡嗎？\n\n💡 提示：\n• 碎片將被標記為已使用（不會刪除）\n• 卡片稀有度隨機決定\n• 稀有度越高，獲得難度越大`)) {
        return;
    }
    
    // 选择要使用的碎片（前3个）
    const selectedFragments = availableFragments.slice(0, requiredCount);
    
    // 随机决定稀有度（抽奖机制）
    const rarity = determineCardRarity();
    const rarityInfo = getRarityInfo(rarity);
    
    // 創建記憶卡
    const newCard = {
        id: `card-${Date.now()}`,
        userId: currentUser.id,
        category: category,
        subcategory: subcategory, // 新增子分類
        title: `${getCategoryName(category)} - ${subLabel}`,
        location: selectedFragments[0].location || '香港',
        description: generateCardDescription(category, subcategory, rarity, selectedFragments),
        rarity: rarity,
        obtainedTime: new Date().toISOString(),
        fromFragments: selectedFragments.map(f => f.id),
        fragmentsRequired: requiredCount
    };
    
    // 标记碎片为已使用
    markFragmentsAsUsed(selectedFragments.map(f => f.id));
    
    // 保存記憶卡
    saveCard(newCard);
    
    // 重新加载數據
    loadUserData();
    
    // 更新顯示
    updateStatistics();
    updateSynthesisProgress();
    displayCards();
    displayFragments();
    
    // 显示成功消息并展示稀有度
    showSynthesisResult(rarityInfo, newCard);
}

// 將 handleSubcategorySynthesize 設為全局函數
window.handleSubcategorySynthesize = handleSubcategorySynthesize;

// 确定卡片稀有度（随机抽奖）
function determineCardRarity() {
    const random = Math.random() * 100;
    
    // 稀有度概率：
    // 普通 (Common): 50%
    // 稀有 (Rare): 30%
    // 史诗 (Epic): 15%
    // 传说 (Legendary): 5%
    
    if (random < 50) {
        return 'common';
    } else if (random < 80) {
        return 'rare';
    } else if (random < 95) {
        return 'epic';
    } else {
        return 'legendary';
    }
}

// 获取稀有度信息
function getRarityInfo(rarity) {
    const rarityMap = {
        'common': {
            name: '普通',
            icon: '⚪',
            color: '#95a5a6',
            description: '常见的香港记忆'
        },
        'rare': {
            name: '稀有',
            icon: '🔵',
            color: '#3498db',
            description: '珍贵的历史片段'
        },
        'epic': {
            name: '史詩',
            icon: '🟣',
            color: '#9b59b6',
            description: '传奇的城市故事'
        },
        'legendary': {
            name: '傳說',
            icon: '🟡',
            color: '#f1c40f',
            description: '永恒的香港记忆'
        }
    };
    return rarityMap[rarity] || rarityMap.common;
}

// 生成卡片描述
function generateCardDescription(category, subcategory, rarity, fragments) {
    const rarityTexts = {
        'common': '這是一段珍貴的香港記憶',
        'rare': '這是一段稀有的歷史見證',
        'epic': '這是一段史詩級的城市傳奇',
        'legendary': '這是一段傳說級的永恆記憶'
    };
    
    const subcategoryLabel = getSubcategoryLabel(category, subcategory);
    const locations = fragments.map(f => f.location).filter(l => l).slice(0, 2);
    const locationText = locations.length > 0 ? `，包括${locations.join('、')}等地` : '';
    
    return `${rarityTexts[rarity]}${locationText}。這些${subcategoryLabel}的記憶，承載著香港的獨特魅力和歷史底蘊。`;
}

// 标记碎片为已使用
function markFragmentsAsUsed(fragmentIds) {
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    
    if (fragmentsData[currentUser.id]) {
        fragmentsData[currentUser.id] = fragmentsData[currentUser.id].map(fragment => {
            if (fragmentIds.includes(fragment.id)) {
                return {
                    ...fragment,
                    usedForSynthesis: true,
                    usedAt: new Date().toISOString()
                };
            }
            return fragment;
        });
        
        localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
    }
}

// 显示合成结果
function showSynthesisResult(rarityInfo, card) {
    // 创建结果对话框
    const overlay = document.createElement('div');
    overlay.className = 'synthesis-result-overlay';
    overlay.innerHTML = `
        <div class="synthesis-result-dialog">
            <div class="synthesis-result-header" style="background: linear-gradient(135deg, ${rarityInfo.color}, ${adjustColor(rarityInfo.color, -20)})">
                <h2>🎉 合成成功！</h2>
            </div>
            <div class="synthesis-result-body">
                <div class="rarity-reveal">
                    <div class="rarity-icon" style="color: ${rarityInfo.color}">${rarityInfo.icon}</div>
                    <h3 style="color: ${rarityInfo.color}">${rarityInfo.name}</h3>
                    <p class="rarity-desc">${rarityInfo.description}</p>
                </div>
                <div class="card-preview">
                    <h4>${card.title}</h4>
                    <p>${card.description}</p>
                    <div class="card-meta">
                        <span>📍 ${card.location}</span>
                        <span>📅 ${formatDate(card.obtainedTime)}</span>
                    </div>
                </div>
            </div>
            <div class="synthesis-result-footer">
                <button class="btn-primary" onclick="closeSynthesisResult()">太棒了！</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 添加动画
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// 关闭合成结果对话框
function closeSynthesisResult() {
    const overlay = document.querySelector('.synthesis-result-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
}

// 颜色调整辅助函数
function adjustColor(color, amount) {
    // 简单的颜色变暗/变亮
    return color; // 简化处理
}

// 保存記憶卡
function saveCard(card) {
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    
    if (!cardsData[currentUser.id]) {
        cardsData[currentUser.id] = [];
    }
    
    cardsData[currentUser.id].push(card);
    localStorage.setItem('userCards', JSON.stringify(cardsData));
}

// 顯示提交記錄
function displaySubmissions() {
    const submissionsList = document.getElementById('submissionsList');
    if (!submissionsList) return;
    
    // 過濾提交記錄
    let filteredSubmissions = userSubmissions;
    if (currentStatus !== 'all') {
        filteredSubmissions = userSubmissions.filter(s => s.status === currentStatus);
    }
    
    if (filteredSubmissions.length === 0) {
        submissionsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>您還沒有${currentStatus === 'all' ? '' : getStatusText(currentStatus)}提交記錄</p>
                <a href="upload.html" class="btn-primary">上傳記憶</a>
            </div>
        `;
        return;
    }
    
    // 顯示提交記錄
    submissionsList.innerHTML = filteredSubmissions.map(submission => `
        <div class="submission-item ${submission.status}">
            <div class="submission-thumb">
                <img src="${submission.photo}" alt="${submission.location}">
            </div>
            <div class="submission-details">
                <div class="submission-header">
                    <h4>${submission.location}</h4>
                    <span class="status-badge ${submission.status}">${getStatusBadge(submission.status)}</span>
                </div>
                <p class="submission-desc">${submission.description}</p>
                <div class="submission-meta">
                    <span>🏷️ ${getCategoryName(submission.category)}</span>
                    <span>📍 ${submission.address}</span>
                    <span>📅 ${formatDate(submission.date)}</span>
                </div>
                ${submission.status === 'rejected' && submission.rejectReason ? 
                    `<div class="reject-reason">
                        <strong>拒絕原因：</strong>${submission.rejectReason}
                    </div>` : ''}
            </div>
        </div>
    `).join('');
    
    // 添加提交項目樣式
    addSubmissionStyles();
}

// 高亮過濾按鈕
function highlightFilterButton(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
}

// 高亮狀態按鈕
function highlightStatusButton(status) {
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        }
    });
}

// 查看碎片詳情
function viewFragmentDetail(fragmentId) {
    const fragment = userFragments.find(f => f.id === fragmentId);
    if (!fragment) return;
    
    // 這裡可以打開模態框顯示詳情
    alert(`碎片詳情：\n\n地點：${fragment.location}\n故事：${fragment.story || fragment.description}`);
}

// 查看卡片詳情
function viewCardDetail(cardId) {
    const card = userCards.find(c => c.id === cardId);
    if (!card) return;
    
    const rarityInfo = getRarityInfo(card.rarity);
    
    // 获取合成这张卡片所用的碎片信息
    let fragmentsInfo = '';
    if (card.fromFragments && card.fromFragments.length > 0) {
        // 从所有用户碎片中查找这些碎片（包括已使用的）
        const allFragments = JSON.parse(localStorage.getItem('userFragments')) || {};
        const userId = getCurrentUser()?.id;
        const allUserFragments = allFragments[userId] || [];
        
        const usedFragments = card.fromFragments.map(fragId => {
            return allUserFragments.find(f => f.id === fragId);
        }).filter(f => f); // 过滤掉找不到的碎片
        
        if (usedFragments.length > 0) {
            // 提取地址信息
            const addresses = usedFragments
                .map(f => f.address || f.location)
                .filter(addr => addr);
            
            // 提取碎片名称
            const fragmentNames = usedFragments
                .map(f => f.title)
                .filter(name => name);
            
            fragmentsInfo = `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                    <h5 style="color: #333; font-size: 0.95rem; margin-bottom: 10px;">🧩 合成碎片</h5>
                    ${fragmentNames.map(name => `
                        <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">
                            • ${name}
                        </p>
                    `).join('')}
                    
                    <h5 style="color: #333; font-size: 0.95rem; margin: 15px 0 10px 0;">📍 記憶地點</h5>
                    ${addresses.map(addr => `
                        <p style="color: #666; font-size: 0.9rem; margin: 5px 0;">
                            • ${addr}
                        </p>
                    `).join('')}
                </div>
            `;
        }
    }
    
    // 获取副分类名称
    const subcategoryName = card.subcategory || '';
    
    // 创建详情对话框
    const overlay = document.createElement('div');
    overlay.className = 'synthesis-result-overlay';
    overlay.innerHTML = `
        <div class="synthesis-result-dialog">
            <div class="synthesis-result-header" style="background: linear-gradient(135deg, ${rarityInfo.color}, ${rarityInfo.color})">
                <h2>🎴 記憶卡詳情</h2>
            </div>
            <div class="synthesis-result-body">
                <div class="rarity-reveal">
                    <div class="rarity-icon" style="color: ${rarityInfo.color}">${rarityInfo.icon}</div>
                    <h3 style="color: ${rarityInfo.color}">${rarityInfo.name}</h3>
                    <p class="rarity-desc">${rarityInfo.description}</p>
                </div>
                <div class="card-preview">
                    <h4>${card.title || card.name || '記憶卡'}</h4>
                    <p>${card.description}</p>
                    <div class="card-meta">
                        <span>🏷️ ${getCategoryName(card.category)}${subcategoryName ? ' - ' + subcategoryName : ''}</span>
                        <span>📅 ${formatDate(card.obtainedTime || card.obtainedDate)}</span>
                    </div>
                    ${fragmentsInfo}
                </div>
            </div>
            <div class="synthesis-result-footer">
                <button class="btn-primary" onclick="closeCardDetail()">關閉</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 添加动画
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// 关闭卡片详情对话框
function closeCardDetail() {
    const overlay = document.querySelector('.synthesis-result-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
}

// 工具函數

// 獲取分類圖標
function getCategoryIcon(category) {
    const icons = {
        food: '🍜',
        culture: '🎭',
        architecture: '🏛️'
    };
    return icons[category] || '📌';
}

// 獲取分類名稱
function getCategoryName(category) {
    const names = {
        food: '餐飲系列',
        culture: '文化系列',
        architecture: '建築系列'
    };
    return names[category] || '其他';
}

// 獲取子分類標籤
function getSubcategoryLabel(category, subcategory) {
    if (!categoryConfig[category]) return subcategory;
    const sub = categoryConfig[category].subcategories.find(s => s.value === subcategory);
    return sub ? sub.label : subcategory;
}

// 獲取地區（從地址提取）
function getDistrict(address) {
    if (!address) return '香港';
    
    // 簡單提取地區名稱
    const districts = ['中環', '上環', '灣仔', '銅鑼灣', '北角', '太古', '西環', 
                       '油麻地', '旺角', '深水埗', '長沙灣', '荔枝角',
                       '尖沙咀', '紅磡', '土瓜灣', '九龍城', '黃大仙', '鑽石山',
                       '觀塘', '牛頭角', '九龍灣', '藍田', '油塘'];
    
    for (let district of districts) {
        if (address.includes(district)) {
            return district;
        }
    }
    
    return address.substring(0, 6);
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-HK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 獲取狀態徽章
function getStatusBadge(status) {
    const badges = {
        pending: '⏳ 待審核',
        approved: '✅ 已通過',
        rejected: '❌ 未通過'
    };
    return badges[status] || status;
}

// 獲取狀態文字
function getStatusText(status) {
    const texts = {
        pending: '待審核的',
        approved: '已通過的',
        rejected: '未通過的'
    };
    return texts[status] || '';
}

// 獲取稀有度文字
function getRarityText(rarity) {
    const texts = {
        common: '普通',
        rare: '稀有',
        epic: '史詩',
        legendary: '傳說'
    };
    return texts[rarity] || '普通';
}

// 檢查是否全部收集完成
function checkAllCollected() {
    const categories = ['food', 'culture', 'architecture'];
    const allCollected = categories.every(category => {
        return userCards.some(card => card.category === category);
    });
    
    if (allCollected && userCards.length >= 3) {
        showAllCollectedBanner();
    }
}

// 顯示全收集橫幅
function showAllCollectedBanner() {
    // 檢查是否已存在橫幅
    if (document.getElementById('allCollectedBanner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'allCollectedBanner';
    banner.className = 'all-collected-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-icon">🎉</div>
            <div class="banner-text">
                <h3>恭喜！您已全收集三大系列記憶卡！</h3>
                <p>您是真正的香港記憶守護者 👑</p>
            </div>
            <button class="banner-close" onclick="closeBanner()">✕</button>
        </div>
    `;
    
    const cardsTab = document.getElementById('cardsTab');
    if (cardsTab) {
        cardsTab.insertBefore(banner, cardsTab.firstChild);
    }
}

// 關閉橫幅
function closeBanner() {
    const banner = document.getElementById('allCollectedBanner');
    if (banner) {
        banner.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    }
}

// 添加記憶卡樣式
function addCardStyles() {
    const styleId = 'card-item-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .card-item {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .card-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
        }
        
        .card-item.rarity-common::before {
            background: linear-gradient(90deg, #95a5a6, #7f8c8d);
        }
        
        .card-item.rarity-rare::before {
            background: linear-gradient(90deg, #3498db, #2980b9);
        }
        
        .card-item.rarity-epic::before {
            background: linear-gradient(90deg, #9b59b6, #8e44ad);
        }
        
        .card-item.rarity-legendary::before {
            background: linear-gradient(90deg, #f1c40f, #f39c12);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        .card-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .card-rarity-indicator {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }
        
        .card-header h4 {
            color: var(--primary-color);
            margin: 0;
            font-size: 1.2rem;
            flex: 1;
        }
        
        .card-badge {
            background-color: rgba(212, 165, 116, 0.1);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--primary-color);
            white-space: nowrap;
        }
        
        .card-description {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            color: var(--text-secondary);
            flex-wrap: wrap;
            gap: 10px;
        }
        
        /* 合成结果对话框样式 */
        .synthesis-result-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .synthesis-result-overlay.show {
            opacity: 1;
        }
        
        .synthesis-result-dialog {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .synthesis-result-overlay.show .synthesis-result-dialog {
            transform: scale(1);
        }
        
        .synthesis-result-header {
            padding: 25px;
            color: white;
            text-align: center;
        }
        
        .synthesis-result-header h2 {
            margin: 0;
            font-size: 1.8rem;
        }
        
        .synthesis-result-body {
            padding: 30px;
        }
        
        .rarity-reveal {
            text-align: center;
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(255, 255, 255, 1));
            border-radius: 12px;
        }
        
        .rarity-icon {
            font-size: 4rem;
            margin-bottom: 10px;
            animation: bounceIn 0.6s ease;
        }
        
        @keyframes bounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .rarity-reveal h3 {
            font-size: 1.8rem;
            margin: 10px 0;
        }
        
        .rarity-desc {
            color: #666;
            font-size: 0.95rem;
            margin: 5px 0 0 0;
        }
        
        .card-preview {
            background: #f8f5f0;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid var(--primary-color);
        }
        
        .card-preview h4 {
            color: var(--primary-color);
            margin: 0 0 10px 0;
            font-size: 1.3rem;
        }
        
        .card-preview p {
            color: #555;
            line-height: 1.6;
            margin: 0 0 15px 0;
        }
        
        .card-meta {
            display: flex;
            gap: 15px;
            font-size: 0.9rem;
            color: #888;
            flex-wrap: wrap;
        }
        
        .synthesis-result-footer {
            padding: 20px 30px;
            text-align: center;
            background: #f5f5f5;
        }
        
        .synthesis-result-footer .btn-primary {
            padding: 12px 40px;
            font-size: 1.1rem;
        }
        
        /* 全收集徽章樣式 */
        .complete-badge {
            display: inline-block;
            margin-left: 10px;
            padding: 4px 12px;
            background: linear-gradient(135deg, #6faa5f, #5d9450);
            color: white;
            border-radius: 15px;
            font-size: 0.75rem;
            font-weight: 600;
            animation: pulse 2s infinite;
            box-shadow: 0 2px 8px rgba(111, 170, 95, 0.3);
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 2px 8px rgba(111, 170, 95, 0.3);
            }
            50% {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(111, 170, 95, 0.5);
            }
        }
        
        /* 已完成的進度卡樣式 */
        .progress-card.completed {
            border: 2px solid #6faa5f;
            background: linear-gradient(135deg, rgba(111, 170, 95, 0.05), rgba(255, 255, 255, 1));
        }
        
        .progress-card.completed .progress-bar {
            background-color: #c8e6c9;
        }
        
        .progress-card.completed .progress-fill {
            background: linear-gradient(90deg, #6faa5f, #81c784);
        }
        
        /* 全收集橫幅樣式 */
        .all-collected-banner {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
            animation: slideDown 0.5s ease;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
        
        .banner-content {
            display: flex;
            align-items: center;
            gap: 20px;
            position: relative;
        }
        
        .banner-icon {
            font-size: 3rem;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }
        
        .banner-text h3 {
            color: #8b4513;
            margin-bottom: 5px;
            font-size: 1.4rem;
        }
        
        .banner-text p {
            color: #a0522d;
            font-size: 1rem;
            margin: 0;
        }
        
        .banner-close {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: none;
            background-color: white;
            color: #8b4513;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .banner-close:hover {
            background-color: #f0f0f0;
            transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
            .banner-content {
                flex-direction: column;
                text-align: center;
            }
            
            .banner-icon {
                font-size: 2.5rem;
            }
            
            .banner-text h3 {
                font-size: 1.2rem;
            }
            
            .synthesis-result-dialog {
                width: 95%;
            }
            
            .rarity-icon {
                font-size: 3rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// 添加提交項目樣式
function addSubmissionStyles() {
    const styleId = 'submission-item-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .submission-item {
            background-color: white;
            border-radius: 12px;
            padding: 20px;
            display: flex;
            gap: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 15px;
        }
        .submission-thumb {
            width: 150px;
            height: 120px;
            flex-shrink: 0;
            border-radius: 8px;
            overflow: hidden;
        }
        .submission-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .submission-details {
            flex: 1;
        }
        .submission-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .submission-header h4 {
            color: var(--primary-color);
            font-size: 1.2rem;
        }
        .status-badge {
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .status-badge.pending {
            background-color: #fff3e0;
            color: #e65100;
        }
        .status-badge.approved {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        .status-badge.rejected {
            background-color: #ffebee;
            color: #c62828;
        }
        .submission-desc {
            color: var(--text-secondary);
            margin-bottom: 10px;
            line-height: 1.6;
        }
        .submission-meta {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }
        .reject-reason {
            margin-top: 10px;
            padding: 10px;
            background-color: #ffebee;
            border-left: 3px solid #c62828;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .submission-item {
                flex-direction: column;
            }
            .submission-thumb {
                width: 100%;
                height: 200px;
            }
        }
    `;
    document.head.appendChild(style);
}

// 導出函數供其他模塊使用
window.viewFragmentDetail = viewFragmentDetail;
window.viewCardDetail = viewCardDetail;
window.closeCardDetail = closeCardDetail;
window.closeBanner = closeBanner;
window.closeSynthesisResult = closeSynthesisResult;
// 導出變量和函數供成就系統使用
window.userCards = userCards;
window.categoryConfig = categoryConfig;
window.getRarityInfo = getRarityInfo;
