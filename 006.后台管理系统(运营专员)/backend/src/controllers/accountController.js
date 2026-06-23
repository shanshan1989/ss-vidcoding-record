const AccountModel = require('../models/accountModel');

class AccountController {
  // GET /admin/accounts
  static async list(req, res) {
    try {
      const { page = 1, pageSize = 20, username, type, status } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const result = await AccountModel.list({
        offset: Number(offset),
        limit: Number(pageSize),
        username,
        type,
        status
      });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Account list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/accounts/:id
  static async get(req, res) {
    try {
      const { id } = req.params;
      const data = await AccountModel.getDetail(id);
      if (!data) {
        return res.status(404).json({ success: false, message: '账户不存在' });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error('Account get error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/accounts/user/:userId/summary
  static async userSummary(req, res) {
    try {
      const { userId } = req.params;
      const data = await AccountModel.getUserSummary(userId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Account user summary error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = AccountController;
