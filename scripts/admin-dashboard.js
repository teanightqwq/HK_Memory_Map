// 管理员仪表板系统
document.addEventListener('DOMContentLoaded', function() {
    // 验证管理员权限
    if (!verifyAdminPermission()) {
        return;
    }
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化仪表板
    initializeDashboard();
});

// 初始化仪表板
function initializeDashboard() {
    // 加载统计数据
    loadStatistics();
    
    // 加载最近活动
    loadRecentActivities();
    
    // 加载用户增长图表
    loadUserGrowthChart();
    
    // 加载分类分布图表
    loadCategoryDistribution();
}

// 加载统计数据
function loadStatistics() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    const cards = JSON.parse(localStorage.getItem('userCards')) || {};
    
    // 计算各项统计
    const stats = {
        totalUsers: users.length,
        activeUsers: calculateActiveUsers(users),
        totalSubmissions: submissions.length,
        pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
        approvedSubmissions: submissions.filter(s => s.status === 'approved').length,
        rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
        totalFragments: Object.values(fragments).reduce((sum, arr) => sum + arr.length, 0),
        totalCards: Object.values(cards).reduce((sum, arr) => sum + arr.length, 0)
    };
    
    // 显示统计卡片
    displayStatCards(stats);
}

// 显示统计卡片
function displayStatCards(stats) {
    const statsContainer = document.querySelector('.stats-grid');
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
                <div class="stat-label">总用户数</div>
                <div class="stat-value">${stats.totalUsers}</div>
                <div class="stat-trend">活跃用户: ${stats.activeUsers}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">📸</div>
            <div class="stat-info">
                <div class="stat-label">提交总数</div>
                <div class="stat-value">${stats.totalSubmissions}</div>
                <div class="stat-trend">待审核: ${stats.pendingSubmissions}</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">✨</div>
            <div class="stat-info">
                <div class="stat-label">记忆碎片</div>
                <div class="stat-value">${stats.totalFragments}</div>
                <div class="stat-trend">已生成碎片数</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon">🎴</div>
            <div class="stat-info">
                <div class="stat-label">记忆卡片</div>
                <div class="stat-value">${stats.totalCards}</div>
                <div class="stat-trend">已合成卡片数</div>
            </div>
        </div>
        
        <div class="stat-card stat-success">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
                <div class="stat-label">已批准</div>
                <div class="stat-value">${stats.approvedSubmissions}</div>
                <div class="stat-trend">${((stats.approvedSubmissions / stats.totalSubmissions) * 100 || 0).toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="stat-card stat-danger">
            <div class="stat-icon">❌</div>
            <div class="stat-info">
                <div class="stat-label">已拒绝</div>
                <div class="stat-value">${stats.rejectedSubmissions}</div>
                <div class="stat-trend">${((stats.rejectedSubmissions / stats.totalSubmissions) * 100 || 0).toFixed(1)}%</div>
            </div>
        </div>
    `;
}

// 计算活跃用户（最近7天有活动）
function calculateActiveUsers(users) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const activeUserIds = new Set();
    
    submissions.forEach(sub => {
        if (new Date(sub.submitTime) > sevenDaysAgo) {
            activeUserIds.add(sub.userId);
        }
    });
    
    return activeUserIds.size;
}

// 加载最近活动
function loadRecentActivities() {
    const activities = [];
    
    // 获取最近提交
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    submissions.slice(-10).reverse().forEach(sub => {
        activities.push({
            type: 'submission',
            icon: '📸',
            text: `${sub.username} 提交了新照片 "${sub.title}"`,
            time: sub.submitTime,
            status: sub.status
        });
    });
    
    // 获取最近审核日志
    const reviewLogs = JSON.parse(localStorage.getItem('reviewLogs')) || [];
    reviewLogs.slice(-10).reverse().forEach(log => {
        const action = log.action === 'approved' ? '批准' : '拒绝';
        const icon = log.action === 'approved' ? '✅' : '❌';
        const title = log.submissionTitle ? ` "${log.submissionTitle}"` : '';
        activities.push({
            type: 'review',
            icon: icon,
            text: `${log.reviewer} ${action}了提交${title}`,
            time: log.reviewTime,
            status: log.action
        });
    });
    
    // 按时间排序
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // 显示最近20条
    displayRecentActivities(activities.slice(0, 20));
}

// 显示最近活动
function displayRecentActivities(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    if (activities.length === 0) {
        activityList.innerHTML = '<div class="empty-state">暂无活动记录</div>';
        return;
    }
    
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${formatRelativeTime(activity.time)}</div>
            </div>
            ${activity.status ? `<span class="activity-status status-${activity.status}">${getStatusText(activity.status)}</span>` : ''}
        </div>
    `).join('');
}

