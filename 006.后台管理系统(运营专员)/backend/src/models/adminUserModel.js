const pool = require('../config/db');

class AdminUserModel {
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, is_active, created_at FROM admin_users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE admin_users SET updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = AdminUserModel;
