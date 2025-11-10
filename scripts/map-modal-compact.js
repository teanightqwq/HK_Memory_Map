// 精簡版導出成功彈窗
// 在 map.js 的 showExportSuccess 函數中使用

function showExportSuccessCompact(count, fragmentsByCategory) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 480px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
    `;
    
    const counts = {
        food: fragmentsByCategory.food?.length || 0,
        culture: fragmentsByCategory.culture?.length || 0,
        architecture: fragmentsByCategory.architecture?.length || 0
    };
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">✅</div>
            <h2 style="color: #2ecc71; margin: 0 0 5px; font-size: 1.3rem;">導出成功</h2>
            <p style="color: #999; font-size: 0.9rem;">已下載 ${count} 個碎片 · 3 個 CSV 檔案</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 12px; border-radius: 10px; margin-bottom: 15px;">
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem;">
                ${counts.food > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: white; border-radius: 5px; border-left: 3px solid #e74c3c;">
                    <span>🍜 餐飲系列</span>
                    <span style="color: #999;">${counts.food} 個</span>
                </div>` : ''}
                ${counts.culture > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: white; border-radius: 5px; border-left: 3px solid #3498db;">
                    <span>🎭 文化系列</span>
                    <span style="color: #999;">${counts.culture} 個</span>
                </div>` : ''}
                ${counts.architecture > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 6px 10px; background: white; border-radius: 5px; border-left: 3px solid #2ecc71;">
                    <span>🏛️ 建築系列</span>
                    <span style="color: #999;">${counts.architecture} 個</span>
                </div>` : ''}
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-around; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center;">
                <div style="width: 30px; height: 30px; background: #e74c3c; border-radius: 50%; margin: 0 auto 3px;"></div>
                <div style="font-size: 0.7rem; color: #666;">紅色</div>
            </div>
            <div style="text-align: center;">
                <div style="width: 30px; height: 30px; background: #3498db; border-radius: 50%; margin: 0 auto 3px;"></div>
                <div style="font-size: 0.7rem; color: #666;">藍色</div>
            </div>
            <div style="text-align: center;">
                <div style="width: 30px; height: 30px; background: #2ecc71; border-radius: 50%; margin: 0 auto 3px;"></div>
                <div style="font-size: 0.7rem; color: #666;">綠色</div>
            </div>
        </div>
        
        <div style="background: #fff3cd; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 0.8rem; line-height: 1.5; color: #856404;">
            <strong>匯入步驟：</strong><br>
            1. 前往 Google My Maps<br>
            2. 點「匯入」上傳 CSV<br>
            3. 選「地址」和「名稱」<br>
            4. 重命名圖層並設顏色<br>
            5. 重複 2-4 匯入其他 CSV
        </div>
        
        <div style="display: flex; gap: 8px;">
            <button onclick="window.open('https://www.google.com/mymaps', '_blank')" style="
                flex: 1;
                padding: 10px;
                background: #4285f4;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 0.9rem;
                cursor: pointer;
                font-weight: bold;
            ">前往 GMM</button>
            
            <button onclick="closeExportModal()" style="
                flex: 1;
                padding: 10px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 0.9rem;
                cursor: pointer;
                font-weight: bold;
            ">關閉</button>
        </div>
    `;
    
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
