const express = require('express');
const router = express.Router();
const AdminAuthController = require('../controllers/adminAuthController');
const adminAuth = require('../middleware/adminAuth');

// POST /admin/auth/login - 管理员登录
router.post('/login', AdminAuthController.login);

// POST /admin/auth/logout - 管理员登出
router.post('/logout', adminAuth, AdminAuthController.logout);

// GET /admin/auth/me - 获取当前管理员信息
router.get('/me', adminAuth, AdminAuthController.me);

module.exports = router;
