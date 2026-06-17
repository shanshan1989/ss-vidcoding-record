/**
 * 随手记账 - 主应用逻辑
 * 基于财务记账产品需求文档 V1.0.1 实现
 * 新增：用户注册登录功能
 */

// ==================== 用户认证模块 ====================

function getUsers() {
    return JSON.parse(localStorage.getItem('ssj_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('ssj_users', JSON.stringify(users));
}

function getCurrentUser() {
    const userId = localStorage.getItem('ssj_current_user');
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
}

function hashPassword(password) {
    // 简单的密码哈希（实际生产环境建议使用更安全的方式）
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

function register(username, password) {
    const users = getUsers();

    // 检查用户名是否已存在
    if (users.some(u => u.username === username)) {
        return { success: false, message: '用户名已存在' };
    }

    // 验证输入
    if (!username || username.length < 2) {
        return { success: false, message: '用户名至少需要2个字符' };
    }
    if (!password || password.length < 6) {
        return { success: false, message: '密码至少需要6个字符' };
    }

    const newUser = {
        id: generateId(),
        username: username,
        passwordHash: hashPassword(password),
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: '注册成功', user: newUser };
}

function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return { success: false, message: '用户名不存在' };
    }

    if (user.passwordHash !== hashPassword(password)) {
        return { success: false, message: '密码错误' };
    }

    localStorage.setItem('ssj_current_user', user.id);
    return { success: true, message: '登录成功', user: user };
}

function logout() {
    localStorage.removeItem('ssj_current_user');
    state.currentUser = null;
    switchPage('home');
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

// ==================== 用户数据管理 ====================

function getUserDataKey() {
    const user = getCurrentUser();
    return user ? `ssj_data_${user.id}` : 'ssj_data';
}

function loadUserData() {
    const user = getCurrentUser();
    if (!user) {
        // 未登录时显示登录界面
        showAuthScreen();
        return;
    }

    // 显示用户名
    $('#user-name').textContent = user.username;

    try {
        const dataKey = getUserDataKey();
        const data = JSON.parse(localStorage.getItem(dataKey) || '{}');
        state.categories = data.categories || [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
        state.accounts = data.accounts || DEFAULT_ACCOUNTS.map(a => ({...a}));
        state.transactions = data.transactions || [];
        state.budgets = data.budgets || {};
        state.settings = data.settings || {...DEFAULT_SETTINGS};

        // 如果是新用户（没有任何数据），初始化默认数据
        if (state.transactions.length === 0) {
            state.categories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
            state.accounts = DEFAULT_ACCOUNTS.map(a => ({...a}));
            saveData();
        }
    } catch (e) {
        console.error('加载用户数据失败', e);
        state.categories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
        state.accounts = DEFAULT_ACCOUNTS.map(a => ({...a}));
        state.transactions = [];
        state.budgets = {};
        state.settings = {...DEFAULT_SETTINGS};
    }

    applyTheme();
    showMainScreen();
}

function saveUserData() {
    const dataKey = getUserDataKey();
    localStorage.setItem(dataKey, JSON.stringify({
        categories: state.categories,
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
        settings: state.settings
    }));
}

// 兼容旧版本的 saveData
function saveData() {
    saveUserData();
}

// ==================== 默认数据 ====================

const DEFAULT_EXPENSE_CATEGORIES = [
    { id: 'food', name: '餐饮', icon: '🍜', color: '#FF7043', type: 'expense', parentId: '', isDefault: true, sortOrder: 1 },
    { id: 'food-breakfast', name: '早餐', icon: '🍞', color: '#FF7043', type: 'expense', parentId: 'food', isDefault: true, sortOrder: 1 },
    { id: 'food-lunch', name: '午餐', icon: '🍱', color: '#FF7043', type: 'expense', parentId: 'food', isDefault: true, sortOrder: 2 },
    { id: 'food-dinner', name: '晚餐', icon: '🍲', color: '#FF7043', type: 'expense', parentId: 'food', isDefault: true, sortOrder: 3 },
    { id: 'food-snack', name: '零食', icon: '🍪', color: '#FF7043', type: 'expense', parentId: 'food', isDefault: true, sortOrder: 4 },
    { id: 'transport', name: '交通', icon: '🚌', color: '#42A5F5', type: 'expense', parentId: '', isDefault: true, sortOrder: 2 },
    { id: 'transport-subway', name: '地铁', icon: '🚇', color: '#42A5F5', type: 'expense', parentId: 'transport', isDefault: true, sortOrder: 1 },
    { id: 'transport-taxi', name: '打车', icon: '🚕', color: '#42A5F5', type: 'expense', parentId: 'transport', isDefault: true, sortOrder: 2 },
    { id: 'shopping', name: '购物', icon: '🛍️', color: '#EC407A', type: 'expense', parentId: '', isDefault: true, sortOrder: 3 },
    { id: 'shopping-clothes', name: '服饰', icon: '👕', color: '#EC407A', type: 'expense', parentId: 'shopping', isDefault: true, sortOrder: 1 },
    { id: 'shopping-daily', name: '日用', icon: '🧴', color: '#EC407A', type: 'expense', parentId: 'shopping', isDefault: true, sortOrder: 2 },
    { id: 'living', name: '居住', icon: '🏠', color: '#8D6E63', type: 'expense', parentId: '', isDefault: true, sortOrder: 4 },
    { id: 'living-rent', name: '房租', icon: '🏠', color: '#8D6E63', type: 'expense', parentId: 'living', isDefault: true, sortOrder: 1 },
    { id: 'entertainment', name: '娱乐', icon: '🎬', color: '#AB47BC', type: 'expense', parentId: '', isDefault: true, sortOrder: 5 },
    { id: 'entertainment-movie', name: '电影', icon: '🎬', color: '#AB47BC', type: 'expense', parentId: 'entertainment', isDefault: true, sortOrder: 1 },
    { id: 'entertainment-game', name: '游戏', icon: '🎮', color: '#AB47BC', type: 'expense', parentId: 'entertainment', isDefault: true, sortOrder: 2 },
    { id: 'medical', name: '医疗', icon: '💊', color: '#EF5350', type: 'expense', parentId: '', isDefault: true, sortOrder: 6 },
    { id: 'study', name: '学习', icon: '📚', color: '#5C6BC0', type: 'expense', parentId: '', isDefault: true, sortOrder: 7 },
    { id: 'other', name: '其他', icon: '📦', color: '#78909C', type: 'expense', parentId: '', isDefault: true, sortOrder: 8 }
];

const DEFAULT_INCOME_CATEGORIES = [
    { id: 'salary', name: '工资', icon: '💰', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 1 },
    { id: 'bonus', name: '奖金', icon: '🎉', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 2 },
    { id: 'parttime', name: '兼职', icon: '💼', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 3 },
    { id: 'investment', name: '理财收益', icon: '📈', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 4 },
    { id: 'redpacket', name: '红包', icon: '🧧', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 5 },
    { id: 'refund', name: '退款', icon: '💸', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 6 },
    { id: 'income-other', name: '其他', icon: '📦', color: '#66BB6A', type: 'income', parentId: '', isDefault: true, sortOrder: 7 }
];

const DEFAULT_ACCOUNTS = [
    { id: 'cash', name: '现金', type: 'cash', icon: '💵', balance: 1000, isDefault: true },
    { id: 'wechat', name: '微信钱包', type: 'ewallet', icon: '💚', balance: 2500, isDefault: true },
    { id: 'alipay', name: '支付宝', type: 'ewallet', icon: '🔵', balance: 1800, isDefault: true },
    { id: 'bank', name: '银行卡', type: 'bank', icon: '💳', balance: 5000, isDefault: true },
    { id: 'creditcard', name: '信用卡', type: 'credit', icon: '💳', balance: -500, isDefault: true }
];

const DEFAULT_SETTINGS = {
    theme: 'light',
    reminderEnabled: true,
    reminderTime: '21:00',
    reminderWeekend: true,
    currency: 'CNY'
};

const ICONS = ['🍜', '🍞', '🍱', '🍲', '🍪', '🚌', '🚇', '🚕', '🛍️', '👕', '🧴', '🏠', '🎬', '🎮', '💊', '📚', '📦', '💰', '🎉', '💼', '📈', '🧧', '💸', '💵', '💚', '🔵', '💳', '🍎', '☕', '🍺', '📱', '💻', '🚗', '✈️', '🏥', '🎁', '💇', '🏋️', '🐱', '🌻'];

const COLORS = ['#FF7043', '#42A5F5', '#EC407A', '#8D6E63', '#AB47BC', '#EF5350', '#5C6BC0', '#78909C', '#66BB6A', '#FFA726', '#26C6DA', '#7E57C2'];

// ==================== 状态管理 ====================

let state = {
    currentPage: 'home',
    currentDate: dayjs(),
    selectedDate: dayjs(),
    transactionType: 'expense',
    selectedCategoryId: null,
    selectedAccountId: 'cash',
    amountInput: '0',
    note: '',
    searchKeyword: '',
    statsTab: 'overview',
    categories: [],
    accounts: [],
    transactions: [],
    budgets: {},
    settings: {},
    currentUser: null
};

// ==================== DOM 元素缓存 ====================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ==================== 认证界面 ====================

function showAuthScreen() {
    $('#auth-screen').classList.remove('hidden');
    $$('.page').forEach(p => p.classList.remove('active'));
    $('.bottom-nav').style.display = 'none';
}

function showMainScreen() {
    $('#auth-screen').classList.add('hidden');
    $('.bottom-nav').style.display = '';
    switchPage('home');
}

function initAuth() {
    const authTabs = $$('.auth-tab');
    const loginForm = $('#auth-form-login');
    const registerForm = $('#auth-form-register');
    const authHint = $('#auth-hint');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tab.dataset.auth === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                authHint.textContent = '登录后即可开始记账';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                authHint.textContent = '注册后即可创建您的专属账本';
            }
        });
    });

    // 登录表单
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = $('#login-username').value.trim();
        const password = $('#login-password').value;

        const result = login(username, password);
        if (result.success) {
            showToast('登录成功');
            loadUserData();
        } else {
            showToast(result.message);
        }
    });

    // 注册表单
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = $('#register-username').value.trim();
        const password = $('#register-password').value;
        const passwordConfirm = $('#register-password-confirm').value;

        if (password !== passwordConfirm) {
            showToast('两次密码输入不一致');
            return;
        }

        const result = register(username, password);
        if (result.success) {
            showToast('注册成功，请登录');
            // 切换到登录表单并清空注册表单
            authTabs.forEach(t => t.classList.remove('active'));
            $('[data-auth="login"]').classList.add('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            authHint.textContent = '登录后即可开始记账';
            $('#register-username').value = '';
            $('#register-password').value = '';
            $('#register-password-confirm').value = '';
        } else {
            showToast(result.message);
        }
    });

    // 退出登录
    $('#btn-logout').addEventListener('click', () => {
        if (confirm('确定要退出登录吗？')) {
            logout();
            showAuthScreen();
        }
    });
}

