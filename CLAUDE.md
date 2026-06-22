# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

随手记账是一个轻量级个人记账工具（V1.0.1），包含前端页面、后端 API 和 MySQL 数据库。

## 运行命令

### 前端开发服务器
```bash
cd "003.前端代码(前端工程师)/frontend"
python3 -m http.server 8080
# 访问 http://localhost:8080
```

### 后端启动
```bash
cd "003.前端代码(前端工程师)/backend"
npm install        # 首次安装依赖
npm start          # 启动服务 (http://localhost:3000)
```

### 数据库连接
```bash
# MySQL Docker 容器
docker exec -it mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 suishouji

# 重新初始化数据库
docker exec -i mysql9 mysql --default-character-set=utf8mb4 -uroot -p123456 < "004.数据库管理(数据库管理员)/init_database.sql"
```

## 项目结构

```
myproduct/
├── 001.产品PRD/                    # 产品需求文档
├── 002.产品UI 原型(美术设计)/     # UI 设计稿
├── 003.前端代码(前端工程师)/
│   ├── frontend/                  # 前端页面（Tailwind CSS）
│   │   ├── index.html             # 登录页
│   │   ├── pages/                # 业务页面
│   │   │   ├── home.html          # 首页（记账）
│   │   │   ├── transactions.html   # 账单明细
│   │   │   ├── statistics.html     # 统计报表
│   │   │   ├── settings.html      # 设置
│   │   │   ├── edit-profile.html  # 编辑个人资料
│   │   │   ├── categories.html    # 分类管理
│   │   │   └── register.html      # 注册页
│   │   └── assets/js/
│   │       ├── auth.js            # 登录注册逻辑
│   │       ├── shared.js          # 共享工具函数（SSJ 对象）
│   │       └── categories-data.js  # 分类数据
│   └── backend/                   # 后端 API（Node.js + Express）
│       └── src/
│           ├── app.js             # Express 主入口
│           ├── config/db.js       # MySQL 连接池
│           ├── middleware/auth.js # 鉴权中间件（Bearer userId）
│           ├── models/            # 数据模型
│           ├── controllers/       # 业务控制器
│           └── routes/          # API 路由
└── 004.数据库管理(数据库管理员)/  # 数据库
    ├── init_database.sql
    └── 随手记账数据库设计.md
```

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript（ES6+）
- Tailwind CSS（CDN）
- Material Symbols Outlined 图标
- ECharts 5（CDN，统计页面图表）

### 后端
- Node.js + Express
- mysql2（MySQL 连接池）
- bcryptjs（密码加密）

### 数据库
- MySQL 9.7，字符集 utf8mb4

## API 接口

| 接口 | 方法 | 说明 | 认证 |
|-----|------|------|------|
| `/api/auth/register` | POST | 用户注册 | 否 |
| `/api/auth/login` | POST | 用户登录 | 否 |
| `/api/health` | GET | 健康检查 | 否 |
| `/api/users/me` | GET | 获取当前用户资料 | 是 |
| `/api/users/me` | PUT | 更新昵称/头像/签名/货币单位 | 是 |
| `/api/home/summary` | GET | 首页汇总 | 是 |
| `/api/home/budget` | GET | 首页预算 | 是 |
| `/api/categories` | GET | 分类列表（`?type=expense|income`） | 是 |
| `/api/categories` | POST | 创建分类 | 是 |
| `/api/categories/:id` | PUT | 更新分类 | 是 |
| `/api/categories/:id` | DELETE | 删除分类 | 是 |
| `/api/transactions/recent` | GET | 最近交易 | 是 |
| `/api/transactions/summary` | GET | 月度汇总 | 是 |
| `/api/accounts` | GET | 账户列表 | 是 |
| `/api/accounts` | POST | 创建账户 | 是 |
| `/api/accounts/:id` | PUT | 更新账户 | 是 |
| `/api/accounts/:id` | DELETE | 删除账户 | 是 |
| `/api/budgets` | GET | 预算（`?year_month=YYYY-MM`） | 是 |
| `/api/budgets` | POST | 创建/更新月度总预算 | 是 |
| `/api/budgets/:id` | PUT | 更新预算 | 是 |
| `/api/budgets/:id` | DELETE | 删除预算 | 是 |
| `/api/statistics/yearly-summary` | GET | 收支汇总（`?year=&month=`） | 是 |
| `/api/statistics/expense-by-category` | GET | 按分类支出（`?year=&month=`） | 是 |
| `/api/statistics/top-expenses` | GET | 支出 Top N（`?year=&month=&limit=`） | 是 |
| `/api/statistics/monthly-trend` | GET | 每月收支趋势（`?year=`） | 是 |

> **认证说明**: 私有 API 需 `Authorization: Bearer {userId}` 请求头。

## 架构说明

### 前端认证流程
1. 登录成功后将用户信息存入 `localStorage.ssj_user_session`
2. 各页面通过 `SSJ.isLoggedIn()` 检查登录状态，未登录跳转 `../index.html`
3. `SSJ.apiRequest(endpoint, method, body)` 自动附加 Authorization 头

### 后端分层
- **Routes**: 定义 API 路由，统一使用 `authenticate` 中间件
- **Controllers**: 处理请求逻辑，返回 `{ success: true/false, data: {...} }`
- **Models**: 数据库操作，使用 `mysql2` prepared statements

### API 响应格式
后端返回 `{ success: true, data: {...} }`，`SSJ.apiRequest` 包装为 `{ success: response.ok, data: 解析后内容, status }`，取值时注意兼容 `res.data.data` 或 `res.data`。

### 数据库表
- `users` — 含 nickname、avatar_url（MEDIUMTEXT）、signature、currency 字段
- `categories` — 系统内置 + 用户自定义，`is_system=1` 为系统内置
- `accounts` — 账户表，`type`: cash/electronic/bank/credit/other
- `transactions` — 账单表，`type`: expense/income/transfer
- `budgets` — 月度预算，`year_month` 格式 `YYYY-MM`
- `reminders`、`backups`

### 重要配置
- Express JSON 请求体限制：`10mb`（支持头像 Base64 上传）

## 开发注意事项

### 添加新的 API 端点
1. 在 `routes/` 创建路由文件，引入 `authenticate` 中间件
2. 在 `controllers/` 创建控制器
3. 在 `models/` 创建数据模型
4. 在 `app.js` 中 `require` 并 `app.use` 注册

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

## 相关文件

- [001.产品PRD/财务记账产品需求文档.md](001.产品PRD/财务记账产品需求文档.md)
- [004.数据库管理(数据库管理员)/随手记账数据库设计.md](004.数据库管理(数据库管理员)/随手记账数据库设计.md)
