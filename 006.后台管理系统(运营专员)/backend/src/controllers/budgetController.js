const BudgetModel = require('../models/budgetModel');

class BudgetController {
  // GET /admin/budgets
  static async list(req, res) {
    try {
      const { page = 1, pageSize = 50, userId, yearMonth } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const result = await BudgetModel.list({
        offset: Number(offset),
        limit: Number(pageSize),
        userId,
        yearMonth
      });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Budget list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/budgets/usage
  static async usage(req, res) {
    try {
      const { userId, yearMonth } = req.query;
      const data = await BudgetModel.getUsage({ userId, yearMonth });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Budget usage error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = BudgetController;
