// 随手记账 - API 服务（UniApp 版本）
// 统一封装所有后端接口调用

const BASE_URL = 'http://localhost:3000/api'

function getHeaders() {
  const session = uni.getStorageSync('ssj_user_session')
  const h = { 'Content-Type': 'application/json' }
  if (session && session.id) {
    h['Authorization'] = `Bearer ${session.id}`
  }
  return h
}

function request(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + endpoint,
      method,
      header: getHeaders(),
      data: body,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          if (res.statusCode === 401) {
            uni.removeStorageSync('ssj_user_session')
            uni.reLaunch({ url: '/pages/login/login' })
          }
          reject(res.data || { message: `请求失败 (${res.statusCode})` })
        }
      },
      fail: () => {
        reject({ message: '网络错误，请检查服务器是否运行' })
      }
    })
  })
}

// ============ 认证相关 ============
export const auth = {
  login(username, password) {
    return request('/auth/login', 'POST', { username, password })
  },
  register(username, password, nickname) {
    return request('/auth/register', 'POST', { username, password, nickname })
  }
}

// ============ 用户相关 ============
export const user = {
  getProfile() {
    return request('/users/me')
  },
  updateProfile(data) {
    return request('/users/me', 'PUT', data)
  }
}

// ============ 首页相关 ============
export const home = {
  getSummary() {
    return request('/home/summary')
  },
  getBudget() {
    return request('/home/budget')
  },
  saveBudget(data) {
    // POST /budgets 用于创建或更新预算
    return request('/budgets', 'POST', data)
  }
}

// ============ 分类相关 ============
export const category = {
  list(type) {
    return request(`/categories?type=${type}`)
  },
  create(data) {
    return request('/categories', 'POST', data)
  },
  update(id, data) {
    return request(`/categories/${id}`, 'PUT', data)
  },
  delete(id) {
    return request(`/categories/${id}`, 'DELETE')
  }
}

// ============ 账单相关 ============
export const transaction = {
  create(data) {
    return request('/transactions', 'POST', data)
  },
  getSummary(year, month) {
    return request(`/transactions/summary?year=${year}&month=${month}`)
  },
  list(year, month, type = 'all') {
    return request(`/transactions/list?year=${year}&month=${month}&type=${type}`)
  }
}

// ============ 账户相关 ============
export const account = {
  list() {
    return request('/accounts')
  },
  create(data) {
    return request('/accounts', 'POST', data)
  },
  update(id, data) {
    return request(`/accounts/${id}`, 'PUT', data)
  },
  delete(id) {
    return request(`/accounts/${id}`, 'DELETE')
  }
}

// ============ 预算相关 ============
export const budget = {
  list(yearMonth) {
    return request(`/budgets?year_month=${yearMonth}`)
  },
  create(data) {
    return request('/budgets', 'POST', data)
  }
}

// ============ 统计相关 ============
export const statistics = {
  yearlySummary(year, month) {
    return request(`/statistics/yearly-summary?year=${year}&month=${month}`)
  },
  expenseByCategory(year, month) {
    return request(`/statistics/expense-by-category?year=${year}&month=${month}`)
  },
  topExpenses(year, month, limit = 5) {
    return request(`/statistics/top-expenses?year=${year}&month=${month}&limit=${limit}`)
  },
  monthlyTrend(year) {
    return request(`/statistics/monthly-trend?year=${year}`)
  }
}

export default {
  auth,
  user,
  home,
  category,
  transaction,
  account,
  budget,
  statistics
}
