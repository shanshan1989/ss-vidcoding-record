const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const StatisticsController = require('../controllers/statisticsController');

// GET /admin/statistics/overview - 全局收支概览
router.get('/overview', adminAuth, StatisticsController.overview);

// GET /admin/statistics/monthly-trend - 按月收支趋势（最近12个月）
router.get('/monthly-trend', adminAuth, StatisticsController.monthlyTrend);

// GET /admin/statistics/expense-breakdown - 支出分类占比
router.get('/expense-breakdown', adminAuth, StatisticsController.expenseBreakdown);

// GET /admin/statistics/income-breakdown - 收入分类占比
router.get('/income-breakdown', adminAuth, StatisticsController.incomeBreakdown);

// GET /admin/statistics/user-ranking - 用户消费排行榜
router.get('/user-ranking', adminAuth, StatisticsController.userRanking);

module.exports = router;
