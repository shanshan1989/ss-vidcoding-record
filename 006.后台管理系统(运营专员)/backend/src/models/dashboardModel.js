const pool = require('../config/db');

class DashboardModel {
  static async getSummary() {
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
    const [todayUsers] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND DATE(created_at) = CURDATE()");
    const [monthExpense] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND is_deleted = 0 AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')"
    );
    const [monthIncome] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND is_deleted = 0 AND DATE_FORMAT(transaction_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')"
    );

    return {
      total_users: Number(totalUsers[0].count),
      today_new_users: Number(todayUsers[0].count),
      month_expense: Number(monthExpense[0].total).toFixed(2),
      month_income: Number(monthIncome[0].total).toFixed(2),
      year_month: new Date().toISOString().slice(0, 7)
    };
  }

  static async getUserTrend() {
    const sql = 'SELECT DATE(created_at) as date, COUNT(*) as count FROM users ' +
      'WHERE is_active = 1 AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) ' +
      'GROUP BY DATE(created_at) ORDER BY date ASC';
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async getTransactionTrend() {
    const sql = 'SELECT DATE(transaction_date) as date, ' +
      'COALESCE(SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END), 0) as expense, ' +
      'COALESCE(SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END), 0) as income ' +
      'FROM transactions ' +
      'WHERE is_deleted = 0 AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) ' +
      'GROUP BY DATE(transaction_date) ORDER BY date ASC';
    const [rows] = await pool.execute(sql);
    return rows;
  }

  static async getRecentUsers(limit = 10) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, created_at FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT ' + Number(limit)
    );
    return rows;
  }
}

module.exports = DashboardModel;
