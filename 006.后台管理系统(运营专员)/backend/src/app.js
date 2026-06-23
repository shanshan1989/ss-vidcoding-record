require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS - 允许多个开发 origin
const ALLOWED_ORIGINS = ['http://localhost:8080', 'http://127.0.0.1:5500', 'http://localhost:5500'];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Session - 必须放在路由之前
app.use(session({
  secret: process.env.SESSION_SECRET || 'admin_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
    sameSite: 'lax',   // 允许跨端口发送cookie（前端8080，后端3001）
    secure: false      // 开发环境不使用HTTPS
  }
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============ 路由 ============

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 管理员认证
const adminAuthRoutes = require('./routes/auth');
app.use('/api/admin/auth', adminAuthRoutes);

// 仪表盘
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/admin/dashboard', dashboardRoutes);

// 用户管理
const userRoutes = require('./routes/users');
app.use('/api/admin/users', userRoutes);

// 账单管理
const transactionRoutes = require('./routes/transactions');
app.use('/api/admin/transactions', transactionRoutes);

// 账户管理
const accountRoutes = require('./routes/accounts');
app.use('/api/admin/accounts', accountRoutes);

// 预算管理
const budgetRoutes = require('./routes/budgets');
app.use('/api/admin/budgets', budgetRoutes);

// 统计分析
const statisticsRoutes = require('./routes/statistics');
app.use('/api/admin/statistics', statisticsRoutes);

// 分类（供筛选下拉用）
const categoryRoutes = require('./routes/categories');
app.use('/api/admin/categories', categoryRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`随手记账后台管理系统已启动: http://localhost:${PORT}`);
});
