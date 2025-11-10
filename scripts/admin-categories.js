// 分类管理系统
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 分類管理頁面開始加載...');
    
    // 验证管理员权限
    if (!verifyAdminPermission()) {
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    initializeCategoriesPage();
});

// 分类定义
const categories = {
    food: {
        name: '餐飲系列',
        icon: '🍜',
        subcategories: {
            restaurant: '茶餐廳',
            snack: '街頭小食',
            traditional: '老字號餐館',
            bakery: '麵包店',
            dessert: '甜品店'
        }
    },
    culture: {
        name: '文化系列',
        icon: '🎭',
        subcategories: {
            festival: '傳統節慶',
            opera: '粵劇',
            martial: '武館',
            temple: '廟宇',
            craft: '傳統手藝'
        }
    },
    architecture: {
        name: '建築系列',
        icon: '🏛️',
        subcategories: {
            tenement: '唐樓',
            arcade: '騎樓',
            estate: '公屋',
            historic: '歷史建築',
            shop: '傳統店舖'
        }
    }
};

// 初始化分类管理页面
function initializeCategoriesPage() {
    console.log('🎬 初始化分類管理頁面...');
    
    // 加载分类概览
    loadCategoriesOverview();
    
    // 加载分类详情
    loadCategoryCards();
}

// 加载分类概览
function loadCategoriesOverview() {
    const container = document.getElementById('categoriesOverview');
    if (!container) return;
    
    // 获取各分类的统计数据
    const stats = getCategoryStats();
    
    container.innerHTML = `
        <div class="stats-grid">
            ${Object.entries(categories).map(([key, category]) => {
                const stat = stats[key] || { fragments: 0, submissions: 0 };
                return `
                    <div class="stat-card stat-category">
                        <div class="stat-icon">${category.icon}</div>
                        <div class="stat-info">
                            <div class="stat-label">${category.name}</div>
                            <div class="stat-value">${stat.fragments}</div>
                            <div class="stat-trend">碎片數</div>
                        </div>
                        <div class="stat-meta">
                            <span>提交數: ${stat.submissions}</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// 加载分类卡片
function loadCategoryCards() {
    const container = document.getElementById('categoryCards');
    if (!container) return;
    
    const stats = getCategoryStats();
    const subcategoryStats = getSubcategoryStats();
    
    container.innerHTML = Object.entries(categories).map(([key, category]) => {
        const stat = stats[key] || { fragments: 0, submissions: 0, approved: 0, pending: 0 };
        
        return `
            <div class="category-card">
                <div class="category-header">
                    <h4>${category.icon} ${category.name}</h4>
                    <span class="badge badge-primary">${stat.fragments} 碎片</span>
                </div>
                
                <div class="category-stats">
                    <div class="stat-row">
                        <span>總提交數：</span>
                        <span class="stat-number">${stat.submissions}</span>
                    </div>
                    <div class="stat-row">
                        <span>已批准：</span>
                        <span class="stat-number text-success">${stat.approved}</span>
                    </div>
                    <div class="stat-row">
                        <span>待審核：</span>
                        <span class="stat-number text-warning">${stat.pending}</span>
                    </div>
                </div>
                
                <div class="subcategories-list">
                    <h5>子分類統計</h5>
                    ${Object.entries(category.subcategories).map(([subKey, subName]) => {
                        const subStat = subcategoryStats[key]?.[subKey] || 0;
                        const percentage = stat.fragments > 0 ? ((subStat / stat.fragments) * 100).toFixed(1) : 0;
                        
                        return `
                            <div class="subcategory-item">
                                <div class="subcategory-info">
                                    <span class="subcategory-name">${subName}</span>
                                    <span class="subcategory-count">${subStat} (${percentage}%)</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${percentage}%"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
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

// 获取分类统计数据
function getCategoryStats() {
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    
    const stats = {};
    
    // 统计碎片
    Object.values(fragments).forEach(userFragments => {
        if (Array.isArray(userFragments)) {
            userFragments.forEach(fragment => {
                if (!stats[fragment.category]) {
                    stats[fragment.category] = {
                        fragments: 0,
                        submissions: 0,
                        approved: 0,
                        pending: 0
                    };
                }
                stats[fragment.category].fragments++;
            });
        }
    });
    
    // 统计提交
    submissions.forEach(sub => {
        if (!stats[sub.category]) {
            stats[sub.category] = {
                fragments: 0,
                submissions: 0,
                approved: 0,
                pending: 0
            };
        }
        stats[sub.category].submissions++;
        
        if (sub.status === 'approved') {
            stats[sub.category].approved++;
        } else if (sub.status === 'pending') {
            stats[sub.category].pending++;
        }
    });
    
    return stats;
}

// 获取子分类统计数据
function getSubcategoryStats() {
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    const stats = {};
    
    Object.values(fragments).forEach(userFragments => {
        if (Array.isArray(userFragments)) {
            userFragments.forEach(fragment => {
                if (!stats[fragment.category]) {
                    stats[fragment.category] = {};
                }
                if (!stats[fragment.category][fragment.subcategory]) {
                    stats[fragment.category][fragment.subcategory] = 0;
                }
                stats[fragment.category][fragment.subcategory]++;
            });
        }
    });
    
    return stats;
}