// ==================== 页面切换 ====================

function initNavigation() {
    $$('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            switchPage(page);
        });
    });
}

function switchPage(page) {
    state.currentPage = page;
    $$('.page').forEach(p => p.classList.remove('active'));
    $$(`#page-${page}`).forEach(p => p.classList.add('active'));
    $$('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    if (page === 'home') renderHome();
    if (page === 'details') renderDetails();
    if (page === 'stats') renderStats();
    if (page === 'profile') renderProfile();
}

// ==================== 首页 ====================

function initHome() {
    $('#home-month-selector').addEventListener('click', () => showMonthPicker('home'));

    $$('.type-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            state.transactionType = tab.dataset.type;
            state.selectedCategoryId = null;
            $$('.type-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateAmountColor();
            renderCategoryList();
        });
    });

    $$('.key').forEach(key => {
        key.addEventListener('click', () => handleKeypad(key.dataset.key));
    });

    $('#btn-note').addEventListener('click', () => showNoteInput());
    $('#btn-time').addEventListener('click', () => showDatePicker());
    $('#btn-account').addEventListener('click', () => showAccountPicker());
}

function renderHome() {
    const yearMonth = state.selectedDate.format('YYYY-MM');
    $('#home-month-selector .month-text').textContent = state.selectedDate.format('YYYY年M月');

    const monthStats = getMonthStats(yearMonth);
    $('#month-income').textContent = formatMoney(monthStats.income);
    $('#month-expense').textContent = formatMoney(monthStats.expense);
    $('#month-balance').textContent = formatMoney(monthStats.income - monthStats.expense);

    const todayStr = dayjs().format('YYYY-MM-DD');
    const todayExpense = state.transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(todayStr))
        .reduce((sum, t) => sum + t.amount, 0);
    $('#today-expense').textContent = formatMoney(todayExpense);

    renderBudgetCard(yearMonth, monthStats.expense);
    renderCategoryList();

    const lastAccount = localStorage.getItem('ssj_last_account');
    if (lastAccount && state.accounts.find(a => a.id === lastAccount)) {
        state.selectedAccountId = lastAccount;
    }
    updateAccountText();
    updateAmountColor();
}

