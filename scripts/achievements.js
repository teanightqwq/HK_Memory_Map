// ===========================
// 成就系統 - 整合版
// ===========================

// 分類配置
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
let currentCategory = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    currentUser = getCurrentUser();
    
    if (!currentUser) {
        alert('請先登入');
        window.location.href = 'login.html';
        return;
    }
    
    // 更新導航欄
    updateNavbar(currentUser);
    
    // 設置標籤切換
    setupTabs();
    
    // 加載成就
    loadAchievements();
});

// 獲取當前用戶
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 更新導航欄
function updateNavbar(user) {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn && user) {
        const userMenu = `
            <div class="user-menu">
                <a href="collection.html" class="user-link">
                    <span class="user-avatar">${user.avatar || '👤'}</span>
                    <span class="user-name">${user.username}</span>
                </a>
                <a href="#" class="logout-link" onclick="handleLogout(); return false;">登出</a>
            </div>
        `;
        loginBtn.parentElement.innerHTML = userMenu;
    }
}

// 處理登出
function handleLogout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

// 設置標籤切換
function setupTabs() {
    const tabButtons = document.querySelectorAll('.achievement-tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            loadAchievements();
        });
    });
}

// 加載成就
function loadAchievements() {
    if (!currentUser) return;
    
    // 獲取用戶數據
    const userData = getUserData(currentUser.id);
    
    // 更新統計
    updateStats(userData);
    
    // 獲取所有成就
    const achievements = getAllAchievements(userData);
    
    // 過濾成就
    const filteredAchievements = currentCategory === 'all' 
        ? achievements 
        : achievements.filter(a => a.category === currentCategory);
    
    // 顯示成就
    displayAchievements(filteredAchievements);
}

// 獲取用戶數據
function getUserData(userId) {
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    const submissionsData = JSON.parse(localStorage.getItem('submissions')) || [];
    
    const userFragments = fragmentsData[userId] || [];
    const userCards = cardsData[userId] || [];
    const userSubmissions = submissionsData.filter(s => s.userId === userId);
    
    return {
        fragments: userFragments,
        cards: userCards,
        submissions: userSubmissions,
        approvedSubmissions: userSubmissions.filter(s => s.status === 'approved')
    };
}

// 更新統計
function updateStats(userData) {
    const achievements = getAllAchievements(userData);
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalCount = achievements.length;
    const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    
    document.getElementById('totalAchievements').textContent = `${unlockedCount} / ${totalCount}`;
    document.getElementById('completionRate').textContent = `${completionRate}%`;
    document.getElementById('totalCards').textContent = userData.cards.length;
    document.getElementById('totalFragments').textContent = userData.fragments.length;
}

