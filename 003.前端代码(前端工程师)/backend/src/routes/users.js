const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const UserModel = require('../models/userModel');

router.use(authenticate);

/**
 * GET /api/users/me - 获取当前用户资料
 */
router.get('/me', async (req, res) => {
  try {
    const user = await UserModel.getProfile(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * PUT /api/users/me - 更新当前用户资料
 */
router.put('/me', async (req, res) => {
  try {
    const { nickname, signature, avatar_url, currency } = req.body;
    await UserModel.updateProfile(req.userId, { nickname, signature, avatar_url, currency });
    const user = await UserModel.getProfile(req.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

module.exports = router;
