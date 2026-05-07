import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── League endpoints ──────────────────────────────────────────
export const createLeague = (data) =>
  api.post('/leagues/create', data).then((r) => r.data);

export const joinLeague = (data) =>
  api.post('/leagues/join', data).then((r) => r.data);

export const getLeague = (id) =>
  api.get(`/leagues/${id}`).then((r) => r.data);

// ── Match endpoints ───────────────────────────────────────────
export const playMatch = (data) =>
  api.post('/matches/play', data).then((r) => r.data);

export default api;
