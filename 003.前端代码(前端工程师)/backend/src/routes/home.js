const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const HomeController = require('../controllers/homeController');

/**
 * @route   GET /api/home/summary
 * @desc    首页顶部汇总
 * @access  Private
 */
router.get('/summary', authenticate, HomeController.summary);

/**
 * @route   GET /api/home/budget
 * @desc    首页本月预算
 * @access  Private
 */
router.get('/budget', authenticate, HomeController.budget);

module.exports = router;
