# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

本仓库包含两个独立项目，共用同一个 MySQL 数据库：

| 项目 | 用途 | 前端端口 | 后端端口 |
|------|------|---------|---------|
| `003.前端代码(前端工程师)` | 随手记账用户端（用户注册、记账） | 8080 | 3000 |
| `006.后台管理系统(运营专员)` | 随手记账户后台（运营查看数据） | 8081 | 3001 |

---

## 运行命令

### 用户端 - 前端
```bash
cd "003.前端代码(前端工程师)/frontend"
python3 -m http.server 8080
```

### 用户端 - 后端
```bash
cd "003.前端代码(前端工程师)/backend"
npm install
npm start      # http://localhost:3000
```

### 后台管理 - 前端
```bash
cd "006.后台管理系统(运营专员)/frontend"
python3 -m http.server 8081
```

### 后台管理 - 后端
```bash
cd "006.后台管理系统(运营专员)/backend"
npm install
npm start      # http://localhost:3001
```

### 数据库
```bash
# 连接 MySQL Docker 容器
docker exec -it mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 suishouji

# 重新初始化数据库
docker exec -i mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 < "004.数据库管理(数据库管理员)/init_database.sql"
```

---

## 技术栈

| 层 | 用户端 | 后台管理 |
|----|--------|---------|
| 前端 | HTML5 + CSS3 + JavaScript，Tailwind CSS（CDN），ECharts 5，Material Symbols | 同用户端 |
| 后端 | Node.js + Express，mysql2（连接池），bcryptjs，uuid，dotenv | Node.js + Express，mysql2，bcryptjs，express-session，uuid，dotenv |
| 数据库 | MySQL 9，utf8mb4 | 同用户端（另有 `admin_users` 表） |

---

## 项目结构

```
003.前端代码(前端工程师)/         # 用户端
├── frontend/
│   ├── index.html              # 登录页
│   ├── pages/                  # home / transactions / statistics / settings 等
│   └── assets/js/
│       ├── shared.js           # SSJ 全局对象
│       ├── auth.js             # SSJAuth 对象（Toast / Overlay / PasswordToggle）
│       └── ...
└── backend/src/
    ├── app.js                  # Express 主入口（端口3000）
    ├── config/db.js            # MySQL 连接池
    ├── middleware/auth.js       # Bearer {userId} 鉴权中间件
    ├── routes/ / controllers/ / models/

006.后台管理系统(运营专员)/        # 后台管理（独立项目）
├── frontend/
│   ├── login.html              # 管理员登录页
│   ├── pages/                  # dashboard / users / transactions / accounts / budgets / statistics/
│   └── assets/js/
│       ├── shared.js           # SSJ 对象（X-Admin-Id 鉴权）
│       └── auth.js            # SSJAdmin 对象
└── backend/src/
    ├── app.js                  # Express 主入口（端口3001）
    ├── config/db.js
    ├── middleware/adminAuth.js # Session + X-Admin-Id 双重鉴权
    └── routes/ / controllers/ / models/

004.数据库管理(数据库管理员)/
├── init_database.sql           # 数据库初始化脚本
└── 随手记账数据库设计.md
```

---

## 核心架构要点

### 认证机制（两个系统不同）

**用户端**：Bearer Token 模式
- 登录后返回 `{id, username, nickname}`，存于 `localStorage` 的 `ssj_user_session`
- 后续请求 Header：`Authorization: Bearer {userId}`
- 中间件：`middleware/auth.js` 从 Header 提取 userId

**后台管理**：Session + X-Admin-Id 备用
- 登录后写入 `express-session` Cookie（`connect.sid`）+ `sessionStorage` 的 `ssj_admin_session`
- 跨域开发时（前端 127.0.0.1:5500/8080 vs 后端 localhost:3001）Cookie 的 `SameSite=Lax` 会阻止跨端口发送，因此额外支持 `X-Admin-Id` 请求头
- 中间件：`middleware/adminAuth.js` 优先读 session，回退读 `X-Admin-Id` 头

### mysql2 LIMIT/OFFSET 参数限制
`mysql2` prepared statements 不支持 `LIMIT ? OFFSET ?` 绑定参数，必须直接拼接整型：
```sql
-- 错误（参数绑定会失败）
LIMIT ? OFFSET ?

-- 正确（直接拼接整型）
LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset)
```
涉及所有分页查询（users / accounts / transactions / budgets / recentUsers 等）

### budgets 表 year_month 字段
`year_month` 是 MySQL 保留字，所有 SQL 必须使用反引号：
```sql
WHERE `year_month` = ?
```

### transactions 软删除
所有账单查询必须过滤 `is_deleted = 0`，删除时使用软删除（`UPDATE ... SET is_deleted = 1`）

### 账户余额自动维护
创建账单时，后端自动更新 `accounts.current_balance`（收入 +，支出 -）

---

## 数据库

### 业务表（8张，用户端使用）

| 表名 | 说明 |
|------|------|
| `users` | 用户账户，is_active=1 正常，0=禁用 |
| `categories` | 分类，is_system=1 为系统内置，user_id=NULL |
| `accounts` | 账户，type: cash/electronic/bank/credit/other |
| `transactions` | 账单，type: expense/income/transfer，is_deleted=0 未删除 |
| `budgets` | 月度预算，`year_month` 格式 YYYY-MM，category_id=NULL 为总预算 |
| `reminders` | 每日提醒设置 |
| `backups` | 备份记录 |
| `admin_users` | 管理员账户（后台管理系统专用，唯一新增的表） |

