import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const paymentMethodApi = {
  getAll: (params?: PaginationParams) => api.get('/payment-methods', { params }),
  getById: (id: string) => api.get(`/payment-methods/${id}`),
  create: (data: object) => api.post('/payment-methods', data),
  update: (id: string, data: object) => api.put(`/payment-methods/${id}`, data),
  delete: (id: string) => api.delete(`/payment-methods/${id}`),
}
