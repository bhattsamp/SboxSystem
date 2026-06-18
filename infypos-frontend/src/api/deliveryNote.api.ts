import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const deliveryNoteApi = {
  getAll: (params?: PaginationParams & { status?: string; customer?: string }) =>
    api.get('/delivery-notes', { params }),
  getById: (id: string) => api.get(`/delivery-notes/${id}`),
  create: (data: object) => api.post('/delivery-notes', data),
  update: (id: string, data: object) => api.put(`/delivery-notes/${id}`, data),
  delete: (id: string) => api.delete(`/delivery-notes/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/delivery-notes/${id}/status`, { status }),
}
