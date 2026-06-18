import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const transferApi = {
  getAll: (params?: PaginationParams) => api.get('/transfers', { params }),
  getById: (id: string) => api.get(`/transfers/${id}`),
  create: (data: object) => api.post('/transfers', data),
  delete: (id: string) => api.delete(`/transfers/${id}`),
}
