// 管理员审核系统
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 審核頁面開始加載...');
    
    // 验证管理员权限（需要reviewer或以上权限）
    console.log('🔐 檢查管理員權限...');
    if (!verifyAdminPermission('reviewer')) {
        console.error('❌ 權限驗證失敗，停止加載');
        return;
    }
    
    console.log('✅ 權限驗證通過');
    
    // 更新导航栏
    updateAdminNavbar();
    
    // 初始化页面
    console.log('🎬 初始化審核頁面...');
    initializeReviewPage();
});

// 初始化审核页面
function initializeReviewPage() {
    // 加载待审核列表
    loadPendingSubmissions();
    
    // 绑定筛选器事件
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterSubmissions(category);
        });
    });
    
    // 绑定搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchSubmissions(this.value);
        });
    }
}

// 加载待审核提交
function loadPendingSubmissions() {
    console.log('📋 開始加載待審核提交...');
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    console.log('📊 總提交數:', submissions.length);
    
    const pendingSubmissions = submissions.filter(s => s.status === 'pending');
    console.log('⏳ 待審核數:', pendingSubmissions.length);
    
    if (pendingSubmissions.length > 0) {
        console.log('📝 待審核列表:', pendingSubmissions.map(s => s.title || s.id));
    } else {
        console.warn('⚠️ 沒有待審核的提交');
    }
    
    // 更新统计数据
    updateReviewStats(pendingSubmissions);
    
    // 显示审核列表
    displayReviewList(pendingSubmissions);
    
    console.log('✅ 審核頁面加載完成');
}

