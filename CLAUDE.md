# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

随手记账是一个轻量级个人记账工具（V1.0.1），包含前端页面、后端 API 和 MySQL 数据库。

## 项目结构

```
myproduct/
├── 001.产品PRD/                    # 产品需求文档
│   ├── 财务记账产品需求文档.md
│   └── 随手记账网站/               # 旧版单文件原型
├── 002.产品UI 原型(美术设计)/     # UI 设计稿
├── 003.前端代码(前端工程师)/
│   ├── frontend/                  # 前端页面（Tailwind CSS）
│   │   ├── index.html             # 登录页
│   │   ├── pages/                 # 各功能页面
│   │   │   ├── home.html          # 首页（记账）
│   │   │   ├── transactions.html   # 账单明细
│   │   │   ├── statistics.html     # 统计报表
│   │   │   ├── settings.html      # 设置
│   │   │   ├── categories.html    # 分类管理
│   │   │   └── register.html       # 注册页
│   │   └── assets/js/
│   │       ├── auth.js            # 登录注册逻辑
│   │       ├── shared.js          # 共享工具函数
│   │       └── categories-data.js  # 分类数据
│   └── backend/                   # 后端 API（Node.js + Express）
│       ├── src/
│       │   ├── app.js             # Express 主入口
│       │   ├── config/db.js       # MySQL 连接池
│       │   ├── models/            # 数据模型
│       │   ├── controllers/       # 业务控制器
│       │   └── routes/           # API 路由
│       └── package.json
└── 004.数据库管理(数据库管理员)/   # 数据库
    ├── init_database.sql          # 初始化脚本
    └── 随手记账数据库设计.md       # 设计文档
```

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

## 技术栈

### 前端
- HTML5 + CSS3 + JavaScript（ES6+）
- Tailwind CSS（CDN）
- Material Symbols 图标

### 后端
- Node.js + Express
- mysql2（MySQL 连接池）
- bcryptjs（密码加密）

### 数据库
- MySQL 9.7
- 字符集：utf8mb4

## API 接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/health` | GET | 健康检查 |

## 架构说明

### 前端认证流程
1. 用户在 `index.html` 登录或注册
2. 成功后用户信息存储在 `localStorage.ssj_user_session`
3. 各页面通过 `SSJ.isLoggedIn()` 检查登录状态
4. 未登录自动跳转登录页

### 后端分层
- **Routes**: 定义 API 路由（如 `/api/auth/*`）
- **Controllers**: 处理请求逻辑
- **Models**: 数据库操作

### 数据库表结构
- `users` - 用户表
- `categories` - 分类表（系统默认 + 用户自定义）
- `accounts` - 账户表
- `transactions` - 账单表
- `budgets` - 预算表
- `reminders` - 提醒表
- `backups` - 备份记录表

## 开发注意事项

### 添加新的 API 端点
1. 在 `routes/` 创建路由文件
2. 在 `controllers/` 创建控制器
3. 在 `models/` 创建数据模型
4. 在 `app.js` 中注册路由

### 前端页面权限控制
```javascript
// 在页面脚本中添加
if (!SSJ.isLoggedIn()) {
  window.location.href = '../index.html';
  return;
}
```

### 环境变量
后端 `.env` 文件（不在 git 中）：
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_NAME=suishouji
PORT=3000
```

## 相关文件

- [001.产品PRD/财务记账产品需求文档.md](001.产品PRD/财务记账产品需求文档.md) - 产品需求文档
- [004.数据库管理(数据库管理员)/随手记账数据库设计.md](004.数据库管理(数据库管理员)/随手记账数据库设计.md) - 数据库设计文档
