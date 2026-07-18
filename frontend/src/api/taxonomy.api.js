import httpClient from './httpClient';

export const categoriesApi = {
  list: () => httpClient.get('/taxonomy/categories'),
  create: (payload) => httpClient.post('/taxonomy/categories', payload),
  update: (id, payload) => httpClient.patch(`/taxonomy/categories/${id}`, payload),
  remove: (id) => httpClient.delete(`/taxonomy/categories/${id}`),
};

export const tagsApi = {
  list: () => httpClient.get('/taxonomy/tags'),
  create: (payload) => httpClient.post('/taxonomy/tags', payload),
  update: (id, payload) => httpClient.patch(`/taxonomy/tags/${id}`, payload),
  remove: (id) => httpClient.delete(`/taxonomy/tags/${id}`),
};
