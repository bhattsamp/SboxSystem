import api from '@/lib/axios'

export const languageApi = {
  getAll:             (params?: any)                           => api.get('/languages', { params }),
  getById:            (id: string)                             => api.get(`/languages/${id}`),
  create:             (data: object)                           => api.post('/languages', data),
  update:             (id: string, data: object)               => api.put(`/languages/${id}`, data),
  delete:             (id: string)                             => api.delete(`/languages/${id}`),
  toggle:             (id: string)                             => api.patch(`/languages/${id}/toggle`),
  getTranslations:    (id: string)                             => api.get(`/languages/${id}/translations`),
  updateTranslations: (id: string, section: string, data: Record<string, string>) =>
                        api.put(`/languages/${id}/translations`, { section, data }),
}
