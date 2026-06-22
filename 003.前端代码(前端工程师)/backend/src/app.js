require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const statisticsRoutes = require('./routes/statistics');
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/accounts');
const budgetRoutes = require('./routes/budgets');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/budgets', budgetRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ success: false, message: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║     随手记账后端服务已启动                       ║
╠════════════════════════════════════════════════╣
║  地址: http://localhost:${PORT}                   ║
║  环境: ${process.env.NODE_ENV || 'development'}                         ║
╠════════════════════════════════════════════════╣
║  API 端点:                                     ║
║  - POST /api/auth/register  (注册)             ║
║  - POST /api/auth/login     (登录)             ║
║  - GET  /api/home/summary   (首页汇总)         ║
║  - GET  /api/home/budget    (首页预算)         ║
║  - GET  /api/categories     (分类列表)         ║
║  - GET  /api/transactions/recent  (最近交易)   ║
║  - GET  /api/transactions/summary (月度汇总)   ║
║  - GET  /api/statistics/*   (统计报表)         ║
║  - GET/PUT /api/users/me  (用户资料)           ║
║  - CRUD  /api/accounts/*  (账户管理)          ║
║  - CRUD  /api/budgets/*   (预算管理)          ║
║  - GET  /api/health        (健康检查)          ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
