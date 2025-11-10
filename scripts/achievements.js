// ===========================
// 成就系統
// ===========================

// 顯示成就
function displayAchievements() {
    const container = document.getElementById('achievementsContainer');
    if (!container) return;
    
    // 獲取用戶卡片和分類配置（從 collection.js）
    const userCards = window.userCards || [];
    const categoryConfig = window.categoryConfig;
    
    let achievementsHTML = '';
    
    // 遍歷每個主分類
    Object.keys(categoryConfig).forEach(categoryKey => {
        const config = categoryConfig[categoryKey];
        const subcategories = config.subcategories;
        
        achievementsHTML += `
            <div class="achievement-category">
                <h4>${config.icon} ${config.name}</h4>
                <div class="achievement-grid">
        `;
        
        // 遍歷每個子分類成就
        subcategories.forEach(sub => {
            const cards = userCards.filter(c => 
                c.category === categoryKey && 
                c.subcategory === sub.value
            );
            
            const isCompleted = cards.length > 0;
            const rarityBadges = isCompleted ? cards.map(card => {
                const rarityInfo = getRarityInfo(card.rarity);
                return `<span class="rarity-badge" style="background: ${rarityInfo.color}; color: white;">${rarityInfo.icon}</span>`;
            }).join('') : '';
            
            achievementsHTML += `
                <div class="achievement-card ${isCompleted ? 'completed' : 'locked'}">
                    <div class="achievement-icon">${isCompleted ? '✓' : '🔒'}</div>
                    <h5>${sub.label}</h5>
                    <p>${isCompleted ? `已收集 ${cards.length} 張卡片` : '尚未收集'}</p>
                    ${rarityBadges ? `<div class="rarity-badges">${rarityBadges}</div>` : ''}
                    ${isCompleted ? `<span class="achievement-badge">🏆 已完成</span>` : `<span class="achievement-badge-locked">收集${sub.label}卡片解鎖</span>`}
                </div>
            `;
        });
        
        // 主分類完成度成就
        const categoryCards = userCards.filter(c => c.category === categoryKey);
        const totalSubcategories = subcategories.length;
        const completedSubcategories = subcategories.filter(sub => 
            userCards.some(c => c.category === categoryKey && c.subcategory === sub.value)
        ).length;
        const isCategoryComplete = completedSubcategories === totalSubcategories;
        
        achievementsHTML += `
                    <div class="achievement-card category-achievement ${isCategoryComplete ? 'completed' : 'locked'}">
                        <div class="achievement-icon">${isCategoryComplete ? '🌟' : '⭐'}</div>
                        <h5>完整收集 ${config.name}</h5>
                        <p>${completedSubcategories} / ${totalSubcategories} 子分類</p>
                        <div class="progress-bar" style="margin: 10px 0;">
                            <div class="progress-fill" style="width: ${(completedSubcategories / totalSubcategories) * 100}%"></div>
                        </div>
                        ${isCategoryComplete ? `<span class="achievement-badge special">🏆 大師收藏家</span>` : `<span class="achievement-badge-locked">收集所有${config.name}子分類</span>`}
                    </div>
                </div>
            </div>
        `;
    });
    
    // 全收集成就
    const totalSubcategories = Object.values(categoryConfig).reduce((sum, config) => sum + config.subcategories.length, 0);
    const completedTotal = Object.keys(categoryConfig).reduce((sum, categoryKey) => {
        return sum + categoryConfig[categoryKey].subcategories.filter(sub => 
            userCards.some(c => c.category === categoryKey && c.subcategory === sub.value)
        ).length;
    }, 0);
    const isAllComplete = completedTotal === totalSubcategories;
    
    achievementsHTML += `
        <div class="achievement-category special">
            <h4>🏆 終極成就</h4>
            <div class="achievement-grid">
                <div class="achievement-card master ${isAllComplete ? 'completed' : 'locked'}">
                    <div class="achievement-icon">${isAllComplete ? '👑' : '🔒'}</div>
                    <h5>香港記憶收藏大師</h5>
                    <p>完整收集所有分類的記憶卡</p>
                    <div class="progress-bar" style="margin: 10px 0;">
                        <div class="progress-fill" style="width: ${(completedTotal / totalSubcategories) * 100}%; background: linear-gradient(90deg, #f1c40f, #e74c3c);"></div>
                    </div>
                    <p style="font-size: 0.9rem; margin: 10px 0;">${completedTotal} / ${totalSubcategories} 子分類已完成</p>
                    ${isAllComplete ? `<span class="achievement-badge legendary">👑 傳說收藏家</span>` : `<span class="achievement-badge-locked">收集所有子分類卡片解鎖</span>`}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = achievementsHTML;
    addAchievementStyles();
}

// 檢查成就（合成卡片後調用）
function checkAchievements() {
    // 這裡可以添加成就通知邏輯
    // 例如顯示"恭喜解鎖新成就"的彈窗
}

// 添加成就樣式
function addAchievementStyles() {
    if (document.getElementById('achievementStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'achievementStyles';
    style.textContent = `
        .achievement-category {
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .achievement-category.special {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .achievement-category h4 {
            margin: 0 0 20px 0;
            font-size: 1.3rem;
        }
        .achievement-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .achievement-card {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: center;
            transition: all 0.3s;
            border: 2px solid #e0e0e0;
        }
        .achievement-card.completed {
            background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
            border-color: #4CAF50;
            transform: scale(1.02);
        }
        .achievement-card.locked {
            opacity: 0.6;
            filter: grayscale(0.5);
        }
        .achievement-card.category-achievement {
            grid-column: span 2;
        }
        .achievement-card.master {
            grid-column: 1 / -1;
            padding: 30px;
        }
        .achievement-icon {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        .achievement-card h5 {
            margin: 10px 0;
            font-size: 1.1rem;
        }
        .achievement-card p {
            color: #666;
            font-size: 0.9rem;
            margin: 5px 0;
        }
        .achievement-badge {
            display: inline-block;
            margin-top: 10px;
            padding: 5px 12px;
            background: #4CAF50;
            color: white;
            border-radius: 15px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        .achievement-badge.special {
            background: linear-gradient(90deg, #f1c40f, #e74c3c);
        }
        .achievement-badge.legendary {
            background: linear-gradient(90deg, #f1c40f, #e74c3c, #9b59b6);
            animation: shimmer 2s infinite;
        }
        .achievement-badge-locked {
            display: inline-block;
            margin-top: 10px;
            padding: 5px 12px;
            background: #bbb;
            color: white;
            border-radius: 15px;
            font-size: 0.85rem;
        }
        .rarity-badges {
            display: flex;
            gap: 5px;
            justify-content: center;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        .rarity-badge {
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .category-progress-section {
            margin-bottom: 30px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .category-progress-section h4 {
            margin: 0 0 15px 0;
            font-size: 1.3rem;
            color: #333;
        }
        .category-progress-section h5 {
            margin: 10px 0;
            font-size: 1rem;
            color: #555;
        }
        .progress-card.completed {
            background: #e8f5e9;
            border-color: #4CAF50;
        }
        .complete-badge {
            display: inline-block;
            margin-left: 10px;
            padding: 2px 8px;
            background: #4CAF50;
            color: white;
            border-radius: 10px;
            font-size: 0.8rem;
            font-weight: normal;
        }
        @keyframes shimmer {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        @media (max-width: 768px) {
            .achievement-grid {
                grid-template-columns: 1fr;
            }
            .achievement-card.category-achievement,
            .achievement-card.master {
                grid-column: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// 導出函數
window.displayAchievements = displayAchievements;
window.checkAchievements = checkAchievements;
