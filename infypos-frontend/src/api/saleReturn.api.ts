import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const saleReturnApi = {
  getAll: (params?: PaginationParams & { customer?: string; warehouse?: string }) => api.get('/sale-returns', { params }),
  getById: (id: string) => api.get(`/sale-returns/${id}`),
  create: (data: object) => api.post('/sale-returns', data),
  delete: (id: string) => api.delete(`/sale-returns/${id}`),
}
