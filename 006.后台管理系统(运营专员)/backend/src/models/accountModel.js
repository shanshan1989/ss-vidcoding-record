const pool = require('../config/db');

class AccountModel {
  static async list({ offset, limit, username, type, status }) {
    let where = 'WHERE 1=1';
    const params = [];

    if (username) { where += ' AND u.username LIKE ?'; params.push('%' + username + '%'); }
    if (type && type !== 'all') { where += ' AND a.type = ?'; params.push(type); }
    if (status !== undefined && status !== '' && status !== 'all') { where += ' AND a.is_active = ?'; params.push(Number(status)); }

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM accounts a JOIN users u ON a.user_id = u.id ' + where,
      params
    );

    const [rows] = await pool.execute(
      'SELECT a.id, a.user_id, u.username, a.name, a.type, a.icon, ' +
      'a.initial_balance, a.current_balance, a.is_default, a.is_active, a.created_at ' +
      'FROM accounts a JOIN users u ON a.user_id = u.id ' +
      where + ' ORDER BY a.created_at DESC LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset),
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
    const [accounts] = await pool.execute(
      'SELECT a.*, u.username FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.id = ?',
      [id]
    );
    if (!accounts[0]) return null;
    const account = accounts[0];

    const [transactions] = await pool.execute(
      'SELECT t.id, t.type, t.amount, t.transaction_date, t.transaction_time, t.note, ' +
      'c.name as category_name, c.icon as category_icon, ' +
      'a_from.name as from_account_name, a_to.name as to_account_name ' +
      'FROM transactions t ' +
      'LEFT JOIN categories c ON t.category_id = c.id ' +
      'LEFT JOIN accounts a_from ON t.account_id = a_from.id ' +
      'LEFT JOIN accounts a_to ON t.to_account_id = a_to.id ' +
      'WHERE (t.account_id = ? OR t.to_account_id = ?) AND t.is_deleted = 0 ' +
      'ORDER BY t.transaction_date DESC, t.transaction_time DESC LIMIT 10',
      [id, id]
    );

    return { ...account, recent_transactions: transactions };
  }

  static async getUserSummary(userId) {
    const [accounts] = await pool.execute(
      'SELECT type, COALESCE(SUM(current_balance), 0) as total FROM accounts WHERE user_id = ? AND is_active = 1 GROUP BY type',
      [userId]
    );
    const [userInfo] = await pool.execute(
      'SELECT id, username, nickname FROM users WHERE id = ?',
      [userId]
    );
    const grandTotal = accounts.reduce((sum, a) => sum + Number(a.total), 0);
    return { user: userInfo[0], by_type: accounts, grand_total: grandTotal.toFixed(2) };
  }
}

module.exports = AccountModel;
