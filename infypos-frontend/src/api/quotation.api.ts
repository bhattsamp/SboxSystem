import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const quotationApi = {
  getAll: (params?: PaginationParams & { status?: string; customer?: string; warehouse?: string }) =>
    api.get('/quotations', { params }),
  getById: (id: string) => api.get(`/quotations/${id}`),
  create: (data: object) => api.post('/quotations', data),
  update: (id: string, data: object) => api.put(`/quotations/${id}`, data),
  delete: (id: string) => api.delete(`/quotations/${id}`),
  convert: (id: string) => api.post(`/quotations/${id}/convert`),
}
