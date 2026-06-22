const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const StatisticsController = require('../controllers/statisticsController');

/**
 * @route   GET /api/statistics/yearly-summary
 * @desc    全年收支汇总
 * @access  Private
 */
router.get('/yearly-summary', authenticate, StatisticsController.yearlySummary);

/**
 * @route   GET /api/statistics/expense-by-category
 * @desc    按分类支出（饼图）
 * @access  Private
 */
router.get('/expense-by-category', authenticate, StatisticsController.expenseByCategory);

/**
 * @route   GET /api/statistics/top-expenses
 * @desc    支出 Top N
 * @access  Private
 */
router.get('/top-expenses', authenticate, StatisticsController.topExpenses);

/**
 * @route   GET /api/statistics/monthly-trend
 * @desc    每月收支趋势（折线图）
 * @access  Private
 */
router.get('/monthly-trend', authenticate, StatisticsController.monthlyTrend);

module.exports = router;
