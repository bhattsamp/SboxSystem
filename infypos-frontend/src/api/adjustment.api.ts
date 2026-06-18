import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const adjustmentApi = {
  getAll: (params?: PaginationParams & { warehouse?: string }) => api.get('/adjustments', { params }),
  getById: (id: string) => api.get(`/adjustments/${id}`),
  create: (data: object) => api.post('/adjustments', data),
  delete: (id: string) => api.delete(`/adjustments/${id}`),
}
