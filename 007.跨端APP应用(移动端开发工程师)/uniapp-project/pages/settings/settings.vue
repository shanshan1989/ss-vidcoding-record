<template>
  <view class="settings-page">
    <!-- 用户信息头部 -->
    <view class="profile-header card">
      <view class="avatar-wrap" @click="goEditProfile">
        <image
          class="avatar-img"
          :src="profile.avatar_url || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="avatar-overlay">
          <text class="material-symbols-outlined">photo_camera</text>
        </view>
      </view>
      <view class="profile-info">
        <text class="profile-name">{{ profile.nickname || profile.username || '未登录' }}</text>
        <text class="profile-signature">{{ profile.signature || '点击编辑个人资料' }}</text>
      </view>
      <text class="edit-profile-btn" @click="goEditProfile">编辑个人信息</text>
    </view>

    <!-- 预算设置 -->
    <view class="section">
      <view class="section-title">预算设置</view>
      <view class="card">
        <view class="budget-row">
          <text class="budget-label">本月预算</text>
          <view v-if="!editingBudget" class="budget-display" @click="startEditBudget">
            <text class="budget-value">¥{{ budgetInfo.budget_amount || '0.00' }}</text>
            <text class="material-symbols-outlined edit-icon">edit</text>
          </view>
          <view v-else class="budget-edit">
            <input
              class="input budget-input"
              v-model="budgetInput"
              type="digit"
              placeholder="输入预算金额"
            />
            <text class="confirm-btn" @click="saveBudgetFn">保存</text>
            <text class="cancel-btn" @click="cancelBudget">取消</text>
          </view>
        </view>
        <view class="progress-bar" v-if="Number(budgetInfo.budget_amount) > 0">
          <view
            class="progress-fill"
            :class="{ 'warning': Number(budgetInfo.used_percentage) >= 80, danger: Number(budgetInfo.used_percentage) >= 100 }"
            :style="{ width: Math.min(Number(budgetInfo.used_percentage || 0), 100) + '%' }"
          ></view>
        </view>
        <view class="budget-stats" v-if="Number(budgetInfo.budget_amount) > 0">
          <text>已使用 ¥{{ formatMoney(budgetInfo.used_amount) }}</text>
          <text>剩余 ¥{{ formatMoney(budgetInfo.remaining || '0') }}</text>
        </view>
      </view>
    </view>

    <!-- 账户管理 -->
    <view class="section">
      <view class="section-title-row">
        <text class="section-title">支付账户</text>
        <text class="add-btn" @click="openAddAccount">+ 添加</text>
      </view>
      <view class="card">
        <view
          v-for="acc in accounts"
          :key="acc.id"
          class="account-item"
          @click="editAccount(acc)"
        >
          <text class="acc-icon">{{ getAccIcon(acc.type) }}</text>
          <view class="acc-info">
            <text class="acc-name">{{ acc.name }}</text>
            <text class="acc-type">{{ getTypeName(acc.type) }}</text>
          </view>
          <text class="acc-balance" :class="{ negative: Number(acc.current_balance) < 0 }">
            ¥{{ formatMoney(acc.current_balance) }}
          </text>
        </view>
        <view v-if="!accounts.length" class="empty-text">暂无账户</view>
      </view>
    </view>

    <!-- 分类管理 -->
    <view class="section">
      <view class="section-title">分类管理</view>
      <view class="card">
        <view class="menu-item" @click="goCategories('expense')">
          <text class="menu-icon">🍜</text>
          <text class="menu-label">支出分类</text>
        </view>
        <view class="menu-item" @click="goCategories('income')">
          <text class="menu-icon">💰</text>
          <text class="menu-label">收入分类</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <button class="btn-logout" @click="handleLogout">退出登录</button>

    <!-- 账户弹窗 -->
    <view v-if="showAccountModal" class="modal-overlay" @click="closeAccountModal">
      <view class="modal-card" @click.stop>
        <text class="modal-title">{{ editingAccount ? '编辑账户' : '添加账户' }}</text>

        <view class="form-item">
          <text class="label">账户名称</text>
          <input class="input" v-model="accountForm.name" placeholder="如：微信钱包" />
        </view>

        <view class="form-item">
          <text class="label">账户类型</text>
          <picker :value="accountTypeIndex" :range="accountTypes" @change="onAccountTypeChange">
            <view class="input picker-value">{{ accountForm.type }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">当前余额</text>
          <input class="input" v-model="accountForm.current_balance" type="digit" placeholder="0.00" />
        </view>

        <view class="modal-actions">
          <button class="btn-outline" @click="closeAccountModal">取消</button>
          <button class="btn-primary" @click="saveAccountFn">保存</button>
        </view>

        <view v-if="editingAccount" class="delete-area">
          <text class="btn-danger-text" @click="deleteAccountFn">删除账户</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { user, home, account as accountApi } from '@/utils/api.js'

export default {
  data() {
    return {
      profile: {},
      budgetInfo: {},
      editingBudget: false,
      budgetInput: '',
      accounts: [],
      showAccountModal: false,
      editingAccount: null,
      accountForm: { name: '', type: 'cash', current_balance: '0' },
      accountTypes: ['cash', 'electronic', 'bank', 'credit', 'other'],
      accountTypeIndex: 0
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  methods: {
    async loadData() {
      try {
        const [profileRes, budgetRes, accountRes] = await Promise.all([
          user.getProfile(),
          home.getBudget(),
          accountApi.list()
        ])
        if (profileRes.success) {
          this.profile = profileRes.data
        }
        if (budgetRes.success) this.budgetInfo = budgetRes.data
        if (accountRes.success) this.accounts = accountRes.data
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    goEditProfile() {
      uni.navigateTo({ url: '/pages/edit-profile/edit-profile' })
    },
    goCategories(type) {
      uni.navigateTo({ url: `/pages/categories/categories?type=${type}` })
    },
    startEditBudget() {
      this.budgetInput = this.budgetInfo.budget_amount || ''
      this.editingBudget = true
    },
    cancelBudget() {
      this.editingBudget = false
    },
    async saveBudgetFn() {
      const val = parseFloat(this.budgetInput)
      if (isNaN(val) || val <= 0) {
        this.editingBudget = false
        return
      }
      const now = new Date()
      const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      try {
        const res = await home.saveBudget({ year_month: ym, budget_amount: val })
        if (res.success) {
          uni.showToast({ title: '预算已更新' })
          this.editingBudget = false
          this.loadData()
        }
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    openAddAccount() {
      this.editingAccount = null
      this.accountForm = { name: '', type: 'cash', current_balance: '0' }
      this.accountTypeIndex = 0
      this.showAccountModal = true
    },
    editAccount(acc) {
      this.editingAccount = acc
      this.accountForm = { name: acc.name, type: acc.type, current_balance: String(acc.current_balance) }
      this.accountTypeIndex = this.accountTypes.indexOf(acc.type)
      this.showAccountModal = true
    },
    closeAccountModal() {
      this.showAccountModal = false
      this.editingAccount = null
    },
    onAccountTypeChange(e) {
      this.accountTypeIndex = Number(e.detail.value)
      this.accountForm.type = this.accountTypes[this.accountTypeIndex]
    },
    async saveAccountFn() {
      if (!this.accountForm.name.trim()) {
        uni.showToast({ title: '请输入账户名称', icon: 'none' })
        return
      }
      const data = {
        name: this.accountForm.name.trim(),
        type: this.accountForm.type,
        current_balance: parseFloat(this.accountForm.current_balance) || 0
      }
      try {
        let res
        if (this.editingAccount) {
          res = await accountApi.update(this.editingAccount.id, data)
        } else {
          res = await accountApi.create({ ...data, initial_balance: data.current_balance })
        }
        if (res.success) {
          uni.showToast({ title: '保存成功' })
          this.closeAccountModal()
          this.loadData()
        }
      } catch (e) {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    async deleteAccountFn() {
      if (!this.editingAccount) return
      try {
        const res = await accountApi.delete(this.editingAccount.id)
        if (res.success) {
          uni.showToast({ title: '已删除' })
          this.closeAccountModal()
          this.loadData()
        }
      } catch (e) {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },
    handleLogout() {
      uni.removeStorageSync('ssj_user_session')
      uni.reLaunch({ url: '/pages/login/login' })
    },
    formatMoney(val) {
      return parseFloat(val || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    getAccIcon(type) {
      const map = { cash: '💵', electronic: '📱', bank: '🏦', credit: '💳', other: '📌' }
      return map[type] || '📌'
    },
    getTypeName(type) {
      const map = { cash: '现金', electronic: '电子钱包', bank: '银行卡', credit: '信用卡', other: '其他' }
      return map[type] || type
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5fdf8;
  padding: 12px;
  padding-bottom: 100px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  margin-bottom: 12px;
}

.avatar-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
}

.avatar-img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #e5f5ec;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.avatar-wrap:active .avatar-overlay { opacity: 1; }

.avatar-overlay .material-symbols-outlined {
  font-size: 20px;
  color: #fff;
}

.profile-info { flex: 1; }

.profile-name {
  font-size: 16px;
  font-weight: 700;
  color: #191c1a;
  display: block;
  margin-bottom: 4px;
}

.profile-signature {
  font-size: 12px;
  color: #9ca3af;
}

.arrow-icon {
  font-size: 22px;
  color: #9ca3af;
}

.edit-profile-btn {
  font-size: 14px;
  font-weight: 600;
  color: #006c49;
  padding: 8px 12px;
  background: #f0f7f3;
  border-radius: 8px;
}

.section { margin-bottom: 16px; }

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #6c7972;
  padding: 8px 0;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.add-btn {
  font-size: 13px;
  font-weight: 600;
  color: #006c49;
}

.budget-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.budget-label {
  font-size: 14px;
  color: #6c7972;
}

.budget-display {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.budget-value {
  font-size: 16px;
  font-weight: 700;
  color: #006c49;
}

.edit-icon {
  font-size: 16px;
  color: #9ca3af;
}

.budget-edit {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-input {
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #d1ddd6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
}

.confirm-btn {
  font-size: 13px;
  font-weight: 600;
  color: #006c49;
  white-space: nowrap;
}

.cancel-btn {
  font-size: 13px;
  color: #9ca3af;
  white-space: nowrap;
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

.budget-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f7f3;
  cursor: pointer;
}

.account-item:last-child { border-bottom: none; }

.acc-icon { font-size: 26px; }

.acc-info { flex: 1; }

.acc-name {
  font-size: 14px;
  font-weight: 600;
  color: #191c1a;
  display: block;
}

.acc-type { font-size: 12px; color: #9ca3af; }

.acc-balance {
  font-size: 14px;
  font-weight: 700;
  color: #006c49;
}

.acc-balance.negative { color: #ef4444; }

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid #f0f7f3;
  cursor: pointer;
}

.menu-item:last-child { border-bottom: none; }

.menu-icon { font-size: 22px; }

.menu-label {
  flex: 1;
  font-size: 14px;
  color: #191c1a;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f0f7f3;
}

.setting-item:last-child { border-bottom: none; }

.setting-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-icon { font-size: 22px; color: #6c7972; }

.setting-label {
  font-size: 14px;
  color: #191c1a;
}

.picker-display {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #6c7972;
}

.btn-logout {
  width: 100%;
  height: 48px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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

.form-item { margin-bottom: 14px; }

.label {
  font-size: 12px;
  font-weight: 600;
  color: #6c7972;
  display: block;
  margin-bottom: 6px;
}

.picker-value {
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d1ddd6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
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

.delete-area { margin-top: 12px; text-align: center; }

.btn-danger-text {
  font-size: 13px;
  color: #ef4444;
}

.empty-text {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 13px;
}
</style>