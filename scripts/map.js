// ===========================
// 地圖頁面功能
// ===========================

// 分類配置
const categoryConfig = {
    food: {
        name: '餐飲系列',
        icon: '🍜',
        color: '#e74c3c',
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
        color: '#3498db',
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
        color: '#2ecc71',
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
let allFragments = [];
let filteredFragments = [];
let selectedFragmentId = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    currentUser = getCurrentUser();
    
    // 更新導航欄（無論是否登入都顯示地圖）
    updateNavbar(currentUser);
    
    // 加載所有碎片數據（公共地圖）
    loadAllFragments();
    
    // 設置篩選器
    setupFilters();
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

// 加載所有碎片數據（公共地圖 - 顯示所有已收錄的碎片）
function loadAllFragments() {
    const fragmentsData = localStorage.getItem('userFragments');
    
    if (!fragmentsData) {
        allFragments = [];
        displayNoFragments();
        return;
    }
    
    const fragmentsObj = JSON.parse(fragmentsData);
    
    // 收集所有用戶的所有碎片
    allFragments = [];
    Object.entries(fragmentsObj).forEach(([userId, fragments]) => {
        if (Array.isArray(fragments)) {
            fragments.forEach(fragment => {
                allFragments.push({
                    ...fragment,
                    userId: userId  // 記錄來源用戶（可選）
                });
            });
        }
    });
    
    console.log('🗺️ 公共地圖已加載', allFragments.length, '個記憶碎片');
    
    if (allFragments.length === 0) {
        displayNoFragments();
        return;
    }
    
    filteredFragments = [...allFragments];
    displayFragments(filteredFragments);
    updateFragmentCount(filteredFragments.length);
}

// 設置篩選器
function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    
    categoryFilter.addEventListener('change', function() {
        updateSubcategoryFilter(this.value);
        filterFragments();
    });
    
    subcategoryFilter.addEventListener('change', function() {
        filterFragments();
    });
}

// 更新子分類篩選器
function updateSubcategoryFilter(category) {
    const subcategoryFilter = document.getElementById('subcategoryFilter');
    subcategoryFilter.innerHTML = '<option value="all">全部子分類</option>';
    
    if (category === 'all') {
        // 顯示所有子分類
        Object.keys(categoryConfig).forEach(catKey => {
            const config = categoryConfig[catKey];
            config.subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = `${catKey}-${sub.value}`;
                option.textContent = `${config.icon} ${sub.label}`;
                subcategoryFilter.appendChild(option);
            });
        });
    } else {
        // 只顯示選中分類的子分類
        const config = categoryConfig[category];
        if (config) {
            config.subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.value;
                option.textContent = sub.label;
                subcategoryFilter.appendChild(option);
            });
        }
    }
}

// 篩選碎片
function filterFragments() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const subcategoryFilter = document.getElementById('subcategoryFilter').value;
    
    filteredFragments = allFragments.filter(fragment => {
        // 主分類篩選
        if (categoryFilter !== 'all' && fragment.category !== categoryFilter) {
            return false;
        }
        
        // 子分類篩選
        if (subcategoryFilter !== 'all') {
            if (categoryFilter === 'all') {
                // 如果主分類是全部，子分類格式是 "category-subcategory"
                const [cat, subcat] = subcategoryFilter.split('-');
                return fragment.category === cat && fragment.subcategory === subcat;
            } else {
                // 如果已選主分類，子分類格式就是 "subcategory"
                return fragment.subcategory === subcategoryFilter;
            }
        }
        
        return true;
    });
    
    displayFragments(filteredFragments);
    updateFragmentCount(filteredFragments.length);
}

