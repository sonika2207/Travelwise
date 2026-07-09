import axios from 'axios';

// The backend is running on http://localhost:8080
// API endpoints will be like /api/auth/login
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
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
    // On 401 Unauthorized (e.g. expired or invalid JWT), clear stale credentials and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
