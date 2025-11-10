# 🗺️ 香港記憶地圖 Hong Kong Memory Map

《記憶地圖：碎片重構香港》項目活動 - LANG1421

**記錄消失中的香港記憶 | Preserving Hong Kong's Fading Memories**

---

## 🎯 参考图
<img width="2483" height="4285" alt="image" src="https://github.com/user-attachments/assets/721d18ba-eaf6-4d9f-bc93-123728c06068" />

## 📖 項目簡介

本項目旨在通過將"文化認知"融入人們的日常生活中，在空閒時間以最低的參與成本，通過收集香港各地的"舊時產物"，以輕鬆、簡單的步驟，參與並深入了解對香港本地的"文化保育"認知。

## ✨ 主要功能

### 1. 🗺️ 記憶地圖（公共地圖）
<img width="2482" height="1364" alt="image" src="https://github.com/user-attachments/assets/ae9facbe-1fe5-42da-8f3d-6d7fba09c0e6" />
- 展示所有已收錄的記憶碎片位置
- 使用 Google My Maps 嵌入地圖
- 按分類顯示（餐飲/文化/建築）
- 一鍵導出 CSV 到 Google Maps
- 支持主分類和子分類篩選

### 2. �📸 記憶上傳
<img width="2480" height="1362" alt="image" src="https://github.com/user-attachments/assets/62c69c53-720b-43c7-86ce-2a697f1408af" />
- 用戶拍攝日常生活中遇到的舊記憶
- 支持拖拽上傳照片（最大5MB）
- 選擇主分類和子分類
- 添加地點信息和故事描述
- 防重複提交（同一地點每天限一次）

### 3. 🧩 記憶碎片收集
<img width="2490" height="1362" alt="image" src="https://github.com/user-attachments/assets/fc861c31-b96a-4e96-98f5-7d8094ddbc1f" />
參與者上傳照片經審核後，可獲得該地的"記憶碎片"：
- 每個碎片附帶一段核心故事
- 包含地點背景和相關知識
- 按分類整理（餐飲/文化/建築）

### 4. 🎴 記憶卡合成
<img width="2483" height="3766" alt="image" src="https://github.com/user-attachments/assets/7448ef0d-b131-4c68-9a3a-1794953109f4" />
- 通過3個地點打卡，集齊同系列碎片
- 可合成"稀有記憶卡"
- 收集不同系列的記憶卡
- 全收集顯示特殊徽章 ✓ 已收集

### 5. 🏆 排行榜系統
<img width="2471" height="1354" alt="image" src="https://github.com/user-attachments/assets/7ce2b5be-4631-4f3d-9c87-16179bd7e2c6" />
- 記錄參與者的收集碎片數
- 每週發佈排行榜
- 支持本週/本月/總榜查看
- 成就系統（9種不同成就）

### 6. 👤 用戶系統
- 註冊/登入功能
- 個人收藏管理
- 提交記錄查看
- 統計數據展示

### 7. 🛠️ 管理員系統
- 審核用戶提交的記憶
- 管理記憶碎片和記憶卡
- 用戶管理和數據統計
- 系統設置和分類管理

## 🚀 快速開始

**⚡ 使用方法：**

1. 將 GitHub > clone 複製到本地
2. 通過文件資源管理器打開瀏覽器訪問：`index.html`
3. 使用下方測試帳號登錄體驗

📖 詳細說明：[快速開始指南 QUICKSTART.md](QUICKSTART.md) | [管理員指南 ADMIN_GUIDE.md](ADMIN_GUIDE.md)

## 🧪 測試帳號

### 普通用戶

| 用戶名 | 密碼 | 說明 |
|--------|------|------|
| `demo` | `123456` | 演示帳號（有部分收集） |
| `test` | `test123` | 測試帳號 |
| `hkfan` | `hk123456` | 香港迷帳號 |

### 管理員帳號

| 用戶名 | 密碼 | 角色 |
|--------|------|------|
| `admin` | `admin123456` | 超級管理員（完整權限） |
| `reviewer` | `review123456` | 審核員（審核權限） |

## 📋 使用流程

```
註冊/登入 → 上傳記憶 → 等待審核 → 獲得碎片 → 查看地圖 → 收集卡片 → 查看排名
```

### 詳細步驟

1. **註冊/登入**
   - 訪問 `pages/login.html` 登入
   - 或 `pages/register.html` 註冊新帳號
   - 可使用測試帳號快速體驗

2. **瀏覽記憶地圖**
   - 訪問 `pages/map.html` 查看公共地圖
   - 查看所有已收錄的記憶碎片位置
   - 使用篩選功能查看不同分類
   - 導出 CSV 到 Google My Maps

