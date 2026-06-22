const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class BudgetModel {
  /**
   * 获取用户指定月份的总预算（category_id IS NULL）
   */
  static async getMonthlyBudget(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT * FROM budgets WHERE user_id = ? AND \`year_month\` = ? AND category_id IS NULL LIMIT 1`,
      [userId, yearMonth]
    );
    return rows[0] || null;
  }

  /**
   * 获取用户指定月份所有预算（含分类）
   */
  static async getMonthlyBudgets(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? AND b.\`year_month\` = ?
       ORDER BY IF(b.category_id IS NULL, 0, 1), b.category_id`,
      [userId, yearMonth]
    );
    return rows;
  }

  /**
   * 创建或更新月度总预算（upsert）
   */
  static async upsertMonthlyBudget(userId, yearMonth, budgetAmount, alertThreshold = 80) {
    const existing = await this.getMonthlyBudget(userId, yearMonth);
    if (existing) {
      await pool.execute(
        'UPDATE budgets SET budget_amount = ?, alert_threshold = ? WHERE id = ?',
        [budgetAmount, alertThreshold, existing.id]
      );
      return { ...existing, budget_amount: budgetAmount, alert_threshold: alertThreshold };
    } else {
      const id = 'bud_' + uuidv4().replace(/-/g, '').substring(0, 12);
      await pool.execute(
        `INSERT INTO budgets (id, user_id, \`year_month\`, category_id, budget_amount, alert_threshold, created_at, updated_at)
         VALUES (?, ?, ?, NULL, ?, ?, NOW(), NOW())`,
        [id, userId, yearMonth, budgetAmount, alertThreshold]
      );
      return { id, user_id: userId, year_month: yearMonth, category_id: null, budget_amount: budgetAmount, alert_threshold: alertThreshold };
    }
  }

  /**
   * 删除预算
   */
  static async delete(id) {
    await pool.execute('DELETE FROM budgets WHERE id = ?', [id]);
    return true;
  }
}

module.exports = BudgetModel;
