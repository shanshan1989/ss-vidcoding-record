const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const CategoryController = require('../controllers/categoryController');

// GET /admin/categories - 获取全部分类（系统+用户自定义）
router.get('/', adminAuth, CategoryController.list);

module.exports = router;
