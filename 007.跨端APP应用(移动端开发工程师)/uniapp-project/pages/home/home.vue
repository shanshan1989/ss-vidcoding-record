<template>
  <view class="home-page" :style="{ paddingTop: statusBarHeight + 12 + 'px' }">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <view v-else class="page-content">
      <!-- 账户余额卡片 -->
      <view class="balance-card card">
        <text class="balance-label">账户余额（元）</text>
        <text class="balance-amount">¥{{ formatMoney(summary.balance) }}</text>
        <view class="balance-month">
          <view class="month-stat">
            <text class="stat-label">本月收入</text>
            <text class="stat-income">+¥{{ formatMoney(summary.month_income) }}</text>
          </view>
          <view class="month-stat">
            <text class="stat-label">本月支出</text>
            <text class="stat-expense">-¥{{ formatMoney(summary.month_expense) }}</text>
          </view>
        </view>
      </view>

      <!-- 预算进度 -->
      <view class="budget-card card" v-if="budget && Number(budget.budget_amount) > 0">
        <view class="budget-header">
          <text class="budget-label">本月预算</text>
          <text class="budget-amount">¥{{ formatMoney(budget.budget_amount) }}</text>
        </view>
        <view class="progress-bar">
          <view
            class="progress-fill"
            :class="{ warning: Number(budget.used_percentage) >= 80, danger: Number(budget.used_percentage) >= 100 }"
            :style="{ width: Math.min(Number(budget.used_percentage || 0), 100) + '%' }"
          ></view>
        </view>
        <view class="budget-footer">
          <text class="budget-used">已使用 ¥{{ formatMoney(budget.used_amount) }}</text>
          <text class="budget-remaining" v-if="Number(budget.remaining_amount) > 0">
            剩余 ¥{{ formatMoney(budget.remaining_amount) }}
          </text>
          <text class="budget-over" v-else>
            已超支 ¥{{ formatMoney(Math.abs(Number(budget.remaining_amount))) }}
          </text>
        </view>
      </view>

      <!-- 收支切换 -->
      <view class="type-toggle">
        <view class="type-btn" :class="{ active: currentType === 'expense' }" @click="switchType('expense')">
          <text>支出</text>
        </view>
        <view class="type-btn" :class="{ active: currentType === 'income' }" @click="switchType('income')">
          <text>收入</text>
        </view>
      </view>

      <!-- 金额输入 -->
      <view class="amount-input-section">
        <text class="currency-symbol" :class="{ income: currentType === 'income' }">¥</text>
        <input
          class="amount-input"
          v-model="amount"
          type="digit"
          placeholder="0.00"
          adjust-position
        />
      </view>

      <!-- 分类选择 -->
      <view class="category-section">
        <text class="section-label">选择分类</text>
        <view class="category-grid">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ selected: selectedCategory && selectedCategory.id === cat.id }"
            @click="selectCategory(cat)"
          >
            <text class="cat-icon">{{ getIconEmoji(cat.icon) }}</text>
            <text class="cat-name">{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <!-- 备注输入 -->
      <view class="note-section">
        <input
          class="input note-input"
          v-model="note"
          placeholder="添加备注（可选）"
          type="text"
          maxlength="200"
          adjust-position
        />
      </view>

      <!-- 记一笔按钮 -->
      <button class="btn-confirm" :disabled="!canSubmit" @click="submitTransaction">记一笔</button>
    </view>

    <!-- 成功提示 -->
    <view v-if="showSuccess" class="success-overlay">
      <view class="success-box">
        <text class="success-icon">✓</text>
        <text class="success-text">记账成功</text>
      </view>
    </view>

    <!-- 新用户引导 -->
    <view v-if="showGuide" class="guide-overlay" @click="closeGuide">
      <view class="guide-box" @click.stop>
        <text class="guide-icon">💰</text>
        <text class="guide-title">欢迎使用随手记账！</text>
        <text class="guide-text">首次使用，请先进入"设置 → 支付账户管理"添加您的账户。</text>
        <button class="guide-btn" @click="closeGuide">知道了</button>
      </view>
    </view>
  </view>
</template>

<script>
import { home, category, transaction } from '@/utils/api.js'
import { showToast } from '@/utils/tools.js'

export default {
  data() {
    return {
      loading: true,
      currentType: 'expense',
      amount: '',
      categories: [],
      allCategories: { expense: [], income: [] },
      selectedCategory: null,
      note: '',
      summary: { balance: '0', month_income: '0', month_expense: '0' },
      budget: null,
      showSuccess: false,
      showGuide: false,
      statusBarHeight: 0
    }
  },
  computed: {
    canSubmit() {
      const num = parseFloat(this.amount)
      return !isNaN(num) && num > 0 && this.selectedCategory !== null
    }
  },
  onLoad() {
    const sys = uni.getSystemInfoSync()
    this.statusBarHeight = sys.statusBarHeight || 0
    this.loadData()
    this.checkNewUser()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    checkNewUser() {
      const isNew = uni.getStorageSync('ssj_new_user')
      if (isNew) {
        uni.removeStorageSync('ssj_new_user')
        this.showGuide = true
      }
    },
    closeGuide() {
      this.showGuide = false
    },
    async loadData() {
      this.loading = true
      try {
        const [summaryRes, budgetRes, expenseRes, incomeRes] = await Promise.all([
          home.getSummary(),
          home.getBudget(),
          category.list('expense'),
          category.list('income')
        ])
        if (summaryRes.success) this.summary = summaryRes.data
        if (budgetRes.success) this.budget = budgetRes.data
        if (expenseRes.success) {
          this.categories = expenseRes.data
          this.allCategories.expense = expenseRes.data
        }
        if (incomeRes.success) {
          this.allCategories.income = incomeRes.data
        }
      } catch (e) {
        showToast('加载失败', 2000, true)
      } finally {
        this.loading = false
      }
    },
    switchType(type) {
      this.currentType = type
      this.categories = this.allCategories[type] || []
      this.selectedCategory = null
      this.amount = ''
    },
    selectCategory(cat) {
      this.selectedCategory = cat
    },
    async submitTransaction() {
      const num = parseFloat(this.amount)
      if (isNaN(num) || num <= 0) {
        showToast('请输入金额', 2000, true)
        return
      }
      if (!this.selectedCategory) {
        showToast('请选择分类', 2000, true)
        return
      }
      try {
        const res = await transaction.create({
          type: this.currentType,
          amount: num,
          category_id: this.selectedCategory.id,
          note: this.note.trim() || undefined
        })
        if (res.success) {
          this.showSuccess = true
          setTimeout(() => {
            this.showSuccess = false
            this.amount = ''
            this.selectedCategory = null
            this.note = ''
            this.loadData()
          }, 1200)
        } else {
          showToast(res.message || '记账失败', 2000, true)
        }
      } catch (e) {
        showToast('网络错误', 2000, true)
      }
    },
    formatMoney(val) {
      return parseFloat(val || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
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
.home-page {
  min-height: 100vh;
  background: #f5fdf8;
  padding-bottom: 20px;
}

.loading-state {
  padding: 60px;
  text-align: center;
  color: #9ca3af;
}

.page-content {
  padding: 16px;
}

.balance-card {
  margin-bottom: 12px;
}

.balance-label {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-bottom: 4px;
}

.balance-amount {
  font-size: 14px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 12px;
}

.balance-month {
  display: flex;
  gap: 24px;
}

.month-stat {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
}

.stat-income {
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
}

.stat-expense {
  font-size: 13px;
  font-weight: 600;
  color: #ef4444;
}

.budget-card {
  margin-bottom: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0ebe4;
}

.budget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.budget-label {
  font-size: 12px;
  color: #9ca3af;
}

.budget-amount {
  font-size: 14px;
  font-weight: 700;
  color: #006c49;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: #006c49;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-fill.warning { background: #f59e0b; }
.progress-fill.danger { background: #ef4444; }

.budget-footer {
  display: flex;
  justify-content: space-between;
}

.budget-used, .budget-remaining, .budget-over {
  font-size: 12px;
  color: #9ca3af;
}

.budget-over { color: #ef4444; }

.type-toggle {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 16px;
  border: 1px solid #e0ebe4;
}

.type-btn {
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  transition: all 0.15s;
}

.type-btn.active {
  background: #006c49;
  color: #fff;
}

.amount-input-section {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e0ebe4;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.currency-symbol {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
  margin-right: 8px;
}

.currency-symbol.income { color: #10b981; }

.amount-input {
  flex: 1;
  font-size: 32px;
  font-weight: 700;
  color: #191c1a;
  border: none;
  background: transparent;
}

.amount-input::placeholder {
  color: #9ca3af;
}

.category-section {
  margin-bottom: 12px;
}

.section-label {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  display: block;
  margin-bottom: 8px;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  min-width: 60px;
  background: #fff;
  border: 1px solid #e0ebe4;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.category-item.selected {
  background: #d0f5e8;
  border-color: #006c49;
}

.cat-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.cat-name {
  font-size: 11px;
  color: #6c7972;
}

.category-item.selected .cat-name {
  color: #006c49;
  font-weight: 600;
}

.note-section {
  margin-bottom: 12px;
}

.note-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #d1ddd6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.btn-confirm {
  width: 100%;
  height: 48px;
  background: #006c49;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm[disabled] {
  background: #9ca3af;
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.success-box {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.success-icon {
  display: block;
  font-size: 48px;
  color: #10b981;
  margin-bottom: 12px;
}

.success-text {
  font-size: 18px;
  font-weight: 700;
  color: #191c1a;
}

.guide-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.guide-box {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 300px;
  margin: 20px;
}

.guide-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.guide-title {
  font-size: 18px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 12px;
}

.guide-text {
  font-size: 14px;
  color: #6c7972;
  display: block;
  margin-bottom: 20px;
  line-height: 1.5;
}

.guide-btn {
  background: #006c49;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 600;
}
</style>