/**
 * Auth page interactions: password visibility toggle and form handling.
 */

(function () {
  "use strict";

  // API 基础配置
  const API_BASE_URL = 'http://localhost:3000/api';

  // ==================== 工具函数 ====================

  function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const toggleBtn = input.parentElement.querySelector('[data-toggle-password]');
    if (!toggleBtn) return;

    const icon = toggleBtn.querySelector('.material-symbols-outlined');

    if (input.type === "password") {
      input.type = "text";
      if (icon) icon.textContent = "visibility";
    } else {
      input.type = "password";
      if (icon) icon.textContent = "visibility_off";
    }
  }

  function attachPasswordToggles() {
    document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const inputId = btn.getAttribute('data-toggle-password');
        togglePassword(inputId);
      });
    });
  }

  function showOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    const panel = overlay.querySelector('div');
    if (panel) {
      panel.classList.remove('scale-90');
      panel.classList.add('scale-100');
    }
  }

  function hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }

  function showToast(message, isError = false) {
    // 移除已存在的 toast
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-message fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-lg py-md rounded-xl shadow-lg text-white font-body-md text-body-md transition-all duration-300';
    toast.style.backgroundColor = isError ? '#F44336' : '#4CAF50';
    toast.textContent = message;
    document.body.appendChild(toast);

    // 显示动画
    requestAnimationFrame(() => {
      toast.classList.add('opacity-100', 'translate-y-0');
      toast.classList.remove('opacity-0', '-translate-y-4');
    });

    // 3秒后自动移除
    setTimeout(() => {
      toast.classList.remove('opacity-100', 'translate-y-0');
      toast.classList.add('opacity-0', '-translate-y-4');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function setButtonLoading(btn, loading) {
    if (loading) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span>';
      btn.disabled = true;
      btn.classList.add('opacity-70');
    } else {
      btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
      btn.disabled = false;
      btn.classList.remove('opacity-70');
    }
  }

  // ==================== API 调用 ====================

  async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      console.error('API 请求错误:', error);
      return { success: false, data: { message: '网络错误，请检查服务器是否运行' }, status: 0 };
    }
  }

  function saveUserSession(userData) {
    localStorage.setItem('ssj_user_session', JSON.stringify(userData));
  }

  function getUserSession() {
    const data = localStorage.getItem('ssj_user_session');
    return data ? JSON.parse(data) : null;
  }

  function clearUserSession() {
    localStorage.removeItem('ssj_user_session');
  }

  // ==================== 登录表单 ====================

  function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // 检查是否已登录
    if (getUserSession()) {
      // 已登录，跳转到首页
      window.location.href = './pages/home.html';
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const btn = form.querySelector('button[type="submit"]');

      // 验证
      if (!username || !password) {
        showToast('请输入用户名和密码', true);
        return;
      }

      // 提交
      setButtonLoading(btn, true);

      try {
        const result = await apiRequest('/auth/login', 'POST', { username, password });

        if (result.success && result.data.success) {
          // 保存登录状态
          saveUserSession(result.data.data);
          showOverlay('successOverlay');
          setTimeout(() => {
            hideOverlay('successOverlay');
            window.location.href = './pages/home.html';
          }, 1500);
        } else {
          showToast(result.data.message || '登录失败', true);
        }
      } catch (error) {
        showToast('登录失败，请稍后重试', true);
      } finally {
        setButtonLoading(btn, false);
      }
    });

    attachPasswordToggles();
  }

  // ==================== 注册表单 ====================

  function initRegisterForm() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const terms = document.getElementById('terms').checked;
      const btn = form.querySelector('button[type="submit"]');

      // 验证
      if (!username || !password) {
        showToast('请填写所有必填项', true);
        return;
      }

      if (username.length < 2) {
        showToast('用户名至少需要2个字符', true);
        return;
      }

      if (password.length < 6) {
        showToast('密码至少需要6个字符', true);
        return;
      }

      if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', true);
        return;
      }

      if (!terms) {
        showToast('请阅读并同意服务协议和隐私政策', true);
        return;
      }

      // 提交
      setButtonLoading(btn, true);

      try {
        const result = await apiRequest('/auth/register', 'POST', {
          username,
          password,
          nickname: username
        });

        if (result.success && result.data.success) {
          // 标记新用户，注册成功后首次登录时显示引导提示
          localStorage.setItem('ssj_new_user', 'true');
          showToast('注册成功！即将跳转到登录页面...');
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 2000);
        } else {
          showToast(result.data.message || '注册失败', true);
        }
      } catch (error) {
        showToast('注册失败，请稍后重试', true);
      } finally {
        setButtonLoading(btn, false);
      }
    });

    attachPasswordToggles();
  }

  // ==================== 初始化 ====================

  document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initRegisterForm();
  });

  window.SSJAuth = {
    togglePassword,
    showOverlay,
    hideOverlay,
    showToast,
  };
})();
