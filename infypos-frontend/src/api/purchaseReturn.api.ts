import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const purchaseReturnApi = {
  getAll: (params?: PaginationParams & { supplier?: string; warehouse?: string }) => api.get('/purchase-returns', { params }),
  getById: (id: string) => api.get(`/purchase-returns/${id}`),
  create: (data: object) => api.post('/purchase-returns', data),
  delete: (id: string) => api.delete(`/purchase-returns/${id}`),
}
