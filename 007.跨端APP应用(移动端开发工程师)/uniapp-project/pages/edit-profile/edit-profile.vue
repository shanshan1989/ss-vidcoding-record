<template>
  <view class="edit-profile-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="nav-title">编辑资料</text>
      <view style="width:40px;"></view>
    </view>

    <view class="content">
      <!-- 头像 -->
      <view class="avatar-section">
        <view class="avatar-wrap" @click="chooseAvatar">
          <image
            class="avatar-img"
            :src="avatarUrl || '/static/default-avatar.png'"
            mode="aspectFill"
          />
          <view class="avatar-overlay">
            <text class="material-symbols-outlined cam-icon">photo_camera</text>
          </view>
        </view>
        <text class="avatar-tip">点击更换头像</text>
      </view>

      <!-- 表单 -->
      <view class="form-section card">
        <view class="form-item">
          <text class="label">昵称</text>
          <input
            class="input"
            v-model="form.nickname"
            placeholder="请输入昵称"
            maxlength="50"
          />
        </view>
        <view class="form-item">
          <text class="label">个性签名</text>
          <input
            class="input"
            v-model="form.signature"
            placeholder="一句话介绍自己"
            maxlength="100"
          />
        </view>
      </view>

      <!-- 保存按钮 -->
      <button class="btn-save" :loading="saving" @click="saveProfile">保存</button>
    </view>
  </view>
</template>

<script>
import { user } from '@/utils/api.js'

export default {
  data() {
    return {
      profile: {},
      form: { nickname: '', signature: '' },
      avatarUrl: '',
      saving: false
    }
  },
  onLoad() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const res = await user.getProfile()
        if (res.success) {
          this.profile = res.data
          this.form.nickname = res.data.nickname || ''
          this.form.signature = res.data.signature || ''
          this.avatarUrl = res.data.avatar_url || ''
        }
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempPath = res.tempFilePaths[0]
          // 限制5MB
          if (res.tempFiles[0].size > 5 * 1024 * 1024) {
            uni.showToast({ title: '图片大小不能超过5MB', icon: 'none' })
            return
          }
          // 读取为 base64
          const fs = uni.getFileSystemManager()
          fs.readFile({
            filePath: tempPath,
            encoding: 'base64',
            success: (readRes) => {
              this.avatarUrl = 'data:image/jpeg;base64,' + readRes.data
            },
            fail: () => {
              // fallback: 使用临时路径（仅 App 端支持）
              this.avatarUrl = tempPath
            }
          })
        }
      })
    },
    async saveProfile() {
      if (!this.form.nickname.trim()) {
        uni.showToast({ title: '请输入昵称', icon: 'none' })
        return
      }
      this.saving = true
      try {
        const data = {
          nickname: this.form.nickname.trim(),
          signature: this.form.signature.trim()
        }
        // 头像已经是 base64 data URL 格式
        if (this.avatarUrl && this.avatarUrl.startsWith('data:')) {
          data.avatar_url = this.avatarUrl
        }
        const res = await user.updateProfile(data)
        if (res.success) {
          uni.showToast({ title: '保存成功' })
          setTimeout(() => uni.navigateBack(), 800)
        } else {
          uni.showToast({ title: res.message || '保存失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        this.saving = false
      }
    },
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: #f5fdf8;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #e0ebe4;
}

.back-btn { font-size: 16px; color: #006c49; width: 40px; }
.nav-title { font-size: 17px; font-weight: 700; color: #191c1a; }

.content {
  padding: 24px 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.avatar-img {
  width: 80px;
  height: 80px;
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

.cam-icon { font-size: 24px; color: #fff; }

.avatar-tip {
  font-size: 12px;
  color: #9ca3af;
}

.form-section {
  margin-bottom: 20px;
  padding: 20px;
}

.form-item { margin-bottom: 16px; }
.form-item:last-child { margin-bottom: 0; }

.label {
  font-size: 13px;
  font-weight: 600;
  color: #6c7972;
  display: block;
  margin-bottom: 6px;
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

.btn-save {
  width: 100%;
  height: 48px;
  background: #006c49;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
