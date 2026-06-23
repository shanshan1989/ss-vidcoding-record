const pool = require('../config/db');

class CategoryController {
  static async list(req, res) {
    try {
      const { type } = req.query;
      let where = 'WHERE 1=1';
      const params = [];
      if (type) {
        where += ' AND type = ?';
        params.push(type);
      }
      const [rows] = await pool.execute(
        `SELECT id, user_id, type, name, icon, color, is_system
         FROM categories ${where}
         ORDER BY is_system DESC, sort_order ASC, created_at ASC`,
        params
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Category list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = CategoryController;
