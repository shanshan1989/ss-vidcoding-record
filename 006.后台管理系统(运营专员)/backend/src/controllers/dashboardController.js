const DashboardModel = require('../models/dashboardModel');

class DashboardController {
  // GET /admin/dashboard/summary
  static async summary(req, res) {
    try {
      const data = await DashboardModel.getSummary();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Dashboard summary error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/dashboard/user-trend
  static async userTrend(req, res) {
    try {
      const data = await DashboardModel.getUserTrend();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Dashboard user trend error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/dashboard/transaction-trend
  static async transactionTrend(req, res) {
    try {
      const data = await DashboardModel.getTransactionTrend();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Dashboard transaction trend error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/dashboard/recent-users
  static async recentUsers(req, res) {
    try {
      const data = await DashboardModel.getRecentUsers(10);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Dashboard recent users error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = DashboardController;
