# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

随手记账是一个轻量级个人记账工具（V1.0.1），包含前端页面、后端 API 和 MySQL 数据库。

## 运行命令

### 前端开发服务器
```bash
cd "003.前端代码(前端工程师)/frontend"
python3 -m http.server 8080
```

### 后端启动
```bash
cd "003.前端代码(前端工程师)/backend"
npm install    # 首次安装依赖
npm start      # 启动服务 (http://localhost:3000)
```

### 数据库连接
```bash
# MySQL Docker 容器
docker exec -it mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 suishouji

# 重新初始化数据库
docker exec -i mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 < "004.数据库管理(数据库管理员)/init_database.sql"
```

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript（ES6+），Tailwind CSS（CDN），Material Symbols Outlined 图标，ECharts 5（统计页面）
- **后端**: Node.js + Express，mysql2（连接池），bcryptjs（密码加密）
- **数据库**: MySQL 9.7，utf8mb4 字符集

## 项目结构

```
003.前端代码(前端工程师)/
├── frontend/                  # 前端页面
│   ├── index.html             # 登录页
│   ├── pages/                 # 业务页面（home/transactions/statistics/settings 等）
│   └── assets/js/
│       ├── shared.js         # SSJ 全局对象（apiRequest/isLoggedIn/getUserSession 等）
│       ├── auth.js           # SSJAuth 对象（登录注册交互、showToast）
│       ├── categories-data.js # 分类数据
│       └── keypad.js         # 首页数字键盘
└── backend/                   # 后端 API
    └── src/
        ├── app.js            # Express 主入口
        ├── config/db.js      # MySQL 连接池
        ├── middleware/auth.js # 鉴权中间件（Bearer userId）
        ├── routes/           # 路由定义
        ├── controllers/      # 业务逻辑
        └── models/           # 数据库操作

004.数据库管理(数据库管理员)/
├── init_database.sql         # 数据库初始化脚本
└── 随手记账数据库设计.md
```

## 前端架构模式

### 页面初始化
各页面使用 IIFE 封装逻辑，在 `DOMContentLoaded` 中初始化：
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (!SSJ.isLoggedIn()) {
    window.location.href = '../index.html';
    return;
  }
  // 初始化逻辑...
});
```

### 全局对象
- **SSJ** (`shared.js`): `apiRequest`、`isLoggedIn()`、`getUserSession()`、`logout()`、`toggleDarkMode()`
- **SSJAuth** (`auth.js`): `showToast(message, isError)`、`showOverlay`/`hideOverlay`、`togglePassword`

### localStorage 键名
| 键名 | 用途 |
|------|------|
| `ssj_user_session` | 用户会话 JSON（含 `id`、`username`、`nickname`） |
| `ssj_new_user` | 新用户首次登录引导标志（注册后设置，首页读取后清除） |
| `ssj-theme` | 主题偏好（`dark`/`light`） |

## 后端 API

所有私有接口需 `Authorization: Bearer {userId}` 请求头。

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/health` | GET | 健康检查 |
| `/api/users/me` | GET/PUT | 获取/更新用户资料 |
| `/api/home/summary` | GET | 首页汇总（余额、月收入、月支出） |
| `/api/home/budget` | GET | 首页预算进度 |
| `/api/categories` | GET/POST | 分类列表/创建 |
| `/api/categories/:id` | PUT/DELETE | 更新/删除分类 |
| `/api/transactions/recent` | GET | 最近交易 |
| `/api/transactions` | POST | 创建交易 |
| `/api/transactions/:id` | DELETE | 删除交易 |
| `/api/accounts` | GET/POST | 账户列表/创建 |
| `/api/accounts/:id` | PUT/DELETE | 更新/删除账户 |
| `/api/budgets` | GET/POST | 预算查询/创建（含 `year_month` 反引号注意） |
| `/api/budgets/:id` | PUT/DELETE | 更新/删除预算 |
| `/api/statistics/yearly-summary` | GET | 收支汇总 |
| `/api/statistics/expense-by-category` | GET | 按分类支出 |
| `/api/statistics/monthly-trend` | GET | 每月趋势 |

### API 响应格式
后端返回 `{ success: true, data: {...} }`；`SSJ.apiRequest` 包装为 `{ success, data, status }`，取值注意兼容 `res.data.data` 或 `res.data`。

## 数据库

- `users` — nickname、avatar_url（MEDIUMTEXT）、signature、currency
- `categories` — 系统内置（`is_system=1`）+ 用户自定义
- `accounts` — 账户表，type: cash/electronic/bank/credit/other
- `transactions` — 账单，type: expense/income/transfer
- `budgets` — 月度预算，`year_month` 格式 YYYY-MM（MySQL 保留字，需反引号）
- `reminders`、`backups`

## 开发注意事项

### 添加新 API 端点
1. 在 `routes/` 创建路由文件，引入 `authenticate` 中间件
2. 在 `controllers/` 创建控制器
3. 在 `models/` 创建数据模型
4. 在 `app.js` 中 require 并 app.use 注册

### 前端页面权限控制
```javascript
if (!SSJ.isLoggedIn()) {
  window.location.href = '../index.html';
}
```

### 环境变量
后端 `.env`（不在 git）：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=suishouji
PORT=3000
```

### 其他
- Express JSON 请求体限制 `10mb`（支持头像 Base64 上传）
- `budgets` 表查询时 `year_month` 字段需用反引号包裹

## 相关文档
- [001.产品PRD/财务记账产品需求文档.md](001.产品PRD/财务记账产品需求文档.md)
- [004.数据库管理(数据库管理员)/随手记账数据库设计.md](004.数据库管理(数据库管理员)/随手记账数据库设计.md)
