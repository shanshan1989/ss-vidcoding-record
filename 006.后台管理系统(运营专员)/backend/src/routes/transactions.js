const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const TransactionController = require('../controllers/transactionController');

// GET /admin/transactions - 账单列表
router.get('/', adminAuth, TransactionController.list);

// GET /admin/transactions/:id - 账单详情
router.get('/:id', adminAuth, TransactionController.get);

// GET /admin/transactions/user/:userId/summary - 按用户月度汇总
router.get('/user/:userId/summary', adminAuth, TransactionController.userMonthlySummary);

// GET /admin/transactions/export - 批量导出CSV
router.get('/export', adminAuth, TransactionController.export);

module.exports = router;
