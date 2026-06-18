import axios from 'axios'
import { storage, TOKEN_KEY } from '@/utils/storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
})

// ── Request interceptor: attach JWT ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = storage.get<string>(TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle auth errors ─────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.remove(TOKEN_KEY)
      storage.remove('sbox_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
