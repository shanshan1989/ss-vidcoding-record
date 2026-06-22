const pool = require('../config/db');

class AccountModel {
  /**
   * 获取用户所有账户当前余额总和
   */
  static async getTotalBalance(userId) {
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(current_balance), 0) AS total_balance
       FROM accounts
       WHERE user_id = ? AND is_active = 1`,
      [userId]
    );
    return rows[0].total_balance;
  }

  /**
   * 获取用户默认账户，没有则返回第一个活跃账户
   */
  static async getDefaultAccount(userId) {
    const [rows] = await pool.execute(
      `SELECT id, name, type, current_balance
       FROM accounts
       WHERE user_id = ? AND is_active = 1
       ORDER BY is_default DESC, sort_order ASC, created_at ASC
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * 更新账户余额
   */
  static async updateBalance(accountId, amount) {
    await pool.execute(
      `UPDATE accounts
       SET current_balance = current_balance + ?
       WHERE id = ?`,
      [amount, accountId]
    );
  }
}

class BudgetModel {
  /**
   * 获取用户指定年月总预算
   */
  static async getMonthlyBudget(userId, yearMonth) {
    const [rows] = await pool.execute(
      `SELECT id, budget_amount, alert_threshold
       FROM budgets
       WHERE user_id = ?
         AND \`year_month\` = ?
         AND category_id IS NULL
       LIMIT 1`,
      [userId, yearMonth]
    );
    return rows[0] || null;
  }
}

module.exports = { AccountModel, BudgetModel };
