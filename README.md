# 🗺️ 香港記憶地圖 Hong Kong Memory Map

《記憶地圖：碎片重構香港》項目活動 - LANG1421

## 📖 項目簡介

本項目旨在通過將"文化認知"融入人們的日常生活中，在空閒時間以最低的參與成本，通過收集香港各地的"舊時產物"，以輕鬆、簡單的步驟，參與並深入了解對香港本地的"文化保育"認知。

## ✨ 主要功能

### 1. 📸 記憶上傳
- 用戶拍攝日常生活中遇到的舊記憶
- 支持拖拽上傳照片（最大5MB）
- 選擇主分類和子分類
- 添加地點信息和故事描述
- 防重複提交（同一地點每天限一次）

### 2. 🧩 記憶碎片收集
參與者上傳照片經審核後，可獲得該地的"記憶碎片"：
- 每個碎片附帶一段核心故事
- 包含地點背景和相關知識
- 按分類整理（餐飲/文化/建築）

### 3. 🎴 記憶卡合成
- 通過3個地點打卡，集齊同系列碎片
- 可合成"稀有記憶卡"
- 收集不同系列的記憶卡
- 全收集顯示特殊徽章 ✓ 已收集

### 4. 🏆 排行榜系統
- 記錄參與者的收集碎片數
- 每週發佈排行榜
- 支持本週/本月/總榜查看
- 成就系統（9種不同成就）

### 5. 👤 用戶系統
- 註冊/登入功能
- 個人收藏管理
- 提交記錄查看
- 統計數據展示

## 🚀 快速開始

**⚡ 第一次使用？请先初始化测试数据：**

1. 打开浏览器访问：`init-data.html`
2. 点击"初始化测试数据"按钮
3. 使用下方测试账号登录体验

📖 详细说明：[快速开始指南 QUICKSTART.md](QUICKSTART.md) | [管理员指南 ADMIN_GUIDE.md](ADMIN_GUIDE.md)

### 測試帳號

**普通用户：**
- 用戶名：`demo` / 密碼：`123456`
- 用戶名：`test` / 密碼：`test123`
- 用戶名：`hkfan` / 密碼：`hk123456`

**管理员账号：**
- 用戶名：`admin` / 密碼：`admin123456`（超级管理员）
- 用戶名：`reviewer` / 密碼：`review123456`（审核员）

### 測試帳號

系統內置兩個測試帳號：

**帳號1：**
- 用戶名：`demo`
- 密碼：`123456`

**帳號2：**
- 用戶名：`test`
- 密碼：`test123`

### 使用流程

1. **註冊/登入**
   - 訪問 `pages/login.html` 登入
   - 或 `pages/register.html` 註冊新帳號

2. **上傳記憶**
   - 點擊"上傳記憶"
   - 選擇照片並填寫信息
   - 提交等待審核

3. **收集碎片**
   - 審核通過後獲得記憶碎片
   - 查看碎片故事和信息

4. **合成卡片**
   - 收集3個同系列碎片
   - 合成稀有記憶卡
   - 挑戰全收集

5. **查看排名**
   - 查看自己的排名
   - 獲得成就徽章

## 📁 項目結構

```
HK_Memory_Map/
├── index.html                 # 首頁
├── pages/                     # 頁面文件夾
│   ├── upload.html           # 上傳頁面
│   ├── collection.html       # 收藏頁面
│   ├── leaderboard.html      # 排行榜頁面
│   ├── login.html            # 登入頁面
│   ├── register.html         # 註冊頁面
│   └── admin/                # 管理員頁面
│       ├── login.html        # 管理員登入
│       ├── dashboard.html    # 數據總覽
│       └── review.html       # 審核提交
├── styles/                    # 樣式文件夾
│   ├── main.css              # 主樣式表
│   └── admin.css             # 管理員樣式
├── scripts/                   # 腳本文件夾
│   ├── main.js               # 主頁腳本
│   ├── upload.js             # 上傳頁面腳本
│   ├── collection.js         # 收藏頁面腳本
│   ├── leaderboard.js        # 排行榜腳本
│   ├── auth.js               # 登入腳本
│   └── register.js           # 註冊腳本
└── README.md                  # 說明文檔
```

## 🎨 技術特點

### 前端技術
- **HTML5** - 語義化標籤
- **CSS3** - 響應式設計、動畫效果
- **JavaScript (ES6+)** - 原生JS實現所有功能
- **LocalStorage** - 本地數據存儲

### 設計特色
- 🎨 香港懷舊風格配色
- 📱 完全響應式設計
- ✨ 流暢的動畫效果
- 🎯 直觀的用戶界面

## 💾 數據結構

### LocalStorage 鍵名

```javascript
// 用戶相關
'currentUser'      // 當前登入用戶
'users'           // 所有用戶列表
'loginHistory'    // 登入歷史

// 內容相關
'submissions'     // 所有提交記錄
'userFragments'   // 用戶碎片
'userCards'       // 用戶記憶卡
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
    date: '2025-11-10T...'
}
```

## 🔧 未來擴展建議

### 後端開發

目前是純前端原型，要實現完整功能需要：

1. **後端框架**
   - Node.js + Express
   - Python + Flask/Django
   - PHP + Laravel

2. **數據庫**
   - MySQL / PostgreSQL（關係型）
   - MongoDB（文檔型）

3. **圖片存儲**
   - AWS S3 / 阿里雲 OSS
   - 本地文件系統

4. **認證系統**
   - JWT Token
   - OAuth 2.0（社交登入）
   - 密碼加密（bcrypt）

## 📱 瀏覽器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 授權

本項目僅供學習和演示使用。

---

**記錄消失中的香港記憶 | Preserving Hong Kong's Fading Memories**