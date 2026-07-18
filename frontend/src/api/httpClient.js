import axios from 'axios';

/**
 * Shared Axios instance. The host application should inject its own
 * auth token/interceptor here (e.g. attach a JWT from its existing
 * auth store) - this module does not manage authentication itself.
 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_EDITOR_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Placeholder hook point for host app token injection:
// httpClient.interceptors.request.use((config) => {
//   const token = hostAuthStore.getToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

httpClient.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Request failed';
    return Promise.reject({ message, status: err.response?.status, details: err.response?.data?.details });
  }
);

export default httpClient;
