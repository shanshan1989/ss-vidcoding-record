<template>
  <view class="statistics-page">
    <!-- 顶部选择器 -->
    <view class="nav-bar">
      <view class="nav-center">
        <picker mode="date" fields="month" :value="pickerDate" @change="onDateChange">
          <view class="date-picker">
            <text class="period-label">{{ year }}年{{ month }}月</text>
          </view>
        </picker>
      </view>
    </view>

    <scroll-view class="content-area" scroll-y>
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else class="content-body">
        <!-- 年度汇总卡片 -->
        <view class="summary-cards" v-if="yearlySummary">
          <view class="summary-card card">
            <text class="card-label">年度支出</text>
            <text class="card-amount expense">¥{{ formatMoney(yearlySummary.total_expense) }}</text>
          </view>
          <view class="summary-card card">
            <text class="card-label">年度收入</text>
            <text class="card-amount income">¥{{ formatMoney(yearlySummary.total_income) }}</text>
          </view>
          <view class="summary-card card wide">
            <text class="card-label">年度净余</text>
            <text class="card-amount" :class="yearlySummary.net >= 0 ? 'income' : 'expense'">
              ¥{{ formatMoney(yearlySummary.net) }}
            </text>
          </view>
        </view>

        <!-- 支出分类饼图 -->
        <view class="chart-card card">
          <text class="chart-title">支出构成</text>
          <view class="chart-area">
            <view class="pie-container">
              <canvas canvas-id="pieChart" id="pieChart" class="pie-canvas"></canvas>
              <view class="pie-center" v-if="pieTotal">
                <text class="pie-total-label">总支出</text>
                <text class="pie-total-value">¥{{ formatMoney(pieTotal) }}</text>
              </view>
            </view>
            <view class="pie-legend">
              <view
                v-for="(item, idx) in expenseData"
                :key="idx"
                class="legend-item"
              >
                <view class="legend-dot" :style="{ background: item.color }"></view>
                <text class="legend-name">{{ item.name }}</text>
                <text class="legend-amount">¥{{ formatMoney(item.value) }}</text>
                <text class="legend-pct">{{ item.percent }}%</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 支出 Top5 列表 -->
        <view class="chart-card card" v-if="topExpenses.length">
          <text class="chart-title">支出排行 Top5</text>
          <view
            v-for="(item, idx) in topExpenses"
            :key="idx"
            class="top-item"
          >
            <text class="top-rank">{{ idx + 1 }}</text>
            <text class="top-icon">{{ getIconEmoji(item.category && item.category.icon) }}</text>
            <view class="top-info">
              <text class="top-name">{{ item.category ? item.category.name : '未分类' }}</text>
              <text class="top-note">{{ item.note || '' }}</text>
            </view>
            <text class="top-amount">-¥{{ formatMoney(item.amount) }}</text>
          </view>
        </view>

        <!-- 每月趋势折线图 -->
        <view class="chart-card card">
          <text class="chart-title">每月收支趋势</text>
          <canvas canvas-id="lineChart" id="lineChart" class="line-canvas"></canvas>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { statistics } from '@/utils/api.js'

