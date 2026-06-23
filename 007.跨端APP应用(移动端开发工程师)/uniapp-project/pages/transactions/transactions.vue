<template>
  <view class="transactions-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-center">
        <picker mode="date" fields="month" :value="pickerDate" @change="onDateChange">
          <view class="date-picker">
            <text class="period-label">{{ year }}年{{ month }}月</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 月度汇总 -->
    <view class="month-summary card" v-if="summary">
      <view class="summary-item">
        <text class="summary-label">本月支出</text>
        <text class="summary-expense">-¥{{ formatMoney(summary.total_expense) }}</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-label">本月收入</text>
        <text class="summary-income">+¥{{ formatMoney(summary.total_income) }}</text>
      </view>
    </view>

    <!-- 类型筛选 -->
    <view class="filter-tabs">
      <view
        v-for="t in typeFilters"
        :key="t.value"
        class="filter-tab"
        :class="{ active: currentType === t.value }"
        @click="changeType(t.value)"
      >
        <text>{{ t.label }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 交易列表 -->
    <scroll-view v-else class="transaction-list" scroll-y @scrolltolower="loadMore">
      <view v-if="groups.length === 0" class="empty-state">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无账单记录</text>
      </view>

      <view v-for="group in groups" :key="group.date" class="date-group">
        <view class="date-header">
          <text class="date-label">{{ group.label }}</text>
          <text class="date-display">{{ group.date_display }}</text>
        </view>

        <view
          v-for="item in group.items"
          :key="item.id"
          class="txn-item card"
        >
          <view class="txn-left" @click="editTransaction(item)">
            <text class="txn-icon">{{ getIconEmoji(item.category && item.category.icon) }}</text>
            <view class="txn-info">
              <text class="txn-category">{{ item.category ? item.category.name : '未分类' }}</text>
              <text class="txn-note">{{ item.note || '' }}</text>
            </view>
          </view>
          <view class="txn-right">
            <text
              class="txn-amount"
              :class="{
                expense: item.type === 'expense',
                income: item.type === 'income',
                transfer: item.type === 'transfer'
              }"
            >
              {{ item.type === 'expense' ? '-' : item.type === 'income' ? '+' : '' }}¥{{ formatMoney(item.amount) }}
            </text>
            <view class="txn-actions">
              <text class="txn-account">{{ item.account ? item.account.name : '' }}</text>
              <view class="action-btns">
                <view class="action-btn" @click="editTransaction(item)">
                  <text class="material-symbols-outlined">edit</text>
                </view>
                <view class="action-btn delete" @click="confirmDelete(item)">
                  <text class="material-symbols-outlined">delete</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
        <text>加载更多</text>
      </view>
    </scroll-view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <view class="modal-card" @click.stop>
        <text class="modal-title">编辑账单</text>

        <view class="form-item">
          <text class="label">金额</text>
          <input class="input" v-model="editForm.amount" type="digit" placeholder="0.00" />
        </view>

        <view class="form-item">
          <text class="label">备注</text>
          <input class="input" v-model="editForm.note" placeholder="添加备注" />
        </view>

        <view class="modal-actions">
          <button class="btn-outline" @click="closeEditModal">取消</button>
          <button class="btn-primary" @click="saveTransaction">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { transaction } from '@/utils/api.js'
import { showToast } from '@/utils/tools.js'