// 獲取所有成就
function getAllAchievements(userData) {
    const achievements = [];
    
    // 收藏成就 - 子分類收集
    Object.keys(categoryConfig).forEach(categoryKey => {
        const config = categoryConfig[categoryKey];
        
        config.subcategories.forEach(sub => {
            const cards = userData.cards.filter(c => 
                c.category === categoryKey && c.subcategory === sub.value
            );
            const unlocked = cards.length > 0;
            
            achievements.push({
                id: `collect-${categoryKey}-${sub.value}`,
                category: 'collection',
                title: `${sub.label}收藏家`,
                description: `收集至少1張${sub.label}卡片`,
                icon: unlocked ? '✓' : '🔒',
                unlocked: unlocked,
                progress: unlocked ? 1 : 0,
                total: 1,
                rarity: 'common',
                rewards: cards.length > 0 ? cards.map(c => {
                    const rarityInfo = getRarityInfo(c.rarity);
                    return `${rarityInfo.icon} ${rarityInfo.name}`;
                }) : []
            });
        });
        
        // 主分類完成度成就
        const totalSubs = config.subcategories.length;
        const completedSubs = config.subcategories.filter(sub => 
            userData.cards.some(c => c.category === categoryKey && c.subcategory === sub.value)
        ).length;
        const unlocked = completedSubs === totalSubs;
        
        achievements.push({
            id: `master-${categoryKey}`,
            category: 'collection',
            title: `${config.name}大師`,
            description: `完整收集所有${config.name}子分類`,
            icon: unlocked ? '🌟' : '⭐',
            unlocked: unlocked,
            progress: completedSubs,
            total: totalSubs,
            rarity: 'epic',
            rewards: []
        });
    });
    
    // 終極收藏成就
    const totalSubcategories = Object.values(categoryConfig).reduce((sum, config) => sum + config.subcategories.length, 0);
    const completedTotal = Object.keys(categoryConfig).reduce((sum, categoryKey) => {
        return sum + categoryConfig[categoryKey].subcategories.filter(sub => 
            userData.cards.some(c => c.category === categoryKey && c.subcategory === sub.value)
        ).length;
    }, 0);
    const masterUnlocked = completedTotal === totalSubcategories;
    
    achievements.push({
        id: 'master-all',
        category: 'collection',
        title: '香港記憶收藏大師',
        description: '完整收集所有分類的所有子分類卡片',
        icon: masterUnlocked ? '👑' : '🔒',
        unlocked: masterUnlocked,
        progress: completedTotal,
        total: totalSubcategories,
        rarity: 'legendary',
        rewards: []
    });
    
    // 碎片收集成就
    const fragmentCount = userData.fragments.length;
    achievements.push(
        {
            id: 'fragments-10',
            category: 'collection',
            title: '記憶收集者',
            description: '收集10個記憶碎片',
            icon: fragmentCount >= 10 ? '🧩' : '🔒',
            unlocked: fragmentCount >= 10,
            progress: Math.min(fragmentCount, 10),
            total: 10,
            rarity: 'common'
        },
        {
            id: 'fragments-50',
            category: 'collection',
            title: '記憶獵人',
            description: '收集50個記憶碎片',
            icon: fragmentCount >= 50 ? '💎' : '🔒',
            unlocked: fragmentCount >= 50,
            progress: Math.min(fragmentCount, 50),
            total: 50,
            rarity: 'rare'
        },
        {
            id: 'fragments-100',
            category: 'collection',
            title: '記憶大師',
            description: '收集100個記憶碎片',
            icon: fragmentCount >= 100 ? '👑' : '🔒',
            unlocked: fragmentCount >= 100,
            progress: Math.min(fragmentCount, 100),
            total: 100,
            rarity: 'legendary'
        }
    );
    
    // 卡片收集成就
    const cardCount = userData.cards.length;
    achievements.push(
        {
            id: 'cards-5',
            category: 'collection',
            title: '卡片收藏家',
            description: '合成5張記憶卡',
            icon: cardCount >= 5 ? '🎴' : '🔒',
            unlocked: cardCount >= 5,
            progress: Math.min(cardCount, 5),
            total: 5,
            rarity: 'common'
        },
        {
            id: 'cards-10',
            category: 'collection',
            title: '卡片大師',
            description: '合成10張記憶卡',
            icon: cardCount >= 10 ? '💎' : '🔒',
            unlocked: cardCount >= 10,
            progress: Math.min(cardCount, 10),
            total: 10,
            rarity: 'epic'
        }
    );
    
    // 提交成就
    const submissionCount = userData.approvedSubmissions.length;
    achievements.push(
        {
            id: 'submissions-1',
            category: 'submission',
            title: '記錄者',
            description: '成功提交1個記憶',
            icon: submissionCount >= 1 ? '📷' : '🔒',
            unlocked: submissionCount >= 1,
            progress: Math.min(submissionCount, 1),
            total: 1,
            rarity: 'common'
        },
        {
            id: 'submissions-5',
            category: 'submission',
            title: '攝影師',
            description: '成功提交5個記憶',
            icon: submissionCount >= 5 ? '📸' : '🔒',
            unlocked: submissionCount >= 5,
            progress: Math.min(submissionCount, 5),
            total: 5,
            rarity: 'rare'
        },
        {
            id: 'submissions-20',
            category: 'submission',
            title: '城市記錄者',
            description: '成功提交20個記憶',
            icon: submissionCount >= 20 ? '🎬' : '🔒',
            unlocked: submissionCount >= 20,
            progress: Math.min(submissionCount, 20),
            total: 20,
            rarity: 'epic'
        },
        {
            id: 'submissions-50',
            category: 'submission',
            title: '傳奇記錄者',
            description: '成功提交50個記憶',
            icon: submissionCount >= 50 ? '👑' : '🔒',
            unlocked: submissionCount >= 50,
            progress: Math.min(submissionCount, 50),
            total: 50,
            rarity: 'legendary'
        }
    );
    
    // 特殊成就
    const legendaryCards = userData.cards.filter(c => c.rarity === 'legendary').length;
    const epicCards = userData.cards.filter(c => c.rarity === 'epic').length;
    
    achievements.push(
        {
            id: 'legendary-card',
            category: 'special',
            title: '幸運之星',
            description: '獲得1張傳說級卡片',
            icon: legendaryCards >= 1 ? '🟡' : '🔒',
            unlocked: legendaryCards >= 1,
            progress: Math.min(legendaryCards, 1),
            total: 1,
            rarity: 'legendary'
        },
        {
            id: 'epic-cards-3',
            category: 'special',
            title: '史詩收藏家',
            description: '獲得3張史詩級卡片',
            icon: epicCards >= 3 ? '🟣' : '🔒',
            unlocked: epicCards >= 3,
            progress: Math.min(epicCards, 3),
            total: 3,
            rarity: 'epic'
        },
        {
            id: 'first-synthesis',
            category: 'special',
            title: '初次合成',
            description: '第一次合成記憶卡',
            icon: cardCount >= 1 ? '✨' : '🔒',
            unlocked: cardCount >= 1,
            progress: cardCount >= 1 ? 1 : 0,
            total: 1,
            rarity: 'common'
        }
    );
    
    return achievements;
}

// 獲取稀有度信息
function getRarityInfo(rarity) {
    const rarityMap = {
        'common': { name: '普通', icon: '⚪', color: '#95a5a6' },
        'rare': { name: '稀有', icon: '🔵', color: '#3498db' },
        'epic': { name: '史詩', icon: '🟣', color: '#9b59b6' },
        'legendary': { name: '傳說', icon: '🟡', color: '#f1c40f' }
    };
    return rarityMap[rarity] || rarityMap.common;
}

