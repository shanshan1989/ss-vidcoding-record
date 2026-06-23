const StatisticsModel = require('../models/statisticsModel');

class StatisticsController {
  // GET /admin/statistics/overview
  static async overview(req, res) {
    try {
      const data = await StatisticsModel.getOverview();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Statistics overview error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/statistics/monthly-trend
  static async monthlyTrend(req, res) {
    try {
      const data = await StatisticsModel.getMonthlyTrend();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Statistics monthly trend error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/statistics/expense-breakdown
  static async expenseBreakdown(req, res) {
    try {
      const { yearMonth } = req.query;
      const data = await StatisticsModel.getExpenseBreakdown(yearMonth);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Statistics expense breakdown error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/statistics/income-breakdown
  static async incomeBreakdown(req, res) {
    try {
      const { yearMonth } = req.query;
      const data = await StatisticsModel.getIncomeBreakdown(yearMonth);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Statistics income breakdown error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/statistics/user-ranking
  static async userRanking(req, res) {
    try {
      const { yearMonth } = req.query;
      const data = await StatisticsModel.getUserRanking(yearMonth);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Statistics user ranking error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = StatisticsController;
