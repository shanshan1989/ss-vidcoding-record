const pool = require('../config/db');

class TransactionModel {
  static async adminList({ offset, limit, userId, type, categoryId, startDate, endDate, keyword }) {
    let where = 'WHERE t.is_deleted = 0';
    const params = [];

    if (userId) { where += ' AND t.user_id = ?'; params.push(userId); }
    if (type && type !== 'all') { where += ' AND t.type = ?'; params.push(type); }
    if (categoryId) { where += ' AND t.category_id = ?'; params.push(categoryId); }
    if (startDate) { where += ' AND t.transaction_date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND t.transaction_date <= ?'; params.push(endDate); }
    if (keyword) { where += ' AND t.note LIKE ?'; params.push('%' + keyword + '%'); }

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM transactions t ' + where,
      params
    );

    const sql = 'SELECT t.id, t.user_id, u.username, t.type, t.amount, t.transaction_date, t.transaction_time, t.note, ' +
      'c.id as category_id, c.name as category_name, c.icon as category_icon, c.color as category_color, ' +
      'a_from.id as from_account_id, a_from.name as from_account_name, ' +
      'a_to.id as to_account_id, a_to.name as to_account_name ' +
      'FROM transactions t ' +
      'JOIN users u ON t.user_id = u.id ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'LEFT JOIN accounts a_from ON t.account_id = a_from.id ' +
      'LEFT JOIN accounts a_to ON t.to_account_id = a_to.id ' +
      where + ' ORDER BY t.transaction_date DESC, t.transaction_time DESC, t.created_at DESC ' +
      'LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset);
    const [rows] = await pool.execute(sql, params);

    return { list: rows, total: countRows[0].total, page: Math.ceil(offset / limit) + 1, pageSize: limit };
  }

  static async adminListNoPage({ userId, type, categoryId, startDate, endDate }) {
    let where = 'WHERE t.is_deleted = 0';
    const params = [];

    if (userId) { where += ' AND t.user_id = ?'; params.push(userId); }
    if (type && type !== 'all') { where += ' AND t.type = ?'; params.push(type); }
    if (categoryId) { where += ' AND t.category_id = ?'; params.push(categoryId); }
    if (startDate) { where += ' AND t.transaction_date >= ?'; params.push(startDate); }
    if (endDate) { where += ' AND t.transaction_date <= ?'; params.push(endDate); }

    const sql = 'SELECT t.id, u.username, t.type, t.amount, t.transaction_date, t.transaction_time, t.note, ' +
      'c.name as category_name, a_from.name as from_account_name, a_to.name as to_account_name ' +
      'FROM transactions t ' +
      'JOIN users u ON t.user_id = u.id ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'LEFT JOIN accounts a_from ON t.account_id = a_from.id ' +
      'LEFT JOIN accounts a_to ON t.to_account_id = a_to.id ' +
      where + ' ORDER BY t.transaction_date DESC, t.transaction_time DESC';
    const [rows] = await pool.execute(sql, params);
    return { list: rows };
  }

  static async getDetail(id) {
    const [rows] = await pool.execute(
      'SELECT t.*, u.username, c.name as category_name, c.icon as category_icon, c.color as category_color, ' +
      'a_from.name as from_account_name, a_from.type as from_account_type, ' +
      'a_to.name as to_account_name, a_to.type as to_account_type ' +
      'FROM transactions t ' +
      'JOIN users u ON t.user_id = u.id ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'LEFT JOIN accounts a_from ON t.account_id = a_from.id ' +
      'LEFT JOIN accounts a_to ON t.to_account_id = a_to.id ' +
      'WHERE t.id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async getUserMonthlySummary(userId) {
    const [rows] = await pool.execute(
      'SELECT DATE_FORMAT(transaction_date, \'%Y-%m\') as month, ' +
      'COALESCE(SUM(CASE WHEN type = \'income\' THEN amount ELSE 0 END), 0) as total_income, ' +
      'COALESCE(SUM(CASE WHEN type = \'expense\' THEN amount ELSE 0 END), 0) as total_expense, ' +
      'COUNT(*) as transaction_count ' +
      'FROM transactions WHERE user_id = ? AND is_deleted = 0 ' +
      'GROUP BY DATE_FORMAT(transaction_date, \'%Y-%m\') ORDER BY month DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      total_income: Number(r.total_income).toFixed(2),
      total_expense: Number(r.total_expense).toFixed(2),
      net: (Number(r.total_income) - Number(r.total_expense)).toFixed(2)
    }));
  }
}

module.exports = TransactionModel;