export default {
  data() {
    const now = new Date()
    return {
      year: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      pickerDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      loading: true,
      yearlySummary: null,
      expenseData: [],
      pieTotal: 0,
      topExpenses: [],
      trendData: { months: [], expense: [], income: [] }
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
      this.currentMonth = parseInt(m)
      this.pickerDate = date
      this.loadData()
    },
    async loadData() {
      this.loading = true
      try {
        const [summaryRes, categoryRes, topRes, trendRes] = await Promise.all([
          statistics.yearlySummary(this.year, this.currentMonth),
          statistics.expenseByCategory(this.year, this.currentMonth),
          statistics.topExpenses(this.year, this.currentMonth, 5),
          statistics.monthlyTrend(this.year)
        ])

        // Handle yearly summary
        if (summaryRes && summaryRes.success) {
          const d = summaryRes.data
          if (d && d.total_expense !== undefined) {
            this.yearlySummary = {
              total_expense: d.total_expense,
              total_income: d.total_income,
              net: parseFloat(d.total_income || 0) - parseFloat(d.total_expense || 0)
            }
          }
        }

        // Handle expense by category - API returns { data: { categories: [...] } }
        if (categoryRes && categoryRes.success) {
          const d = categoryRes.data
          if (d && d.categories && Array.isArray(d.categories)) {
            const total = d.total_expense || 0
            this.expenseData = d.categories.map(c => ({
              name: c.category_name || '其他',
              value: parseFloat(c.amount || 0),
              color: c.category_color || '#607D8B',
              percent: c.percentage || 0,
              category: { id: c.category_id, name: c.category_name, icon: c.category_icon }
            }))
            this.pieTotal = parseFloat(total)
          }
        }

        // Handle top expenses - API returns { data: { items: [...] } }
        if (topRes && topRes.success) {
          const d = topRes.data
          if (d && d.items && Array.isArray(d.items)) {
            this.topExpenses = d.items.map(item => ({
              id: item.id,
              amount: item.amount,
              note: item.note || '',
              category: {
                name: item.category_name || '未分类',
                icon: item.category_icon || 'more_horiz'
              }
            }))
          }
        }

        // Handle monthly trend - API returns { data: { months: [...] } }
        if (trendRes && trendRes.success) {
          const d = trendRes.data
          if (d && d.months && Array.isArray(d.months)) {
            this.trendData = this.processTrend(d.months)
          }
        }

        this.$nextTick(() => {
          this.drawPie()
          this.drawLine()
        })
      } catch (e) {
        console.error('Statistics load error:', e)
      } finally {
        this.loading = false
      }
    },
    processTrend(data) {
      // Backend returns [{ month: 1, income: '0.00', expense: '0.00' }, ...]
      if (!Array.isArray(data)) data = []
      const months = []
      const expense = []
      const income = []
      for (let m = 1; m <= 12; m++) {
        const found = data.find(d => parseInt(d.month) === m)
        months.push(m + '月')
        expense.push(found ? parseFloat(found.expense || 0) : 0)
        income.push(found ? parseFloat(found.income || 0) : 0)
      }
      return { months, expense, income }
    },
    drawPie() {
      if (!this.expenseData.length) return
      const ctx = uni.createCanvasContext('pieChart')
      const W = 160
      const H = 160
      const cx = W / 2
      const cy = H / 2
      const r = Math.min(W, H) / 2 - 4
      let startAngle = -Math.PI / 2
      this.expenseData.forEach(item => {
        const angle = (item.value / this.pieTotal) * Math.PI * 2
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, r, startAngle, startAngle + angle)
        ctx.closePath()
        ctx.setFillStyle(item.color)
        ctx.fill()
        startAngle += angle
      })
      ctx.draw()
    },
    drawLine() {
      const ctx = uni.createCanvasContext('lineChart')
      const W = uni.getSystemInfoSync().windowWidth - 60
      const H = 200
      const { months, expense, income } = this.trendData
      const max = Math.max(...expense, ...income, 1)
      const stepX = W / 11
      const h = H - 20

      function drawLine(data, color) {
        ctx.beginPath()
        ctx.setStrokeStyle(color)
        ctx.setLineWidth(2)
        data.forEach((v, i) => {
          const x = i * stepX + stepX / 2
          const y = h - (v / max) * (h - 20)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.stroke()

        data.forEach((v, i) => {
          const x = i * stepX + stepX / 2
          const y = h - (v / max) * (h - 20)
          ctx.beginPath()
          ctx.arc(x, y, 3, 0, Math.PI * 2)
          ctx.setFillStyle(color)
          ctx.fill()
        })
      }

      ctx.drawLine = drawLine
      ctx.clearRect(0, 0, W, H)
      drawLine(expense, '#ef4444')
      drawLine(income, '#3b82f6')
      ctx.draw()
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
.statistics-page {
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

.content-area {
  height: calc(100vh - 70px);
}

.loading-state {
  padding: 60px;
  text-align: center;
  color: #9ca3af;
}

.content-body {
  padding: 12px;
}

.summary-cards {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.summary-card {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 14px;
  text-align: center;
}

.summary-card.wide {
  flex-basis: 100%;
}

.card-label {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-bottom: 4px;
}

.card-amount {
  font-size: 18px;
  font-weight: 800;
}

.card-amount.expense { color: #ef4444; }
.card-amount.income { color: #10b981; }

.chart-card {
  padding: 16px;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 12px;
}

.chart-area {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.pie-container {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.pie-canvas {
  width: 160px;
  height: 160px;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-total-label {
  font-size: 11px;
  color: #9ca3af;
  display: block;
}

.pie-total-value {
  font-size: 14px;
  font-weight: 800;
  color: #ef4444;
}

.pie-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 12px;
  color: #6c7972;
}

.legend-amount {
  font-size: 12px;
  font-weight: 600;
  color: #ef4444;
}

.legend-pct {
  font-size: 11px;
  color: #9ca3af;
  width: 36px;
  text-align: right;
}

.top-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f7f3;
}

.top-item:last-child { border-bottom: none; }

.top-rank {
  width: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #9ca3af;
  text-align: center;
}

.top-icon { font-size: 22px; }

.top-info { flex: 1; }

.top-name {
  font-size: 13px;
  font-weight: 600;
  color: #191c1a;
  display: block;
}

.top-note {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.top-amount {
  font-size: 14px;
  font-weight: 700;
  color: #ef4444;
}

.line-canvas {
  width: 100%;
  height: 200px;
}
</style>