// 初始化测试数据脚本
// 在浏览器控制台运行此脚本可以快速创建测试数据

function initializeTestData() {
    console.log('🎬 开始初始化测试数据...');
    
    // 1. 初始化用户数据
    initializeUsers();
    
    // 2. 初始化测试提交
    initializeSubmissions();
    
    // 3. 初始化一些碎片和卡片
    initializeFragmentsAndCards();
    
    console.log('✅ 测试数据初始化完成！');
    console.log('📝 现在可以：');
    console.log('  1. 用 demo/123456 登录查看用户界面');
    console.log('  2. 用 admin/admin123456 登录管理后台审核图片');
}

// 初始化用户
function initializeUsers() {
    const users = [
        {
            id: 'user-001',
            username: 'demo',
            password: '123456',
            email: 'demo@example.com',
            avatar: '👤',
            createdAt: new Date('2025-11-01').toISOString(),
            stats: {
                fragments: 5,
                cards: 1,
                submissions: 8
            }
        },
        {
            id: 'user-002',
            username: 'test',
            password: 'test123',
            email: 'test@example.com',
            avatar: '👨',
            createdAt: new Date('2025-11-05').toISOString(),
            stats: {
                fragments: 3,
                cards: 0,
                submissions: 4
            }
        },
        {
            id: 'user-003',
            username: 'hkfan',
            password: 'hk123456',
            email: 'hkfan@example.com',
            avatar: '👩',
            createdAt: new Date('2025-11-08').toISOString(),
            stats: {
                fragments: 8,
                cards: 2,
                submissions: 10
            }
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(users));
    console.log('✓ 用户数据初始化完成，共 ' + users.length + ' 个用户');
}

// 初始化提交数据
function initializeSubmissions() {
    const submissions = [
        // 待审核 - 餐饮
        {
            id: 'sub-' + Date.now() + '-1',
            userId: 'user-001',
            username: 'demo',
            title: '蘭芳園茶餐廳',
            photo: createPlaceholderImage('蘭芳園茶餐廳', '#e74c3c'),
            location: '中環結志街2號',
            address: '中環結志街2號',
            category: 'food',
            subcategory: 'restaurant',
            description: '這是一家有著70年歷史的老字號茶餐廳，以絲襪奶茶聞名全港。店內保留了舊式茶餐廳的裝潢，木製桌椅、馬賽克地磚都是原汁原味的香港味道。',
            tags: '老字號,絲襪奶茶,茶餐廳',
            status: 'pending',
            submitTime: new Date('2025-11-10T10:30:00').toISOString(),
            submittedDate: new Date('2025-11-10T10:30:00').toISOString()
        },
        {
            id: 'sub-' + Date.now() + '-2',
            userId: 'user-002',
            username: 'test',
            title: '添好運點心專門店',
            photo: createPlaceholderImage('添好運點心', '#f39c12'),
            location: '深水埗福榮街',
            address: '深水埗福榮街9-11號',
            category: 'food',
            subcategory: 'restaurant',
            description: '米其林一星的平民點心店，以實惠價格提供高質量的港式點心。招牌酥皮焗叉燒包深受歡迎，每天都大排長龍。',
            tags: '米其林,點心,叉燒包',
            status: 'pending',
            submitTime: new Date('2025-11-10T11:15:00').toISOString(),
            submittedDate: new Date('2025-11-10T11:15:00').toISOString()
        },
        // 待审核 - 文化
        {
            id: 'sub-' + Date.now() + '-3',
            userId: 'user-003',
            username: 'hkfan',
            title: '油麻地戲院',
            photo: createPlaceholderImage('油麻地戲院', '#9b59b6'),
            location: '油麻地窩打老道6號',
            address: '九龍油麻地窩打老道6號',
            category: 'culture',
            subcategory: 'opera',
            description: '建於1930年的油麻地戲院是香港現存最古老的戲院之一。2012年活化後成為粵劇演出場地，讓這項傳統藝術得以傳承。',
            tags: '粵劇,歷史建築,活化',
            status: 'pending',
            submitTime: new Date('2025-11-10T09:45:00').toISOString(),
            submittedDate: new Date('2025-11-10T09:45:00').toISOString()
        },
        {
            id: 'sub-' + Date.now() + '-4',
            userId: 'user-001',
            username: 'demo',
            title: '黃大仙祠',
            photo: createPlaceholderImage('黃大仙祠', '#8e44ad'),
            location: '黃大仙竹園村2號',
            address: '九龍黃大仙竹園村2號',
            category: 'culture',
            subcategory: 'temple',
            description: '香港最著名的廟宇之一，建於1921年。以「有求必應」聞名，每年農曆新年都吸引大量善信前來上香祈福。',
            tags: '廟宇,黃大仙,祈福',
            status: 'pending',
            submitTime: new Date('2025-11-10T14:20:00').toISOString(),
            submittedDate: new Date('2025-11-10T14:20:00').toISOString()
        },
        // 待审核 - 建筑
        {
            id: 'sub-' + Date.now() + '-5',
            userId: 'user-002',
            username: 'test',
            title: '藍屋建築群',
            photo: createPlaceholderImage('藍屋', '#3498db'),
            location: '灣仔石水渠街72號',
            address: '香港島灣仔石水渠街72號',
            category: 'architecture',
            subcategory: 'tenement',
            description: '建於1920年代的唐樓建築群，因外牆被漆成藍色而得名。2017年獲得聯合國教科文組織亞太區文化遺產保護獎。',
            tags: '唐樓,藍屋,文化遺產',
            status: 'pending',
            submitTime: new Date('2025-11-10T13:00:00').toISOString(),
            submittedDate: new Date('2025-11-10T13:00:00').toISOString()
        },
        // 已批准的提交
        {
            id: 'sub-' + Date.now() + '-6',
            userId: 'user-003',
            username: 'hkfan',
            title: '中環街市',
            photo: createPlaceholderImage('中環街市', '#27ae60'),
            location: '中環皇后大道中93號',
            address: '香港島中環皇后大道中93號',
            category: 'architecture',
            subcategory: 'colonial',
            description: '建於1939年的包浩斯風格建築，經活化後成為集購物、餐飲、文化於一體的社區空間。',
            tags: '包浩斯,活化,街市',
            status: 'approved',
            submitTime: new Date('2025-11-09T10:00:00').toISOString(),
            submittedDate: new Date('2025-11-09T10:00:00').toISOString(),
            reviewTime: new Date('2025-11-09T15:30:00').toISOString(),
            reviewer: 'admin'
        },
        {
            id: 'sub-' + Date.now() + '-7',
            userId: 'user-001',
            username: 'demo',
            title: '九記牛腩',
            photo: createPlaceholderImage('九記牛腩', '#c0392b'),
            location: '中環歌賦街21號',
            address: '香港島中環歌賦街21號',
            category: 'food',
            subcategory: 'restaurant',
            description: '1920年創立的老字號牛腩店，以清湯牛腩和咖喱牛筋聞名。湯底清甜，牛腩軟嫩，是香港美食的代表。',
            tags: '老字號,牛腩,中環',
            status: 'approved',
            submitTime: new Date('2025-11-08T12:00:00').toISOString(),
            submittedDate: new Date('2025-11-08T12:00:00').toISOString(),
            reviewTime: new Date('2025-11-08T16:00:00').toISOString(),
            reviewer: 'admin'
        },
        // 已拒绝的提交
        {
            id: 'sub-' + Date.now() + '-8',
            userId: 'user-002',
            username: 'test',
            title: '測試照片',
            photo: createPlaceholderImage('測試', '#95a5a6'),
            location: '測試地點',
            address: '測試地址',
            category: 'food',
            subcategory: 'other',
            description: '這是一張測試照片',
            tags: '測試',
            status: 'rejected',
            submitTime: new Date('2025-11-07T10:00:00').toISOString(),
            submittedDate: new Date('2025-11-07T10:00:00').toISOString(),
            reviewTime: new Date('2025-11-07T14:00:00').toISOString(),
            reviewer: 'reviewer',
            rejectReason: '照片質量不符合要求，請重新拍攝'
        }
    ];
    
    localStorage.setItem('submissions', JSON.stringify(submissions));
    console.log('✓ 提交数据初始化完成，共 ' + submissions.length + ' 个提交');
    console.log('  - 待审核: 5 个');
    console.log('  - 已批准: 2 个');
    console.log('  - 已拒绝: 1 个');
}

// 初始化碎片和卡片
function initializeFragmentsAndCards() {
    // 用户碎片
    const userFragments = {
        'user-001': [
            {
                id: 'frag-001',
                category: 'food',
                subcategory: 'restaurant',
                image: createPlaceholderImage('九記牛腩', '#c0392b'),
                title: '九記牛腩',
                description: '老字號牛腩店',
                location: '中環歌賦街',
                obtainedTime: new Date('2025-11-08T16:00:00').toISOString(),
                fromSubmission: 'sub-approved-1'
            },
            {
                id: 'frag-002',
                category: 'food',
                subcategory: 'snack',
                image: createPlaceholderImage('雞蛋仔', '#f39c12'),
                title: '利強記雞蛋仔',
                description: '傳統街頭小食',
                location: '北角',
                obtainedTime: new Date('2025-11-07T12:00:00').toISOString(),
                fromSubmission: 'sub-approved-2'
            },
            {
                id: 'frag-003',
                category: 'food',
                subcategory: 'bakery',
                image: createPlaceholderImage('菠蘿包', '#e67e22'),
                title: '金華冰廳',
                description: '傳統菠蘿包',
                location: '太子',
                obtainedTime: new Date('2025-11-06T10:00:00').toISOString(),
                fromSubmission: 'sub-approved-3'
            },
            {
                id: 'frag-004',
                category: 'architecture',
                subcategory: 'colonial',
                image: createPlaceholderImage('中環街市', '#27ae60'),
                title: '中環街市',
                description: '包浩斯建築',
                location: '中環',
                obtainedTime: new Date('2025-11-09T15:30:00').toISOString(),
                fromSubmission: 'sub-approved-4'
            }
        ],
        'user-003': [
            {
                id: 'frag-101',
                category: 'culture',
                subcategory: 'temple',
                image: createPlaceholderImage('文武廟', '#8e44ad'),
                title: '文武廟',
                description: '上環古廟',
                location: '上環',
                obtainedTime: new Date('2025-11-05T14:00:00').toISOString(),
                fromSubmission: 'sub-approved-5'
            }
        ]
    };
    
    // 用户卡片
    const userCards = {
        'user-001': [
            {
                id: 'card-001',
                category: 'food',
                title: '餐飲記憶卡',
                description: '收集了香港傳統餐飲的記憶',
                fragments: ['frag-001', 'frag-002', 'frag-003'],
                synthesizedTime: new Date('2025-11-08T18:00:00').toISOString(),
                rarity: 'common'
            }
        ]
    };
    
    localStorage.setItem('userFragments', JSON.stringify(userFragments));
    localStorage.setItem('userCards', JSON.stringify(userCards));
    
    console.log('✓ 碎片和卡片数据初始化完成');
    console.log('  - demo 用户: 4 个碎片, 1 张卡片');
    console.log('  - hkfan 用户: 1 个碎片');
}

// 创建占位图片 (SVG as Data URL)
function createPlaceholderImage(text, color) {
    const svg = `
        <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="300" fill="${color}"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Arial, sans-serif" font-size="24" fill="white" font-weight="bold">
                ${text}
            </text>
        </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

// 清除所有数据
function clearAllData() {
    const keys = ['users', 'submissions', 'userFragments', 'userCards', 'admins', 'adminSession', 'reviewLogs', 'adminLoginHistory'];
    keys.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    console.log('🗑️ 所有数据已清除');
}

// 导出函数
window.initializeTestData = initializeTestData;
window.clearAllData = clearAllData;

// 使用说明
console.log('📚 测试数据初始化脚本已加载');
console.log('运行以下命令：');
console.log('  initializeTestData() - 初始化测试数据');
console.log('  clearAllData()       - 清除所有数据');
