require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
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
║  - GET  /api/health        (健康检查)          ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
