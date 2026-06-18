import api from '@/lib/axios'

export const productDistributionApi = {
  getAll:   (params?: any)                 => api.get('/product-distributions', { params }),
  getById:  (id: string)                   => api.get(`/product-distributions/${id}`),
  create:   (data: object)                 => api.post('/product-distributions', data),
  update:   (id: string, data: object)     => api.put(`/product-distributions/${id}`, data),
  delete:   (id: string)                   => api.delete(`/product-distributions/${id}`),
}
