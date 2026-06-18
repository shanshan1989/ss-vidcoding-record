const UserModel = require('../models/userModel');

class AuthController {
  /**
   * 用户注册
   * POST /api/auth/register
   */
  static async register(req, res) {
    try {
      const { username, password, nickname } = req.body;

      // 参数验证
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      if (username.length < 2) {
        return res.status(400).json({
          success: false,
          message: '用户名至少需要2个字符'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: '密码至少需要6个字符'
        });
      }

      // 检查用户名是否已存在
      const exists = await UserModel.usernameExists(username);
      if (exists) {
        return res.status(409).json({
          success: false,
          message: '用户名已存在'
        });
      }

      // 创建用户
      const user = await UserModel.create({ username, password, nickname });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 用户登录
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // 参数验证
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      // 查找用户
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 验证密码
      const isValid = await UserModel.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 更新最后登录时间
      await UserModel.updateLastLogin(user.id);

      res.json({
        success: true,
        message: '登录成功',
        data: {
          id: user.id,
          username: user.username,
          nickname: user.nickname
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = AuthController;
