const pool = require('../config/db');

class UserModel {
  static async list({ offset, limit, username, startDate, endDate, status }) {
    let where = 'WHERE 1=1';
    const params = [];

    if (username) { where += ' AND username LIKE ?'; params.push(`%${username}%`); }
    if (startDate) { where += ' AND created_at >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND created_at <= ?'; params.push(endDate + ' 23:59:59'); }
    if (status !== undefined && status !== '' && status !== 'all') { where += ' AND is_active = ?'; params.push(Number(status)); }

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM users ' + where, params
    );

    // LIMIT/OFFSET 直接拼入SQL（mysql2 prepared statement 不支持这两个作为参数）
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, created_at, last_login_at, is_active ' +
      'FROM users ' + where + ' ORDER BY created_at DESC LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset),
      params
    );

    return {
      list: rows,
      total: countRows[0].total,
      page: Math.ceil(offset / limit) + 1,
      pageSize: limit
    };
  }

  static async getDetail(id) {
    const [users] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, signature, currency, created_at, last_login_at, is_active FROM users WHERE id = ?',
      [id]
    );
    if (!users[0]) return null;
    const user = users[0];

    const [accounts] = await pool.execute(
      'SELECT COUNT(*) as count, COALESCE(SUM(current_balance), 0) as total_balance FROM accounts WHERE user_id = ? AND is_active = 1',
      [id]
    );
    const [income] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'income' AND is_deleted = 0 AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')",
      [id]
    );
    const [expense] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = 'expense' AND is_deleted = 0 AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')",
      [id]
    );

    return {
      ...user,
      account_count: Number(accounts[0].count),
      total_balance: Number(accounts[0].total_balance).toFixed(2),
      month_income: Number(income[0].total).toFixed(2),
      month_expense: Number(expense[0].total).toFixed(2)
    };
  }

  static async disable(id) {
    await pool.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  }
}

module.exports = UserModel;