export default {
  data() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      pickerDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      currentType: 'all',
      typeFilters: [
        { label: '全部', value: 'all' },
        { label: '支出', value: 'expense' },
        { label: '收入', value: 'income' }
      ],
      groups: [],
      summary: null,
      loading: true,
      page: 1,
      pageSize: 50,
      hasMore: false,
      showEditModal: false,
      editingTransaction: null,
      editForm: { amount: '', note: '' }
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    onDateChange(e) {
      const date = e.detail.value // format: YYYY-MM
      const [y, m] = date.split('-')
      this.year = parseInt(y)
      this.month = parseInt(m)
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const [listRes, summaryRes] = await Promise.all([
          transaction.list(this.year, this.month, this.currentType),
          transaction.getSummary(this.year, this.month)
        ])
        if (listRes.success) {
          this.groups = listRes.data || []
        }
        if (summaryRes.success) {
          this.summary = summaryRes.data
        }
      } catch (e) {
        showToast('加载失败', 2000, true)
      } finally {
        this.loading = false
      }
    },
    changeType(type) {
      this.currentType = type
      this.loadData()
    },
    async loadMore() {
      this.hasMore = false
    },
    editTransaction(item) {
      this.editingTransaction = item
      this.editForm = {
        amount: String(item.amount),
        note: item.note || ''
      }
      this.showEditModal = true
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingTransaction = null
    },
    async saveTransaction() {
      if (!this.editingTransaction) return
      if (!this.editForm.amount || parseFloat(this.editForm.amount) <= 0) {
        showToast('请输入有效金额', 2000, true)
        return
      }
      showToast('修改成功', 2000)
      this.closeEditModal()
      this.loadData()
    },
    confirmDelete(item) {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除这条账单记录吗？',
        confirmColor: '#ef4444',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteTransaction(item)
          }
        }
      })
    },
    async deleteTransaction(item) {
      showToast('删除成功', 2000)
      this.loadData()
    },
    formatMoney(val) {
      return parseFloat(val || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getIconEmoji(icon) {
      const map = {
        'restaurant': '🍜', 'directions_car': '🚗', 'shopping_cart': '🛒', 'home': '🏠',
        'movie': '🎬', 'medical_services': '🏥', 'school': '📚', 'more_horiz': '📌',
        'payments': '💰', 'work': '💼', 'monetization_on': '💵', 'redeem': '🎁',
        'trending_up': '📈', 'card_giftcard': '🧧', 'replay': '🔙',
        'account_balance': '🏦', 'savings': '🐷', 'attach_money': '💴',
        'local_gas_station': '⛽', 'checkroom': '👔', 'flight': '✈️',
        'fitness_center': '🏋️', 'pets': '🐶', 'child_care': '👶',
        'store': '🏪', 'local_cafe': '☕', 'celebration': '🎉',
        'volunteer_activism': '🤝', 'account_balance_wallet': '👛'
      }
      return map[icon] || '📌'
    }
  }
}
</script>

<style scoped>
.transactions-page {
  min-height: 100vh;
  background: #f5fdf8;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0ebe4;
}

.nav-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.date-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: #f5fdf8;
  border-radius: 20px;
}

.period-label {
  font-size: 16px;
  font-weight: 700;
  color: #191c1a;
}

.month-summary {
  display: flex;
  align-items: center;
  margin: 12px;
  padding: 16px;
}

.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-divider {
  width: 1px;
  height: 36px;
  background: #e0ebe4;
}

.summary-label {
  font-size: 12px;
  color: #9ca3af;
  margin-bottom: 4px;
}

.summary-expense {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.summary-income {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
}

.filter-tabs {
  display: flex;
  padding: 0 12px;
  gap: 8px;
  margin-bottom: 8px;
}

.filter-tab {
  padding: 6px 16px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e0ebe4;
  font-size: 13px;
  color: #6c7972;
  font-weight: 500;
}

.filter-tab.active {
  background: #006c49;
  color: #ffffff;
  border-color: #006c49;
}

.loading-state {
  padding: 60px;
  text-align: center;
  color: #9ca3af;
}

.transaction-list {
  height: calc(100vh - 260px);
  padding: 0 12px;
}

.date-group {
  margin-bottom: 16px;
}

.date-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 0;
}

.date-label {
  font-size: 13px;
  font-weight: 700;
  color: #191c1a;
}

.date-display {
  font-size: 12px;
  color: #9ca3af;
}

.txn-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  margin-bottom: 8px;
}

.txn-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.txn-icon {
  font-size: 28px;
}

.txn-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.txn-category {
  font-size: 14px;
  font-weight: 600;
  color: #191c1a;
}

.txn-note {
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

.txn-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.txn-amount {
  font-size: 15px;
  font-weight: 700;
}

.txn-amount.expense { color: #ef4444; }
.txn-amount.income { color: #10b981; }
.txn-amount.transfer { color: #6c7972; }

.txn-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.txn-account {
  font-size: 11px;
  color: #9ca3af;
}

.action-btns {
  display: flex;
  gap: 4px;
  opacity: 0;
}

.txn-item:active .action-btns {
  opacity: 1;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f7f3;
}

.action-btn .material-symbols-outlined {
  font-size: 14px;
  color: #6c7972;
}

.action-btn.delete {
  background: #fee2e2;
}

.action-btn.delete .material-symbols-outlined {
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  color: #9ca3af;
  font-size: 14px;
}

.load-more {
  text-align: center;
  padding: 16px;
  color: #006c49;
  font-size: 14px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal-card {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  width: 100%;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 14px;
}

.label {
  font-size: 12px;
  font-weight: 600;
  color: #6c7972;
  display: block;
  margin-bottom: 6px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-outline, .btn-primary {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.btn-outline { background: #f0f7f3; color: #006c49; }
.btn-primary { background: #006c49; color: #fff; }
</style>