function renderBudgetCard(yearMonth, spent) {
    const totalBudget = state.budgets[yearMonth]?.total || 0;
    const budgetCard = $('#budget-card');

    if (totalBudget > 0) {
        budgetCard.style.display = 'block';
        const ratio = Math.min((spent / totalBudget) * 100, 100);
        $('#budget-ratio').textContent = ratio.toFixed(0) + '%';
        $('#budget-spent').textContent = `已用 ${formatMoney(spent)}`;
        $('#budget-total').textContent = `预算 ${formatMoney(totalBudget)}`;

        const fill = $('#budget-progress');
        fill.style.width = ratio + '%';
        fill.className = 'progress-fill';
        if (spent >= totalBudget) fill.classList.add('danger');
        else if (spent >= totalBudget * 0.8) fill.classList.add('warning');

        const alert = $('#budget-alert');
        alert.className = 'budget-alert';
        if (spent >= totalBudget) {
            alert.classList.add('danger');
            alert.textContent = '⚠️ 本月预算已超支，注意控制消费哦';
        } else if (spent >= totalBudget * 0.8) {
            alert.classList.add('warning');
            alert.textContent = '⚡ 本月预算已使用 80%，请留意支出';
        }
    } else {
        budgetCard.style.display = 'none';
    }
}

function renderCategoryList() {
    const list = $('#category-list');
    const categories = state.categories
        .filter(c => c.type === state.transactionType && !c.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    list.innerHTML = categories.map(cat => {
        const isActive = state.selectedCategoryId === cat.id;
        return `
            <div class="category-item ${isActive ? 'active' : ''}" data-id="${cat.id}">
                <div class="category-icon" style="background: ${isActive ? cat.color + '30' : '#fff'}; color: ${cat.color}">${cat.icon}</div>
                <div class="category-name">${cat.name}</div>
            </div>
        `;
    }).join('');

    $$('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            state.selectedCategoryId = item.dataset.id;
            renderCategoryList();
            updateSelectedCategoryText();
        });
    });

    if (!state.selectedCategoryId && categories.length > 0) {
        state.selectedCategoryId = categories[0].id;
        updateSelectedCategoryText();
    }
}

function updateSelectedCategoryText() {
    const cat = state.categories.find(c => c.id === state.selectedCategoryId);
    $('#selected-category').textContent = cat ? `${cat.name} ${cat.icon}` : '请选择分类';
}

function updateAmountColor() {
    const input = $('#amount-input');
    input.className = 'amount-input ' + state.transactionType;
}

function updateAccountText() {
    const account = state.accounts.find(a => a.id === state.selectedAccountId);
    $('#account-text').textContent = account ? account.name : '选择账户';
}

function handleKeypad(key) {
    let current = state.amountInput;

    switch (key) {
        case '1': case '2': case '3': case '4': case '5':
        case '6': case '7': case '8': case '9': case '0':
            if (current === '0') current = key;
            else if (current.length < 10) current += key;
            break;
        case '.':
            if (!current.includes('.')) current += '.';
            break;
        case 'backspace':
            current = current.length > 1 ? current.slice(0, -1) : '0';
            break;
        case 'clear':
            current = '0';
            break;
        case 'date':
            showDatePicker();
            return;
        case 'confirm':
            confirmTransaction();
            return;
    }

    state.amountInput = current;
    $('#amount-input').textContent = current;
}

function confirmTransaction() {
    const amount = parseFloat(state.amountInput);
    if (amount <= 0) {
        showToast('请输入金额');
        return;
    }
    if (!state.selectedCategoryId) {
        showToast('请选择分类');
        return;
    }

    const account = state.accounts.find(a => a.id === state.selectedAccountId);
    if (!account) {
        showToast('请选择账户');
        return;
    }

    const category = state.categories.find(c => c.id === state.selectedCategoryId);
    const date = state.selectedDate.format('YYYY-MM-DD HH:mm:ss');

    const transaction = {
        id: generateId(),
        type: state.transactionType,
        amount: amount,
        categoryId: state.selectedCategoryId,
        accountId: state.selectedAccountId,
        date: date,
        note: state.note,
        createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };

    state.transactions.unshift(transaction);

    if (state.transactionType === 'expense') {
        account.balance -= amount;
    } else {
        account.balance += amount;
    }

    localStorage.setItem('ssj_last_account', state.selectedAccountId);
    saveUserData();

    state.amountInput = '0';
    $('#amount-input').textContent = '0';
    state.note = '';
    $('#note-text').textContent = '添加备注';

    showToast(`${category.icon} 记账成功 ${formatMoney(amount)}`);
    renderHome();
}

// ==================== 明细页 ====================

function initDetails() {
    $('#details-month-selector').addEventListener('click', () => showMonthPicker('details'));
    $('#btn-search').addEventListener('click', () => {
        $('#search-bar').style.display = 'flex';
        $('#search-input').focus();
    });
    $('#btn-close-search').addEventListener('click', () => {
        $('#search-bar').style.display = 'none';
        state.searchKeyword = '';
        $('#search-input').value = '';
        renderDetails();
    });
    $('#search-input').addEventListener('input', (e) => {
        state.searchKeyword = e.target.value.trim().toLowerCase();
        renderTransactionList();
    });
}

