const bcrypt = require('bcryptjs');
const AdminUserModel = require('../models/adminUserModel');

class AdminAuthController {
  // POST /admin/auth/login
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
      }

      const admin = await AdminUserModel.findByUsername(username);
      if (!admin) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }
      if (!admin.is_active) {
        return res.status(401).json({ success: false, message: '账户已被禁用' });
      }

      const valid = await bcrypt.compare(password, admin.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: '用户名或密码错误' });
      }

      // 设置 session
      req.session.admin = {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname
      };

      res.json({
        success: true,
        data: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // POST /admin/auth/logout
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: '登出失败' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: '登出成功' });
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/auth/me
  static async me(req, res) {
    try {
      const nickname = req.session?.admin?.nickname || req.adminUsername;
      res.json({
        success: true,
        data: {
          id: req.adminId,
          username: req.adminUsername,
          nickname: nickname
        }
      });
    } catch (error) {
      console.error('Admin me error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = AdminAuthController;