// 加载用户增长图表
function loadUserGrowthChart() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const chartContainer = document.getElementById('userGrowthChart');
    if (!chartContainer) return;
    
    // 按日期统计用户注册数
    const dateCounts = {};
    users.forEach(user => {
        const date = new Date(user.createdAt).toLocaleDateString('zh-CN');
        dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    // 获取最近7天
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('zh-CN'));
    }
    
    // 创建简单的文本图表
    const chartData = last7Days.map(date => ({
        date: date,
        count: dateCounts[date] || 0
    }));
    
    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    
    chartContainer.innerHTML = `
        <h3>用户增长趋势（最近7天）</h3>
        <div class="simple-chart">
            ${chartData.map(data => `
                <div class="chart-bar">
                    <div class="bar-label">${data.date.split('/').slice(1).join('/')}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${(data.count / maxCount * 100)}%"></div>
                    </div>
                    <div class="bar-value">${data.count}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// 加载分类分布
function loadCategoryDistribution() {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const chartContainer = document.getElementById('categoryChart');
    if (!chartContainer) return;
    
    // 统计各分类数量
    const categoryCounts = {
        food: 0,
        culture: 0,
        architecture: 0
    };
    
    submissions.filter(s => s.status === 'approved').forEach(sub => {
        if (categoryCounts[sub.category] !== undefined) {
            categoryCounts[sub.category]++;
        }
    });
    
    const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
    
    chartContainer.innerHTML = `
        <h3>分类分布（已批准）</h3>
        <div class="category-distribution">
            <div class="category-item">
                <div class="category-icon">🍜</div>
                <div class="category-info">
                    <div class="category-name">餐饮</div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${total > 0 ? (categoryCounts.food / total * 100) : 0}%"></div>
                    </div>
                    <div class="category-count">${categoryCounts.food} (${total > 0 ? (categoryCounts.food / total * 100).toFixed(1) : 0}%)</div>
                </div>
            </div>
            <div class="category-item">
                <div class="category-icon">🎭</div>
                <div class="category-info">
                    <div class="category-name">文化</div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${total > 0 ? (categoryCounts.culture / total * 100) : 0}%"></div>
                    </div>
                    <div class="category-count">${categoryCounts.culture} (${total > 0 ? (categoryCounts.culture / total * 100).toFixed(1) : 0}%)</div>
                </div>
            </div>
            <div class="category-item">
                <div class="category-icon">🏛️</div>
                <div class="category-info">
                    <div class="category-name">建筑</div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${total > 0 ? (categoryCounts.architecture / total * 100) : 0}%"></div>
                    </div>
                    <div class="category-count">${categoryCounts.architecture} (${total > 0 ? (categoryCounts.architecture / total * 100).toFixed(1) : 0}%)</div>
                </div>
            </div>
        </div>
        <div class="total-approved">
            总计已批准: ${total} 个提交
        </div>
    `;
}

// 格式化相对时间
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return formatDateTime(dateString);
}

// 获取状态文本
function getStatusText(status) {
    const texts = {
        'pending': '待审核',
        'approved': '已批准',
        'rejected': '已拒绝'
    };
    return texts[status] || status;
}
