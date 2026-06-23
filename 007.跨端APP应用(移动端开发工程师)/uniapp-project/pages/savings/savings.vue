<template>
  <view class="savings-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <text class="material-symbols-outlined">arrow_back</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">储蓄详情</text>
      </view>
      <view class="nav-right"></view>
    </view>

    <scroll-view class="content-area" scroll-y>
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else class="content-body">
        <!-- 摘要卡片 -->
        <view class="summary-cards">
          <view class="summary-card card">
            <view class="card-header">
              <text class="card-label">储蓄总额</text>
              <text class="material-symbols-outlined icon-primary">account_balance_wallet</text>
            </view>
            <text class="card-amount">¥{{ formatMoney(savingsData.totalSavings) }}</text>
            <view class="card-trend">
              <text class="material-symbols-outlined trend-up">trending_up</text>
              <text class="trend-text">较上月增长 {{ savingsData.growthRate }}%</text>
            </view>
          </view>

          <view class="summary-card card">
            <view class="card-header">
              <text class="card-label">本月平均增长</text>
              <text class="material-symbols-outlined icon-secondary">show_chart</text>
            </view>
            <text class="card-amount">¥{{ formatMoney(savingsData.monthlyGrowth) }}</text>
            <text class="card-hint">稳定增长趋势</text>
          </view>

          <view class="summary-card card wide">
            <view class="card-header">
              <text class="card-label">储蓄目标进度</text>
              <text class="material-symbols-outlined icon-warning">flag</text>
            </view>
            <view class="goal-content">
              <view class="goal-stats">
                <text class="goal-target">¥{{ formatMoney(savingsData.savingsGoal) }} 目标</text>
                <text class="goal-percent">{{ savingsData.goalProgress }}%</text>
              </view>
              <view class="progress-bar">
                <view
                  class="progress-fill"
                  :style="{ width: Math.min(savingsData.goalProgress, 100) + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 储蓄趋势图表 -->
        <view class="chart-card card">
          <view class="chart-header">
            <text class="chart-title">{{ currentYear }}年储蓄趋势</text>
            <view class="chart-tabs">
              <view class="chart-tab active">
                <text>月度</text>
              </view>
              <view class="chart-tab">
                <text>季度</text>
              </view>
            </view>
          </view>

          <view class="bar-chart">
            <view
              v-for="(item, idx) in monthlyTrend"
              :key="idx"
              class="bar-item"
            >
              <view
                class="bar"
                :class="{ future: item.isFuture }"
                :style="{ height: item.percent + '%' }"
              ></view>
              <text class="bar-label">{{ item.month }}</text>
            </view>
          </view>
        </view>

        <!-- 资产分布 -->
        <view class="chart-card card">
          <text class="chart-title">资产分布</text>
          <view class="asset-list">
            <view
              v-for="asset in assetDistribution"
              :key="asset.type"
              class="asset-item"
            >
              <view class="asset-header">
                <view class="asset-left">
                  <view class="asset-icon" :style="{ background: asset.bgColor }">
                    <text :style="{ color: asset.color }">{{ asset.icon }}</text>
                  </view>
                  <text class="asset-name">{{ asset.name }}</text>
                </view>
                <text class="asset-balance">¥{{ formatMoney(asset.balance) }}</text>
              </view>
              <view class="progress-bar small">
                <view
                  class="progress-fill"
                  :style="{ width: asset.percent + '%', background: asset.color }"
                ></view>
              </view>
            </view>
          </view>
        </view>

        <!-- 财务洞察 -->
        <view class="insight-card card">
          <view class="insight-icon">
            <text class="material-symbols-outlined">lightbulb</text>
          </view>
          <view class="insight-content">
            <text class="insight-title">财务洞察</text>
            <text class="insight-text">{{ savingsData.insight }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { account } from '@/utils/api.js'
import { showToast } from '@/utils/tools.js'

export default {
  data() {
    const now = new Date()
    return {
      currentYear: now.getFullYear(),
      loading: true,
      savingsData: {
        totalSavings: 0,
        monthlyGrowth: 0,
        growthRate: 0,
        savingsGoal: 200000,
        goalProgress: 0,
        insight: '您的储蓄率目前保持在35%，高于上季度28%的平均水平。如果保持这个节奏，您将提前完成年度储蓄目标。'
      },
      monthlyTrend: [],
      assetDistribution: []
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await account.list()
        if (res.success) {
          const accounts = res.data || []
          this.calculateSavings(accounts)
          this.generateTrendData()
          this.generateAssetDistribution(accounts)
        }
      } catch (e) {
        showToast('加载失败', 2000, true)
      } finally {
        this.loading = false
      }
    },
    calculateSavings(accounts) {
      // 计算总储蓄
      let total = 0
      accounts.forEach(acc => {
        total += Number(acc.current_balance || 0)
      })
      this.savingsData.totalSavings = total

      // 计算月度增长（简化计算）
      this.savingsData.monthlyGrowth = total * 0.05 // 假设5%增长
      this.savingsData.growthRate = 12.5

      // 计算目标进度
      if (this.savingsData.savingsGoal > 0) {
        this.savingsData.goalProgress = Math.round((total / this.savingsData.savingsGoal) * 100)
      }
    },
    generateTrendData() {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      const now = new Date()
      const currentMonth = now.getMonth() + 1

      this.monthlyTrend = months.map((month, idx) => {
        const monthNum = idx + 1
        const isFuture = monthNum > currentMonth
        // 模拟数据：实际月份有数据，未来月份无数据
        const baseHeight = 30 + Math.random() * 50
        return {
          month,
          percent: isFuture ? 0 : baseHeight,
          isFuture
        }
      })
    },
    generateAssetDistribution(accounts) {
      const typeMap = {
        cash: { name: '现金', icon: '💵', color: '#1976D2', bgColor: '#E3F2FD' },
        electronic: { name: '电子钱包', icon: '📱', color: '#07C160', bgColor: '#E8F5E9' },
        bank: { name: '银行卡', icon: '🏦', color: '#9C27B0', bgColor: '#F3E5F5' },
        credit: { name: '信用卡', icon: '💳', color: '#F57C00', bgColor: '#FFF3E0' },
        other: { name: '其他', icon: '📌', color: '#607D8B', bgColor: '#ECEFF1' }
      }

      let total = this.savingsData.totalSavings || 1

      this.assetDistribution = accounts.map(acc => {
        const info = typeMap[acc.type] || typeMap.other
        const balance = Number(acc.current_balance || 0)
        return {
          type: acc.type,
          name: acc.name || info.name,
          icon: info.icon,
          color: info.color,
          bgColor: info.bgColor,
          balance: Math.abs(balance),
          percent: Math.round((Math.abs(balance) / Math.abs(total)) * 100)
        }
      })
    },
    goBack() {
      uni.navigateBack()
    },
    formatMoney(val) {
      return parseFloat(val || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }
  }
}
</script>

<style scoped>
.savings-page {
  min-height: 100vh;
  background: #f5fdf8;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e0ebe4;
}

.nav-left, .nav-right { width: 40px; }
.nav-left { display: flex; align-items: center; }
.nav-center { flex: 1; text-align: center; }
.nav-title { font-size: 17px; font-weight: 700; color: #191c1a; }

.content-area {
  height: calc(100vh - 60px);
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
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.summary-card {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 14px;
  min-height: 100px;
}

.summary-card.wide {
  flex-basis: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.card-label {
  font-size: 12px;
  color: #9ca3af;
}

.icon-primary { font-size: 20px; color: #006c49; }
.icon-secondary { font-size: 20px; color: #6c7972; }
.icon-warning { font-size: 20px; color: #f59e0b; }

.card-amount {
  font-size: 20px;
  font-weight: 800;
  color: #191c1a;
  display: block;
  margin-bottom: 4px;
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  font-size: 14px;
  color: #10b981;
}

.trend-text {
  font-size: 11px;
  color: #10b981;
}

.card-hint {
  font-size: 11px;
  color: #9ca3af;
}

.goal-content {
  margin-top: 4px;
}

.goal-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.goal-target {
  font-size: 12px;
  color: #9ca3af;
}

.goal-percent {
  font-size: 14px;
  font-weight: 700;
  color: #006c49;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar.small {
  height: 4px;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: #006c49;
  border-radius: 3px;
  transition: width 0.3s;
}

.chart-card {
  padding: 16px;
  margin-bottom: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #191c1a;
}

.chart-tabs {
  display: flex;
  gap: 4px;
}

.chart-tab {
  padding: 4px 12px;
  border-radius: 12px;
  background: #f5fdf8;
  font-size: 12px;
  color: #6c7972;
}

.chart-tab.active {
  background: #006c49;
  color: #fff;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120px;
  padding: 0 8px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  height: 100%;
  justify-content: flex-end;
}

.bar {
  width: 20px;
  background: #006c49;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.bar.future {
  background: #e5e7eb;
}

.bar-label {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

.asset-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-item {
  display: flex;
  flex-direction: column;
}

.asset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.asset-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.asset-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.asset-name {
  font-size: 14px;
  color: #191c1a;
}

.asset-balance {
  font-size: 14px;
  font-weight: 700;
  color: #191c1a;
}

.insight-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 108, 73, 0.05);
  border: 1px solid rgba(0, 108, 73, 0.1);
}

.insight-icon {
  width: 40px;
  height: 40px;
  background: #006c49;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon .material-symbols-outlined {
  font-size: 20px;
  color: #fff;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 13px;
  font-weight: 700;
  color: #006c49;
  display: block;
  margin-bottom: 4px;
}

.insight-text {
  font-size: 13px;
  color: #6c7972;
  line-height: 1.5;
}
</style>