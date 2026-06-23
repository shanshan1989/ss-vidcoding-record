const UserModel = require('../models/userModel');

class UserController {
  // GET /admin/users
  static async list(req, res) {
    try {
      const { page = 1, pageSize = 20, username, startDate, endDate, status } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const result = await UserModel.list({
        offset: Number(offset),
        limit: Number(pageSize),
        username,
        startDate,
        endDate,
        status
      });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('User list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/users/:id
  static async get(req, res) {
    try {
      const { id } = req.params;
      const data = await UserModel.getDetail(id);
      if (!data) {
        return res.status(404).json({ success: false, message: '用户不存在' });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error('User get error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // PUT /admin/users/:id/disable
  static async disable(req, res) {
    try {
      const { id } = req.params;
      await UserModel.disable(id);
      res.json({ success: true, message: '账户已禁用' });
    } catch (error) {
      console.error('User disable error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = UserController;
