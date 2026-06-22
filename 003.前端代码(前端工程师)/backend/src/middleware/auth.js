const UserModel = require('../models/userModel');

/**
 * 简易鉴权中间件
 * 前端 shared.js 将 user id 以 Bearer token 形式放在 Authorization 头中
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供授权信息'
      });
    }

    const userId = authHeader.split(' ')[1];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '授权信息无效'
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    console.error('鉴权中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}

module.exports = authenticate;
