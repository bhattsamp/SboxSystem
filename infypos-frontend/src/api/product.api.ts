import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const productApi = {
  getAll: (params?: PaginationParams & { category?: string; brand?: string; isActive?: boolean }) =>
    api.get('/products', { params }),

  getById: (id: string) =>
    api.get(`/products/${id}`),

  create: (data: FormData) =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData) =>
    api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id: string) =>
    api.delete(`/products/${id}`),

  getStock: (id: string) =>
    api.get(`/products/${id}/stock`),

  import: (file: FormData) =>
    api.post('/products/import', file, { headers: { 'Content-Type': 'multipart/form-data' } }),

  exportTemplate: () =>
    api.get('/products/export-template', { responseType: 'blob' }),
}
