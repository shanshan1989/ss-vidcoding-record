const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const UserController = require('../controllers/userController');

// GET /admin/users - 用户列表（支持筛选、分页）
router.get('/', adminAuth, UserController.list);

// GET /admin/users/:id - 用户详情
router.get('/:id', adminAuth, UserController.get);

// PUT /admin/users/:id/disable - 软删除（禁用账户）
router.put('/:id/disable', adminAuth, UserController.disable);

module.exports = router;
