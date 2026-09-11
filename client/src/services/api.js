import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ─── Request interceptor: attach JWT ───
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle errors globally ───
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error (no response from server)
    if (!error.response) {
      toast.error('Connection lost. Please check your internet.', { id: 'network-error' });
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = data?.message || 'Something went wrong';

    switch (status) {
      case 401:
        // Token expired or invalid — auto-logout
        localStorage.removeItem('dms_token');
        localStorage.removeItem('dms_user');
        toast.error('Session expired. Please login again.', { id: 'session-expired' });
        // Only redirect if not already on a login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        break;

      case 403:
        toast.error('Access denied. You do not have permission.', { id: 'access-denied' });
        break;

      case 500:
        toast.error('Server error. Please try again later.', { id: 'server-error' });
        break;

      // 400, 404, etc. — let individual callers handle with their own toast
      default:
        break;
    }

    return Promise.reject(error);
  }
);

export default API;
