# 🚀 快速开始指南

## 问题解决：管理员无法审核图片

你遇到的问题是因为系统中没有测试数据。我已经为你创建了完整的解决方案！

## ✨ 解决方案

### 方法一：使用初始化页面（推荐）

1. **打开初始化页面**
   ```
   在浏览器中打开：init-data.html
   ```

2. **点击"初始化测试数据"按钮**
   - 系统会自动创建 3 个用户
   - 创建 8 个图片提交（包括 5 个待审核）
   - 创建一些碎片和卡片

3. **登录管理后台测试**
   - 访问：`pages/admin/login.html`
   - 使用：`admin` / `admin123456`
   - 进入"审核提交"页面
   - 现在应该能看到 5 个待审核的提交了！

### 方法二：使用浏览器控制台

1. **打开任意页面**（比如 index.html）

2. **按 F12 打开开发者工具**

3. **切换到 Console（控制台）标签**

4. **在页面中加载初始化脚本**
   ```javascript
   // 创建 script 标签加载初始化脚本
   var script = document.createElement('script');
   script.src = 'scripts/init-test-data.js';
   document.head.appendChild(script);
   
   // 等待 1 秒后执行初始化
   setTimeout(() => {
       initializeTestData();
   }, 1000);
   ```

5. **查看控制台输出**
   - 应该会显示"测试数据初始化完成"

## 📋 测试账号

### 普通用户账号
- **demo** / 123456（有一些碎片和卡片）
- **test** / test123
- **hkfan** / hk123456（有较多数据）

### 管理员账号
- **admin** / admin123456（超级管理员）
- **reviewer** / review123456（审核员）

## 🎯 完整测试流程

### 第一步：初始化数据
```
打开 init-data.html → 点击"初始化测试数据"
```

### 第二步：管理员审核
1. 访问 `pages/admin/login.html`
2. 使用 `admin` / `admin123456` 登录
3. 点击左侧"审核提交"菜单
4. 应该能看到 5 个待审核的提交：
   - 蘭芳園茶餐廳（餐饮）
   - 添好運點心專門店（餐饮）
   - 油麻地戲院（文化）
   - 黃大仙祠（文化）
   - 藍屋建築群（建筑）

### 第三步：批准提交
1. 点击任意一个提交的"✓ 批准"按钮
2. 确认操作
3. 系统会自动：
   - 更新提交状态为"已批准"
   - 生成记忆碎片给用户
   - 记录审核日志
   - 更新统计数据

### 第四步：查看用户收藏
1. 退出管理员账号
2. 使用 `demo` / `123456` 登录
3. 进入"我的收藏"页面
4. 查看"记忆碎片"标签
5. 应该能看到批准后获得的碎片！

## 🔍 数据结构说明

### 提交数据必需字段
```javascript
{
    id: 'sub-xxx',           // 提交ID
    userId: 'user-001',      // 用户ID
    username: 'demo',        // 用户名
    title: '蘭芳園茶餐廳',    // 标题（重要！）
    photo: 'data:image/...',  // Base64图片
    location: '中環',         // 地点
    address: '中環結志街2號',  // 地址
    category: 'food',        // 分类
    subcategory: 'restaurant', // 子分类
    description: '...',      // 描述
    tags: '老字號,奶茶',      // 标签
    status: 'pending',       // 状态
    submitTime: '2025-11-10T...', // 提交时间
}
```

### 之前的问题
- ❌ 没有 `title` 字段 → 显示 undefined
- ❌ 使用 `date` 而不是 `submitTime` → 显示 NaN
- ❌ 没有测试数据 → 无法审核

### 现在已修复
- ✅ 上传表单添加了标题输入框
- ✅ 统一使用 `submitTime` 字段
- ✅ 提供测试数据初始化脚本
- ✅ ID 格式统一为 `sub-xxx`

## 📊 查看数据

### 在浏览器控制台查看数据
```javascript
// 查看所有提交
console.log(JSON.parse(localStorage.getItem('submissions')));

// 查看待审核的提交
const subs = JSON.parse(localStorage.getItem('submissions'));
console.log(subs.filter(s => s.status === 'pending'));

// 查看用户碎片
console.log(JSON.parse(localStorage.getItem('userFragments')));

// 查看审核日志
console.log(JSON.parse(localStorage.getItem('reviewLogs')));
```

## 🛠️ 故障排除

### 如果还是看不到数据
1. **清除浏览器缓存**
   - 按 Ctrl+Shift+Delete
   - 清除缓存和 Cookies
   - 刷新页面

2. **确认数据已初始化**
   ```javascript
   // 在控制台检查
   console.log(localStorage.getItem('submissions'));
   // 应该显示 JSON 数据，而不是 null
   ```

3. **重新初始化**
   - 打开 init-data.html
   - 先点击"清除所有数据"
   - 再点击"初始化测试数据"

### 如果批准后用户没有获得碎片
检查以下几点：
1. 用户ID是否匹配
2. 提交的 userId 字段是否正确
3. 查看控制台是否有错误信息

## 📝 下一步

现在你可以：
1. ✅ 正常审核图片
2. ✅ 用户上传新照片（记得填写标题）
3. ✅ 批准后用户获得碎片
4. ✅ 收集 3 个碎片合成卡片
5. ✅ 查看排行榜和成就

## 🎊 完成！

数据库问题已经解决！现在整个系统都可以正常使用了。如果还有任何问题，随时告诉我！
