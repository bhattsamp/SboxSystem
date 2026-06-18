import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

// ── Customers ─────────────────────────────────────────────────
export const customerApi = {
  getAll: (params?: PaginationParams) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: object) => api.post('/customers', data),
  update: (id: string, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  getLedger: (id: string) => api.get(`/customers/${id}/ledger`),
}

// ── Suppliers ─────────────────────────────────────────────────
export const supplierApi = {
  getAll: (params?: PaginationParams) => api.get('/suppliers', { params }),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: object) => api.post('/suppliers', data),
  update: (id: string, data: object) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
  getLedger: (id: string) => api.get(`/suppliers/${id}/ledger`),
}

// ── Warehouses ────────────────────────────────────────────────
export const warehouseApi = {
  getAll: (params?: PaginationParams) => api.get('/warehouses', { params }),
  getById: (id: string) => api.get(`/warehouses/${id}`),
  create: (data: object) => api.post('/warehouses', data),
  update: (id: string, data: object) => api.put(`/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
}

// ── Users ─────────────────────────────────────────────────────
export const userApi = {
  getAll: (params?: PaginationParams) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post('/users', data),
  update: (id: string, data: object) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  updateProfile: (data: FormData) =>
    api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Roles ─────────────────────────────────────────────────────
export const roleApi = {
  getAll: () => api.get('/roles'),
  create: (data: object) => api.post('/roles', data),
  update: (id: string, data: object) => api.put(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
}

// ── Reports ───────────────────────────────────────────────────
export const reportApi = {
  getSalesReport: (params: object) => api.get('/reports/sales', { params }),
  getPurchaseReport: (params: object) => api.get('/reports/purchases', { params }),
  getStockReport: (params: object) => api.get('/reports/stock', { params }),
  getProfitLoss: (params: object) => api.get('/reports/profit-loss', { params }),
  getExpenseReport: (params: object) => api.get('/reports/expenses', { params }),
  exportSales: (params: object) => api.get('/reports/sales/export', { params, responseType: 'blob' }),
  exportStock: (params: object) => api.get('/reports/stock/export', { params, responseType: 'blob' }),
}

// ── Stock ─────────────────────────────────────────────────────
export const stockApi = {
  getAll: (params?: PaginationParams & { warehouse?: string; category?: string; status?: string }) =>
    api.get('/stock', { params }),
  adjust: (data: object) => api.post('/stock/adjust', data),
  transfer: (data: object) => api.post('/stock/transfer', data),
  getLowStock: () => api.get('/stock/low-stock'),
}

// ── Settings ──────────────────────────────────────────────────
export const settingApi = {
  get: () => api.get('/settings'),
  update: (data: FormData) =>
    api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ── Notifications ─────────────────────────────────────────────
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ── Expenses ──────────────────────────────────────────────────
export const expenseApi = {
  getAll: (params?: PaginationParams & { category?: string }) => api.get('/expenses', { params }),
  create: (data: object) => api.post('/expenses', data),
  update: (id: string, data: object) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
}

// ── Payments ──────────────────────────────────────────────────
export const paymentApi = {
  getSalePayments: (saleId: string) => api.get(`/payments/sale/${saleId}`),
  getPurchasePayments: (purchaseId: string) => api.get(`/payments/purchase/${purchaseId}`),
  delete: (id: string) => api.delete(`/payments/${id}`),
}

// ── Invoice ───────────────────────────────────────────────────
export const invoiceApi = {
  getSettings: () => api.get('/invoice/settings'),
  updateSettings: (data: object) => api.put('/invoice/settings', data),
  generate: (saleId: string, template?: string) =>
    api.get(`/invoice/generate/${saleId}`, { params: { template }, responseType: 'blob' }),
}
