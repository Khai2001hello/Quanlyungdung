import axiosInstance from './axios';

export const authAPI = {
  // Register with email/password
  async register(data) {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data.data; // Backend returns { success: true, data: { user, token } }
  },

  // Login with email/password
  async login(data) {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data.data; // Backend returns { success: true, data: { user, token } }
  },

  // Google OAuth - Redirect to backend
  googleLogin() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  },

  // Get current user profile
  async getProfile() {
    const response = await axiosInstance.get('/auth/profile');
    return response.data.data;
  },
};