function renderDetails() {
    $('#details-month-selector .month-text').textContent = state.selectedDate.format('YYYY年M月');

    const yearMonth = state.selectedDate.format('YYYY-MM');
    const monthStats = getMonthStats(yearMonth);
    $('#details-income').textContent = formatMoney(monthStats.income);
    $('#details-expense').textContent = formatMoney(monthStats.expense);
    $('#details-balance').textContent = formatMoney(monthStats.income - monthStats.expense);

    renderTransactionList();
}

function renderTransactionList() {
    const yearMonth = state.selectedDate.format('YYYY-MM');
    let txs = state.transactions.filter(t => t.date.startsWith(yearMonth));

    if (state.searchKeyword) {
        txs = txs.filter(t => {
            const cat = state.categories.find(c => c.id === t.categoryId);
            return (cat && cat.name.includes(state.searchKeyword)) ||
                   (t.note && t.note.toLowerCase().includes(state.searchKeyword));
        });
    }

    const list = $('#transaction-list');
    if (txs.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="64" height="64"><path fill="#ccc" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                <p>${state.searchKeyword ? '没有找到匹配的账单' : '本月还没有记账哦，快去记一笔吧'}</p>
            </div>
        `;
        return;
    }

    const groups = {};
    txs.forEach(t => {
        const date = t.date.split(' ')[0];
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
    });

    list.innerHTML = Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(date => {
        const dayTxs = groups[date];
        const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return `
            <div class="date-group">
                <div class="date-header">
                    <span>${formatDateHeader(date)}</span>
                    <div class="date-total">
                        ${dayIncome > 0 ? `<span class="income">收 ${formatMoney(dayIncome)}</span>` : ''}
                        ${dayExpense > 0 ? `<span class="expense">支 ${formatMoney(dayExpense)}</span>` : ''}
                    </div>
                </div>
                ${dayTxs.map(t => renderTransactionItem(t)).join('')}
            </div>
        `;
    }).join('');

    $$('.transaction-item').forEach(item => {
        item.addEventListener('click', () => showTransactionDetail(item.dataset.id));
    });
}

function renderTransactionItem(t) {
    const cat = state.categories.find(c => c.id === t.categoryId) || { name: '未知', icon: '❓', color: '#999' };
    const account = state.accounts.find(a => a.id === t.accountId) || { name: '未知' };
    return `
        <div class="transaction-item" data-id="${t.id}">
            <div class="transaction-icon" style="background: ${cat.color}20; color: ${cat.color}">${cat.icon}</div>
            <div class="transaction-info">
                <div class="transaction-category">${cat.name}</div>
                ${t.note ? `<div class="transaction-note">${t.note}</div>` : ''}
                <div class="transaction-account">${account.name} · ${t.date.split(' ')[1].slice(0, 5)}</div>
            </div>
            <div class="transaction-amount ${t.type}">${t.type === 'expense' ? '-' : '+'}${formatMoney(t.amount)}</div>
        </div>
    `;
}

function formatDateHeader(dateStr) {
    const d = dayjs(dateStr);
    const today = dayjs();
    if (d.isSame(today, 'day')) return '今天';
    if (d.isSame(today.subtract(1, 'day'), 'day')) return '昨天';
    return d.format('M月D日 dddd');
}

// ==================== 统计页 ====================

function initStats() {
    $('#stats-month-selector').addEventListener('click', () => showMonthPicker('stats'));

    $$('.stats-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            state.statsTab = tab.dataset.tab;
            $$('.stats-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            $$('.stats-panel').forEach(p => p.classList.remove('active'));
            $(`#panel-${state.statsTab}`).classList.add('active');
            renderStats();
        });
    });
}

function renderStats() {
    $('#stats-month-selector .month-text').textContent = state.selectedDate.format('YYYY年M月');

    const yearMonth = state.selectedDate.format('YYYY-MM');
    const monthStats = getMonthStats(yearMonth);

    $('#overview-income').textContent = formatMoney(monthStats.income);
    $('#overview-expense').textContent = formatMoney(monthStats.expense);
    $('#overview-balance').textContent = formatMoney(monthStats.income - monthStats.expense);

    if (state.statsTab === 'overview') renderOverviewChart(yearMonth, monthStats);
    if (state.statsTab === 'category') renderCategoryChart(yearMonth);
    if (state.statsTab === 'trend') renderTrendChart();
    if (state.statsTab === 'compare') renderCompareChart(yearMonth);
}

function renderOverviewChart(yearMonth, stats) {
    const ctx = $('#overview-chart').getContext('2d');
    if (window.overviewChart) window.overviewChart.destroy();

    window.overviewChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['收入', '支出', '结余'],
            datasets: [{
                data: [stats.income, stats.expense, stats.income - stats.expense],
                backgroundColor: ['#4CAF50', '#FF5252', '#42A5F5'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderCategoryChart(yearMonth) {
    const year = state.selectedDate.year();
    const month = state.selectedDate.month() + 1;

    const expenses = state.transactions.filter(t =>
        t.type === 'expense' &&
        dayjs(t.date).year() === year &&
        dayjs(t.date).month() + 1 === month
    );

    const categoryTotals = {};
    expenses.forEach(t => {
        const cat = state.categories.find(c => c.id === t.categoryId);
        const parentId = cat ? (cat.parentId || cat.id) : 'other';
        if (!categoryTotals[parentId]) categoryTotals[parentId] = 0;
        categoryTotals[parentId] += t.amount;
    });

    const sorted = Object.keys(categoryTotals)
        .map(id => {
            const cat = state.categories.find(c => c.id === id) || { name: '其他', icon: '📦', color: '#78909C' };
            return { ...cat, amount: categoryTotals[id] };
        })
        .sort((a, b) => b.amount - a.amount);

    const ctx = $('#category-chart').getContext('2d');
    if (window.categoryChart) window.categoryChart.destroy();

    if (sorted.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        $('#category-ranking').innerHTML = `<div class="empty-state"><p>本月暂无支出数据</p></div>`;
        return;
    }

    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sorted.map(c => c.name),
            datasets: [{
                data: sorted.map(c => c.amount),
                backgroundColor: sorted.map(c => c.color),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } }
            }
        }
    });

    const total = sorted.reduce((s, c) => s + c.amount, 0);
    $('#category-ranking').innerHTML = `
        <div class="ranking-title">支出分类 TOP5</div>
        ${sorted.slice(0, 5).map((c, i) => `
            <div class="ranking-item">
                <div class="ranking-rank ${i < 3 ? 'top' : ''}">${i + 1}</div>
                <div class="ranking-icon" style="background: ${c.color}20; color: ${c.color}">${c.icon}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${c.name}</div>
                    <div class="ranking-percent">${((c.amount / total) * 100).toFixed(1)}%</div>
                </div>
                <div class="ranking-amount">${formatMoney(c.amount)}</div>
            </div>
        `).join('')}
    `;
}

