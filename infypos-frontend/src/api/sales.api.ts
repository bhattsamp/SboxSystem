import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const salesApi = {
  getAll: (params?: PaginationParams & { status?: string; paymentStatus?: string; customer?: string; warehouse?: string }) =>
    api.get('/sales', { params }),

  getById: (id: string) =>
    api.get(`/sales/${id}`),

  create: (data: object) =>
    api.post('/sales', data),

  update: (id: string, data: object) =>
    api.put(`/sales/${id}`, data),

  delete: (id: string) =>
    api.delete(`/sales/${id}`),

  addPayment: (id: string, data: object) =>
    api.post(`/sales/${id}/payment`, data),

  getInvoice: (id: string) =>
    api.get(`/sales/${id}/invoice`),

  sendInvoiceEmail: (id: string, email: string) =>
    api.post(`/sales/${id}/send-email`, { email }),

  getByCustomer: (customerId: string, params?: PaginationParams) =>
    api.get(`/sales/customer/${customerId}`, { params }),
}
