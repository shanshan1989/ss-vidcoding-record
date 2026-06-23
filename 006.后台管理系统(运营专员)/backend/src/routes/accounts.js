const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const AccountController = require('../controllers/accountController');

// GET /admin/accounts - 账户列表
router.get('/', adminAuth, AccountController.list);

// GET /admin/accounts/:id - 账户详情
router.get('/:id', adminAuth, AccountController.get);

// GET /admin/accounts/user/:userId/summary - 用户账户余额汇总
router.get('/user/:userId/summary', adminAuth, AccountController.userSummary);

module.exports = router;
