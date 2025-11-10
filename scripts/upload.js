// ===========================
// 香港記憶地圖 - 上傳頁面腳本
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
            { value: 'wetmarket', label: '街市大排檔' },
            { value: 'other', label: '其他餐飲' }
        ]
    },
    culture: {
        name: '文化系列',
        icon: '🎭',
        subcategories: [
            { value: 'opera', label: '粵劇文化' },
            { value: 'temple', label: '傳統廟宇' },
            { value: 'festival', label: '民俗節慶' },
            { value: 'craft', label: '傳統工藝' },
            { value: 'other', label: '其他文化' }
        ]
    },
    architecture: {
        name: '建築系列',
        icon: '🏛️',
        subcategories: [
            { value: 'tenement', label: '唐樓' },
            { value: 'colonial', label: '殖民地建築' },
            { value: 'village', label: '圍村建築' },
            { value: 'industrial', label: '工業遺產' },
            { value: 'other', label: '其他建築' }
        ]
    }
};

// 全局變量
let selectedPhoto = null;
let uploadedPhotoData = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadPage();
    checkLoginStatus();
    setupFormHandlers();
    setupPhotoUpload();
});

// 初始化上傳頁面
function initializeUploadPage() {
    console.log('上傳頁面已加載');
    
    // 設置分類下拉選單
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }

    // 設置描述字數統計
    const descriptionTextarea = document.getElementById('description');
    if (descriptionTextarea) {
        descriptionTextarea.addEventListener('input', updateCharCount);
    }
}

// 檢查登入狀態
function checkLoginStatus() {
    const user = getCurrentUser();
    if (!user) {
        // 未登入，顯示提示並重定向
        alert('請先登入才能上傳記憶');
        window.location.href = 'login.html';
    } else {
        // 已登入，更新導航欄
        updateNavbar(user);
    }
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
// 獲取當前用戶
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// 設置表單處理器
function setupFormHandlers() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleFormSubmit);
    }
}

// 處理分類變更
function handleCategoryChange(event) {
    const selectedCategory = event.target.value;
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subcategorySelect = document.getElementById('subcategory');

    if (selectedCategory && categoryConfig[selectedCategory]) {
        // 顯示子分類
        subcategoryGroup.style.display = 'block';
        
        // 填充子分類選項
        const subcategories = categoryConfig[selectedCategory].subcategories;
        subcategorySelect.innerHTML = '<option value="">請選擇子分類</option>' +
            subcategories.map(sub => 
                `<option value="${sub.value}">${sub.label}</option>`
            ).join('');
        
        subcategorySelect.required = true;
    } else {
        // 隱藏子分類
        subcategoryGroup.style.display = 'none';
        subcategorySelect.required = false;
    }
}

// 設置照片上傳
function setupPhotoUpload() {
    const photoUpload = document.getElementById('photoUpload');
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoPreview = document.getElementById('photoPreview');
    const removePhoto = document.getElementById('removePhoto');

    if (!photoUpload || !photoUploadArea) return;

    // 文件選擇事件
    photoUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handlePhotoSelect(file);
        }
    });

    // 拖放事件
    photoUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'rgba(212, 165, 116, 0.05)';
    });

    photoUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
    });

    photoUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = 'transparent';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handlePhotoSelect(file);
        } else {
            alert('請上傳圖片文件');
        }
    });

    // 移除照片按鈕
    if (removePhoto) {
        removePhoto.addEventListener('click', function(e) {
            e.stopPropagation();
            clearPhotoSelection();
        });
    }
}

// 處理照片選擇
function handlePhotoSelect(file) {
    // 檢查文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
        alert('照片大小不能超過 5MB');
        return;
    }

    // 檢查文件類型
    if (!file.type.startsWith('image/')) {
        alert('請上傳圖片文件');
        return;
    }

    selectedPhoto = file;

    // 讀取並預覽照片
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedPhotoData = e.target.result;
        displayPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

