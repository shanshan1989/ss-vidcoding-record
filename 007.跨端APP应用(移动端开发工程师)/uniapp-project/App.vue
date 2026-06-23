<script>
export default {
  onLaunch() {
    // 检查登录状态
    const session = uni.getStorageSync('ssj_user_session')
    if (!session) {
      uni.reLaunch({ url: '/pages/login/login' })
    }
  },
  onShow() {},
  onHide() {}
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #f5fdf8;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  color: #191c1a;
}

/* 通用工具类 */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.flex-wrap { flex-wrap: wrap; }
.gap-xs { gap: 4px; }
.gap-sm { gap: 8px; }
.gap-md { gap: 16px; }
.gap-lg { gap: 24px; }
.p-sm { padding: 8px; }
.p-md { padding: 16px; }
.p-lg { padding: 24px; }
.m-sm { margin: 8px; }
.m-md { margin: 16px; }
.mt-sm { margin-top: 8px; }
.mt-md { margin-top: 16px; }
.mb-sm { margin-bottom: 8px; }
.mb-md { margin-bottom: 16px; }
.ml-auto { margin-left: auto; }
.text-sm { font-size: 12px; }
.text-base { font-size: 14px; }
.text-lg { font-size: 16px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-secondary { color: #6c7972; }
.text-primary { color: #006c49; }
.text-alert-red { color: #ef4444; }
.text-blue { color: #3b82f6; }
.bg-surface { background-color: #f5fdf8; }
.bg-white { background-color: #ffffff; }
.bg-primary { background-color: #006c49; }
.bg-primary-container { background-color: #d0f5e8; }
.bg-surface-container { background-color: #e5f5ec; }
.rounded-lg { border-radius: 12px; }
.rounded-xl { border-radius: 16px; }
.rounded-full { border-radius: 9999px; }
.shadow-card { box-shadow: 0px 2px 8px rgba(0,0,0,0.08); }
.border-b { border-bottom: 1px solid #e0ebe4; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.overflow-hidden { overflow: hidden; }
.overflow-scroll { overflow: scroll; }
.relative { position: relative; }
.absolute { position: absolute; }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bottom-0 { bottom: 0; }
.right-0 { right: 0; }
.left-0 { left: 0; }
.z-50 { z-index: 50; }
.z-100 { z-index: 100; }
.opacity-0 { opacity: 0; }
.pointer-events-none { pointer-events: none; }
.cursor-pointer { cursor: pointer; }

/* 按钮 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  outline: none;
}
.btn:active { transform: scale(0.97); }
.btn-primary { background-color: #006c49; color: #ffffff; }
.btn-primary:hover { background-color: #005c3d; }
.btn-outline { background-color: transparent; border: 1px solid #d1ddd6; color: #006c49; }
.btn-outline:hover { background-color: #f0f7f3; }
.btn-danger { background-color: #ef4444; color: #ffffff; }
.btn-danger:hover { background-color: #dc2626; }

/* 卡片 */
.card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #e0ebe4;
}

/* 输入框 */
.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1ddd6;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background-color: #ffffff;
}
.input:focus { border-color: #006c49; box-shadow: 0 0 0 2px rgba(0,108,73,0.1); }
.input::placeholder { color: #9ca3af; }

/* Badge */
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.badge-success { background: #d1fae5; color: #065f46; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-info { background: #dbeafe; color: #1e40af; }

/* Toast */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  color: #ffffff;
  background-color: #333333;
  box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
}
.toast-error { background-color: #ef4444; }
.toast-success { background-color: #10b981; }

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

/* 加载动画 */
@keyframes spin { to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }

/* 安全区域 */
.safe-area-bottom { padding-bottom: constant(safe-area-inset-bottom); padding-bottom: env(safe-area-inset-bottom); }
.safe-area-top { padding-top: constant(safe-area-inset-top); padding-top: env(safe-area-inset-top); }
</style>
