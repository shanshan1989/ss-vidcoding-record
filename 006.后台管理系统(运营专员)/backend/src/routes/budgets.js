const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const BudgetController = require('../controllers/budgetController');

// GET /admin/budgets - 预算列表
router.get('/', adminAuth, BudgetController.list);

// GET /admin/budgets/usage - 预算使用情况
router.get('/usage', adminAuth, BudgetController.usage);

module.exports = router;