// 更新审核统计
function updateReviewStats(submissions) {
    const statsContainer = document.querySelector('.stats-cards');
    if (!statsContainer) return;
    
    const categoryCounts = {
        food: 0,
        culture: 0,
        architecture: 0
    };
    
    submissions.forEach(sub => {
        if (categoryCounts[sub.category] !== undefined) {
            categoryCounts[sub.category]++;
        }
    });
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
                <div class="stat-label">待审核总数</div>
                <div class="stat-value">${submissions.length}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🍜</div>
            <div class="stat-info">
                <div class="stat-label">餐饮</div>
                <div class="stat-value">${categoryCounts.food}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-info">
                <div class="stat-label">文化</div>
                <div class="stat-value">${categoryCounts.culture}</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🏛️</div>
            <div class="stat-info">
                <div class="stat-label">建筑</div>
                <div class="stat-value">${categoryCounts.architecture}</div>
            </div>
        </div>
    `;
}

// 显示审核列表
function displayReviewList(submissions) {
    const reviewList = document.getElementById('reviewList');
    if (!reviewList) return;
    
    if (submissions.length === 0) {
        reviewList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <p>暂无待审核内容</p>
            </div>
        `;
        return;
    }
    
    // 按提交时间倒序排列
    submissions.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime));
    
    reviewList.innerHTML = submissions.map(submission => {
        // 确保 tags 是数组
        let tagsArray = [];
        if (submission.tags) {
            if (Array.isArray(submission.tags)) {
                tagsArray = submission.tags;
            } else if (typeof submission.tags === 'string') {
                // 如果是字符串，按逗号分割
                tagsArray = submission.tags.split(',').map(t => t.trim()).filter(t => t);
            }
        }
        
        return `
        <div class="review-item" data-id="${submission.id}">
            <div class="review-image">
                <img src="${submission.photo}" alt="提交图片">
                <span class="category-badge category-${submission.category}">
                    ${getCategoryName(submission.category)} - ${submission.subcategory}
                </span>
            </div>
            <div class="review-content">
                <h3 class="review-title">${submission.title || '未命名'}</h3>
                <p class="review-description">${submission.description || '无描述'}</p>
                <div class="review-meta">
                    <span class="meta-item">📍 ${submission.location || '未填写位置'}</span>
                    <span class="meta-item">👤 ${submission.username || '匿名'}</span>
                    <span class="meta-item">🕐 ${formatDateTime(submission.submitTime)}</span>
                </div>
                ${tagsArray.length > 0 ? `
                    <div class="review-tags">
                        ${tagsArray.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="review-actions">
                <button class="btn-approve" onclick="approveSubmission('${submission.id}')">
                    ✓ 批准
                </button>
                <button class="btn-reject" onclick="rejectSubmission('${submission.id}')">
                    ✗ 拒绝
                </button>
                <button class="btn-view" onclick="viewSubmissionDetail('${submission.id}')">
                    👁 查看详情
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// 批准提交
function approveSubmission(submissionId) {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) {
        showMessage('提交不存在！', 'error');
        return;
    }
    
    // 显示批准对话框，让管理员添加故事
    showApprovalDialog(submission);
}

// 显示批准对话框
function showApprovalDialog(submission) {
    // 创建对话框
    const dialog = document.createElement('div');
    dialog.className = 'approval-dialog-overlay';
    dialog.innerHTML = `
        <div class="approval-dialog">
            <div class="dialog-header">
                <h3>✅ 批准提交 - 添加故事描述</h3>
                <button class="dialog-close" onclick="closeApprovalDialog()">×</button>
            </div>
            <div class="dialog-body">
                <div class="submission-preview">
                    <img src="${submission.photo}" alt="${submission.title}" style="max-width: 200px; border-radius: 8px;">
                    <div class="preview-info">
                        <h4>${submission.title || '未命名'}</h4>
                        <p>📍 ${submission.location || '未知地点'}</p>
                        <p>👤 提交者：${submission.username}</p>
                        <p>🏷️ ${getCategoryName(submission.category)} - ${submission.subcategory}</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="fragmentStory">
                        <strong>記憶故事描述</strong>
                        <span style="color: #999; font-size: 12px;">（这段故事将显示在用户获得的记忆碎片中）</span>
                    </label>
                    <textarea 
                        id="fragmentStory" 
                        rows="6" 
                        placeholder="請輸入這個地點的故事描述，例如：\n\n這家茶餐廳創立於1952年，是中環最古老的茶餐廳之一。招牌菠蘿包外脆內軟，配上冰凍奶茶，是許多老香港人的集體回憶..."
                        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit;"
                    >${submission.description || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="fragmentTags">
                        <strong>標籤</strong>
                        <span style="color: #999; font-size: 12px;">（用逗號分隔，例如：懷舊, 老字號, 茶餐廳）</span>
                    </label>
                    <input 
                        type="text" 
                        id="fragmentTags" 
                        placeholder="懷舊, 老字號, 傳統"
                        value="${Array.isArray(submission.tags) ? submission.tags.join(', ') : (submission.tags || '')}"
                        style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;"
                    >
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-cancel" onclick="closeApprovalDialog()">取消</button>
                <button class="btn-confirm" onclick="confirmApproval('${submission.id}')">✓ 確認批准並發送碎片</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 聚焦到文本框
    setTimeout(() => {
        document.getElementById('fragmentStory').focus();
    }, 100);
}

// 关闭批准对话框
function closeApprovalDialog() {
    const dialog = document.querySelector('.approval-dialog-overlay');
    if (dialog) {
        dialog.remove();
    }
}

// 确认批准
function confirmApproval(submissionId) {
    const story = document.getElementById('fragmentStory').value.trim();
    const tagsInput = document.getElementById('fragmentTags').value.trim();
    
    if (!story) {
        alert('請輸入故事描述！');
        document.getElementById('fragmentStory').focus();
        return;
    }
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) {
        showMessage('提交不存在！', 'error');
        closeApprovalDialog();
        return;
    }
    
    // 更新提交状态和故事
    submission.status = 'approved';
    submission.reviewTime = new Date().toISOString();
    submission.reviewer = checkAdminLogin().username;
    submission.story = story; // 添加管理员编写的故事
    submission.tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // 保存更新
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    // 生成记忆碎片奖励给用户（包含故事）
    generateFragmentReward(submission);
    
    // 记录审核日志
    recordReviewLog(submissionId, 'approved');
    
    showMessage('已批准！用户将获得记忆碎片奖励', 'success');
    
    // 关闭对话框
    closeApprovalDialog();
    
    // 重新加载列表
    setTimeout(() => {
        loadPendingSubmissions();
    }, 1000);
}

// 拒绝提交
function rejectSubmission(submissionId) {
    const reason = prompt('请输入拒绝理由（可选）：');
    if (reason === null) return; // 用户取消
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) {
        showMessage('提交不存在！', 'error');
        return;
    }
    
    // 更新提交状态
    submission.status = 'rejected';
    submission.reviewTime = new Date().toISOString();
    submission.reviewer = checkAdminLogin().username;
    submission.rejectReason = reason || '不符合审核标准';
    
    // 保存更新
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    // 记录审核日志
    recordReviewLog(submissionId, 'rejected', reason);
    
    showMessage('已拒绝该提交', 'success');
    
    // 重新加载列表
    setTimeout(() => {
        loadPendingSubmissions();
    }, 1000);
}

// 生成碎片奖励
function generateFragmentReward(submission) {
    const fragments = JSON.parse(localStorage.getItem('userFragments')) || {};
    const userId = submission.userId;
    
    if (!fragments[userId]) {
        fragments[userId] = [];
    }
    
    // 创建新碎片
    const newFragment = {
        id: `fragment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: submission.category,
        subcategory: submission.subcategory,
        image: submission.photo,
        title: submission.title,
        description: submission.description,
        location: submission.location,
        obtainedTime: new Date().toISOString(),
        fromSubmission: submission.id
    };
    
    fragments[userId].push(newFragment);
    
    // 保存碎片数据
    localStorage.setItem('userFragments', JSON.stringify(fragments));
    
    // 更新用户统计
    updateUserStats(userId, 'fragment');
}

// 更新用户统计
function updateUserStats(userId, type) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    if (!user.stats) {
        user.stats = {
            fragments: 0,
            cards: 0,
            submissions: 0
        };
    }
    
    if (type === 'fragment') {
        user.stats.fragments = (user.stats.fragments || 0) + 1;
    } else if (type === 'card') {
        user.stats.cards = (user.stats.cards || 0) + 1;
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// 记录审核日志
function recordReviewLog(submissionId, action, reason = '') {
    const logs = JSON.parse(localStorage.getItem('reviewLogs')) || [];
    
    logs.push({
        id: `log-${Date.now()}`,
        submissionId: submissionId,
        action: action,
        reason: reason,
        reviewer: checkAdminLogin().username,
        reviewTime: new Date().toISOString()
    });
    
    // 只保留最近1000条日志
    if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('reviewLogs', JSON.stringify(logs));
}

// 查看提交详情
function viewSubmissionDetail(submissionId) {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const submission = submissions.find(s => s.id === submissionId);
    
    if (!submission) {
        showMessage('提交不存在！', 'error');
        return;
    }
    
    // 创建模态框显示详情
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">×</span>
            <h2>提交详情</h2>
            <div class="detail-content">
                <div class="detail-image">
                    <img src="${submission.photo}" alt="提交图片">
                </div>
                <div class="detail-info">
                    <h3>${submission.title}</h3>
                    <p class="detail-description">${submission.description}</p>
                    <div class="detail-meta">
                        <p><strong>类别：</strong>${getCategoryName(submission.category)} - ${submission.subcategory}</p>
                        <p><strong>位置：</strong>${submission.location || '未填写'}</p>
                        <p><strong>提交者：</strong>${submission.username}</p>
                        <p><strong>提交时间：</strong>${formatDateTime(submission.submitTime)}</p>
                        <p><strong>状态：</strong>${getStatusText(submission.status)}</p>
                        ${submission.tags && submission.tags.length > 0 ? `
                            <p><strong>标签：</strong>${submission.tags.map(tag => `#${tag}`).join(' ')}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-approve" onclick="approveSubmission('${submission.id}'); this.parentElement.parentElement.parentElement.remove();">
                    ✓ 批准
                </button>
                <button class="btn-reject" onclick="rejectSubmission('${submission.id}'); this.parentElement.parentElement.parentElement.remove();">
                    ✗ 拒绝
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 筛选提交
function filterSubmissions(category) {
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    let filtered;
    
    if (category === 'all') {
        filtered = submissions.filter(s => s.status === 'pending');
    } else {
        filtered = submissions.filter(s => s.status === 'pending' && s.category === category);
    }
    
    displayReviewList(filtered);
}

// 搜索提交
function searchSubmissions(query) {
    if (!query.trim()) {
        loadPendingSubmissions();
        return;
    }
    
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
    const filtered = submissions.filter(s => {
        return s.status === 'pending' && (
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.description.toLowerCase().includes(query.toLowerCase()) ||
            s.username.toLowerCase().includes(query.toLowerCase()) ||
            (s.location && s.location.toLowerCase().includes(query.toLowerCase()))
        );
    });
    
    displayReviewList(filtered);
}

// 获取分类名称
function getCategoryName(category) {
    const names = {
        'food': '餐饮',
        'culture': '文化',
        'architecture': '建筑'
    };
    return names[category] || category;
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

// 导出函数
window.approveSubmission = approveSubmission;
window.rejectSubmission = rejectSubmission;
window.viewSubmissionDetail = viewSubmissionDetail;
window.closeApprovalDialog = closeApprovalDialog;
window.confirmApproval = confirmApproval;
