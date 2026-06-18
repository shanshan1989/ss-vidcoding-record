/**
 * API Service - 随手记账后端 API 调用
 */

const API_BASE_URL = 'http://localhost:3000/api';

const ApiService = {
  /**
   * 发送请求
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return { success: response.ok, data, status: response.status };
    } catch (error) {
      console.error('API 请求错误:', error);
      return { success: false, data: { message: '网络错误，请检查服务器是否运行' }, status: 0 };
    }
  },

  /**
   * 注册
   */
  async register({ username, password, nickname }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    });
  },

  /**
   * 登录
   */
  async login({ username, password }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// 保存用户信息到 localStorage
const UserSession = {
  KEY: 'ssj_user_session',

  save(userData) {
    localStorage.setItem(this.KEY, JSON.stringify(userData));
  },

  get() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  isLoggedIn() {
    return this.get() !== null;
  },
};

window.ApiService = ApiService;
window.UserSession = UserSession;
