<template>
  <view class="login-page">
    <!-- 顶部 Logo 区 -->
    <view class="logo-section">
      <view class="logo-icon">
        <text class="icon-text">💰</text>
      </view>
      <text class="app-name">随手记账</text>
      <text class="app-desc">个人财务管理</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="form-card">
        <view class="form-title">登录账户</view>

        <view class="form-item">
          <text class="label">用户名</text>
          <input
            class="input"
            v-model="username"
            placeholder="请输入用户名"
            type="text"
            maxlength="50"
            adjust-position
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <view class="password-wrap">
            <input
              class="input password-input"
              v-model="password"
              :password="!showPassword"
              placeholder="请输入密码"
              type="text"
              maxlength="50"
              adjust-position
            />
            <text class="eye-icon" @click="togglePassword">
              {{ showPassword ? '👁' : '👁‍🗨' }}
            </text>
          </view>
        </view>

        <button class="btn-login" :loading="loading" @click="handleLogin">
          登录
        </button>

        <view class="form-footer">
          <text class="link" @click="goRegister">还没有账户？立即注册</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { auth } from '@/utils/api.js'
import { showToast } from '@/utils/tools.js'

export default {
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      loading: false
    }
  },
  onLoad() {
    // 已登录则跳转到首页
    const session = uni.getStorageSync('ssj_user_session')
    if (session) {
      uni.switchTab({ url: '/pages/home/home' })
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async handleLogin() {
      if (!this.username.trim()) {
        showToast('请输入用户名', 2000, true)
        return
      }
      if (!this.password) {
        showToast('请输入密码', 2000, true)
        return
      }
      this.loading = true
      try {
        const res = await auth.login(this.username.trim(), this.password)
        if (res.success) {
          uni.setStorageSync('ssj_user_session', res.data)
          showToast('登录成功')
          setTimeout(() => {
            uni.switchTab({ url: '/pages/home/home' })
          }, 800)
        } else {
          showToast(res.message || '登录失败', 2000, true)
        }
      } catch (err) {
        showToast(err.message || '网络错误', 2000, true)
      } finally {
        this.loading = false
      }
    },
    goRegister() {
      uni.navigateTo({ url: '/pages/register/register' })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5f0 0%, #d0f5e8 50%, #b8e8d8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  padding-bottom: 40px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: #006c49;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,108,73,0.3);
}

.icon-text {
  font-size: 40px;
}

.app-name {
  font-size: 28px;
  font-weight: 800;
  color: #006c49;
  margin-bottom: 4px;
}

.app-desc {
  font-size: 13px;
  color: #6c7972;
}

.form-section {
  width: 100%;
  padding: 0 24px;
  flex: 1;
}

.form-card {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.form-title {
  font-size: 18px;
  font-weight: 700;
  color: #191c1a;
  margin-bottom: 24px;
  text-align: center;
}

.form-item {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #6c7972;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid #d1ddd6;
  border-radius: 12px;
  font-size: 16px;
  background: #ffffff;
  color: #191c1a;
}

.input:focus {
  border-color: #006c49;
  box-shadow: 0 0 0 2px rgba(0,108,73,0.1);
}

.input::placeholder {
  color: #9ca3af;
}

.password-wrap {
  position: relative;
}

.password-input {
  padding-right: 44px;
}

.eye-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  cursor: pointer;
}

.btn-login {
  width: 100%;
  height: 50px;
  background: #006c49;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-login:active {
  background: #005c3d;
  transform: scale(0.98);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.link {
  color: #006c49;
  font-size: 14px;
  font-weight: 500;
}
</style>