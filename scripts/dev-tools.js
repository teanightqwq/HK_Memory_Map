// ===========================
// 開發者工具腳本
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

// 示例地址數據
const sampleLocations = {
    food: {
        restaurant: ['中環結志街', '中環歌賦街', '油麻地廟街', '深水埗福榮街'],
        snack: ['北角英皇道', '旺角花園街', '灣仔軒尼詩道', '銅鑼灣記利佐治街'],
        bakery: ['中環擺花街', '上環文咸東街', '灣仔皇后大道東', '北角渣華道'],
        wetmarket: ['西環石塘咀街市', '灣仔街市', '油麻地果欄', '深水埗鴨寮街']
    },
    culture: {
        opera: ['油麻地戲院', '新光戲院', '高山劇場', '西九戲曲中心'],
        temple: ['黃大仙祠', '文武廟', '車公廟', '天后廟'],
        festival: ['大坑舞火龍', '長洲太平清醮', '元朗盆菜', '大澳端午龍舟'],
        craft: ['深水埗棚仔', '上環荷李活道', '中環摩羅上街', '灣仔利東街']
    },
    architecture: {
        tenement: ['灣仔藍屋', '深水埗主教山配水庫', '中環嘉咸街', '油麻地上海街'],
        colonial: ['中環立法會大樓', '中環終審法院', '前九廣鐵路鐘樓', '舊中區警署'],
        village: ['元朗錦田', '屏山文物徑', '粉嶺龍躍頭', '西貢鹽田梓'],
        industrial: ['南豐紗廠', '賽馬會創意藝術中心', '大館', 'PMQ元創方']
    }
};

// 當前用戶
let currentUser = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('請先登入才能使用開發工具', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // 初始化下拉選單
    updateSubcategoryOptions('fragment');
    updateSubcategoryOptions('card');
    
    // 刷新狀態
    refreshStatus();
});

// 獲取當前用戶
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 更新子分類選項
function updateSubcategoryOptions(type) {
    const categorySelect = document.getElementById(`${type}Category`);
    const subcategorySelect = document.getElementById(`${type}Subcategory`);
    
    const category = categorySelect.value;
    const config = categoryConfig[category];
    
    if (!config) return;
    
    subcategorySelect.innerHTML = config.subcategories.map(sub => 
        `<option value="${sub.value}">${sub.label}</option>`
    ).join('');
}

// 刷新狀態
function refreshStatus() {
    if (!currentUser) return;
    
    // 顯示用戶名
    document.getElementById('currentUserName').textContent = currentUser.username;
    
    // 獲取碎片數據
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    const userFragments = fragmentsData[currentUser.id] || [];
    document.getElementById('fragmentCount').textContent = userFragments.length;
    
    // 獲取卡片數據
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    const userCards = cardsData[currentUser.id] || [];
    document.getElementById('cardCount').textContent = userCards.length;
    
    // 計算已完成的子分類
    const totalSubcategories = Object.values(categoryConfig).reduce((sum, config) => sum + config.subcategories.length, 0);
    const completedSubcategories = new Set();
    
    userCards.forEach(card => {
        if (card.category && card.subcategory) {
            completedSubcategories.add(`${card.category}-${card.subcategory}`);
        }
    });
    
    document.getElementById('completedSubcategories').textContent = 
        `${completedSubcategories.size} / ${totalSubcategories}`;
}

// 生成碎片
function generateFragments() {
    if (!currentUser) return;
    
    const category = document.getElementById('fragmentCategory').value;
    const subcategory = document.getElementById('fragmentSubcategory').value;
    const count = parseInt(document.getElementById('fragmentCount').value);
    
    const config = categoryConfig[category];
    const subConfig = config.subcategories.find(s => s.value === subcategory);
    const locations = sampleLocations[category][subcategory] || ['香港'];
    
    // 獲取現有碎片
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    if (!fragmentsData[currentUser.id]) {
        fragmentsData[currentUser.id] = [];
    }
    
    // 生成新碎片
    for (let i = 0; i < count; i++) {
        const location = locations[i % locations.length];
        const fragment = {
            id: `fragment-${Date.now()}-${i}`,
            userId: currentUser.id,
            category: category,
            subcategory: subcategory,
            title: `${subConfig.label} - ${location}`,
            location: location,
            address: `${location}附近`,
            description: `這是一段珍貴的${subConfig.label}記憶，見證了香港的獨特文化。`,
            photo: '../images/placeholder.svg',
            tags: [subConfig.label, location, '香港記憶'],
            obtainedDate: new Date().toISOString(),
            usedForSynthesis: false
        };
        
        fragmentsData[currentUser.id].push(fragment);
    }
    
    // 保存
    localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
    
    showToast(`✨ 成功生成 ${count} 個${subConfig.label}碎片！`, 'success');
    refreshStatus();
}