3. **上傳記憶**
   - 點擊"上傳記憶"按鈕
   - 選擇照片並填寫信息
   - 提交等待管理員審核

3. **上傳記憶**
   - 點擊"上傳記憶"按鈕
   - 選擇照片並填寫信息
   - 提交等待管理員審核

4. **收集碎片**
   - 審核通過後獲得記憶碎片
   - 查看碎片故事和信息
   - 在地圖上查看碎片位置

5. **合成卡片**
   - 收集3個同系列碎片
   - 自動合成稀有記憶卡
   - 挑戰全收集成就

6. **查看排名**
   - 查看自己在排行榜的位置
   - 獲得成就徽章
   - 與其他收集者競爭

## 📁 項目結構

```
HK_Memory_Map/
├── index.html                 # 首頁
├── pages/                     # 頁面文件夾
│   ├── map.html              # 🗺️ 記憶地圖（新增）
│   ├── upload.html           # 📸 上傳頁面
│   ├── collection.html       # 🧩 收藏頁面
│   ├── achievements.html     # 🏆 成就頁面
│   ├── leaderboard.html      # 📊 排行榜頁面
│   ├── login.html            # 🔐 登入頁面
│   ├── register.html         # 📝 註冊頁面
│   ├── dev-tools.html        # 🛠️ 開發工具
│   └── admin/                # 👨‍💼 管理員頁面
│       ├── login.html        # 管理員登入
│       ├── dashboard.html    # 數據總覽
│       ├── review.html       # 審核提交
│       ├── fragments.html    # 碎片管理
│       ├── cards.html        # 卡片管理
│       ├── users.html        # 用戶管理
│       ├── categories.html   # 分類管理
│       └── settings.html     # 系統設置
├── styles/                    # 樣式文件夾
│   ├── main.css              # 主樣式表
│   └── admin.css             # 管理員樣式
├── scripts/                   # 腳本文件夾
│   ├── main.js               # 主頁腳本
│   ├── map.js                # 地圖腳本（新增）
│   ├── upload.js             # 上傳頁面腳本
│   ├── collection.js         # 收藏頁面腳本
│   ├── achievements.js       # 成就系統腳本
│   ├── leaderboard.js        # 排行榜腳本
│   ├── auth.js               # 登入腳本
│   ├── register.js           # 註冊腳本
│   ├── dev-tools.js          # 開發工具腳本
│   ├── init-test-data.js     # 測試數據初始化
│   └── admin-*.js            # 管理員功能腳本
├── QUICKSTART.md              # 快速開始指南
├── ADMIN_GUIDE.md             # 管理員指南
├── GOOGLE_MAPS_GUIDE.md       # Google Maps 使用教學
└── README.md                  # 說明文檔
```

## 🎨 技術特點

### 前端技術
- **HTML5** - 語義化標籤、原生拖拽 API
- **CSS3** - 響應式設計、Flexbox/Grid 佈局、動畫效果
- **JavaScript (ES6+)** - 原生 JS 實現所有功能，無框架依賴
- **LocalStorage** - 本地數據持久化存儲
- **Google My Maps API** - 地圖嵌入與數據可視化

### 設計特色
- 🎨 香港懷舊風格配色（紫色系 + 漸變）
- 📱 完全響應式設計（桌面/平板/手機）
- ✨ 流暢的過渡動畫和交互效果
- 🎯 直觀的卡片式 UI 設計
- 🌈 分類顏色編碼系統（餐飲/文化/建築）

### 核心功能亮點
- ⚡ 即時篩選和搜索（無需刷新）
- 📥 CSV 批量導出到 Google My Maps
- 🎴 自動卡片合成系統
- 🏆 成就徽章動態更新
- 🔒 防重複提交保護機制

## 💾 數據結構

### LocalStorage 鍵名

```javascript
// 用戶相關
'currentUser'      // 當前登入用戶信息
'users'            // 所有用戶列表
'loginHistory'     // 登入歷史記錄
'admins'           // 管理員列表

// 內容相關
'submissions'      // 所有提交記錄（待審核/已審核/已拒絕）
'userFragments'    // 用戶碎片集合（按用戶ID分組）
'userCards'        // 用戶記憶卡集合（按用戶ID分組）
'fragments'        // 系統碎片模板
'cards'            // 系統記憶卡模板
'categories'       // 分類和子分類配置

// 系統相關
'achievements'     // 成就系統配置
'leaderboard'      // 排行榜數據
'systemSettings'   // 系統設置
```

