const pool = require('../config/db');

class BudgetModel {
  static async list({ offset, limit, userId, yearMonth }) {
    let whereClause = 'WHERE 1=1';
    const p = [];
    if (userId) { whereClause += ' AND b.user_id = ?'; p.push(userId); }
    if (yearMonth) { whereClause += ' AND b.`year_month` = ?'; p.push(yearMonth); }

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) as total FROM budgets b ' + whereClause,
      p
    );

    const sql = 'SELECT b.*, u.username, c.name as category_name, c.icon as category_icon, c.color as category_color ' +
      'FROM budgets b JOIN users u ON b.user_id = u.id ' +
      'LEFT JOIN categories c ON b.category_id = c.id ' +
      whereClause + ' ORDER BY b.`year_month` DESC, b.created_at DESC LIMIT ' + Number(limit) + ' OFFSET ' + Number(offset);
    const [rows] = await pool.execute(sql, p);

    return { list: rows, total: countRows[0].total, page: Math.ceil(offset / limit) + 1, pageSize: limit };
  }

  static async getUsage({ userId, yearMonth }) {
    let whereClause = 'WHERE 1=1';
    const p = [];
    if (userId) { whereClause += ' AND b.user_id = ?'; p.push(userId); }
    if (yearMonth) { whereClause += ' AND b.`year_month` = ?'; p.push(yearMonth); }
    else { whereClause += ' AND b.`year_month` = DATE_FORMAT(CURDATE(), "%Y-%m")'; }

    const sql = 'SELECT b.*, u.username, c.name as category_name, ' +
      'COALESCE(used.amount, 0) as used_amount ' +
      'FROM budgets b ' +
      'JOIN users u ON b.user_id = u.id ' +
      'LEFT JOIN categories c ON b.category_id = c.id ' +
      'LEFT JOIN (SELECT user_id, category_id, SUM(amount) as amount FROM transactions WHERE type = \'expense\' AND is_deleted = 0 GROUP BY user_id, category_id) used ' +
      'ON b.user_id = used.user_id AND (b.category_id = used.category_id OR (b.category_id IS NULL AND used.category_id IS NULL)) ' +
      whereClause + ' ORDER BY b.`year_month` DESC';
    const [budgets] = await pool.execute(sql, p);

    return budgets.map(b => {
      const used = Number(b.used_amount);
      const budget = Number(b.budget_amount);
      const pct = budget > 0 ? Math.min((used / budget) * 100, 100) : 0;
      return {
        ...b,
        used_amount: used.toFixed(2),
        budget_amount: budget.toFixed(2),
        remaining: (budget - used).toFixed(2),
        used_percentage: pct.toFixed(1)
      };
    });
  }
}

module.exports = BudgetModel;
