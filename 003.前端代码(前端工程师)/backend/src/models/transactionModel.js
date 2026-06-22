const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class TransactionModel {
  /**
   * 获取最近 N 天的交易记录
   * @param {string} userId - 用户ID
   * @param {string|null} type - 'expense' | 'income' | null（全部）
   * @param {number} days - 最近天数
   */
  static async findRecentByType(userId, type, days = 3) {
    let sql = `SELECT
         t.id,
         t.type,
         t.amount,
         t.transaction_date,
         t.transaction_time,
         t.note,
         c.id AS category_id,
         c.name AS category_name,
         c.icon AS category_icon,
         c.color AS category_color,
         a.id AS account_id,
         a.name AS account_name,
         a.icon AS account_icon
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ?
         AND t.is_deleted = 0
         AND t.transaction_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
    const params = [userId, days];

    if (type && type !== 'all') {
      sql += ` AND t.type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY t.transaction_date DESC, t.transaction_time DESC, t.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 按年月统计收支
   */
  static async getMonthlySummary(userId, year, month) {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const [rows] = await pool.execute(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?
         AND is_deleted = 0
         AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`,
      [userId, yearMonth]
    );
    return rows[0];
  }

  /**
   * 按年月查询交易记录
   */
  static async findByYearMonth(userId, year, month, type) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    let sql = `SELECT
         t.id,
         t.type,
         t.amount,
         t.transaction_date,
         t.transaction_time,
         t.note,
         c.id AS category_id,
         c.name AS category_name,
         c.icon AS category_icon,
         c.color AS category_color,
         a.id AS account_id,
         a.name AS account_name,
         a.icon AS account_icon
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       LEFT JOIN accounts a ON t.account_id = a.id
       WHERE t.user_id = ?
         AND t.is_deleted = 0
         AND t.transaction_date >= ?
         AND t.transaction_date <= ?`;
    const params = [userId, startDate, endDate];

    if (type && type !== 'all') {
      sql += ` AND t.type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY t.transaction_date DESC, t.transaction_time DESC, t.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  /**
   * 获取指定年月总支出
   */
  static async getMonthlyExpense(userId, year, month) {
    const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
    const [rows] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total_expense
       FROM transactions
       WHERE user_id = ?
         AND type = 'expense'
         AND is_deleted = 0
         AND DATE_FORMAT(transaction_date, '%Y-%m') = ?`,
      [userId, yearMonth]
    );
    return rows[0].total_expense;
  }

  /**
   * 创建交易记录
   */
  static async create({ userId, type, amount, categoryId, accountId, note, transactionDate, transactionTime }) {
    const id = 'txn_' + uuidv4().replace(/-/g, '').substring(0, 12);

    await pool.execute(
      `INSERT INTO transactions
       (id, user_id, type, amount, category_id, account_id, transaction_date, transaction_time, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, userId, type, amount, categoryId, accountId, transactionDate, transactionTime, note || null]
    );

    return { id };
  }
}

module.exports = TransactionModel;
