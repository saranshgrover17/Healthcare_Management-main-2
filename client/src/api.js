import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5001/api' });
api.interceptors.request.use(cfg => {
  const token = window.__token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export default api;
