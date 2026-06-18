import api from '@/lib/axios'

export const holdApi = {
  getAll: () => api.get('/holds'),
  getById: (id: string) => api.get(`/holds/${id}`),
  create: (data: object) => api.post('/holds', data),
  delete: (id: string) => api.delete(`/holds/${id}`),
}
