const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class AccountModel {
  /**
   * 获取用户所有账户
   */
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM accounts WHERE user_id = ? AND is_active = 1 ORDER BY sort_order, created_at',
      [userId]
    );
    return rows;
  }

  /**
   * 根据ID获取账户
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM accounts WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * 创建账户
   */
  static async create({ user_id, name, type, icon, initial_balance, current_balance, is_default }) {
    const id = 'acc_' + uuidv4().replace(/-/g, '').substring(0, 12);
    const [rows] = await pool.execute(
      `INSERT INTO accounts (id, user_id, name, type, icon, initial_balance, current_balance, is_default, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [id, user_id, name, type, icon || 'account_balance_wallet', initial_balance || 0, current_balance || 0, is_default || 0]
    );
    return { id, user_id, name, type, icon, initial_balance, current_balance, is_default };
  }

  /**
   * 更新账户
   */
  static async update(id, { name, type, icon, initial_balance, current_balance, is_default, sort_order }) {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (type !== undefined) { fields.push('type = ?'); values.push(type); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (initial_balance !== undefined) { fields.push('initial_balance = ?'); values.push(initial_balance); }
    if (current_balance !== undefined) { fields.push('current_balance = ?'); values.push(current_balance); }
    if (is_default !== undefined) { fields.push('is_default = ?'); values.push(is_default); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (fields.length === 0) return false;
    values.push(id);
    await pool.execute(
      `UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  }

  /**
   * 删除账户（软删除）
   */
  static async delete(id) {
    await pool.execute(
      'UPDATE accounts SET is_active = 0 WHERE id = ?',
      [id]
    );
    return true;
  }
}

module.exports = AccountModel;
