import httpClient from './httpClient';

const autosaveApi = {
  save: (documentId, payload) => httpClient.put(`/autosave/${documentId}`, payload),
  get: (documentId) => httpClient.get(`/autosave/${documentId}`),
  clear: (documentId) => httpClient.delete(`/autosave/${documentId}`),
};

export default autosaveApi;
