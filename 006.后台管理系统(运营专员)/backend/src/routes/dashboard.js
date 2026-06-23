const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const DashboardController = require('../controllers/dashboardController');

// GET /admin/dashboard/summary - 核心指标卡片
router.get('/summary', adminAuth, DashboardController.summary);

// GET /admin/dashboard/user-trend - 近30天用户增长趋势
router.get('/user-trend', adminAuth, DashboardController.userTrend);

// GET /admin/dashboard/transaction-trend - 近30天收支趋势
router.get('/transaction-trend', adminAuth, DashboardController.transactionTrend);

// GET /admin/dashboard/recent-users - 最近注册用户列表
router.get('/recent-users', adminAuth, DashboardController.recentUsers);

module.exports = router;
