// 随手记账 - Toast 工具

let toastTimer = null

export function showToast(message, duration = 2000, isError = false) {
  if (toastTimer) {
    clearTimeout(toastTimer)
    uni.hideToast()
  }
  uni.showToast({
    title: message,
    icon: isError ? 'none' : 'success',
    duration,
    mask: true
  })
  toastTimer = setTimeout(() => {
    uni.hideToast()
    toastTimer = null
  }, duration + 300)
}

export function showLoading(message = '加载中...') {
  uni.showLoading({ title: message, mask: true })
}

export function hideLoading() {
  uni.hideLoading()
}

export default { showToast, showLoading, hideLoading }
