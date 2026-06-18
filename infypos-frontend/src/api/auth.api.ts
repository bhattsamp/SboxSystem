import api from '@/lib/axios'

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.put('/auth/change-password', data),

  refreshToken: () =>
    api.post('/auth/refresh'),
}
