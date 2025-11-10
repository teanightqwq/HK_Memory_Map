// ===========================
// 香港記憶地圖 - 排行榜頁面腳本
// ===========================

// 全局變量
let currentTimeRange = 'week';
let leaderboardData = [];
let currentUser = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeLeaderboard();
    setupEventListeners();
    loadLeaderboardData();
});

// 初始化排行榜
function initializeLeaderboard() {
    console.log('排行榜頁面已加載');
    
    // 獲取當前用戶
    currentUser = getCurrentUser();
    
    // 更新用戶登入狀態
    updateLoginButton();
}

// 獲取當前用戶
// 獲取當前用戶
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 更新登入按鈕
function updateLoginButton() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn && currentUser) {
        const userMenu = createUserMenu(currentUser);
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

// 設置事件監聽器
function setupEventListeners() {
    // 時間範圍切換按鈕
    const rangeButtons = document.querySelectorAll('.range-btn');
    rangeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentTimeRange = this.dataset.range;
            updateRangeButtons();
            loadLeaderboardData();
        });
    });
}

// 更新時間範圍按鈕狀態
function updateRangeButtons() {
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.range === currentTimeRange) {
            btn.classList.add('active');
        }
    });
}

// 加載排行榜數據
function loadLeaderboardData() {
    // 獲取所有用戶的碎片數據
    const fragmentsStr = localStorage.getItem('userFragments');
    const allFragments = fragmentsStr ? JSON.parse(fragmentsStr) : [];
    
    // 獲取所有用戶信息
    const usersStr = localStorage.getItem('users');
    const allUsers = usersStr ? JSON.parse(usersStr) : [];
    
    // 獲取所有記憶卡
    const cardsStr = localStorage.getItem('userCards');
    const allCards = cardsStr ? JSON.parse(cardsStr) : [];
    
    // 根據時間範圍過濾碎片
    const filteredFragments = filterByTimeRange(allFragments);
    
    // 統計每個用戶的數據
    const userStats = {};
    
    // 統計碎片數量
    filteredFragments.forEach(fragment => {
        if (!userStats[fragment.userId]) {
            userStats[fragment.userId] = {
                userId: fragment.userId,
                fragmentCount: 0,
                cardCount: 0,
                achievements: []
            };
        }
        userStats[fragment.userId].fragmentCount++;
    });
    
    // 統計記憶卡數量
    allCards.forEach(card => {
        if (userStats[card.userId]) {
            userStats[card.userId].cardCount++;
        }
    });
    
    // 添加用戶信息和成就
    Object.keys(userStats).forEach(userId => {
        const user = allUsers.find(u => u.id === userId) || { username: `用戶${userId}` };
        userStats[userId].username = user.username;
        userStats[userId].avatar = user.avatar || '👤';
        userStats[userId].achievements = calculateAchievements(userStats[userId]);
    });
    
    // 轉換為數組並排序
    leaderboardData = Object.values(userStats)
        .filter(user => user.fragmentCount > 0)
        .sort((a, b) => b.fragmentCount - a.fragmentCount);
    
    // 如果數據不足，添加示例數據
    if (leaderboardData.length < 5) {
        addSampleData();
    }
    
    // 顯示排行榜
    displayTopThree();
    displayLeaderboardTable();
}

// 根據時間範圍過濾
function filterByTimeRange(fragments) {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const startOfMonth = getStartOfMonth(now);
    
    return fragments.filter(fragment => {
        const fragmentDate = new Date(fragment.obtainedDate || fragment.date);
        
        switch(currentTimeRange) {
            case 'week':
                return fragmentDate >= startOfWeek;
            case 'month':
                return fragmentDate >= startOfMonth;
            case 'all':
            default:
                return true;
        }
    });
}

// 獲取本週開始時間
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 週一為一週開始
    return new Date(d.setDate(diff));
}

