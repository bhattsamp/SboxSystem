import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

// ── Units ─────────────────────────────────────────────────────
export const unitApi = {
  getAll: (params?: PaginationParams) => api.get('/units', { params }),
  create: (data: object) => api.post('/units', data),
  update: (id: string, data: object) => api.put(`/units/${id}`, data),
  delete: (id: string) => api.delete(`/units/${id}`),
}

// ── Taxes ─────────────────────────────────────────────────────
export const taxApi = {
  getAll: () => api.get('/taxes'),
  create: (data: object) => api.post('/taxes', data),
  update: (id: string, data: object) => api.put(`/taxes/${id}`, data),
  delete: (id: string) => api.delete(`/taxes/${id}`),
}

// ── Barcode ───────────────────────────────────────────────────
export const barcodeApi = {
  getProducts: (warehouseId: string, search?: string) =>
    api.get('/barcode/products', { params: { warehouse: warehouseId, search } }),
  generate: (data: object) =>
    api.post('/barcode/generate', data),
  getTemplates: () =>
    api.get('/barcode/templates'),
}
