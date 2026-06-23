<template>
  <view class="register-page">
    <!-- 顶部导航 -->
    <view class="nav-bar safe-area-top">
      <view class="back-btn-wrap" @click="goBack">
        <text class="material-symbols-outlined back-icon">arrow_back_ios</text>
      </view>
      <text class="header-title">注册账户</text>
      <view style="width: 44px;"></view>
    </view>

    <view class="form-section">
      <view class="form-card">
        <view class="form-item">
          <text class="label">用户名</text>
          <input
            class="input"
            v-model="username"
            placeholder="请输入用户名（至少2个字符）"
            type="text"
            maxlength="50"
            adjust-position
          />
        </view>

        <view class="form-item">
          <text class="label">密码</text>
          <input
            class="input"
            v-model="password"
            placeholder="请输入密码（至少6个字符）"
            :password="!showPwd"
            type="text"
            maxlength="50"
            adjust-position
          />
        </view>

        <view class="form-item">
          <text class="label">确认密码</text>
          <input
            class="input"
            v-model="confirmPwd"
            placeholder="请再次输入密码"
            :password="!showPwd"
            type="text"
            maxlength="50"
            adjust-position
          />
        </view>

        <view class="agreement-row" @click="agreed = !agreed">
          <text class="checkbox">{{ agreed ? '☑' : '☐' }}</text>
          <text class="agreement-text">我已阅读并同意《服务协议》和《隐私政策》</text>
        </view>

        <button class="btn-register" :loading="loading" @click="handleRegister">注册</button>
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
      confirmPwd: '',
      agreed: false,
      showPwd: false,
      loading: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async handleRegister() {
      if (!this.username.trim() || this.username.trim().length < 2) {
        showToast('用户名至少需要2个字符', 2000, true)
        return
      }
      if (!this.password || this.password.length < 6) {
        showToast('密码至少需要6个字符', 2000, true)
        return
      }
      if (this.password !== this.confirmPwd) {
        showToast('两次输入的密码不一致', 2000, true)
        return
      }
      if (!this.agreed) {
        showToast('请阅读并同意服务协议和隐私政策', 2000, true)
        return
      }
      this.loading = true
      try {
        const res = await auth.register(this.username.trim(), this.password, this.username.trim())
        if (res.success) {
          uni.setStorageSync('ssj_new_user', 'true')
          showToast('注册成功！即将跳转到登录页...')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          showToast(res.message || '注册失败', 2000, true)
        }
      } catch (err) {
        showToast(err.message || '网络错误', 2000, true)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f5fdf8;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-top: calc(12px + constant(safe-area-inset-top));
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #ffffff;
  border-bottom: 1px solid #e0ebe4;
}

.back-btn-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 24px;
  color: #006c49;
}

.header-title {
  font-size: 17px;
  font-weight: 700;
  color: #191c1a;
}

.form-section {
  padding: 24px 20px;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e0ebe4;
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

.agreement-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px 0;
}

.checkbox {
  font-size: 20px;
  color: #006c49;
}

.agreement-text {
  font-size: 12px;
  color: #6c7972;
}

.btn-register {
  width: 100%;
  height: 50px;
  background: #006c49;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-register:active {
  background: #005c3d;
  transform: scale(0.98);
}
</style>