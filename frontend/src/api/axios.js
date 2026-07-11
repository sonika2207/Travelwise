import axios from 'axios';

// Centralized Backend URL configuration.
// Fallbacks to production URL, but can be overridden by VITE_API_BASE_URL env variable.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://travelwise-backend-q6s1.onrender.com';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only attach token if it exists and the request is not for an auth endpoint
    if (token && !config.url?.includes('/auth/')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // On 401 Unauthorized (e.g. expired or invalid JWT), clear stale credentials
    // Use a custom event instead of window.location.href to avoid hard full-page reloads
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch a custom event — AuthContext listens for this and uses React Router navigate()
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
