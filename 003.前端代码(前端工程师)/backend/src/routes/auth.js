const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', AuthController.login);

module.exports = router;
