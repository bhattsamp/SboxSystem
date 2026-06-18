import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const branchApi = {
  getAll: (params?: PaginationParams) =>
    api.get('/branches', { params }),
  getById: (id: string) =>
    api.get(`/branches/${id}`),
  create: (data: object) =>
    api.post('/branches', data),
  update: (id: string, data: object) =>
    api.put(`/branches/${id}`, data),
  delete: (id: string) =>
    api.delete(`/branches/${id}`),
}
