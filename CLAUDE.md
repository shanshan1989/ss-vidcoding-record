# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

随手记账是一个轻量级个人记账工具的网页版（V1.0.1），基于原生 HTML/CSS/JavaScript 开发，无需构建工具即可在浏览器中运行。

## 运行命令

### 打开网页应用

```bash
open "001.产品PRD/随手记账网站/index.html"
```

### 本地开发服务器（推荐）

```bash
cd "001.产品PRD/随手记账网站"
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 语法检查

```bash
node --check "001.产品PRD/随手记账网站/app.js"
```

## 架构说明

### 技术栈
- **前端**：原生 HTML5 + CSS3 + JavaScript（ES6+）
- **图表**：Chart.js（CDN 引入）
- **日期处理**：Day.js（CDN 引入）
- **数据存储**：浏览器 LocalStorage（按用户 ID 隔离）

### 文件结构
```
随手记账网站/
├── index.html   # 页面结构（所有页面模块在一个文件中）
├── styles.css   # 样式表
├── app.js       # 应用逻辑（单文件，包含所有模块）
└── README.md    # 使用说明
```

### 代码架构（app.js）

应用采用单文件模块化组织，主要模块：

1. **用户认证模块**（顶部）
   - `getUsers()` / `saveUsers()` - 用户列表管理
   - `register()` / `login()` / `logout()` - 认证操作
   - `getUserDataKey()` - 按用户隔离数据 key

2. **状态管理**
   - 全局 `state` 对象管理应用状态
   - `loadUserData()` / `saveUserData()` - 数据持久化

3. **页面模块**（按功能划分）
   - 认证界面：`initAuth()`, `showAuthScreen()`, `showMainScreen()`
   - 页面导航：`initNavigation()`, `switchPage()`
   - 首页记账：`initHome()`, `renderHome()`, `handleKeypad()`, `confirmTransaction()`
   - 明细列表：`initDetails()`, `renderDetails()`, `renderTransactionList()`
   - 统计报表：`initStats()`, `renderStats()`, `renderCategoryChart()`, `renderTrendChart()`
   - 设置页：`initProfile()`, `handleProfileAction()`
   - 弹窗/操作表：`showModal()`, `showActionSheet()`, `showToast()`
   - 各功能管理：账户、分类、预算、提醒、数据备份/导出

4. **初始化**
   - `init()` 入口函数在文件末尾调用
   - 初始化顺序：auth → navigation → 各页面 → 加载数据 → 启动

### LocalStorage 数据结构

| Key | 说明 |
|-----|------|
| `ssj_users` | 用户列表（JSON 数组） |
| `ssj_current_user` | 当前登录用户 ID |
| `ssj_data_{userId}` | 用户专属数据（账单、分类、账户等） |
| `ssj_last_account` | 上次使用的账户 ID |

## 开发注意事项

### 添加新页面
1. 在 `index.html` 中添加 `<section id="page-xxx" class="page">`
2. 在 `app.js` 中添加 `initXxx()` 和 `renderXxx()` 函数
3. 在 `init()` 中调用 `initXxx()`
4. 在 `switchPage()` 中添加渲染调用

### 添加新功能到「我的」页面
1. 在 `index.html` 中添加 `.menu-item[data-action="xxx"]`
2. 在 `handleProfileAction()` 中添加 case 分支

### 样式命名约定
- 页面容器：`.page`, `.page.active`
- 卡片：`.xxx-card`
- 列表项：`.xxx-item`
- 操作按钮：`.btn`, `.btn-primary`, `.btn-danger`
- 弹窗：`.modal`, `.modal-overlay`, `.modal-content`
- 操作表：`.action-sheet`

## 相关文件

- [001.产品PRD/财务记账产品需求文档.md](001.产品PRD/财务记账产品需求文档.md) - 产品需求文档
- [001.产品PRD/随手记账网站/README.md](001.产品PRD/随手记账网站/README.md) - 使用说明