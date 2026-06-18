import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const variationApi = {
  getAll: (params?: PaginationParams) => api.get('/variation-attributes', { params }),
  getById: (id: string) => api.get(`/variation-attributes/${id}`),
  create: (data: object) => api.post('/variation-attributes', data),
  update: (id: string, data: object) => api.put(`/variation-attributes/${id}`, data),
  delete: (id: string) => api.delete(`/variation-attributes/${id}`),
}
