const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const TransactionController = require('../controllers/transactionController');

/**
 * @route   GET /api/transactions/recent
 * @desc    获取最近 N 天交易
 * @access  Private
 */
router.get('/recent', authenticate, TransactionController.recent);

/**
 * @route   GET /api/transactions/summary
 * @desc    获取指定年月收支汇总
 * @access  Private
 */
router.get('/summary', authenticate, TransactionController.summary);

/**
 * @route   GET /api/transactions/list
 * @desc    获取指定年月交易列表
 * @access  Private
 */
router.get('/list', authenticate, TransactionController.list);

/**
 * @route   POST /api/transactions
 * @desc    创建交易
 * @access  Private
 */
router.post('/', authenticate, TransactionController.create);

module.exports = router;
