import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const categoryApi = {
  getTree: () => api.get('/categories/tree'),
  getAll: (params?: PaginationParams & { parentCategory?: string }) => api.get('/categories', { params }),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: object) => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}
