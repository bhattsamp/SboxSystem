import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const voucherTypeApi = {
  getAll: (params?: PaginationParams & { module?: string }) =>
    api.get('/voucher-types', { params }),
  getById: (id: string) => api.get(`/voucher-types/${id}`),
  create: (data: object) => api.post('/voucher-types', data),
  update: (id: string, data: object) => api.put(`/voucher-types/${id}`, data),
  delete: (id: string) => api.delete(`/voucher-types/${id}`),
}
