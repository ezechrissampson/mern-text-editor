import httpClient from './httpClient';

const revisionsApi = {
  list: (documentId, params) => httpClient.get(`/documents/${documentId}/revisions`, { params }),
  compare: (documentId, from, to) => httpClient.get(`/documents/${documentId}/revisions/compare`, { params: { from, to } }),
  restore: (documentId, revisionNumber) => httpClient.post(`/documents/${documentId}/revisions/${revisionNumber}/restore`),
};

export default revisionsApi;
