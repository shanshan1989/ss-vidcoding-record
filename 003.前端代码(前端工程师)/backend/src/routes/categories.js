const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const CategoryController = require('../controllers/categoryController');

/**
 * @route   GET /api/categories
 * @desc    获取分类列表
 * @access  Private
 */
router.get('/', authenticate, CategoryController.list);
router.post('/', authenticate, CategoryController.create);
router.put('/:id', authenticate, CategoryController.update);
router.delete('/:id', authenticate, CategoryController.delete);

module.exports = router;
