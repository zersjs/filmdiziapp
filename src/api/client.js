import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookie or localStorage
    const token = Cookies.get('token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Handle specific status codes
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          Cookies.remove('token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;

        case 404:
          // Not found
          console.error('Resource not found');
          break;

        case 429:
          // Too many requests
          console.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;

        default:
          break;
      }

      return Promise.reject(response.data);
    }

    // Network error
    if (error.message === 'Network Error') {
      console.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