// 顯示碎片列表
function displayFragments(fragments) {
    const fragmentList = document.getElementById('fragmentList');
    
    if (fragments.length === 0) {
        fragmentList.innerHTML = `
            <div class="no-fragments">
                <div class="no-fragments-icon">🔍</div>
                <p>沒有符合條件的碎片</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                    請調整篩選條件
                </p>
            </div>
        `;
        return;
    }
    
    // 按分類分組
    const grouped = {};
    fragments.forEach(fragment => {
        const category = fragment.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(fragment);
    });
    
    let html = '';
    
    // 按分類順序顯示
    ['food', 'culture', 'architecture'].forEach(categoryKey => {
        if (grouped[categoryKey]) {
            const config = categoryConfig[categoryKey];
            
            grouped[categoryKey].forEach(fragment => {
                const subcategory = config.subcategories.find(s => s.value === fragment.subcategory);
                const subcategoryLabel = subcategory ? subcategory.label : fragment.subcategory;
                
                html += `
                    <div class="fragment-item ${selectedFragmentId === fragment.id ? 'active' : ''}" 
                         data-id="${fragment.id}"
                         onclick="selectFragment('${fragment.id}')">
                        <h4>${fragment.title}</h4>
                        <p>📍 ${fragment.location || fragment.address}</p>
                        <span class="fragment-category" style="background: ${config.color}">
                            ${config.icon} ${subcategoryLabel}
                        </span>
                    </div>
                `;
            });
        }
    });
    
    fragmentList.innerHTML = html;
}

// 選擇碎片
function selectFragment(fragmentId) {
    selectedFragmentId = fragmentId;
    displayFragments(filteredFragments);
    
    // 可以在這裡添加額外的功能，例如：
    // 1. 在地圖上高亮該位置（需要 Google Maps API）
    // 2. 顯示詳細信息彈窗
    // 3. 滾動到對應位置
    
    const fragment = allFragments.find(f => f.id === fragmentId);
    if (fragment) {
        showFragmentDetail(fragment);
    }
}

// 顯示碎片詳情（可選）
function showFragmentDetail(fragment) {
    const config = categoryConfig[fragment.category];
    const subcategory = config.subcategories.find(s => s.value === fragment.subcategory);
    
    // 創建詳情彈窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 500px;
        width: 90%;
    `;
    
    modal.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 15px;">${config.icon}</div>
            <h2 style="margin: 0 0 10px 0; color: #333;">${fragment.title}</h2>
            <p style="color: ${config.color}; font-weight: bold; margin-bottom: 20px;">
                ${subcategory.label}
            </p>
            <div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>📍 位置：</strong>${fragment.location}</p>
                <p style="margin: 5px 0;"><strong>🏠 地址：</strong>${fragment.address}</p>
                <p style="margin: 5px 0;"><strong>📝 描述：</strong>${fragment.description || '暫無描述'}</p>
            </div>
            <button onclick="closeFragmentDetail()" style="
                padding: 12px 30px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                font-size: 1rem;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            ">關閉</button>
        </div>
    `;
    
    // 背景遮罩
    const overlay = document.createElement('div');
    overlay.id = 'fragmentDetailOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    overlay.onclick = closeFragmentDetail;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    window.currentModal = modal;
}

// 關閉碎片詳情
function closeFragmentDetail() {
    const overlay = document.getElementById('fragmentDetailOverlay');
    if (overlay) overlay.remove();
    if (window.currentModal) window.currentModal.remove();
}

// 顯示無碎片狀態
function displayNoFragments() {
    const fragmentList = document.getElementById('fragmentList');
    fragmentList.innerHTML = `
        <div class="no-fragments">
            <div class="no-fragments-icon">📭</div>
            <p>暫無已收錄的記憶碎片</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">
                系統中還沒有任何碎片數據。<br>
                請前往<a href="dev-tools.html" style="color: #667eea;">開發工具</a>生成測試數據，
                或等待管理員收錄更多記憶碎片。
            </p>
        </div>
    `;
    updateFragmentCount(0);
}

// 更新碎片計數
function updateFragmentCount(count) {
    const fragmentCount = document.getElementById('fragmentCount');
    fragmentCount.textContent = count;
}

// ===========================
// 導出到 Google Maps CSV
// ===========================

