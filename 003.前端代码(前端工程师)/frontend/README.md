# 随手记账 - 前端原型页面

本目录包含「随手记账」网页版的前端原型页面，基于原生 HTML + CDN Tailwind CSS 构建，无需构建工具即可运行。

## 目录结构

```
frontend/
├── index.html                  # 默认首页（登录页）
├── pages/                      # 业务页面
│   ├── register.html          # 注册
│   ├── home.html              # 首页 / 快速记账
│   ├── transactions.html      # 账单明细
│   ├── statistics.html        # 统计报表
│   ├── savings.html           # 储蓄详情（统计子页）
│   ├── settings.html          # 设置 / 我的
│   ├── edit-profile.html      # 编辑个人资料（设置子页）
│   └── categories.html        # 分类管理（设置子页）
├── assets/
│   ├── css/
│   │   └── components.css     # 公共组件样式
│   └── js/
│       ├── tailwind-config.js # 共享 Tailwind 设计 token
│       ├── shared.js          # 导航高亮、主题记忆等公共逻辑
│       ├── categories-data.js # 分类数据共享（localStorage 读写）
│       ├── auth.js            # 登录/注册交互
│       └── keypad.js          # 首页数字键盘交互
├── screenshots/               # 原始原型截图参考
├── archive/                   # 原始 Stitch 输出（_1 ~ _8）
└── emerald_clarity/
    └── DESIGN.md              # 设计系统说明
```

## 本地运行

```bash
cd frontend
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 页面导航

- 默认首页为登录页（`index.html`）。
- 登录成功后跳转 `pages/home.html`。
- 注册成功后跳转根目录 `index.html`（登录页）。
- 主要模块通过顶部导航（桌面）或底部导航（移动端）互相跳转：
  - 首页、账单、统计、设置
- 子页面：
  - 统计 → 储蓄详情
  - 设置 → 编辑个人资料
  - 设置 → 分类管理
  - 设置 → 退出登录

## 设计规范

详见 `emerald_clarity/DESIGN.md`。核心要点：

- 主色：翠绿 `#006c49`
- 语义色：警告黄 `#F59E0B`、警示红 `#EF4444`
- 字体：Inter
- 图标：Material Symbols Outlined
- 间距：8px 基准网格
- 卡片圆角：16px，按钮圆角：8px

## 原始文件归档

`_1/code.html` ~ `_8/code.html` 已归档至 `archive/_N/code.html`，对应截图保存于 `screenshots/`。
