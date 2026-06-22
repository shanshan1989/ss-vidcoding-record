const BudgetModel = require('../models/budgetModel');
const pool = require('../config/db');

class BudgetController {
  /**
   * GET /api/budgets?year_month=2026-06
   */
  static async list(req, res) {
    try {
      const userId = req.userId;
      const yearMonth = req.query.year_month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
        return res.status(400).json({ success: false, message: '年月格式无效，应为 YYYY-MM' });
      }
      const budgets = await BudgetModel.getMonthlyBudgets(userId, yearMonth);
      const totalBudget = await BudgetModel.getMonthlyBudget(userId, yearMonth);
      res.json({ success: true, data: { year_month: yearMonth, total_budget: totalBudget, budgets } });
    } catch (error) {
      console.error('Budget list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * POST /api/budgets
   */
  static async create(req, res) {
    try {
      const userId = req.userId;
      const { year_month, budget_amount, alert_threshold } = req.body;
      if (!year_month || budget_amount === undefined) {
        return res.status(400).json({ success: false, message: '年月和预算金额不能为空' });
      }
      if (!/^\d{4}-\d{2}$/.test(year_month)) {
        return res.status(400).json({ success: false, message: '年月格式无效，应为 YYYY-MM' });
      }
      const budget = await BudgetModel.upsertMonthlyBudget(userId, year_month, budget_amount, alert_threshold || 80);
      res.json({ success: true, data: budget });
    } catch (error) {
      console.error('Budget create error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * PUT /api/budgets/:id
   */
  static async update(req, res) {
    try {
      const userId = req.userId;
      const { budget_amount, alert_threshold } = req.body;
      if (budget_amount === undefined) {
        return res.status(400).json({ success: false, message: '预算金额不能为空' });
      }
      await pool.execute(
        'UPDATE budgets SET budget_amount = ?, alert_threshold = ? WHERE id = ? AND user_id = ?',
        [budget_amount, alert_threshold || 80, req.params.id, userId]
      );
      res.json({ success: true, message: '更新成功' });
    } catch (error) {
      console.error('Budget update error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * DELETE /api/budgets/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.userId;
      await BudgetModel.delete(req.params.id);
      res.json({ success: true, message: '删除成功' });
    } catch (error) {
      console.error('Budget delete error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = BudgetController;
