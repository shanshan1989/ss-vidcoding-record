const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  /**
   * 根据用户名查找用户
   */
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );
    return rows[0] || null;
  }

  /**
   * 根据用户ID查找用户
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, avatar_url, created_at, last_login_at FROM users WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * 创建新用户
   */
  static async create({ username, password, nickname }) {
    const id = 'user_' + uuidv4().replace(/-/g, '').substring(0, 12);
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      `INSERT INTO users (id, username, password_hash, nickname, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [id, username, passwordHash, nickname || username]
    );

    return { id, username, nickname: nickname || username };
  }

  /**
   * 验证密码
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 更新最后登录时间
   */
  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
  }

  /**
   * 检查用户名是否存在
   */
  static async usernameExists(username) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [username]
    );
    return rows[0].count > 0;
  }
}

module.exports = UserModel;
