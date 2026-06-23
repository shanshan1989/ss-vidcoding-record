/**
 * 管理员身份认证中间件
 * 支持两种方式：
 * 1. Cookie 中的 connect.sid（express-session）
 * 2. 请求头 X-Admin-Id（开发环境跨域兼容）
 */
const AdminUserModel = require('../models/adminUserModel');

async function adminAuth(req, res, next) {
  try {
    let adminId = null;

    // 方式1：优先从 session 获取
    if (req.session && req.session.admin) {
      adminId = req.session.admin.id;
    }

    // 方式2：从自定义请求头获取（开发环境跨域场景）
    if (!adminId) {
      adminId = req.headers['x-admin-id'];
    }

    if (!adminId) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    // 验证管理员是否仍然有效
    const admin = await AdminUserModel.findById(adminId);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }

    req.adminId = admin.id;
    req.adminUsername = admin.username;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}

module.exports = adminAuth;
