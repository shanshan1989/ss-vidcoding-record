window.SSJ = {
  API_BASE_URL: 'http://localhost:3001/api/admin',

  // 获取当前页面文件名
  getCurrentPage() {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1].replace('.html', '') || 'login';
  },

  // 高亮侧边栏当前导航
  highlightCurrentNav() {
    const current = this.getCurrentPage();
    document.querySelectorAll('.sidebar-nav-item').forEach(link => {
      const href = link.getAttribute('href');
      const target = href.replace(/^\.\//, '').replace('.html', '');
      if (target === current) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // 检查是否已登录
  isLoggedIn() {
    return !!sessionStorage.getItem('ssj_admin_session');
  },

  // 获取管理员会话
  getAdminSession() {
    const s = sessionStorage.getItem('ssj_admin_session');
    return s ? JSON.parse(s) : null;
  },

  // 保存管理员会话
  saveAdminSession(data) {
    sessionStorage.setItem('ssj_admin_session', JSON.stringify(data));
  },

  // 清除管理员会话
  clearAdminSession() {
    sessionStorage.removeItem('ssj_admin_session');
  },

  // 登出
  logout() {
    this.clearAdminSession();
    window.location.href = './login.html';
  },

  // API 请求核心方法
  async apiRequest(endpoint, method = 'GET', body = null) {
    const session = this.getAdminSession();
    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    // 发送 X-Admin-Id 头（开发环境跨域兼容，避免 Cookie SameSite 问题）
    if (session && session.id) {
      headers['X-Admin-Id'] = session.id;
    }
    const options = { method, headers, credentials: 'include' };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      let data;
      try { data = await response.json(); } catch { data = null; }
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      return { success: false, data: { message: '网络错误，请检查服务器是否运行' }, status: 0 };
    }
  },

  // 翻页辅助
  buildPageUrl(baseUrl, page, pageSize, otherParams = {}) {
    const params = new URLSearchParams({ page, pageSize, ...otherParams });
    return `${baseUrl}?${params.toString()}`;
  },

  // Toast 提示（依赖 auth.js）
  showToast(message, isError) {
    if (typeof window.SSJAdmin === 'undefined') return;
    if (window.SSJAdmin.showToast) window.SSJAdmin.showToast(message, isError);
  }
};

// 页面加载时自动高亮导航
document.addEventListener('DOMContentLoaded', () => {
  SSJ.highlightCurrentNav();
});
