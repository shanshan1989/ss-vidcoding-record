const CategoryModel = require('../models/categoryModel');

class CategoryController {
  /**
   * 获取分类列表
   * GET /api/categories?type=expense|income
   */
  static async list(req, res) {
    try {
      const { type } = req.query;
      const userId = req.userId;

      if (!type || !['expense', 'income'].includes(type)) {
        return res.status(400).json({ success: false, message: '分类类型无效，只能是 expense 或 income' });
      }

      const categories = await CategoryModel.findByUserAndType(userId, type);
      res.json({
        success: true,
        data: categories.map((item) => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          color: item.color,
          type: item.type,
          is_system: item.is_system === 1,
          sort_order: item.sort_order
        }))
      });
    } catch (error) {
      console.error('获取分类错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 创建分类
   * POST /api/categories
   */
  static async create(req, res) {
    try {
      const userId = req.userId;
      const { type, name, icon, color } = req.body;
      if (!type || !['expense', 'income'].includes(type)) {
        return res.status(400).json({ success: false, message: '类型无效' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: '分类名称不能为空' });
      }
      const cat = await CategoryModel.create({ user_id: userId, type, name: name.trim(), icon, color });
      res.json({ success: true, data: { ...cat, is_system: false } });
    } catch (error) {
      console.error('创建分类错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 更新分类
   * PUT /api/categories/:id
   */
  static async update(req, res) {
    try {
      const userId = req.userId;
      const { name, icon, color, sort_order } = req.body;
      const ok = await CategoryModel.update(req.params.id, userId, { name, icon, color, sort_order });
      if (!ok) {
        return res.status(404).json({ success: false, message: '分类不存在或无权修改' });
      }
      res.json({ success: true, message: '更新成功' });
    } catch (error) {
      console.error('更新分类错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 删除分类
   * DELETE /api/categories/:id
   */
  static async delete(req, res) {
    try {
      const userId = req.userId;
      const ok = await CategoryModel.delete(req.params.id, userId);
      if (!ok) {
        return res.status(404).json({ success: false, message: '分类不存在或无权删除' });
      }
      res.json({ success: true, message: '删除成功' });
    } catch (error) {
      console.error('删除分类错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = CategoryController;
