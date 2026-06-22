const pool = require('../config/db');

class StatisticsModel {
  /**
   * 按年份统计收支（可选月份筛选）
   */
  static async getYearlySummary(userId, year, month = null) {
    let sql = `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?
         AND is_deleted = 0
         AND YEAR(transaction_date) = ?`;
    const params = [userId, year];
    if (month !== null) {
      sql += ' AND MONTH(transaction_date) = ?';
      params.push(month);
    }
    const [rows] = await pool.execute(sql, params);
    return rows[0];
  }

  /**
   * 按分类统计支出（可选月份筛选，用于饼图）
   */
  static async getExpenseByCategory(userId, year, month = null) {
    let sql = `SELECT
         c.id AS category_id,
         c.name AS category_name,
         c.icon AS category_icon,
         c.color AS category_color,
         COALESCE(SUM(t.amount), 0) AS total_amount
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
         AND t.type = 'expense'
         AND t.is_deleted = 0
         AND YEAR(t.transaction_date) = ?`;
    const params = [userId, year];
    if (month !== null) {
      sql += ' AND MONTH(t.transaction_date) = ?';
      params.push(month);
    }
    sql += ` GROUP BY c.id, c.name, c.icon, c.color
       HAVING total_amount > 0
       ORDER BY total_amount DESC`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 指定年月的支出排行 Top N（按单笔金额排序）
   */
  static async getTopExpenses(userId, year, month, limit = 5) {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const [rows] = await pool.execute(
      `SELECT
         t.id,
         t.amount,
         t.note,
         t.transaction_date,
         c.name AS category_name,
         c.icon AS category_icon,
         c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = ?
         AND t.type = 'expense'
         AND t.is_deleted = 0
         AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
       ORDER BY t.amount DESC
       LIMIT ${Number(limit)}`,
      [userId, yearMonth]
    );
    return rows;
  }

  /**
   * 指定年份每月收支（用于折线图）
   */
  static async getMonthlyTrend(userId, year) {
    const [rows] = await pool.execute(
      `SELECT
         MONTH(transaction_date) AS month,
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?
         AND is_deleted = 0
         AND YEAR(transaction_date) = ?
       GROUP BY MONTH(transaction_date)
       ORDER BY MONTH(transaction_date)`,
      [userId, year]
    );
    return rows;
  }
}

module.exports = StatisticsModel;
