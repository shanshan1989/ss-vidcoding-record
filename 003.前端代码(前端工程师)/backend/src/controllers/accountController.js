const AccountModel = require('../models/accountModel');

class AccountController {
  /**
   * GET /api/accounts
   */
  static async list(req, res) {
    try {
      const userId = req.userId;
      const accounts = await AccountModel.findByUserId(userId);
      res.json({ success: true, data: accounts });
    } catch (error) {
      console.error('Account list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * GET /api/accounts/:id
   */
  static async get(req, res) {
    try {
      const userId = req.userId;
      const account = await AccountModel.findById(req.params.id);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({ success: false, message: '账户不存在' });
      }
      res.json({ success: true, data: account });
    } catch (error) {
      console.error('Account get error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * POST /api/accounts
   */
  static async create(req, res) {
    try {
      const userId = req.userId;
      const { name, type, icon, initial_balance, current_balance, is_default } = req.body;
      if (!name || !type) {
        return res.status(400).json({ success: false, message: '名称和类型不能为空' });
      }
      const account = await AccountModel.create({ user_id: userId, name, type, icon, initial_balance, current_balance, is_default });
      res.json({ success: true, data: account });
    } catch (error) {
      console.error('Account create error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * PUT /api/accounts/:id
   */
  static async update(req, res) {
    try {
      const userId = req.userId;
      const account = await AccountModel.findById(req.params.id);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({ success: false, message: '账户不存在' });
      }
      const { name, type, icon, initial_balance, current_balance, is_default, sort_order } = req.body;
      await AccountModel.update(req.params.id, { name, type, icon, initial_balance, current_balance, is_default, sort_order });
      const updated = await AccountModel.findById(req.params.id);
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Account update error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * DELETE /api/accounts/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const account = await AccountModel.findById(req.params.id);
      if (!account || account.user_id !== userId) {
        return res.status(404).json({ success: false, message: '账户不存在' });
      }
      await AccountModel.delete(req.params.id);
      res.json({ success: true, message: '删除成功' });
    } catch (error) {
      console.error('Account delete error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = AccountController;
