// ===========================
// 香港記憶地圖 - 收藏頁面腳本
// ===========================

// 全局變量
let currentUser = null;
let userFragments = [];
let userCards = [];
let userSubmissions = [];
let currentTab = 'fragments';
let currentFilter = 'all';
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
            console.log('🏷️ 切換過濾器:', currentFilter);
            highlightFilterButton(currentFilter);
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
            break;
        case 'submissions':
            displaySubmissions();
            break;
    }
}

// 顯示碎片
function displayFragments() {
    const fragmentsGrid = document.getElementById('fragmentsGrid');
    if (!fragmentsGrid) return;
    
    // 過濾碎片
    let filteredFragments = userFragments;
    if (currentFilter !== 'all') {
        filteredFragments = userFragments.filter(f => f.category === currentFilter);
    }
    
    // 如果沒有碎片，顯示空狀態
    if (filteredFragments.length === 0) {
        fragmentsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧩</div>
                <p>您還沒有收集${currentFilter === 'all' ? '任何' : '這個分類的'}記憶碎片</p>
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
    
    if (userCards.length === 0) {
        cardsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎴</div>
                <p>您還沒有合成任何記憶卡</p>
            </div>
        `;
        return;
    }
    
    // 顯示記憶卡
    cardsGrid.innerHTML = userCards.map(card => `
        <div class="card-item" onclick="viewCardDetail(${card.id})">
            <div class="card-image">
                <img src="${card.image}" alt="${card.name}">
                <div class="card-badge">${getCategoryIcon(card.category)} ${getCategoryName(card.category)}</div>
            </div>
            <div class="card-info">
                <h4>${card.name}</h4>
                <p class="card-description">${card.description}</p>
                <div class="card-footer">
                    <span class="card-date">📅 ${formatDate(card.obtainedDate)}</span>
                    <span class="card-rarity ${card.rarity}">${getRarityText(card.rarity)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // 添加記憶卡樣式
    addCardStyles();
}

// 更新合成進度
function updateSynthesisProgress() {
    const categories = ['food', 'culture', 'architecture'];
    const categoryNames = {
        'food': '🍜 餐飲系列',
        'culture': '🎭 文化系列',
        'architecture': '🏛️ 建築系列'
    };
    
    categories.forEach((category, index) => {
        const categoryFragments = userFragments.filter(f => f.category === category);
        const categoryCards = userCards.filter(c => c.category === category);
        const count = categoryFragments.length;
        const needed = 3;
        const percentage = Math.min((count / needed) * 100, 100);
        
        // 檢查是否已擁有該系列的記憶卡
        const hasCard = categoryCards.length > 0;
        
        // 更新進度條
        const progressCards = document.querySelectorAll('.progress-card');
        if (progressCards[index]) {
            const progressFill = progressCards[index].querySelector('.progress-fill');
            const progressText = progressCards[index].querySelector('p');
            const synthesizeBtn = progressCards[index].querySelector('.btn-synthesize');
            const cardTitle = progressCards[index].querySelector('h4');
            
            if (progressFill) {
                progressFill.style.width = `${percentage}%`;
            }
            
            if (progressText) {
                progressText.textContent = `${count}/${needed} 碎片`;
            }
            
            if (synthesizeBtn) {
                synthesizeBtn.disabled = count < needed;
                synthesizeBtn.textContent = count >= needed ? '合成卡片' : `還需 ${needed - count} 個碎片`;
            }
            
            // 如果已擁有記憶卡，添加全收集徽章
            if (cardTitle && hasCard) {
                // 移除舊的徽章（如果存在）
                const existingBadge = progressCards[index].querySelector('.complete-badge');
                if (existingBadge) {
                    existingBadge.remove();
                }
                
                // 添加新徽章
                const completeBadge = document.createElement('span');
                completeBadge.className = 'complete-badge';
                completeBadge.innerHTML = '✓ 已收集';
                completeBadge.title = '您已擁有此系列的記憶卡！';
                cardTitle.appendChild(completeBadge);
                
                // 為進度卡添加完成樣式
                progressCards[index].classList.add('completed');
            }
        }
    });
    
    // 檢查是否全部收集完成
    checkAllCollected();
}

// 處理合成
function handleSynthesize(categoryTitle) {
    // 從標題提取分類
    let category = '';
    if (categoryTitle.includes('餐飲')) category = 'food';
    else if (categoryTitle.includes('文化')) category = 'culture';
    else if (categoryTitle.includes('建築')) category = 'architecture';
    
    if (!category) return;
    
    const categoryFragments = userFragments.filter(f => f.category === category);
    
    if (categoryFragments.length < 3) {
        alert('碎片數量不足，無法合成');
        return;
    }
    
    // 確認合成
    if (!confirm(`確定要使用 3 個${getCategoryName(category)}碎片合成記憶卡嗎？`)) {
        return;
    }
    
    // 創建記憶卡
    const newCard = {
        id: Date.now(),
        userId: currentUser.id,
        category: category,
        name: `${getCategoryName(category)}記憶卡`,
        description: `收集了3個${getCategoryName(category)}的珍貴記憶`,
        image: categoryFragments[0].photo, // 使用第一個碎片的圖片
        rarity: 'rare',
        obtainedDate: new Date().toISOString(),
        fragments: categoryFragments.slice(0, 3).map(f => f.id)
    };
    
    // 保存記憶卡
    saveCard(newCard);
    
    // 標記碎片為已使用（可選：移除或標記）
    // 這裡我們選擇保留碎片，只是記錄已用於合成
    
    // 重新加載數據
    userCards = getUserCards(currentUser.id);
    
    // 更新顯示
    updateStatistics();
    updateSynthesisProgress();
    displayCards();
    
    // 顯示成功消息
    alert('🎉 恭喜！成功合成記憶卡！');
}

// 保存記憶卡
function saveCard(card) {
    const cardsStr = localStorage.getItem('userCards');
    const allCards = cardsStr ? JSON.parse(cardsStr) : [];
    allCards.push(card);
    localStorage.setItem('userCards', JSON.stringify(allCards));
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
    
    alert(`記憶卡詳情：\n\n名稱：${card.name}\n描述：${card.description}`);
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
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .card-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .card-image {
            position: relative;
            height: 180px;
            overflow: hidden;
            background: linear-gradient(135deg, #d4a574, #c9896b);
        }
        .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.9;
        }
        .card-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: rgba(255, 255, 255, 0.95);
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .card-info {
            padding: 20px;
        }
        .card-info h4 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        .card-description {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 15px;
        }
        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
        }
        .card-date {
            color: var(--text-secondary);
        }
        .card-rarity {
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
        }
        .card-rarity.rare {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .card-rarity.epic {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        .card-rarity.legendary {
            background-color: #fff3e0;
            color: #e65100;
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
window.closeBanner = closeBanner;
