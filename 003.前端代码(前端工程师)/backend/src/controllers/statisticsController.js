const StatisticsModel = require('../models/statisticsModel');

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function buildMonthlyTrend(year, rows) {
  // 补齐 12 个月
  const map = {};
  rows.forEach((r) => {
    map[r.month] = {
      month: r.month,
      income: formatMoney(r.total_income),
      expense: formatMoney(r.total_expense)
    };
  });
  const data = [];
  for (let m = 1; m <= 12; m++) {
    if (map[m]) {
      data.push(map[m]);
    } else {
      data.push({ month: m, income: '0.00', expense: '0.00' });
    }
  }
  return data;
}

class StatisticsController {
  /**
   * 收支汇总
   * GET /api/statistics/yearly-summary?year=2026&month=6
   */
  static async yearlySummary(req, res) {
    try {
      const userId = req.userId;
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month, 10) : null;

      if (year < 2000 || year > 2100) {
        return res.status(400).json({ success: false, message: '年份无效' });
      }
      if (month !== null && (month < 1 || month > 12)) {
        return res.status(400).json({ success: false, message: '月份无效' });
      }

      const result = await StatisticsModel.getYearlySummary(userId, year, month);
      const totalIncome = Number(result.total_income);
      const totalExpense = Number(result.total_expense);

      res.json({
        success: true,
        data: {
          year,
          month,
          total_income: formatMoney(totalIncome),
          total_expense: formatMoney(totalExpense),
          balance: formatMoney(totalIncome - totalExpense)
        }
      });
    } catch (error) {
      console.error('全年汇总错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 按分类支出（饼图）
   * GET /api/statistics/expense-by-category?year=2026&month=6
   */
  static async expenseByCategory(req, res) {
    try {
      const userId = req.userId;
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      const month = req.query.month ? parseInt(req.query.month, 10) : null;
      if (year < 2000 || year > 2100) {
        return res.status(400).json({ success: false, message: '年份无效' });
      }
      if (month !== null && (month < 1 || month > 12)) {
        return res.status(400).json({ success: false, message: '月份无效' });
      }

      const rows = await StatisticsModel.getExpenseByCategory(userId, year, month);
      const total = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);

      const categories = rows.map((r) => ({
        category_id: r.category_id,
        category_name: r.category_name || '未分类',
        category_icon: r.category_icon || 'more_horiz',
        category_color: r.category_color || '#607D8B',
        amount: formatMoney(r.total_amount),
        percentage: total > 0 ? Math.round((Number(r.total_amount) / total) * 100) : 0
      }));

      res.json({
        success: true,
        data: {
          year,
          month,
          total_expense: formatMoney(total),
          categories
        }
      });
    } catch (error) {
      console.error('分类支出错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 支出 Top 5
   * GET /api/statistics/top-expenses?year=2026&month=6
   */
  static async topExpenses(req, res) {
    try {
      const userId = req.userId;
      const now = new Date();
      const year = parseInt(req.query.year, 10) || now.getFullYear();
      const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
      const limit = parseInt(req.query.limit, 10) || 5;

      if (year < 2000 || year > 2100 || month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: '年月无效' });
      }

      const rows = await StatisticsModel.getTopExpenses(userId, year, month, limit);
      const maxAmount = rows.length > 0 ? Number(rows[0].amount) : 1;

      const items = rows.map((r, i) => ({
        rank: i + 1,
        id: r.id,
        amount: formatMoney(r.amount),
        note: r.note || '',
        category_name: r.category_name || '未分类',
        category_icon: r.category_icon || 'more_horiz',
        category_color: r.category_color || '#607D8B',
        bar_width: Math.round((Number(r.amount) / maxAmount) * 100)
      }));

      res.json({
        success: true,
        data: { year, month, items }
      });
    } catch (error) {
      console.error('Top 支出错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 每月收支趋势（折线图）
   * GET /api/statistics/monthly-trend?year=2026
   */
  static async monthlyTrend(req, res) {
    try {
      const userId = req.userId;
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      if (year < 2000 || year > 2100) {
        return res.status(400).json({ success: false, message: '年份无效' });
      }

      const rows = await StatisticsModel.getMonthlyTrend(userId, year);
      const data = buildMonthlyTrend(year, rows);

      res.json({
        success: true,
        data: { year, months: data }
      });
    } catch (error) {
      console.error('月度趋势错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = StatisticsController;
