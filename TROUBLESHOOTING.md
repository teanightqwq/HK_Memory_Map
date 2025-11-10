# 🔧 故障排除指南

## 问题：循环登录提示

### 症状
- 点击"查看收藏"后提示"请先登录"
- 跳转后仍在收藏页面
- 不断弹出"请先登录"的提示框
- 无法正常访问收藏页面

### 根本原因
`getCurrentUser()` 函数只检查 `localStorage`，但登录时可能将数据保存在 `sessionStorage` 中（取决于是否勾选"记住我"）。

### 已修复
✅ 更新了所有页面的 `getCurrentUser()` 函数，现在会同时检查两个存储位置：

```javascript
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}
```

修复的文件：
- `scripts/main.js`
- `scripts/upload.js`
- `scripts/collection.js`
- `scripts/leaderboard.js`

## 如何验证修复

### 方法一：使用检查登录状态按钮

1. 打开 `init-data.html`
2. 点击"🔍 检查登入状态"按钮
3. 查看显示的信息：
   - ✅ 如果显示有登录信息 → 登录成功
   - ⚠️ 如果显示没有登录信息 → 需要重新登录

### 方法二：使用浏览器控制台

打开任意页面，按 F12 打开控制台，输入：

```javascript
// 检查 localStorage
console.log('LocalStorage:', localStorage.getItem('currentUser'));

// 检查 sessionStorage  
console.log('SessionStorage:', sessionStorage.getItem('currentUser'));

// 检查当前用户（如果页面有 getCurrentUser 函数）
if (typeof getCurrentUser === 'function') {
    console.log('Current User:', getCurrentUser());
}
```

## 完整测试流程

### 第一步：清除旧数据
```
1. 打开 init-data.html
2. 点击"清除所有数据"
3. 确认清除
```

### 第二步：初始化新数据
```
1. 点击"初始化测试数据"
2. 等待成功提示
3. 点击"检查登入状态"确认数据已创建
```

### 第三步：测试登录（不勾选"记住我"）
```
1. 访问 pages/login.html
2. 使用 demo / 123456 登录
3. 不要勾选"记住我"
4. 点击登录
5. 在 init-data.html 点击"检查登入状态"
   → 应该在 SessionStorage 中看到登录信息
```

### 第四步：测试访问收藏页面
```
1. 点击导航栏的"我的收藏"
2. 应该能正常显示收藏页面
3. 不应该再出现"请先登录"的提示
```

### 第五步：测试登录（勾选"记住我"）
```
1. 登出
2. 重新登录，这次勾选"记住我"
3. 在 init-data.html 点击"检查登入状态"
   → 应该在 LocalStorage 中看到登录信息
4. 访问收藏页面应该正常
```

## 其他可能的问题

### 问题1：初始化后仍然无法登录

**检查步骤：**
1. 打开 init-data.html
2. 点击"检查登入状态"
3. 查看"用户数据库状态"
4. 如果显示"数据库为空" → 重新初始化数据

**解决方法：**
```
清除所有数据 → 刷新页面 → 重新初始化
```

### 问题2：登录成功但立即显示未登录

**可能原因：**
- 浏览器隐私模式阻止了 localStorage/sessionStorage
- 浏览器设置禁用了 Cookie 和本地存储

**解决方法：**
1. 检查浏览器设置，允许本地存储
2. 不要使用隐私/无痕模式
3. 清除浏览器缓存后重试

### 问题3：部分页面正常，部分页面提示未登录

**可能原因：**
- 某些 JS 文件没有更新

**解决方法：**
1. 清除浏览器缓存（Ctrl+Shift+Delete）
2. 硬刷新页面（Ctrl+F5）
3. 重新打开页面

## 调试命令

在浏览器控制台中使用这些命令进行调试：

```javascript
// 1. 查看所有 localStorage 数据
console.log('All localStorage keys:', Object.keys(localStorage));
Object.keys(localStorage).forEach(key => {
    console.log(key + ':', localStorage.getItem(key));
});

// 2. 手动设置登录状态（临时测试用）
const testUser = {
    id: 'user-001',
    username: 'demo',
    email: 'demo@example.com',
    avatar: '👤'
};
localStorage.setItem('currentUser', JSON.stringify(testUser));
console.log('已手动设置登录状态');

// 3. 清除登录状态
localStorage.removeItem('currentUser');
sessionStorage.removeItem('currentUser');
console.log('已清除登录状态');

// 4. 查看提交数据
const submissions = JSON.parse(localStorage.getItem('submissions'));
console.log('待审核提交数:', submissions?.filter(s => s.status === 'pending').length);
console.log('所有提交:', submissions);

// 5. 查看用户数据
const users = JSON.parse(localStorage.getItem('users'));
console.log('用户列表:', users?.map(u => u.username));
```

## 预防措施

为了避免类似问题，建议：

1. **登录后立即检查**
   - 登录成功后，点击用户名或头像
   - 确认能看到用户菜单
   - 确认能访问收藏页面

2. **定期备份数据**（如果有重要数据）
   ```javascript
   // 导出所有数据
   const backup = {
       users: localStorage.getItem('users'),
       submissions: localStorage.getItem('submissions'),
       fragments: localStorage.getItem('userFragments'),
       cards: localStorage.getItem('userCards')
   };
   console.log('备份数据:', JSON.stringify(backup));
   // 复制控制台输出保存到文本文件
   ```

3. **使用推荐的浏览器**
   - Chrome 或 Edge（推荐）
   - Firefox
   - Safari（可能需要特殊设置）

## 技术说明

### 登录状态存储逻辑

**登录时：**
```javascript
if (rememberMe) {
    // 勾选"记住我" → 存储到 localStorage（永久）
    localStorage.setItem('currentUser', JSON.stringify(user));
} else {
    // 未勾选 → 存储到 sessionStorage（关闭浏览器后清除）
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}
```

**读取时：**
```javascript
// 必须同时检查两个位置
const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
```

### 为什么需要检查两个位置？

- **localStorage**：数据永久保存，除非手动清除
- **sessionStorage**：数据在浏览器会话结束后自动清除
- 用户可能选择"记住我"（localStorage）或不选择（sessionStorage）
- 必须两个都检查才能涵盖所有情况

## 联系支持

如果以上方法都无法解决问题：

1. 截图错误信息
2. 打开控制台（F12）复制错误日志
3. 说明操作步骤
4. 提供浏览器和操作系统信息

---

**最后更新：** 2025-11-10  
**状态：** ✅ 问题已修复
