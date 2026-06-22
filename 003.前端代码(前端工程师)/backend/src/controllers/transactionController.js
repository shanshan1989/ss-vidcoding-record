const TransactionModel = require('../models/transactionModel');
const { AccountModel } = require('../models/homeModel');

function formatMoney(value) {
  return Number(value).toFixed(2);
}

function getDayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (fmt(date) === fmt(today)) return '今天';
  if (fmt(date) === fmt(yesterday)) return '昨天';

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[date.getDay()];
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

class TransactionController {
  /**
   * 获取最近 N 天交易
   * GET /api/transactions/recent?type=expense|income|all&days=3
   */
  static async recent(req, res) {
    try {
      const userId = req.userId;
      const { type = 'all', days = 3 } = req.query;

      if (type && !['expense', 'income', 'all'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '交易类型无效'
        });
      }

      const daysNum = parseInt(days, 10);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
        return res.status(400).json({
          success: false,
          message: 'days 参数必须在 1-30 之间'
        });
      }

      const rows = await TransactionModel.findRecentByType(userId, type === 'all' ? null : type, daysNum);

      // 按日期分组
      const groups = [];
      const groupMap = {};

      rows.forEach((row) => {
        const date = row.transaction_date;
        if (!groupMap[date]) {
          groupMap[date] = {
            date,
            label: getDayLabel(date),
            date_display: formatDateDisplay(date),
            items: []
          };
          groups.push(groupMap[date]);
        }

        groupMap[date].items.push({
          id: row.id,
          type: row.type,
          amount: formatMoney(row.amount),
          note: row.note || '',
          category: {
            id: row.category_id,
            name: row.category_name,
            icon: row.category_icon,
            color: row.category_color
          },
          account: {
            id: row.account_id,
            name: row.account_name,
            icon: row.account_icon
          }
        });
      });

      res.json({
        success: true,
        data: groups
      });
    } catch (error) {
      console.error('获取最近交易错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 获取指定年月收支汇总
   * GET /api/transactions/summary?year=2026&month=10
   */
  static async summary(req, res) {
    try {
      const userId = req.userId;
      const now = new Date();
      const year = parseInt(req.query.year, 10) || now.getFullYear();
      const month = parseInt(req.query.month, 10) || now.getMonth() + 1;

      if (year < 2000 || year > 2100 || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          message: '年月参数无效'
        });
      }

      const result = await TransactionModel.getMonthlySummary(userId, year, month);
      const totalIncome = Number(result.total_income);
      const totalExpense = Number(result.total_expense);
      const balance = totalIncome - totalExpense;

      res.json({
        success: true,
        data: {
          year,
          month,
          total_income: formatMoney(totalIncome),
          total_expense: formatMoney(totalExpense),
          balance: formatMoney(balance)
        }
      });
    } catch (error) {
      console.error('获取交易汇总错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }

  /**
   * 获取指定年月交易列表
   * GET /api/transactions/list?year=2026&month=6&type=all
   */
  static async list(req, res) {
    try {
      const userId = req.userId;
      const now = new Date();
      const year = parseInt(req.query.year, 10) || now.getFullYear();
      const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
      const type = req.query.type || 'all';

      if (year < 2000 || year > 2100 || month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: '年月参数无效' });
      }
      if (!['expense', 'income', 'all'].includes(type)) {
        return res.status(400).json({ success: false, message: '类型参数无效' });
      }

      const rows = await TransactionModel.findByYearMonth(userId, year, month, type === 'all' ? null : type);

      // 按日期分组
      const groups = [];
      const groupMap = {};
      rows.forEach((row) => {
        const date = row.transaction_date;
        if (!groupMap[date]) {
          groupMap[date] = { date, label: getDayLabel(date), date_display: formatDateDisplay(date), items: [] };
          groups.push(groupMap[date]);
        }
        groupMap[date].items.push({
          id: row.id, type: row.type, amount: formatMoney(row.amount), note: row.note || '',
          category: { id: row.category_id, name: row.category_name, icon: row.category_icon, color: row.category_color },
          account: { id: row.account_id, name: row.account_name, icon: row.account_icon }
        });
      });

      res.json({ success: true, data: groups });
    } catch (error) {
      console.error('获取交易列表错误:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  /**
   * 创建交易
   * POST /api/transactions
   */
  static async create(req, res) {
    try {
      const userId = req.userId;
      const { type, amount, category_id, note } = req.body;

      // 参数校验
      if (!type || !['expense', 'income'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '交易类型无效'
        });
      }

      const amountNum = Number(amount);
      if (!amount || isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: '金额必须大于0'
        });
      }

      if (!category_id) {
        return res.status(400).json({
          success: false,
          message: '请选择分类'
        });
      }

      // 获取默认账户
      const account = await AccountModel.getDefaultAccount(userId);
      if (!account) {
        return res.status(400).json({
          success: false,
          message: '请先创建一个账户'
        });
      }

      const now = new Date();
      const transactionDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const transactionTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // 创建交易
      const transaction = await TransactionModel.create({
        userId,
        type,
        amount: amountNum.toFixed(2),
        categoryId: category_id,
        accountId: account.id,
        note: note || '',
        transactionDate,
        transactionTime
      });

      // 更新账户余额
      const balanceDelta = type === 'income' ? amountNum : -amountNum;
      await AccountModel.updateBalance(account.id, balanceDelta);

      res.status(201).json({
        success: true,
        message: '入账成功',
        data: {
          id: transaction.id,
          type,
          amount: formatMoney(amountNum),
          account_name: account.name
        }
      });
    } catch (error) {
      console.error('创建交易错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  }
}

module.exports = TransactionController;
