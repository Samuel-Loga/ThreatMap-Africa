import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    return client.post('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => client.get('/auth/me'),
  updateMe: (data) => client.patch('/auth/me', data),
  setup2fa: () => client.post('/auth/2fa/setup'),
  verifySetup2fa: (code) => client.post('/auth/2fa/verify-setup', { code }),
  verify2fa: (pre_auth_token, code) => client.post('/auth/2fa/verify', { pre_auth_token, code }),
  disable2fa: (password) => client.post('/auth/2fa/disable', { password }),
}

export const indicatorsApi = {
  list: (params) => client.get('/indicators', { params }),
  get: (id) => client.get(`/indicators/${id}`),
  create: (data) => client.post('/indicators', data),
}

export const notificationsApi = {
  list: (params) => client.get('/notifications', { params }),
  markRead: (id) => client.post(`/notifications/${id}/read`),
  markAllRead: () => client.post('/notifications/read-all'),
}

export const exportApi = {
  stix: (params) => client.get('/export/stix', { params }),
}

export default client