### admin_users 表结构
| 字段 | 说明 |
|------|------|
| id | VARCHAR(36) PK |
| username | VARCHAR(50) UNIQUE NOT NULL |
| password_hash | VARCHAR(255)（bcrypt） |
| nickname | VARCHAR(50) |
| is_active | TINYINT(1) 默认1 |
| created_at / updated_at | DATETIME |

---

## 前端架构模式

### 页面权限控制
```javascript
document.addEventListener('DOMContentLoaded', () => {
  if (!SSJ.isLoggedIn()) {
    window.location.href = '../login.html'; // 或 '../index.html'（用户端）
    return;
  }
});
```

### 退出登录路径（后台管理）
```javascript
// shared.js 中 logout() 使用 '../login.html'，从 pages/ 目录跳回根目录登录页
window.location.href = '../login.html';
```

### localStorage / sessionStorage 键名
| 键名 | 存储位置 | 用途 |
|------|---------|------|
| `ssj_user_session` | localStorage（用户端） | 用户会话 `{id, username, nickname}` |
| `ssj_admin_session` | sessionStorage（后台） | 管理员会话 |
| `ssj_new_user` | localStorage | 新用户引导标志 |
| `ssj-theme` | localStorage | 主题 dark/light |

### API 请求封装
```javascript
// 用户端
const result = await SSJ.apiRequest('/transactions', 'POST', body);

// 后台管理
const result = await SSJ.apiRequest('/users', 'GET');
// 内部自动附加 X-Admin-Id 头
```
响应格式：`{ success, data, status }`，数据取 `result.data?.data ?? result.data`

### API 响应格式
后端统一 `{ success: true, data: {...} }` 或 `{ success: false, message: "..." }`

---

## 后端路由概览

### 用户端（端口 3000，前缀 `/api`）

| 接口 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/auth/register` | POST | 否 | 注册 |
| `/api/auth/login` | POST | 否 | 登录 |
| `/api/health` | GET | 否 | 健康检查 |
| `/api/home/summary` | GET | Bearer | 首页汇总 |
| `/api/home/budget` | GET | Bearer | 预算进度 |
| `/api/categories` | GET/POST | Bearer | 分类 |
| `/api/transactions` | POST | Bearer | 创建账单 |
| `/api/transactions/list` | GET | Bearer | 账单列表 |
| `/api/accounts` | GET/POST | Bearer | 账户 |
| `/api/budgets` | GET/POST | Bearer | 预算 |
| `/api/statistics/*` | GET | Bearer | 统计图表 |
| `/api/users/me` | GET/PUT | Bearer | 用户资料 |

### 后台管理（端口 3001，前缀 `/api/admin`）

| 接口 | 方法 | 鉴权 | 说明 |
|------|------|------|------|
| `/api/admin/auth/login` | POST | 否 | 管理员登录 |
| `/api/admin/auth/logout` | POST | 是 | 登出（清除 session） |
| `/api/admin/auth/me` | GET | 是 | 当前管理员信息 |
| `/api/admin/dashboard/summary` | GET | 是 | 核心指标 |
| `/api/admin/dashboard/user-trend` | GET | 是 | 30天用户趋势 |
| `/api/admin/dashboard/transaction-trend` | GET | 是 | 30天收支趋势 |
| `/api/admin/dashboard/recent-users` | GET | 是 | 最近注册用户 |
| `/api/admin/users` | GET | 是 | 用户列表（筛选/分页） |
| `/api/admin/users/:id` | GET | 是 | 用户详情 |
| `/api/admin/users/:id/disable` | PUT | 是 | 禁用用户（软删除） |
| `/api/admin/transactions` | GET | 是 | 账单列表（多维筛选） |
| `/api/admin/transactions/:id` | GET | 是 | 账单详情 |
| `/api/admin/accounts` | GET | 是 | 账户列表 |
| `/api/admin/accounts/:id` | GET | 是 | 账户详情 |
| `/api/admin/budgets` | GET | 是 | 预算列表 |
| `/api/admin/statistics/overview` | GET | 是 | 累计收支概览 |
| `/api/admin/statistics/expense-breakdown` | GET | 是 | 支出分类占比 |
| `/api/admin/statistics/income-breakdown` | GET | 是 | 收入分类占比 |
| `/api/admin/statistics/user-ranking` | GET | 是 | 用户消费排行 |
| `/api/admin/categories` | GET | 是 | 分类列表（供筛选下拉） |

---

## 环境变量

### 用户端后端 `.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=suishouji
PORT=3000
```

### 后台管理后端 `.env`
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=suishouji
PORT=3001
SESSION_SECRET=your_secret_here
```

---

## 添加新后端接口

1. 在 `routes/` 创建路由文件，require 中间件 `adminAuth`（后台）或 `authenticate`（用户端）
2. 在 `controllers/` 创建控制器（静态方法类）
3. 在 `models/` 创建数据模型（所有 SQL 使用 `pool.execute`，参数绑定）
4. 在 `app.js` 中 `require` 并 `app.use` 注册

---

## 相关文档
- [001.产品PRD/财务记账产品需求文档.md](001.产品PRD/财务记账产品需求文档.md)
- [001.产品PRD/后台管理系统功能规格.md](001.产品PRD/后台管理系统功能规格.md)
- [004.数据库管理(数据库管理员)/随手记账数据库设计.md](004.数据库管理(数据库管理员)/随手记账数据库设计.md)
