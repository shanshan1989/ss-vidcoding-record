const pool = require('../config/db');

class StatisticsModel {
  static async getOverview() {
    const [income] = await pool.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income' AND is_deleted = 0");
    const [expense] = await pool.execute("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense' AND is_deleted = 0");
    const [count] = await pool.execute('SELECT COUNT(*) as total FROM transactions WHERE is_deleted = 0');
    const totalIncome = Number(income[0].total);
    const totalExpense = Number(expense[0].total);
    return {
      total_income: totalIncome.toFixed(2),
      total_expense: totalExpense.toFixed(2),
      net_profit: (totalIncome - totalExpense).toFixed(2),
      total_transactions: Number(count[0].total)
    };
  }

  static async getMonthlyTrend() {
    const sql = 'SELECT DATE_FORMAT(transaction_date, \'%Y-%m\') as month, ' +
      'COALESCE(SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END), 0) as income, ' +
      'COALESCE(SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END), 0) as expense ' +
      'FROM transactions ' +
      'WHERE is_deleted = 0 AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) ' +
      'GROUP BY DATE_FORMAT(transaction_date, \'%Y-%m\') ORDER BY month ASC';
    const [rows] = await pool.execute(sql);
    return rows.map(r => ({ month: r.month, income: Number(r.income).toFixed(2), expense: Number(r.expense).toFixed(2) }));
  }

  static async getExpenseBreakdown(yearMonth) {
    let where = "WHERE t.type = 'expense' AND t.is_deleted = 0";
    const params = [];
    if (yearMonth) { where += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?'; params.push(yearMonth); }

    const sql = 'SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total_amount ' +
      'FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ' +
      where + ' GROUP BY c.id, c.name, c.icon, c.color HAVING total_amount > 0 ORDER BY total_amount DESC';
    const [rows] = await pool.execute(sql, params);

    const grand = rows.reduce((s, r) => s + Number(r.total_amount), 0);
    return rows.map((r, i) => ({
      rank: i + 1,
      id: r.id, name: r.name || '未分类', icon: r.icon || 'help', color: r.color || '#607D8B',
      total_amount: Number(r.total_amount).toFixed(2),
      percentage: grand > 0 ? ((Number(r.total_amount) / grand) * 100).toFixed(1) : '0.0'
    }));
  }

  static async getIncomeBreakdown(yearMonth) {
    let where = "WHERE t.type = 'income' AND t.is_deleted = 0";
    const params = [];
    if (yearMonth) { where += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?'; params.push(yearMonth); }

    const sql = 'SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(t.amount), 0) as total_amount ' +
      'FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ' +
      where + ' GROUP BY c.id, c.name, c.icon, c.color HAVING total_amount > 0 ORDER BY total_amount DESC';
    const [rows] = await pool.execute(sql, params);

    const grand = rows.reduce((s, r) => s + Number(r.total_amount), 0);
    return rows.map((r, i) => ({
      rank: i + 1,
      id: r.id, name: r.name || '未分类', icon: r.icon || 'help', color: r.color || '#607D8B',
      total_amount: Number(r.total_amount).toFixed(2),
      percentage: grand > 0 ? ((Number(r.total_amount) / grand) * 100).toFixed(1) : '0.0'
    }));
  }

  static async getUserRanking(yearMonth) {
    let where = "WHERE t.type = 'expense' AND t.is_deleted = 0";
    const params = [];
    if (yearMonth) { where += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?'; params.push(yearMonth); }
    else { where += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = DATE_FORMAT(CURDATE(), "%Y-%m")'; }

    const sql = 'SELECT u.id, u.username, u.nickname, ' +
      'COALESCE(SUM(t.amount), 0) as total_expense, COUNT(t.id) as transaction_count, ' +
      'COALESCE(AVG(t.amount), 0) as avg_amount ' +
      'FROM transactions t JOIN users u ON t.user_id = u.id ' +
      where + ' GROUP BY u.id, u.username, u.nickname HAVING total_expense > 0 ORDER BY total_expense DESC LIMIT 50';
    const [rows] = await pool.execute(sql, params);

    return rows.map((r, i) => ({
      rank: i + 1,
      user_id: r.id, username: r.username, nickname: r.nickname || r.username,
      total_expense: Number(r.total_expense).toFixed(2),
      transaction_count: Number(r.transaction_count),
      avg_amount: Number(r.avg_amount).toFixed(2)
    }));
  }
}

module.exports = StatisticsModel;
