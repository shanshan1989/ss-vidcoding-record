const pool = require('../config/db');

class CategoryModel {
  /**
   * 获取用户可见分类（用户自定义 + 系统默认）
   * @param {string} userId - 用户ID
   * @param {string} type - 'expense' | 'income'
   */
  static async findByUserAndType(userId, type) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, type, name, icon, color, sort_order, is_system, is_hidden
       FROM categories
       WHERE (user_id = ? OR (user_id IS NULL AND is_system = 1))
         AND type = ?
         AND is_hidden = 0
       ORDER BY is_system DESC, sort_order ASC, created_at ASC`,
      [userId, type]
    );
    return rows;
  }
}

module.exports = CategoryModel;
