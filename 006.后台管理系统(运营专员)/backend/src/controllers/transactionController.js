const TransactionModel = require('../models/transactionModel');

class TransactionController {
  // GET /admin/transactions
  static async list(req, res) {
    try {
      const { page = 1, pageSize = 50, userId, type, categoryId, startDate, endDate, keyword } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const result = await TransactionModel.adminList({
        offset: Number(offset),
        limit: Number(pageSize),
        userId,
        type,
        categoryId,
        startDate,
        endDate,
        keyword
      });
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('Transaction list error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/transactions/:id
  static async get(req, res) {
    try {
      const { id } = req.params;
      const data = await TransactionModel.getDetail(id);
      if (!data) {
        return res.status(404).json({ success: false, message: '账单不存在' });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error('Transaction get error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/transactions/user/:userId/summary
  static async userMonthlySummary(req, res) {
    try {
      const { userId } = req.params;
      const data = await TransactionModel.getUserMonthlySummary(userId);
      res.json({ success: true, data });
    } catch (error) {
      console.error('Transaction user summary error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }

  // GET /admin/transactions/export
  static async export(req, res) {
    try {
      const { userId, type, categoryId, startDate, endDate } = req.query;
      const data = await TransactionModel.adminListNoPage({
        userId,
        type,
        categoryId,
        startDate,
        endDate
      });

      // 生成CSV
      const header = '账单ID,用户名,类型,金额,分类,账户,日期,时间,备注\n';
      const rows = data.list.map(t => {
        const typeMap = { expense: '支出', income: '收入', transfer: '转账' };
        return [
          t.id,
          t.username,
          typeMap[t.type] || t.type,
          t.amount,
          t.category_name || '-',
          t.account_name || (t.from_account_name + ' → ' + t.to_account_name),
          t.transaction_date,
          t.transaction_time || '',
          (t.note || '').replace(/,/g, ';').replace(/\n/g, ' ')
        ].join(',');
      }).join('\n');

      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment;filename=transactions.csv');
      res.send('﻿' + header + rows);
    } catch (error) {
      console.error('Transaction export error:', error);
      res.status(500).json({ success: false, message: '服务器内部错误' });
    }
  }
}

module.exports = TransactionController;