// 導出當前顯示的碎片為 CSV
function exportToGoogleMapsCSV() {
    if (filteredFragments.length === 0) {
        alert('⚠️ 沒有碎片可以導出！\n\n請先確保有碎片數據，並調整篩選條件。');
        return;
    }
    
    // 確認導出方式
    const confirmMsg = `📍 即將導出 ${filteredFragments.length} 個記憶碎片到 Google My Maps\n\n` +
                      `請選擇導出方式：\n\n` +
                      `✅ 確定：導出 3 個分開的 CSV（推薦，自動分層）\n` +
                      `❌ 取消：不導出`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    // 按分類分組
    const fragmentsByCategory = {
        food: filteredFragments.filter(f => f.category === 'food'),
        culture: filteredFragments.filter(f => f.category === 'culture'),
        architecture: filteredFragments.filter(f => f.category === 'architecture')
    };
    
    // 生成並下載 3 個 CSV
    const categoriesToExport = Object.entries(fragmentsByCategory).filter(([k, v]) => v.length > 0);
    let downloadedCount = 0;
    
    categoriesToExport.forEach(([category, fragments], index) => {
        const config = categoryConfig[category];
        const csvContent = generateCSVContent(fragments);
        const filename = `HK_Memory_Map_${config.name}.csv`;
        
        // 延遲下載避免瀏覽器阻擋（增加延遲時間）
        setTimeout(() => {
            downloadCSV(csvContent, filename);
            downloadedCount++;
            
            console.log(`✅ 已下載 ${downloadedCount}/${categoriesToExport.length}: ${filename}`);
            
            // 最後一個下載完成後顯示成功訊息
            if (downloadedCount === categoriesToExport.length) {
                setTimeout(() => showExportSuccess(filteredFragments.length, fragmentsByCategory), 500);
            }
        }, index * 800); // 增加到 800ms 延遲
    });
}

// 生成 CSV 內容
function generateCSVContent(fragments) {
    // CSV 標題行（簡化，不包含圖層欄位）
    let csv = '名稱,地址,描述\n';
    
    fragments.forEach(fragment => {
        const config = categoryConfig[fragment.category];
        const subcategory = config.subcategories.find(s => s.value === fragment.subcategory);
        const subcategoryLabel = subcategory ? subcategory.label : fragment.subcategory;
        
        // 組合名稱
        const name = fragment.title;
        
        // 使用完整地址（優先使用 address，其次 location）
        const address = fragment.address || fragment.location || '';
        
        // 組合描述（包含分類和詳細描述）
        const description = `分類：${config.name} > ${subcategoryLabel}\n\n${fragment.description || '香港經典記憶碎片'}`;
        
        // 轉義 CSV 特殊字符（雙引號和換行）
        const escapedName = escapeCSVField(name);
        const escapedAddress = escapeCSVField(address);
        const escapedDescription = escapeCSVField(description);
        
        csv += `${escapedName},${escapedAddress},${escapedDescription}\n`;
    });
    
    return csv;
}

// 轉義 CSV 字段（處理逗號、雙引號、換行）
function escapeCSVField(field) {
    if (!field) return '""';
    
    // 將字段轉為字串
    field = String(field);
    
    // 如果包含逗號、雙引號或換行，需要用雙引號包裹
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        // 雙引號需要轉義為兩個雙引號
        field = field.replace(/"/g, '""');
        return `"${field}"`;
    }
    
    return `"${field}"`;
}

// 下載 CSV 檔案
function downloadCSV(content, filename) {
    // 添加 UTF-8 BOM 以確保 Excel 正確顯示中文
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    
    // 創建下載連結
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 釋放 URL 對象
    URL.revokeObjectURL(url);
}

