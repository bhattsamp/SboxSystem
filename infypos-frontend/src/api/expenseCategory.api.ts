import api from '@/lib/axios'
import type { PaginationParams } from '@/types/api.types'

export const expenseCategoryApi = {
  getAll: (params?: PaginationParams) => api.get('/expense-categories', { params }),
  getById: (id: string) => api.get(`/expense-categories/${id}`),
  create: (data: object) => api.post('/expense-categories', data),
  update: (id: string, data: object) => api.put(`/expense-categories/${id}`, data),
  delete: (id: string) => api.delete(`/expense-categories/${id}`),
}