// 批量生成主分類碎片
function generateCategoryFragments() {
    if (!currentUser) return;
    
    const category = document.getElementById('bulkCategory').value;
    const config = categoryConfig[category];
    
    let totalGenerated = 0;
    
    config.subcategories.forEach(sub => {
        const locations = sampleLocations[category][sub.value] || ['香港'];
        
        // 獲取現有碎片
        const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
        if (!fragmentsData[currentUser.id]) {
            fragmentsData[currentUser.id] = [];
        }
        
        // 為每個子分類生成3個碎片
        for (let i = 0; i < 3; i++) {
            const location = locations[i % locations.length];
            const fragment = {
                id: `fragment-${Date.now()}-${sub.value}-${i}`,
                userId: currentUser.id,
                category: category,
                subcategory: sub.value,
                title: `${sub.label} - ${location}`,
                location: location,
                address: `${location}附近`,
                description: `這是一段珍貴的${sub.label}記憶，見證了香港的獨特文化。`,
                photo: '../images/placeholder.svg',
                tags: [sub.label, location, '香港記憶'],
                obtainedDate: new Date().toISOString(),
                usedForSynthesis: false
            };
            
            fragmentsData[currentUser.id].push(fragment);
            totalGenerated++;
        }
        
        // 保存
        localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
    });
    
    showToast(`🎁 成功為${config.name}生成 ${totalGenerated} 個碎片！`, 'success');
    refreshStatus();
}

// 生成所有碎片
function generateAllFragments() {
    if (!currentUser) return;
    
    if (!confirm('確定要為所有子分類生成碎片嗎？這將生成大量數據。')) {
        return;
    }
    
    let totalGenerated = 0;
    
    Object.keys(categoryConfig).forEach(categoryKey => {
        const config = categoryConfig[categoryKey];
        
        config.subcategories.forEach(sub => {
            const locations = sampleLocations[categoryKey][sub.value] || ['香港'];
            
            // 獲取現有碎片
            const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
            if (!fragmentsData[currentUser.id]) {
                fragmentsData[currentUser.id] = [];
            }
            
            // 為每個子分類生成3個碎片
            for (let i = 0; i < 3; i++) {
                const location = locations[i % locations.length];
                const fragment = {
                    id: `fragment-${Date.now()}-${categoryKey}-${sub.value}-${i}`,
                    userId: currentUser.id,
                    category: categoryKey,
                    subcategory: sub.value,
                    title: `${sub.label} - ${location}`,
                    location: location,
                    address: `${location}附近`,
                    description: `這是一段珍貴的${sub.label}記憶，見證了香港的獨特文化。`,
                    photo: '../images/placeholder.svg',
                    tags: [sub.label, location, '香港記憶'],
                    obtainedDate: new Date().toISOString(),
                    usedForSynthesis: false
                };
                
                fragmentsData[currentUser.id].push(fragment);
                totalGenerated++;
            }
            
            // 保存
            localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
        });
    });
    
    showToast(`🌟 全收集完成！共生成 ${totalGenerated} 個碎片！`, 'success');
    refreshStatus();
}

// 生成卡片
function generateCard() {
    if (!currentUser) return;
    
    const category = document.getElementById('cardCategory').value;
    const subcategory = document.getElementById('cardSubcategory').value;
    const rarity = document.getElementById('cardRarity').value;
    
    const config = categoryConfig[category];
    const subConfig = config.subcategories.find(s => s.value === subcategory);
    
    // 獲取現有卡片
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    if (!cardsData[currentUser.id]) {
        cardsData[currentUser.id] = [];
    }
    
    // 生成卡片
    const card = {
        id: `card-${Date.now()}`,
        userId: currentUser.id,
        category: category,
        subcategory: subcategory,
        title: `${config.name} - ${subConfig.label}`,
        location: '香港',
        description: `這是一段珍貴的${subConfig.label}記憶，承載著香港的獨特魅力和歷史底蘊。`,
        rarity: rarity,
        obtainedTime: new Date().toISOString(),
        fromFragments: [],
        fragmentsRequired: 3
    };
    
    cardsData[currentUser.id].push(card);
    
    // 保存
    localStorage.setItem('userCards', JSON.stringify(cardsData));
    
    const rarityNames = {
        common: '普通',
        rare: '稀有',
        epic: '史詩',
        legendary: '傳說'
    };
    
    showToast(`🎴 成功生成${rarityNames[rarity]}級${subConfig.label}卡片！`, 'success');
    refreshStatus();
}

