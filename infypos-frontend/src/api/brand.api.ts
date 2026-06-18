import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const brandApi = {
  getAll: (params?: PaginationParams) => api.get('/brands', { params }),
  getById: (id: string) => api.get(`/brands/${id}`),
  create: (data: FormData) => api.post('/brands', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => api.put(`/brands/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/brands/${id}`),
}
