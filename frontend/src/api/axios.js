import axios from 'axios';
import { authUtils } from '../utils/auth';
import { toast } from 'sonner';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      const isAuthEndpoint = config.url.includes('/auth/login') || config.url.includes('/auth/register');
      
      switch (status) {
        case 401:
          // Only handle 401 for protected routes (not login/register)
          if (!isAuthEndpoint && authUtils.isAuthenticated()) {
            toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            authUtils.logout();
            window.location.href = '/login';
          }
          // Let login/register components handle their own 401 errors
          break;
        case 403:
          toast.error('Bạn không có quyền truy cập tài nguyên này.');
          break;
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        // Remove default case to let components handle their own errors
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

