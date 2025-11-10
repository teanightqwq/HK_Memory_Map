// ===========================
// 香港記憶地圖 - 主頁腳本
// ===========================

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeHomePage();
    loadRecentSubmissions();
    updateCategoryProgress();
    checkUserLogin();
});

// 初始化主頁
function initializeHomePage() {
    console.log('香港記憶地圖已加載');
    
    // 添加平滑滾動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 分類卡片點擊事件
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            // 跳轉到收藏頁面並過濾該分類
            window.location.href = `pages/collection.html?category=${category}`;
        });
    });

    // 添加滾動動畫效果
    observeElements();
}

// 檢查用戶登入狀態
function checkUserLogin() {
    const user = getCurrentUser();
    const loginBtn = document.querySelector('.btn-login');
    
    if (user && loginBtn) {
        // 將登入按鈕替換為用戶菜單
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
            <a href="pages/collection.html" class="user-link">
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
        window.location.reload();
    }
}

// 獲取當前用戶（從 localStorage）
// 獲取當前用戶
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 加載最新提交
function loadRecentSubmissions() {
    const submissionsGrid = document.getElementById('recentSubmissions');
    if (!submissionsGrid) return;

    // 從 localStorage 獲取提交記錄
    const submissions = getApprovedSubmissions();
    
    if (submissions.length === 0) {
        submissionsGrid.innerHTML = '<p class="no-data">暫無提交記錄</p>';
        return;
    }

    // 顯示最新的 6 條記錄
    const recentSubmissions = submissions.slice(0, 6);
    submissionsGrid.innerHTML = recentSubmissions.map(submission => `
        <div class="submission-card">
            <div class="submission-image">
                <img src="${submission.photo}" alt="${submission.location}">
                <div class="submission-overlay">
                    <span class="submission-category">${getCategoryIcon(submission.category)} ${getCategoryName(submission.category)}</span>
                </div>
            </div>
            <div class="submission-info">
                <h4>${submission.location}</h4>
                <p class="submission-description">${submission.description}</p>
                <div class="submission-meta">
                    <span>📍 ${submission.address.substring(0, 20)}...</span>
                    <span>👤 ${submission.username}</span>
                </div>
                <div class="submission-footer">
                    <span class="submission-date">${formatDate(submission.date)}</span>
                </div>
            </div>
        </div>
    `).join('');

    // 添加 CSS 樣式（如果還沒有）
    addSubmissionCardStyles();
}

// 添加提交卡片樣式
function addSubmissionCardStyles() {
    const styleId = 'submission-card-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .submission-card {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .submission-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .submission-image {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        .submission-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .submission-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        .submission-category {
            background-color: rgba(212, 165, 116, 0.9);
            color: white;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.85rem;
        }
        .submission-info {
            padding: 20px;
        }
        .submission-info h4 {
            color: var(--primary-color);
            margin-bottom: 10px;
            font-size: 1.2rem;
        }
        .submission-description {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 15px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .submission-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin-bottom: 10px;
        }
        .submission-footer {
            display: flex;
            justify-content: flex-end;
        }
        .submission-date {
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
    `;
    document.head.appendChild(style);
}

// 更新分類進度
function updateCategoryProgress() {
    const user = getCurrentUser();
    if (!user) return;

    const userFragments = getUserFragments(user.id);
    
    // 統計各分類的碎片數量
    const categoryCounts = {
        food: 0,
        culture: 0,
        architecture: 0
    };

    userFragments.forEach(fragment => {
        if (categoryCounts.hasOwnProperty(fragment.category)) {
            categoryCounts[fragment.category]++;
        }
    });

    // 更新分類卡片的計數
    document.querySelectorAll('.category-card').forEach(card => {
        const category = card.dataset.category;
        const countSpan = card.querySelector('.category-count');
        if (countSpan && categoryCounts.hasOwnProperty(category)) {
            countSpan.textContent = `${categoryCounts[category]}/10 碎片`;
        }
    });
}

// 獲取用戶的碎片
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

// 獲取已通過審核的提交
function getApprovedSubmissions() {
    const submissionsStr = localStorage.getItem('submissions');
    const submissions = submissionsStr ? JSON.parse(submissionsStr) : [];
    return submissions.filter(s => s.status === 'approved').sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
}

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

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    if (days < 7) return `${days}天前`;
    
    return date.toLocaleDateString('zh-HK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 滾動動畫觀察器
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // 觀察所有需要動畫的元素
    document.querySelectorAll('.step, .category-card, .submission-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// 初始化示例數據（僅用於演示）
function initializeSampleData() {
    // 檢查是否已有數據
    if (localStorage.getItem('submissions')) return;

    const sampleSubmissions = [
        {
            id: 1,
            userId: 'demo1',
            username: '香港仔',
            photo: 'https://via.placeholder.com/400x300?text=蘭芳園',
            location: '蘭芳園茶餐廳',
            address: '中環結志街2號',
            category: 'food',
            subcategory: '茶餐廳',
            description: '這是一家有著70年歷史的老字號茶餐廳，以絲襪奶茶聞名。店內保留了舊式茶餐廳的裝潢。',
            tags: '老字號,茶餐廳,絲襪奶茶',
            status: 'approved',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            userId: 'demo2',
            username: '文化保育者',
            photo: 'https://via.placeholder.com/400x300?text=油麻地戲院',
            location: '油麻地戲院',
            address: '油麻地窩打老道6號',
            category: 'culture',
            subcategory: '粵劇',
            description: '建於1930年，是香港現存最古老的戲院之一。經活化後成為粵劇演出場地。',
            tags: '粵劇,歷史建築,活化',
            status: 'approved',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    localStorage.setItem('submissions', JSON.stringify(sampleSubmissions));
}

// 如果需要，初始化示例數據
// initializeSampleData();
