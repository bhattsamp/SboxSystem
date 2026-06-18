import api from '@/lib/axios'

export const dashboardApi = {
  getStats: () =>
    api.get('/dashboard/stats'),

  getSalesChart: (year?: number) =>
    api.get('/dashboard/sales-chart', { params: { year: year ?? new Date().getFullYear() } }),

  getCategoryChart: () =>
    api.get('/dashboard/category-chart'),

  getRecentSales: (limit = 5) =>
    api.get('/dashboard/recent-sales', { params: { limit } }),

  getLowStock: () =>
    api.get('/dashboard/low-stock'),
}
