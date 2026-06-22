const { AccountModel, BudgetModel } = require('../models/homeModel');
const TransactionModel = require('../models/transactionModel');

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function getCurrentYearMonth() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    yearMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  };
}

class HomeController {
  /**
   * 首页顶部汇总数据
   * GET /api/home/summary
   */
  static async summary(req, res) {
    try {
      const userId = req.userId;
      const { year, month, yearMonth } = getCurrentYearMonth();

      const [totalBalance, monthlySummary] = await Promise.all([
        AccountModel.getTotalBalance(userId),
        TransactionModel.getMonthlySummary(userId, year, month)
      ]);

      const totalIncome = Number(monthlySummary.total_income);
      const totalExpense = Number(monthlySummary.total_expense);

      res.json({
        success: true,
        data: {
          balance: formatMoney(totalBalance),
          month_income: formatMoney(totalIncome),
          month_expense: formatMoney(totalExpense),
          year_month: yearMonth
        }
      });
    } catch (error) {
      console.error('获取首页汇总错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 首页本月预算使用情况
   * GET /api/home/budget
   */
  static async budget(req, res) {
    try {
      const userId = req.userId;
      const { year, month, yearMonth } = getCurrentYearMonth();

      const [budget, totalExpense] = await Promise.all([
        BudgetModel.getMonthlyBudget(userId, yearMonth),
        TransactionModel.getMonthlyExpense(userId, year, month)
      ]);

      const budgetAmount = budget ? Number(budget.budget_amount) : 0;
      const alertThreshold = budget ? Number(budget.alert_threshold) : 80;
      const usedAmount = Number(totalExpense);
      const usedPercentage = budgetAmount > 0
        ? Math.min(100, Math.round((usedAmount / budgetAmount) * 100))
        : 0;
      const remainingAmount = budgetAmount - usedAmount;
      const isAlert = usedPercentage >= alertThreshold;

      res.json({
        success: true,
        data: {
          year_month: yearMonth,
          budget_amount: formatMoney(budgetAmount),
          used_amount: formatMoney(usedAmount),
          remaining_amount: formatMoney(remainingAmount),
          used_percentage: usedPercentage,
          alert_threshold: alertThreshold,
          is_alert: isAlert
        }
      });
    } catch (error) {
      console.error('获取首页预算错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = HomeController;