// 顯示導出成功訊息
function showExportSuccess(count, fragmentsByCategory) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        text-align: center;
    `;
    
    // 統計各分類數量
    const counts = {
        food: fragmentsByCategory.food?.length || 0,
        culture: fragmentsByCategory.culture?.length || 0,
        architecture: fragmentsByCategory.architecture?.length || 0
    };
    
    modal.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
        <h2 style="color: #2ecc71; margin: 0 0 15px 0;">導出成功！</h2>
        <p style="color: #666; margin-bottom: 25px; font-size: 1.1rem;">
            已成功導出 <strong style="color: #667eea;">${count} 個</strong>記憶碎片<br>
            <span style="font-size: 0.9rem; color: #999;">分成 3 個 CSV 檔案</span>
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 1rem; color: #333;">📁 已下載的檔案</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${counts.food > 0 ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #e74c3c;">
                    <span style="font-weight: bold;">� HK_Memory_Map_餐飲系列.csv</span>
                    <span style="color: #999; font-size: 0.9rem;">${counts.food} 個地點</span>
                </div>
                ` : ''}
                ${counts.culture > 0 ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #3498db;">
                    <span style="font-weight: bold;">🎭 HK_Memory_Map_文化系列.csv</span>
                    <span style="color: #999; font-size: 0.9rem;">${counts.culture} 個地點</span>
                </div>
                ` : ''}
                ${counts.architecture > 0 ? `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #2ecc71;">
                    <span style="font-weight: bold;">🏛️ HK_Memory_Map_建築系列.csv</span>
                    <span style="color: #999; font-size: 0.9rem;">${counts.architecture} 個地點</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 1rem; color: #333;">�🎨 圖層顏色設定參考</h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; border: 2px solid #e0e0e0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #e74c3c; border-radius: 50%; box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);"></div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #333;">🍜 餐飲系列</div>
                            <div style="font-size: 0.85rem; color: #999;">#e74c3c</div>
                        </div>
                    </div>
                    <span style="background: #ffe5e5; color: #e74c3c; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">紅色</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; border: 2px solid #e0e0e0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #3498db; border-radius: 50%; box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);"></div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #333;">🎭 文化系列</div>
                            <div style="font-size: 0.85rem; color: #999;">#3498db</div>
                        </div>
                    </div>
                    <span style="background: #e3f2fd; color: #3498db; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">藍色</span>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 8px; border: 2px solid #e0e0e0;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: #2ecc71; border-radius: 50%; box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);"></div>
                        <div style="text-align: left;">
                            <div style="font-weight: bold; color: #333;">🏛️ 建築系列</div>
                            <div style="font-size: 0.85rem; color: #999;">#2ecc71</div>
                        </div>
                    </div>
                    <span style="background: #e8f8f5; color: #2ecc71; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: bold;">綠色</span>
                </div>
            </div>
            <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #666;">
                💡 每個 CSV 匯入後會自動成為一個圖層
            </p>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 12px; text-align: left; margin-bottom: 20px; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0 0 12px 0; font-size: 1rem; color: #856404;">📋 快速操作步驟：</h3>
            <ol style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.8; font-size: 0.95rem;">
                <li>開啟 <a href="https://www.google.com/mymaps" target="_blank" style="color: #667eea;">Google My Maps</a></li>
                <li>點擊「<strong>匯入</strong>」→ 上傳第 1 個 CSV（餐飲系列）</li>
                <li>選擇「<strong>地址</strong>」作為位置，「<strong>名稱</strong>」作為標題</li>
                <li>重新命名圖層為「餐飲系列」→ 設定 🔴 紅色</li>
                <li>重複步驟 2-4 匯入其他 2 個 CSV</li>
                <li>完成！🎉 現在有 3 個不同顏色的圖層了</li>
            </ol>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="window.open('https://www.google.com/mymaps', '_blank')" style="
                padding: 12px 24px;
                background: #4285f4;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            " onmouseover="this.style.background='#3367d6'" onmouseout="this.style.background='#4285f4'">前往 Google My Maps</button>
            
            <button onclick="closeExportModal()" style="
                padding: 12px 24px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                cursor: pointer;
                font-weight: bold;
            ">關閉</button>
        </div>
    `;
    
    // 背景遮罩
    const overlay = document.createElement('div');
    overlay.id = 'exportModalOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    overlay.onclick = closeExportModal;
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
    window.currentExportModal = modal;
}

// 關閉導出成功彈窗
function closeExportModal() {
    const overlay = document.getElementById('exportModalOverlay');
    if (overlay) overlay.remove();
    if (window.currentExportModal) window.currentExportModal.remove();
}

// 導出函數供 HTML 使用
window.selectFragment = selectFragment;
window.closeFragmentDetail = closeFragmentDetail;
window.handleLogout = handleLogout;
window.exportToGoogleMapsCSV = exportToGoogleMapsCSV;
window.closeExportModal = closeExportModal;