// 顯示成就
function displayAchievements(achievements) {
    const container = document.getElementById('achievementsContainer');
    
    // 按稀有度和解鎖狀態分組
    const grouped = {
        unlocked: {
            legendary: [],
            epic: [],
            rare: [],
            common: []
        },
        locked: {
            legendary: [],
            epic: [],
            rare: [],
            common: []
        }
    };
    
    achievements.forEach(achievement => {
        const status = achievement.unlocked ? 'unlocked' : 'locked';
        const rarity = achievement.rarity || 'common';
        grouped[status][rarity].push(achievement);
    });
    
    let html = '';
    
    // 已解鎖成就
    const unlockedAchievements = [
        ...grouped.unlocked.legendary,
        ...grouped.unlocked.epic,
        ...grouped.unlocked.rare,
        ...grouped.unlocked.common
    ];
    
    if (unlockedAchievements.length > 0) {
        html += `<div class="achievement-section">
            <h3>✅ 已解鎖成就 (${unlockedAchievements.length})</h3>
            <div class="achievement-grid">`;
        
        unlockedAchievements.forEach(achievement => {
            html += renderAchievement(achievement);
        });
        
        html += `</div></div>`;
    }
    
    // 未解鎖成就
    const lockedAchievements = [
        ...grouped.locked.legendary,
        ...grouped.locked.epic,
        ...grouped.locked.rare,
        ...grouped.locked.common
    ];
    
    if (lockedAchievements.length > 0) {
        html += `<div class="achievement-section">
            <h3>🔒 未解鎖成就 (${lockedAchievements.length})</h3>
            <div class="achievement-grid">`;
        
        lockedAchievements.forEach(achievement => {
            html += renderAchievement(achievement);
        });
        
        html += `</div></div>`;
    }
    
    container.innerHTML = html;
    addAchievementStyles();
}

// 渲染單個成就
function renderAchievement(achievement) {
    const rarityInfo = getRarityInfo(achievement.rarity || 'common');
    const progressPercent = achievement.total > 0 ? (achievement.progress / achievement.total) * 100 : 0;
    
    return `
        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity || 'common'}">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-content">
                <h4>${achievement.title}</h4>
                <p>${achievement.description}</p>
                ${achievement.total > 1 ? `
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%; background: ${rarityInfo.color}"></div>
                    </div>
                    <div class="progress-text">${achievement.progress} / ${achievement.total}</div>
                ` : ''}
                ${achievement.rewards && achievement.rewards.length > 0 ? `
                    <div class="achievement-rewards">
                        ${achievement.rewards.map(r => `<span class="reward-badge">${r}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="achievement-rarity" style="background: ${rarityInfo.color}">
                ${rarityInfo.icon} ${rarityInfo.name}
            </div>
        </div>
    `;
}

// 添加成就樣式
function addAchievementStyles() {
    if (document.getElementById('achievementStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'achievementStyles';
    style.textContent = `
        .achievement-section {
            margin-bottom: 40px;
        }
        
        .achievement-section h3 {
            margin-bottom: 20px;
            font-size: 1.5rem;
            color: #333;
        }
        
        .achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .achievement-card {
            position: relative;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s;
            border: 2px solid #e0e0e0;
            display: flex;
            gap: 15px;
        }
        
        .achievement-card.unlocked {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border-color: #4CAF50;
        }
        
        .achievement-card.unlocked.rarity-legendary {
            background: linear-gradient(135deg, #fff9e6 0%, #ffe4a0 100%);
            border-color: #f1c40f;
            animation: shimmer 3s infinite;
        }
        
        .achievement-card.locked {
            opacity: 0.6;
            filter: grayscale(0.7);
        }
        
        .achievement-icon {
            font-size: 3rem;
            flex-shrink: 0;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .achievement-content {
            flex: 1;
        }
        
        .achievement-content h4 {
            margin: 0 0 8px 0;
            font-size: 1.1rem;
            color: #333;
        }
        
        .achievement-content p {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0 5px 0;
        }
        
        .progress-fill {
            height: 100%;
            transition: width 0.3s;
            border-radius: 4px;
        }
        
        .progress-text {
            font-size: 0.85rem;
            color: #666;
            margin-top: 5px;
        }
        
        .achievement-rewards {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 10px;
        }
        
        .reward-badge {
            padding: 3px 8px;
            background: rgba(255,255,255,0.8);
            border-radius: 10px;
            font-size: 0.75rem;
        }
        
        .achievement-rarity {
            position: absolute;
            top: 10px;
            right: 10px;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            color: white;
            font-weight: bold;
        }
        
        @keyframes shimmer {
            0%, 100% { box-shadow: 0 2px 8px rgba(241, 196, 15, 0.3); }
            50% { box-shadow: 0 4px 16px rgba(241, 196, 15, 0.6); }
        }
        
        @media (max-width: 768px) {
            .achievement-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
}
