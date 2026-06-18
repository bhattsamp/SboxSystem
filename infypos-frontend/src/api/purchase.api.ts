import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const purchaseApi = {
  getAll: (params?: PaginationParams & { status?: string; paymentStatus?: string; supplier?: string; documentType?: string }) =>
    api.get('/purchases', { params }),

  getById: (id: string) =>
    api.get(`/purchases/${id}`),

  create: (data: object) =>
    api.post('/purchases', data),

  update: (id: string, data: object) =>
    api.put(`/purchases/${id}`, data),

  delete: (id: string) =>
    api.delete(`/purchases/${id}`),

  addPayment: (id: string, data: object) =>
    api.post(`/purchases/${id}/payment`, data),

  updateStatus: (id: string, status: string) =>
    api.patch(`/purchases/${id}/status`, { status }),
}