function renderTrendChart() {
    const months = [];
    const expenses = [];
    const incomes = [];

    for (let i = 5; i >= 0; i--) {
        const d = dayjs().subtract(i, 'month');
        const ym = d.format('YYYY-MM');
        const stats = getMonthStats(ym);
        months.push(d.format('M月'));
        expenses.push(stats.expense);
        incomes.push(stats.income);
    }

    const ctx = $('#trend-chart').getContext('2d');
    if (window.trendChart) window.trendChart.destroy();

    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: '支出', data: expenses, borderColor: '#FF5252', backgroundColor: 'rgba(255,82,82,0.1)', tension: 0.4, fill: true },
                { label: '收入', data: incomes, borderColor: '#4CAF50', backgroundColor: 'rgba(76,175,80,0.1)', tension: 0.4, fill: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderCompareChart(yearMonth) {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = dayjs(`${yearMonth}-01`).daysInMonth();
    const labels = [];
    const incomeData = [];
    const expenseData = [];

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`;
        labels.push(`${d}日`);
        const dayTxs = state.transactions.filter(t => t.date.startsWith(dateStr));
        incomeData.push(dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
        expenseData.push(dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
    }

    const ctx = $('#compare-chart').getContext('2d');
    if (window.compareChart) window.compareChart.destroy();

    window.compareChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: '收入', data: incomeData, backgroundColor: '#4CAF50', borderRadius: 2 },
                { label: '支出', data: expenseData, backgroundColor: '#FF5252', borderRadius: 2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 10 } } }
            }
        }
    });
}

// ==================== 我的页 ====================

function initProfile() {
    $$('.menu-item').forEach(item => {
        item.addEventListener('click', () => handleProfileAction(item.dataset.action));
    });
}

function renderProfile() {}

function handleProfileAction(action) {
    switch (action) {
        case 'accounts': showAccountManager(); break;
        case 'categories': showCategoryManager(); break;
        case 'budget': showBudgetManager(); break;
        case 'reminder': showReminderSettings(); break;
        case 'backup': backupData(); break;
        case 'restore': showRestoreInput(); break;
        case 'export': exportData(); break;
        case 'theme': toggleTheme(); break;
        case 'feedback': showFeedback(); break;
        case 'about': showAbout(); break;
    }
}

// ==================== 弹窗与操作表 ====================

function showModal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-body').innerHTML = html;
    $('#modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    $('#modal').classList.remove('active');
    document.body.style.overflow = '';
}

function showActionSheet(title, items) {
    $('#action-sheet-title').textContent = title;
    $('#action-sheet-body').innerHTML = items.map(item => `
        <button class="action-sheet-item ${item.danger ? 'danger' : ''}" data-value="${item.value}">
            ${item.icon ? `<span>${item.icon}</span>` : ''}
            ${item.label}
        </button>
    `).join('');

    $('#action-sheet').classList.add('active');

    return new Promise(resolve => {
        const handler = (e) => {
            const item = e.target.closest('.action-sheet-item');
            if (item) {
                resolve(item.dataset.value);
                closeActionSheet();
            }
        };
        $('#action-sheet-body').onclick = handler;
        $('#action-sheet-cancel').onclick = () => { resolve(null); closeActionSheet(); };
        $('#action-sheet .action-sheet-overlay').onclick = () => { resolve(null); closeActionSheet(); };
    });
}

function closeActionSheet() {
    $('#action-sheet').classList.remove('active');
}

function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2000);
}

// ==================== 通用选择器 ====================

function showMonthPicker(context) {
    const months = [];
    for (let i = -12; i <= 0; i++) {
        const d = dayjs().add(i, 'month');
        months.push({ value: d.format('YYYY-MM'), label: d.format('YYYY年M月') });
    }

    const items = months.map(m => ({ value: m.value, label: m.label }));
    showActionSheet('选择月份', items).then(value => {
        if (value) {
            state.selectedDate = dayjs(value + '-01');
            if (context === 'home') renderHome();
            if (context === 'details') renderDetails();
            if (context === 'stats') renderStats();
        }
    });
}

function showDatePicker() {
    const html = `
        <div class="form-group">
            <label class="form-label">选择日期时间</label>
            <input type="datetime-local" class="form-input" id="pick-datetime" value="${state.selectedDate.format('YYYY-MM-DDTHH:mm')}">
        </div>
        <button class="btn btn-primary" id="btn-confirm-date">确定</button>
    `;
    showModal('选择时间', html);

    $('#btn-confirm-date').addEventListener('click', () => {
        const val = $('#pick-datetime').value;
        if (val) {
            state.selectedDate = dayjs(val);
            $('#time-text').textContent = state.selectedDate.format('M月D日 HH:mm');
            hideModal();
        }
    });
}

function showNoteInput() {
    const html = `
        <div class="form-group">
            <label class="form-label">备注</label>
            <input type="text" class="form-input" id="input-note" placeholder="例如：午餐、打车..." value="${state.note}" maxlength="50">
        </div>
        <button class="btn btn-primary" id="btn-confirm-note">确定</button>
    `;
    showModal('添加备注', html);

    $('#btn-confirm-note').addEventListener('click', () => {
        state.note = $('#input-note').value.trim();
        $('#note-text').textContent = state.note || '添加备注';
        hideModal();
    });
}

function showAccountPicker() {
    const items = state.accounts.map(a => ({
        value: a.id,
        label: `${a.icon} ${a.name}（${formatMoney(a.balance)}）`
    }));
    showActionSheet('选择账户', items).then(value => {
        if (value) {
            state.selectedAccountId = value;
            updateAccountText();
        }
    });
}

// ==================== 账户管理 ====================

function showAccountManager() {
    const html = `
        <div class="manage-list" id="account-manage-list">
            ${state.accounts.map(a => `
                <div class="manage-item">
                    <div class="manage-icon" style="background: ${getAccountColor(a)}20; color: ${getAccountColor(a)}">${a.icon}</div>
                    <div class="manage-info">
                        <div class="manage-name">${a.name}</div>
                        <div class="manage-meta">余额 ${formatMoney(a.balance)}</div>
                    </div>
                    <div class="manage-actions">
                        <button class="btn btn-secondary btn-small" onclick="editAccount('${a.id}')">编辑</button>
                        ${a.isDefault ? '' : `<button class="btn btn-danger btn-small" onclick="deleteAccount('${a.id}')">删除</button>`}
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-primary" onclick="showAddAccount()">+ 新增账户</button>
    `;
    showModal('账户管理', html);
}

function getAccountColor(account) {
    if (account.balance >= 0) return '#4CAF50';
    return '#FF5252';
}

function showAddAccount() {
    const html = `
        <div class="form-group">
            <label class="form-label">账户名称</label>
            <input type="text" class="form-input" id="account-name" placeholder="如：微信零钱" maxlength="20">
        </div>
        <div class="form-group">
            <label class="form-label">账户类型</label>
            <select class="form-select" id="account-type">
                <option value="cash">现金</option>
                <option value="ewallet">电子钱包</option>
                <option value="bank">银行卡</option>
                <option value="credit">信用卡</option>
                <option value="other">其他</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">初始余额</label>
            <input type="number" class="form-input" id="account-balance" placeholder="0.00" step="0.01">
        </div>
        <div class="form-group">
            <label class="form-label">选择图标</label>
            <div class="icon-picker" id="account-icon-picker">${renderIconOptions('💵')}</div>
        </div>
        <button class="btn btn-primary" id="btn-save-account">保存</button>
    `;
    showModal('新增账户', html);
    initIconPicker('#account-icon-picker');

    $('#btn-save-account').addEventListener('click', () => {
        const name = $('#account-name').value.trim();
        const type = $('#account-type').value;
        const balance = parseFloat($('#account-balance').value) || 0;
        const icon = document.querySelector('#account-icon-picker .icon-option.active')?.textContent || '💵';

        if (!name) { showToast('请输入账户名称'); return; }

        state.accounts.push({
            id: generateId(),
            name,
            type,
            icon,
            balance,
            isDefault: false
        });
        saveUserData();
        showToast('账户添加成功');
        showAccountManager();
    });
}

function editAccount(id) {
    const account = state.accounts.find(a => a.id === id);
    if (!account) return;

    const html = `
        <div class="form-group">
            <label class="form-label">账户名称</label>
            <input type="text" class="form-input" id="account-name" value="${account.name}" maxlength="20">
        </div>
        <div class="form-group">
            <label class="form-label">图标</label>
            <div class="icon-picker" id="account-icon-picker">${renderIconOptions(account.icon)}</div>
        </div>
        <button class="btn btn-primary" id="btn-update-account">保存</button>
    `;
    showModal('编辑账户', html);
    initIconPicker('#account-icon-picker');

    $('#btn-update-account').addEventListener('click', () => {
        account.name = $('#account-name').value.trim();
        account.icon = document.querySelector('#account-icon-picker .icon-option.active')?.textContent || account.icon;
        saveUserData();
        showToast('账户更新成功');
        showAccountManager();
    });
}

function deleteAccount(id) {
    const txs = state.transactions.filter(t => t.accountId === id);
    if (txs.length > 0) {
        showToast('该账户已有账单记录，无法删除');
        return;
    }
    if (confirm('确定删除该账户吗？')) {
        state.accounts = state.accounts.filter(a => a.id !== id);
        saveUserData();
        showAccountManager();
    }
}

// ==================== 分类管理 ====================

function showCategoryManager() {
    const html = `
        <div class="form-group">
            <label class="form-label">显示类型</label>
            <select class="form-select" id="manage-cat-type">
                <option value="expense">支出分类</option>
                <option value="income">收入分类</option>
            </select>
        </div>
        <div class="manage-list" id="category-manage-list"></div>
        <button class="btn btn-primary" onclick="showAddCategory()">+ 新增分类</button>
    `;
    showModal('分类管理', html);

    renderManageCategoryList();
    $('#manage-cat-type').addEventListener('change', renderManageCategoryList);
}

function renderManageCategoryList() {
    const type = $('#manage-cat-type').value;
    const cats = state.categories
        .filter(c => c.type === type && !c.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);

    $('#category-manage-list').innerHTML = cats.map(c => `
        <div class="manage-item">
            <div class="manage-icon" style="background: ${c.color}20; color: ${c.color}">${c.icon}</div>
            <div class="manage-info">
                <div class="manage-name">${c.name}</div>
                <div class="manage-meta">${c.isDefault ? '默认分类' : '自定义分类'}</div>
            </div>
            <div class="manage-actions">
                <button class="btn btn-secondary btn-small" onclick="editCategory('${c.id}')">编辑</button>
                ${c.isDefault ? '' : `<button class="btn btn-danger btn-small" onclick="deleteCategory('${c.id}')">删除</button>`}
            </div>
        </div>
    `).join('');
}

function showAddCategory() {
    const type = $('#manage-cat-type').value;
    const html = `
        <div class="form-group">
            <label class="form-label">分类名称</label>
            <input type="text" class="form-input" id="cat-name" placeholder="分类名称" maxlength="20">
        </div>
        <div class="form-group">
            <label class="form-label">选择图标</label>
            <div class="icon-picker" id="cat-icon-picker">${renderIconOptions('🏷️')}</div>
        </div>
        <div class="form-group">
            <label class="form-label">选择颜色</label>
            <div class="color-picker" id="cat-color-picker">${renderColorOptions(COLORS[0])}</div>
        </div>
        <button class="btn btn-primary" id="btn-save-category">保存</button>
    `;
    showModal('新增分类', html);
    initIconPicker('#cat-icon-picker');
    initColorPicker('#cat-color-picker');

    $('#btn-save-category').addEventListener('click', () => {
        const name = $('#cat-name').value.trim();
        if (!name) { showToast('请输入分类名称'); return; }

        const icon = document.querySelector('#cat-icon-picker .icon-option.active')?.textContent || '🏷️';
        const color = document.querySelector('#cat-color-picker .color-option.active')?.dataset.color || COLORS[0];
        const maxOrder = Math.max(...state.categories.filter(c => c.type === type && !c.parentId).map(c => c.sortOrder), 0);

        state.categories.push({
            id: generateId(),
            name,
            type,
            icon,
            color,
            parentId: '',
            isDefault: false,
            sortOrder: maxOrder + 1
        });
        saveUserData();
        showToast('分类添加成功');
        renderManageCategoryList();
    });
}

function editCategory(id) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    const html = `
        <div class="form-group">
            <label class="form-label">分类名称</label>
            <input type="text" class="form-input" id="cat-name" value="${cat.name}" maxlength="20">
        </div>
        <div class="form-group">
            <label class="form-label">选择图标</label>
            <div class="icon-picker" id="cat-icon-picker">${renderIconOptions(cat.icon)}</div>
        </div>
        <div class="form-group">
            <label class="form-label">选择颜色</label>
            <div class="color-picker" id="cat-color-picker">${renderColorOptions(cat.color)}</div>
        </div>
        <button class="btn btn-primary" id="btn-update-category">保存</button>
    `;
    showModal('编辑分类', html);
    initIconPicker('#cat-icon-picker');
    initColorPicker('#cat-color-picker');

    $('#btn-update-category').addEventListener('click', () => {
        cat.name = $('#cat-name').value.trim();
        cat.icon = document.querySelector('#cat-icon-picker .icon-option.active')?.textContent || cat.icon;
        cat.color = document.querySelector('#cat-color-picker .color-option.active')?.dataset.color || cat.color;
        saveUserData();
        showToast('分类更新成功');
        renderManageCategoryList();
    });
}

function deleteCategory(id) {
    const txs = state.transactions.filter(t => t.categoryId === id);
    if (txs.length > 0) {
        showToast('该分类已有账单记录，无法删除');
        return;
    }
    if (confirm('确定删除该分类吗？')) {
        state.categories = state.categories.filter(c => c.id !== id);
        saveUserData();
        renderManageCategoryList();
    }
}

function renderIconOptions(selected) {
    return ICONS.map(icon => `
        <div class="icon-option ${icon === selected ? 'active' : ''}" data-icon="${icon}">${icon}</div>
    `).join('');
}

function initIconPicker(selector) {
    $$(selector + ' .icon-option').forEach(el => {
        el.addEventListener('click', () => {
            $$(selector + ' .icon-option').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
        });
    });
}

function renderColorOptions(selected) {
    return COLORS.map(color => `
        <div class="color-option ${color === selected ? 'active' : ''}" data-color="${color}" style="background: ${color}"></div>
    `).join('');
}

function initColorPicker(selector) {
    $$(selector + ' .color-option').forEach(el => {
        el.addEventListener('click', () => {
            $$(selector + ' .color-option').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
        });
    });
}

// ==================== 预算管理 ====================

function showBudgetManager() {
    const yearMonth = state.selectedDate.format('YYYY-MM');
    const monthStats = getMonthStats(yearMonth);
    const totalBudget = state.budgets[yearMonth]?.total || '';

    const html = `
        <div class="form-group">
            <label class="form-label">${state.selectedDate.format('YYYY年M月')} 总预算</label>
            <input type="number" class="form-input" id="total-budget" placeholder="不设置则留空" value="${totalBudget}" step="0.01">
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
            本月已支出 ${formatMoney(monthStats.expense)}，设置预算后首页将显示预算进度。
        </p>
        <button class="btn btn-primary" id="btn-save-budget">保存</button>
    `;
    showModal('预算设置', html);

    $('#btn-save-budget').addEventListener('click', () => {
        const total = parseFloat($('#total-budget').value) || 0;
        if (!state.budgets[yearMonth]) state.budgets[yearMonth] = {};
        if (total > 0) {
            state.budgets[yearMonth].total = total;
        } else {
            delete state.budgets[yearMonth].total;
        }
        saveUserData();
        showToast('预算设置成功');
        hideModal();
        if (state.currentPage === 'home') renderHome();
    });
}

// ==================== 提醒设置 ====================

function showReminderSettings() {
    const html = `
        <div class="setting-item">
            <div>
                <div class="setting-label">开启记账提醒</div>
                <div class="setting-desc">每天提醒您记账</div>
            </div>
            <label class="switch">
                <input type="checkbox" id="reminder-enabled" ${state.settings.reminderEnabled ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
        <div class="form-group" style="margin-top: 16px;">
            <label class="form-label">提醒时间</label>
            <input type="time" class="form-input" id="reminder-time" value="${state.settings.reminderTime}">
        </div>
        <div class="setting-item">
            <div>
                <div class="setting-label">周末提醒</div>
            </div>
            <label class="switch">
                <input type="checkbox" id="reminder-weekend" ${state.settings.reminderWeekend ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
        <button class="btn btn-primary" id="btn-save-reminder">保存</button>
    `;
    showModal('记账提醒', html);

    $('#btn-save-reminder').addEventListener('click', () => {
        state.settings.reminderEnabled = $('#reminder-enabled').checked;
        state.settings.reminderTime = $('#reminder-time').value;
        state.settings.reminderWeekend = $('#reminder-weekend').checked;
        saveUserData();
        showToast('提醒设置已保存');
        hideModal();
        scheduleReminder();
    });
}

function scheduleReminder() {
    if (state.settings.reminderEnabled) {
        document.title = `随手记账 · 提醒 ${state.settings.reminderTime}`;
    } else {
        document.title = '随手记账 - 每天三秒，钱花得明白';
    }
}

// ==================== 数据备份/导出 ====================

function backupData() {
    const dataStr = JSON.stringify({
        categories: state.categories,
        accounts: state.accounts,
        transactions: state.transactions,
        budgets: state.budgets,
        settings: state.settings,
        backupAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `随手记账备份_${dayjs().format('YYYYMMDD_HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('备份文件已下载');
}

function showRestoreInput() {
    const html = `
        <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
            请选择之前备份的 JSON 文件，恢复后将覆盖当前数据。
        </p>
        <input type="file" class="form-input" id="restore-file" accept=".json,application/json">
        <button class="btn btn-primary" id="btn-restore" style="margin-top: 16px;">恢复数据</button>
    `;
    showModal('数据恢复', html);

    $('#btn-restore').addEventListener('click', () => {
        const file = $('#restore-file').files[0];
        if (!file) { showToast('请选择备份文件'); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.transactions && data.categories) {
                    if (confirm('恢复数据将覆盖当前所有数据，确定继续吗？')) {
                        state.categories = data.categories;
                        state.accounts = data.accounts;
                        state.transactions = data.transactions;
                        state.budgets = data.budgets || {};
                        state.settings = data.settings || DEFAULT_SETTINGS;
                        saveUserData();
                        showToast('数据恢复成功');
                        hideModal();
                        switchPage('home');
                    }
                } else {
                    showToast('备份文件格式不正确');
                }
            } catch (err) {
                showToast('文件解析失败');
            }
        };
        reader.readAsText(file);
    });
}

function exportData() {
    const yearMonth = state.selectedDate.format('YYYY-MM');
    const txs = state.transactions.filter(t => t.date.startsWith(yearMonth));

    if (txs.length === 0) {
        showToast('本月没有可导出的账单');
        return;
    }

    const headers = ['日期', '类型', '分类', '账户', '金额', '备注'];
    const rows = txs.map(t => {
        const cat = state.categories.find(c => c.id === t.categoryId) || { name: '' };
        const acc = state.accounts.find(a => a.id === t.accountId) || { name: '' };
        return [t.date, t.type === 'expense' ? '支出' : '收入', cat.name, acc.name, t.amount, t.note || ''];
    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `随手记账_${yearMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV 已导出');
}

// ==================== 主题 ====================

function toggleTheme() {
    state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveUserData();
    showToast(state.settings.theme === 'dark' ? '已切换到深色主题' : '已切换到浅色主题');
}

function applyTheme() {
    if (state.settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// ==================== 反馈与关于 ====================

function showFeedback() {
    const html = `
        <div class="form-group">
            <label class="form-label">您的建议或反馈</label>
            <textarea class="form-input" id="feedback-text" rows="4" placeholder="请输入您的建议..."></textarea>
        </div>
        <button class="btn btn-primary" id="btn-send-feedback">提交反馈</button>
    `;
    showModal('反馈与建议', html);
    $('#btn-send-feedback').addEventListener('click', () => {
        showToast('感谢您的反馈！我们会认真阅读每一条建议。');
        hideModal();
    });
}

function showAbout() {
    const html = `
        <div style="text-align: center; padding: 20px 0;">
            <div style="font-size: 48px; margin-bottom: 12px;">💰</div>
            <h2 style="font-size: 20px; margin-bottom: 8px;">随手记账</h2>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">V1.0.1 · 每天三秒，钱花得明白</p>
            <p style="font-size: 13px; color: var(--text-tertiary); line-height: 1.8;">
                一款轻量、专注、易坚持的个人记账工具。<br>
                无广告、无理财推荐、无社区。<br>
                数据本地优先，隐私可控。
            </p>
        </div>
    `;
    showModal('关于随手记账', html);
}

// ==================== 账单详情/编辑 ====================

function showTransactionDetail(id) {
    const t = state.transactions.find(tx => tx.id === id);
    if (!t) return;

    const cat = state.categories.find(c => c.id === t.categoryId) || { name: '未知', icon: '❓', color: '#999' };
    const acc = state.accounts.find(a => a.id === t.accountId) || { name: '未知' };

    const html = `
        <div style="text-align: center; padding: 20px 0;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: ${cat.color}20; color: ${cat.color}; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 12px;">${cat.icon}</div>
            <div style="font-size: 14px; color: var(--text-secondary);">${cat.name}</div>
            <div style="font-size: 32px; font-weight: 700; color: ${t.type === 'expense' ? 'var(--expense)' : 'var(--income)'}; margin: 12px 0;">${t.type === 'expense' ? '-' : '+'}${formatMoney(t.amount)}</div>
            <div style="font-size: 13px; color: var(--text-tertiary);">${t.date} · ${acc.name}</div>
            ${t.note ? `<div style="margin-top: 12px; padding: 10px; background: var(--bg); border-radius: 8px; font-size: 13px;">备注：${t.note}</div>` : ''}
        </div>
        <button class="btn btn-danger" id="btn-delete-transaction" style="margin-top: 16px;">删除账单</button>
    `;
    showModal('账单详情', html);

    $('#btn-delete-transaction').addEventListener('click', () => {
        if (confirm('确定删除这笔账单吗？')) {
            const account = state.accounts.find(a => a.id === t.accountId);
            if (account) {
                if (t.type === 'expense') account.balance += t.amount;
                else account.balance -= t.amount;
            }
            state.transactions = state.transactions.filter(tx => tx.id !== id);
            saveUserData();
            showToast('账单已删除');
            hideModal();
            renderCurrentPage();
        }
    });
}

function renderCurrentPage() {
    if (state.currentPage === 'home') renderHome();
    if (state.currentPage === 'details') renderDetails();
    if (state.currentPage === 'stats') renderStats();
}

// ==================== 统计工具函数 ====================

function getMonthStats(yearMonth) {
    const txs = state.transactions.filter(t => t.date.startsWith(yearMonth));
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatMoney(amount) {
    return '¥' + parseFloat(amount || 0).toFixed(2);
}

// ==================== 初始化 ====================

function init() {
    dayjs.locale('zh-cn');

    initAuth();
    initNavigation();
    initHome();
    initDetails();
    initStats();
    initProfile();

    $('#modal-close').addEventListener('click', hideModal);
    $('#modal .modal-overlay').addEventListener('click', hideModal);

    $('#time-text').textContent = state.selectedDate.format('M月D日 HH:mm');

    // 加载用户数据（如果已登录则显示主界面，否则显示登录界面）
    loadUserData();

    scheduleReminder();
}

// 启动应用
init();