// 顯示照片預覽
function displayPhotoPreview(dataUrl) {
    const photoPreview = document.getElementById('photoPreview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    
    if (photoPreview && uploadPlaceholder) {
        const img = photoPreview.querySelector('img');
        img.src = dataUrl;
        
        uploadPlaceholder.style.display = 'none';
        photoPreview.style.display = 'block';
    }
}

// 清除照片選擇
function clearPhotoSelection() {
    selectedPhoto = null;
    uploadedPhotoData = null;
    
    const photoUpload = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    
    if (photoUpload) photoUpload.value = '';
    if (photoPreview) photoPreview.style.display = 'none';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
}

// 更新字數統計
function updateCharCount(event) {
    const textarea = event.target;
    const charCount = textarea.parentElement.querySelector('.char-count');
    const currentLength = textarea.value.length;
    const maxLength = 500;
    
    if (charCount) {
        charCount.textContent = `${currentLength}/${maxLength} 字`;
        
        if (currentLength > maxLength) {
            charCount.style.color = 'var(--danger-color)';
            textarea.value = textarea.value.substring(0, maxLength);
        } else if (currentLength > maxLength * 0.9) {
            charCount.style.color = 'var(--warning-color)';
        } else {
            charCount.style.color = 'var(--text-secondary)';
        }
    }
}

// 處理表單提交
async function handleFormSubmit(event) {
    event.preventDefault();

    // 檢查是否已上傳照片
    if (!uploadedPhotoData) {
        showStatus('請上傳照片', 'error');
        return;
    }

    const user = getCurrentUser();
    if (!user) {
        alert('請先登入');
        window.location.href = 'login.html';
        return;
    }

    // 獲取表單數據
    const formData = {
        id: 'sub-' + Date.now(),
        userId: user.id,
        username: user.username,
        title: document.getElementById('title').value,
        photo: uploadedPhotoData,
        location: document.getElementById('location').value,
        address: document.getElementById('address').value || '',
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value,
        description: document.getElementById('description').value,
        tags: document.getElementById('tags').value || '',
        status: 'pending', // 待審核
        submitTime: new Date().toISOString(),
        submittedDate: new Date().toISOString()
    };

    // 檢查今日是否已提交相同地點
    if (hasSameLocationToday(user.id, formData.location)) {
        showStatus('您今天已經提交過這個地點了，請明天再試', 'error');
        return;
    }

    // 保存提交
    if (saveSubmission(formData)) {
        showStatus('提交成功！您的記憶正在等待審核', 'success');
        
        // 3秒後跳轉到收藏頁面
        setTimeout(() => {
            window.location.href = 'collection.html?tab=submissions';
        }, 3000);
    } else {
        showStatus('提交失敗，請稍後再試', 'error');
    }
}

// 檢查今日是否已提交相同地點
function hasSameLocationToday(userId, location) {
    const submissions = getAllSubmissions();
    const today = new Date().toDateString();
    
    return submissions.some(sub => 
        sub.userId === userId && 
        sub.location === location && 
        new Date(sub.date).toDateString() === today
    );
}

// 獲取所有提交
function getAllSubmissions() {
    const submissionsStr = localStorage.getItem('submissions');
    return submissionsStr ? JSON.parse(submissionsStr) : [];
}

// 保存提交
function saveSubmission(submission) {
    try {
        const submissions = getAllSubmissions();
        submissions.push(submission);
        localStorage.setItem('submissions', JSON.stringify(submissions));
        return true;
    } catch (error) {
        console.error('保存提交失敗:', error);
        return false;
    }
}

// 顯示狀態消息
function showStatus(message, type) {
    const statusDiv = document.getElementById('submitStatus');
    if (!statusDiv) return;

    statusDiv.textContent = message;
    statusDiv.className = `submit-status ${type}`;
    statusDiv.style.display = 'block';

    // 滾動到狀態消息
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // 如果是錯誤消息，5秒後自動隱藏
    if (type === 'error') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

// 獲取分類圖標
function getCategoryIcon(category) {
    return categoryConfig[category]?.icon || '📌';
}

// 獲取分類名稱
function getCategoryName(category) {
    return categoryConfig[category]?.name || '其他';
}

// 獲取子分類名稱
function getSubcategoryName(category, subcategory) {
    const config = categoryConfig[category];
    if (!config) return subcategory;
    
    const sub = config.subcategories.find(s => s.value === subcategory);
    return sub ? sub.label : subcategory;
}

// 表單重置
function resetForm() {
    document.getElementById('uploadForm').reset();
    clearPhotoSelection();
    document.getElementById('subcategoryGroup').style.display = 'none';
    updateCharCount({ target: document.getElementById('description') });
}

// 導出配置供其他模塊使用
window.categoryConfig = categoryConfig;
window.getCategoryIcon = getCategoryIcon;
window.getCategoryName = getCategoryName;
window.getSubcategoryName = getSubcategoryName;