// 獲取本月開始時間
function getStartOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// 顯示前三名
function displayTopThree() {
    const topThree = leaderboardData.slice(0, 3);
    
    // 確保至少有3個位置
    while (topThree.length < 3) {
        topThree.push({
            username: '暫無',
            avatar: '👤',
            fragmentCount: 0,
            cardCount: 0
        });
    }
    
    // 按照 rank-2, rank-1, rank-3 的順序排列
    const orderedRanks = [
        { data: topThree[1], rankClass: 'rank-2', badge: '🥈', position: '第二名' },
        { data: topThree[0], rankClass: 'rank-1', badge: '🥇', position: '第一名' },
        { data: topThree[2], rankClass: 'rank-3', badge: '🥉', position: '第三名' }
    ];
    
    // 更新前三名卡片
    const rankCards = document.querySelectorAll('.rank-card');
    orderedRanks.forEach((rank, index) => {
        if (rankCards[index]) {
            const nameEl = rankCards[index].querySelector('.rank-name');
            const scoreEl = rankCards[index].querySelector('.rank-score');
            const avatarEl = rankCards[index].querySelector('.rank-avatar');
            
            if (nameEl) nameEl.textContent = rank.data.username;
            if (scoreEl) scoreEl.textContent = `${rank.data.fragmentCount} 碎片`;
            if (avatarEl) avatarEl.textContent = rank.data.avatar;
            
            // 高亮當前用戶
            if (currentUser && rank.data.userId === currentUser.id) {
                rankCards[index].style.border = '3px solid var(--primary-color)';
                rankCards[index].style.backgroundColor = 'rgba(212, 165, 116, 0.1)';
            }
        }
    });
}

// 顯示排行榜表格
function displayLeaderboardTable() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (!leaderboardBody) return;
    
    // 從第4名開始顯示（前3名已在上方展示）
    const tableData = leaderboardData.slice(3);
    
    if (tableData.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    暫無更多排名數據
                </td>
            </tr>
        `;
        return;
    }
    
    leaderboardBody.innerHTML = tableData.map((user, index) => {
        const rank = index + 4; // 從第4名開始
        const isCurrentUser = currentUser && user.userId === currentUser.id;
        const rowClass = isCurrentUser ? 'current-user-row' : '';
        
        return `
            <tr class="${rowClass}">
                <td class="rank-number">${rank}</td>
                <td class="user-info">
                    <span class="user-avatar">${user.avatar}</span>
                    <span class="user-name">${user.username}${isCurrentUser ? ' (你)' : ''}</span>
                </td>
                <td>${user.fragmentCount}</td>
                <td>${user.cardCount}</td>
                <td>
                    ${user.achievements.map(achievement => 
                        `<span class="badge">${achievement}</span>`
                    ).join(' ')}
                </td>
            </tr>
        `;
    }).join('');
    
    // 添加當前用戶高亮樣式
    addCurrentUserStyles();
}

// 計算用戶成就
function calculateAchievements(userStats) {
    const achievements = [];
    
    // 基於碎片數量的成就
    if (userStats.fragmentCount >= 50) {
        achievements.push('👑 傳奇');
    } else if (userStats.fragmentCount >= 30) {
        achievements.push('🏆 大師');
    } else if (userStats.fragmentCount >= 20) {
        achievements.push('🎴 收藏家');
    } else if (userStats.fragmentCount >= 10) {
        achievements.push('🌟 新星');
    }
    
    // 基於記憶卡數量的成就
    if (userStats.cardCount >= 10) {
        achievements.push('💎 卡片大師');
    } else if (userStats.cardCount >= 5) {
        achievements.push('🎯 卡片收藏家');
    }
    
    // 基於提交數量的成就
    const submissions = getUserSubmissions(userStats.userId);
    if (submissions.length >= 20) {
        achievements.push('📸 攝影師');
    } else if (submissions.length >= 10) {
        achievements.push('📷 記錄者');
    }
    
    // 如果沒有成就，返回默認
    if (achievements.length === 0) {
        achievements.push('🆕 新手');
    }
    
    return achievements;
}

// 獲取用戶提交記錄
function getUserSubmissions(userId) {
    const submissionsStr = localStorage.getItem('submissions');
    const allSubmissions = submissionsStr ? JSON.parse(submissionsStr) : [];
    return allSubmissions.filter(s => s.userId === userId);
}

// 添加當前用戶高亮樣式
function addCurrentUserStyles() {
    const styleId = 'current-user-highlight';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .current-user-row {
            background-color: rgba(212, 165, 116, 0.1) !important;
            border-left: 4px solid var(--primary-color);
        }
        .current-user-row:hover {
            background-color: rgba(212, 165, 116, 0.15) !important;
        }
        .current-user-row .user-name {
            font-weight: bold;
            color: var(--primary-color);
        }
    `;
    document.head.appendChild(style);
}

