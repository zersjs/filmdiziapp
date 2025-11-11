import apiClient from './client';

const authAPI = {
  // Register new user
  register: async (data) => {
    return await apiClient.post('/auth/register', data);
  },

  // Login user
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  // Logout user
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  // Get current user
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await apiClient.put(`/auth/reset-password/${token}`, { password });
  },

  // Update password
  updatePassword: async (passwords) => {
    return await apiClient.put('/auth/update-password', passwords);
  },

  // Verify email
  verifyEmail: async (token) => {
    return await apiClient.get(`/auth/verify-email/${token}`);
  },

  // Google OAuth
  googleAuth: (token) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  },

  // Facebook OAuth
  facebookAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`;
  },

  // Twitter OAuth
  twitterAuth: () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/twitter`;
  },
};

export default authAPI;
