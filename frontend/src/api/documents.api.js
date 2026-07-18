import httpClient from './httpClient';

const documentsApi = {
  list: (params) => httpClient.get('/documents', { params }),
  search: (q, params) => httpClient.get('/documents/search', { params: { q, ...params } }),
  dashboard: (params) => httpClient.get('/documents/dashboard', { params }),
  getOne: (id) => httpClient.get(`/documents/${id}`),
  create: (payload) => httpClient.post('/documents', payload),
  update: (id, payload) => httpClient.patch(`/documents/${id}`, payload),
  remove: (id) => httpClient.delete(`/documents/${id}`),
  duplicate: (id) => httpClient.post(`/documents/${id}/duplicate`),
  archive: (id) => httpClient.post(`/documents/${id}/archive`),
  restore: (id) => httpClient.post(`/documents/${id}/restore`),
};

export default documentsApi;