// 添加示例數據（用於演示）
function addSampleData() {
    const sampleUsers = [
        {
            userId: 'sample1',
            username: '香港歷史愛好者',
            avatar: '🎭',
            fragmentCount: 58,
            cardCount: 12,
            achievements: ['👑 傳奇', '💎 卡片大師', '📸 攝影師']
        },
        {
            userId: 'sample2',
            username: '文化保育先鋒',
            avatar: '🏛️',
            fragmentCount: 42,
            cardCount: 8,
            achievements: ['🏆 大師', '🎯 卡片收藏家']
        },
        {
            userId: 'sample3',
            username: '舊香港回憶',
            avatar: '🍜',
            fragmentCount: 35,
            cardCount: 6,
            achievements: ['🏆 大師', '📸 攝影師']
        },
        {
            userId: 'sample4',
            username: '記憶收集者',
            avatar: '📸',
            fragmentCount: 28,
            cardCount: 5,
            achievements: ['🎴 收藏家', '🎯 卡片收藏家']
        },
        {
            userId: 'sample5',
            username: '懷舊達人',
            avatar: '⭐',
            fragmentCount: 22,
            cardCount: 4,
            achievements: ['🎴 收藏家', '📷 記錄者']
        }
    ];
    
    // 只添加不存在的示例用戶
    sampleUsers.forEach(sampleUser => {
        if (!leaderboardData.find(u => u.userId === sampleUser.userId)) {
            leaderboardData.push(sampleUser);
        }
    });
    
    // 重新排序
    leaderboardData.sort((a, b) => b.fragmentCount - a.fragmentCount);
}

// 獲取用戶在排行榜中的排名
function getUserRank(userId) {
    const index = leaderboardData.findIndex(u => u.userId === userId);
    return index >= 0 ? index + 1 : -1;
}

// 成就系統展示
function displayAchievements() {
    const achievementsInfo = document.querySelector('.achievements-info');
    if (!achievementsInfo) return;
    
    const allAchievements = [
        {
            icon: '🆕',
            name: '新手',
            description: '開始收集記憶',
            locked: false
        },
        {
            icon: '🌟',
            name: '新星',
            description: '收集10個碎片',
            locked: !currentUser || getUserFragmentCount(currentUser.id) < 10
        },
        {
            icon: '🎴',
            name: '收藏家',
            description: '收集20個碎片',
            locked: !currentUser || getUserFragmentCount(currentUser.id) < 20
        },
        {
            icon: '🏆',
            name: '大師',
            description: '收集30個碎片',
            locked: !currentUser || getUserFragmentCount(currentUser.id) < 30
        },
        {
            icon: '👑',
            name: '傳奇',
            description: '收集50個碎片',
            locked: !currentUser || getUserFragmentCount(currentUser.id) < 50
        },
        {
            icon: '📷',
            name: '記錄者',
            description: '上傳10張照片',
            locked: !currentUser || getUserSubmissions(currentUser.id).length < 10
        },
        {
            icon: '📸',
            name: '攝影師',
            description: '上傳20張照片',
            locked: !currentUser || getUserSubmissions(currentUser.id).length < 20
        },
        {
            icon: '🎯',
            name: '卡片收藏家',
            description: '合成5張記憶卡',
            locked: !currentUser || getUserCardCount(currentUser.id) < 5
        },
        {
            icon: '💎',
            name: '卡片大師',
            description: '合成10張記憶卡',
            locked: !currentUser || getUserCardCount(currentUser.id) < 10
        }
    ];
    
    const achievementsGrid = achievementsInfo.querySelector('.achievements-grid');
    if (achievementsGrid) {
        achievementsGrid.innerHTML = allAchievements.map(achievement => `
            <div class="achievement-card ${achievement.locked ? 'locked' : ''}">
                <span class="achievement-icon">${achievement.icon}</span>
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${achievement.locked ? '<div class="lock-overlay">🔒</div>' : ''}
            </div>
        `).join('');
    }
    
    // 添加鎖定樣式
    addAchievementStyles();
}

// 獲取用戶碎片數量
function getUserFragmentCount(userId) {
    const fragmentsStr = localStorage.getItem('userFragments');
    const allFragments = fragmentsStr ? JSON.parse(fragmentsStr) : [];
    return allFragments.filter(f => f.userId === userId).length;
}

// 獲取用戶記憶卡數量
function getUserCardCount(userId) {
    const cardsStr = localStorage.getItem('userCards');
    const allCards = cardsStr ? JSON.parse(cardsStr) : [];
    return allCards.filter(c => c.userId === userId).length;
}

// 添加成就樣式
function addAchievementStyles() {
    const styleId = 'achievement-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .achievement-card {
            position: relative;
        }
        .achievement-card.locked {
            opacity: 0.5;
            filter: grayscale(50%);
        }
        .lock-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2rem;
            opacity: 0.3;
        }
    `;
    document.head.appendChild(style);
}

// 初始化時顯示成就
displayAchievements();

// 刷新排行榜（可由外部調用）
function refreshLeaderboard() {
    loadLeaderboardData();
}

// 導出函數
window.refreshLeaderboard = refreshLeaderboard;
window.getUserRank = getUserRank;