// 批量生成主分類卡片
function generateCategoryCards() {
    if (!currentUser) return;
    
    const category = document.getElementById('bulkCardCategory').value;
    const config = categoryConfig[category];
    
    // 獲取現有卡片
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    if (!cardsData[currentUser.id]) {
        cardsData[currentUser.id] = [];
    }
    
    let totalGenerated = 0;
    
    config.subcategories.forEach(sub => {
        // 隨機稀有度
        const rarities = ['common', 'rare', 'epic', 'legendary'];
        const weights = [50, 30, 15, 5];
        const random = Math.random() * 100;
        let rarity = 'common';
        let cumulative = 0;
        
        for (let i = 0; i < rarities.length; i++) {
            cumulative += weights[i];
            if (random < cumulative) {
                rarity = rarities[i];
                break;
            }
        }
        
        const card = {
            id: `card-${Date.now()}-${sub.value}`,
            userId: currentUser.id,
            category: category,
            subcategory: sub.value,
            title: `${config.name} - ${sub.label}`,
            location: '香港',
            description: `這是一段珍貴的${sub.label}記憶，承載著香港的獨特魅力和歷史底蘊。`,
            rarity: rarity,
            obtainedTime: new Date().toISOString(),
            fromFragments: [],
            fragmentsRequired: 3
        };
        
        cardsData[currentUser.id].push(card);
        totalGenerated++;
    });
    
    // 保存
    localStorage.setItem('userCards', JSON.stringify(cardsData));
    
    showToast(`🎁 成功為${config.name}生成 ${totalGenerated} 張卡片！`, 'success');
    refreshStatus();
}

// 生成所有卡片
function generateAllCards() {
    if (!currentUser) return;
    
    if (!confirm('確定要生成所有子分類的卡片嗎？這將完成全收集成就。')) {
        return;
    }
    
    // 獲取現有卡片
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    if (!cardsData[currentUser.id]) {
        cardsData[currentUser.id] = [];
    }
    
    let totalGenerated = 0;
    
    Object.keys(categoryConfig).forEach(categoryKey => {
        const config = categoryConfig[categoryKey];
        
        config.subcategories.forEach(sub => {
            // 隨機稀有度
            const rarities = ['common', 'rare', 'epic', 'legendary'];
            const weights = [50, 30, 15, 5];
            const random = Math.random() * 100;
            let rarity = 'common';
            let cumulative = 0;
            
            for (let i = 0; i < rarities.length; i++) {
                cumulative += weights[i];
                if (random < cumulative) {
                    rarity = rarities[i];
                    break;
                }
            }
            
            const card = {
                id: `card-${Date.now()}-${categoryKey}-${sub.value}`,
                userId: currentUser.id,
                category: categoryKey,
                subcategory: sub.value,
                title: `${config.name} - ${sub.label}`,
                location: '香港',
                description: `這是一段珍貴的${sub.label}記憶，承載著香港的獨特魅力和歷史底蘊。`,
                rarity: rarity,
                obtainedTime: new Date().toISOString(),
                fromFragments: [],
                fragmentsRequired: 3
            };
            
            cardsData[currentUser.id].push(card);
            totalGenerated++;
        });
    });
    
    // 保存
    localStorage.setItem('userCards', JSON.stringify(cardsData));
    
    showToast(`👑 全收集完成！共生成 ${totalGenerated} 張卡片！恭喜成為香港記憶收藏大師！`, 'success');
    refreshStatus();
}

// 清除碎片
function clearFragments() {
    if (!currentUser) return;
    
    if (!confirm('確定要清除所有碎片數據嗎？此操作不可恢復！')) {
        return;
    }
    
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    fragmentsData[currentUser.id] = [];
    localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
    
    showToast('🗑️ 已清除所有碎片數據', 'warning');
    refreshStatus();
}

// 清除卡片
function clearCards() {
    if (!currentUser) return;
    
    if (!confirm('確定要清除所有卡片數據嗎？此操作不可恢復！')) {
        return;
    }
    
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    cardsData[currentUser.id] = [];
    localStorage.setItem('userCards', JSON.stringify(cardsData));
    
    showToast('🗑️ 已清除所有卡片數據', 'warning');
    refreshStatus();
}

// 重置所有收集數據
function resetAllCollection() {
    if (!currentUser) return;
    
    if (!confirm('確定要重置所有收集數據嗎？這將清除碎片和卡片，但保留用戶帳號。')) {
        return;
    }
    
    const fragmentsData = JSON.parse(localStorage.getItem('userFragments')) || {};
    const cardsData = JSON.parse(localStorage.getItem('userCards')) || {};
    
    fragmentsData[currentUser.id] = [];
    cardsData[currentUser.id] = [];
    
    localStorage.setItem('userFragments', JSON.stringify(fragmentsData));
    localStorage.setItem('userCards', JSON.stringify(cardsData));
    
    showToast('⚠️ 已重置所有收集數據', 'warning');
    refreshStatus();
}

// 清除所有數據
function clearAllData() {
    if (!confirm('⚠️ 危險操作！\n\n這將清除所有 localStorage 數據，包括：\n- 所有用戶帳號\n- 所有碎片和卡片\n- 所有提交記錄\n- 管理員帳號\n\n確定要繼續嗎？')) {
        return;
    }
    
    if (!confirm('最後確認：真的要清除所有數據嗎？此操作無法恢復！')) {
        return;
    }
    
    localStorage.clear();
    sessionStorage.clear();
    
    showToast('💀 已清除所有數據，頁面將重新加載...', 'error');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 2000);
}

// 顯示提示訊息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
