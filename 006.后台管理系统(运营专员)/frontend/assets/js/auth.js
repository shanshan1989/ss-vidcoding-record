window.SSJAdmin = {
  // Toast 通知
  showToast(message, isError = false) {
    const id = 'toast-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.opacity = '0';
      setTimeout(() => div.remove(), 300);
    }, 3000);
  },

  // 密码显隐切换
  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  },

  // 按钮 loading 状态
  setButtonLoading(btn, loading) {
    if (loading) {
      btn.classList.add('btn-loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('btn-loading');
      btn.disabled = false;
    }
  },

  // 成功提示遮罩
  showSuccessOverlay(overlayId, message) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    const msg = overlay.querySelector('.success-message');
    if (msg) msg.textContent = message || '操作成功';
    overlay.style.display = 'flex';
    setTimeout(() => { overlay.style.display = 'none'; }, 1500);
  },

  // 隐藏成功遮罩
  hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) overlay.style.display = 'none';
  }
};
