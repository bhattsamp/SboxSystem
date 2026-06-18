import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const grnApi = {
  getAll: (params?: PaginationParams & { status?: string; supplier?: string }) =>
    api.get('/grn', { params }),
  getById: (id: string) => api.get(`/grn/${id}`),
  create: (data: object) => api.post('/grn', data),
  update: (id: string, data: object) => api.put(`/grn/${id}`, data),
  delete: (id: string) => api.delete(`/grn/${id}`),
  complete: (id: string) => api.patch(`/grn/${id}/complete`),
}
