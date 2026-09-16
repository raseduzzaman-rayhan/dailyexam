import axios from 'axios';
import { getCurrentIdToken } from '../firebase/config.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Strip duplicate /api prefix & Attach Firebase ID Token
api.interceptors.request.use(
  async (config) => {
    // Normalize URL if it already begins with /api
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    // Attach Authorization header if not manually supplied
    if (!config.headers.Authorization && !config.headers.authorization) {
      try {
        const firebaseToken = await getCurrentIdToken();
        if (firebaseToken) {
          config.headers.Authorization = `Bearer ${firebaseToken}`;
        } else {
          // Fallback to legacy admin token if present in localStorage
          const legacyToken = localStorage.getItem('admin_token');
          if (legacyToken) {
            config.headers.Authorization = `Bearer ${legacyToken}`;
          }
        }
      } catch (tokenErr) {
        console.warn('[API Client] Token retrieval notice:', tokenErr.message);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
