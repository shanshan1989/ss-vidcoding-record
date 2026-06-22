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
        return res.status(400).json({
          success: false,
          message: '分类类型无效，只能是 expense 或 income'
        });
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
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = CategoryController;