### 數據結構示例

**用戶對象：**
```javascript
{
    id: 'user_1234567890',
    username: '用戶名',
    email: 'email@example.com',
    password: '密碼',
    avatar: '👤',
    registerDate: '2025-11-10T...',
    role: 'user'
}
```

**提交對象：**
```javascript
{
    id: 1234567890,
    userId: 'user_xxx',
    username: '用戶名',
    photo: 'data:image/jpeg;base64,...',
    location: '地點名稱',
    address: '詳細地址',
    category: 'food/culture/architecture',
    subcategory: '子分類',
    description: '描述內容',
    tags: '標籤1,標籤2',
    status: 'pending/approved/rejected',
    reviewNote: '審核備註（如果有）',
    date: '2025-11-10T...',
    reviewDate: '2025-11-10T...'
}
```

**碎片對象：**
```javascript
{
    id: 'food_yumcha',
    category: 'food',
    subcategory: '茶樓文化',
    name: '飲茶',
    story: '碎片故事內容...',
    color: '#e74c3c',
    location: '中環蓮香樓',
    address: '中環威靈頓街160-164號',
    obtainedDate: '2025-11-10T...'
}
```

**記憶卡對象：**
```javascript
{
    id: 'card_food',
    name: '餐飲記憶',
    category: 'food',
    description: '完整的香港飲食文化記憶...',
    requiredFragments: ['food_yumcha', 'food_pineapplebun', 'food_eggwaffle'],
    rarity: 'rare',
    unlocked: true,
    unlockedDate: '2025-11-10T...'
}
```

## 🔧 開發工具

項目內置開發工具頁面（`pages/dev-tools.html`），提供：

- 📊 一鍵初始化測試數據（用戶/提交/碎片/卡片）
- 🗑️ 清空所有 LocalStorage 數據
- 💾 導出/導入 JSON 數據
- 🔍 查看當前數據庫狀態
- 🎲 生成隨機測試用戶和提交

**使用建議：**
- 首次使用請先初始化測試數據
- 開發時可用於快速重置環境
- 可導出數據作為備份

## 🚀 未來擴展建議

### 後端開發

目前是純前端原型，要實現完整功能需要：

1. **後端框架**
   - Node.js + Express（推薦）
   - Python + Flask/Django
   - PHP + Laravel

2. **數據庫**
   - MySQL / PostgreSQL（關係型）
   - MongoDB（文檔型，與當前結構相似）

3. **圖片存儲**
   - AWS S3 / 阿里雲 OSS
   - Cloudinary（圖片處理服務）
   - 本地文件系統 + CDN

4. **認證系統**
   - JWT Token 認證
   - OAuth 2.0（支持 Google/Facebook 登入）
   - 密碼加密（bcrypt）
   - Session 管理

5. **實時功能**
   - WebSocket（實時排行榜更新）
   - Server-Sent Events（通知系統）

### 功能擴展

- 🌐 **多語言支持**（繁中/簡中/英文）
- 💬 **評論系統**（用戶可對碎片發表評論）
- ❤️ **點讚收藏**（社交互動功能）
- 🔔 **通知系統**（審核通知/成就通知）
- 📱 **PWA 支持**（可安裝的 Web App）
- 🎮 **遊戲化**（每日任務/連續打卡獎勵）
- 📍 **GPS 定位**（自動獲取當前位置）
- 🔍 **進階搜索**（按標籤/日期/地區搜索）

## 📱 瀏覽器兼容性

### 已測試支持
- ✅ **Chrome 90+**（推薦）
- ✅ **Firefox 88+**
- ✅ **Safari 14+**
- ✅ **Edge 90+**

### 功能需求
- ✅ LocalStorage API
- ✅ ES6+ JavaScript 支持
- ✅ CSS Grid & Flexbox
- ✅ Drag & Drop API

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 本倉庫
2. 創建功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 開啟 Pull Request

### 代碼規範
- 使用 2 空格縮進
- 函數和變量使用駝峰命名
- 添加適當的註釋
- 保持代碼簡潔可讀

## 📞 聯繫方式

- � Email: your.email@example.com
- 🌐 GitHub: [@teanightqwq](https://github.com/teanightqwq)
- 📝 項目主頁: [HK Memory Map](https://github.com/teanightqwq/HK_Memory_Map)

## �📄 授權

本項目採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

---

<div align="center">

**記錄消失中的香港記憶 | Preserving Hong Kong's Fading Memories**

Made with ❤️ for Hong Kong

[⬆ 返回頂部](#-香港記憶地圖-hong-kong-memory-map)

</div>
