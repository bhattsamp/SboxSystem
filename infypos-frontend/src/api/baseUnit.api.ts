import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const baseUnitApi = {
  getAll: (params?: PaginationParams) => api.get('/base-units', { params }),
  getById: (id: string) => api.get(`/base-units/${id}`),
  create: (data: object) => api.post('/base-units', data),
  update: (id: string, data: object) => api.put(`/base-units/${id}`, data),
  delete: (id: string) => api.delete(`/base-units/${id}`),
}
