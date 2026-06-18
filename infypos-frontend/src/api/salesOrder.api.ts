import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const salesOrderApi = {
  getAll: (params?: PaginationParams & { status?: string; customer?: string }) =>
    api.get('/sales-orders', { params }),
  getById: (id: string) => api.get(`/sales-orders/${id}`),
  create: (data: object) => api.post('/sales-orders', data),
  update: (id: string, data: object) => api.put(`/sales-orders/${id}`, data),
  delete: (id: string) => api.delete(`/sales-orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/sales-orders/${id}/status`, { status }),
}
