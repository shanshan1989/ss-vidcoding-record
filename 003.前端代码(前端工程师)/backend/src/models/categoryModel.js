const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class CategoryModel {
  /**
   * 获取用户可见分类（用户自定义 + 系统默认）
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

  /**
   * 创建分类
   */
  static async create({ user_id, type, name, icon, color, sort_order = 0 }) {
    const id = 'cat_u_' + uuidv4().replace(/-/g, '').substring(0, 12);
    await pool.execute(
      `INSERT INTO categories (id, user_id, type, name, icon, color, sort_order, is_system, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [id, user_id, type, name, icon || 'category', color || '#607D8B', sort_order]
    );
    return { id, user_id, type, name, icon, color, sort_order, is_system: 0 };
  }

  /**
   * 更新分类（仅限用户自定义）
   */
  static async update(id, userId, { name, icon, color, sort_order }) {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (icon !== undefined) { fields.push('icon = ?'); values.push(icon); }
    if (color !== undefined) { fields.push('color = ?'); values.push(color); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); values.push(sort_order); }
    if (fields.length === 0) return false;
    values.push(id, userId);
    const [result] = await pool.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ? AND is_system = 0`,
      values
    );
    return result.affectedRows > 0;
  }

  /**
   * 删除分类（仅限用户自定义）
   */
  static async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ? AND is_system = 0',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = CategoryModel;
