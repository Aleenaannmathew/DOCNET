import axios from 'axios';
import { adminApi } from '../constants/Api';

export const adminAxios = axios.create({
  baseURL: adminApi,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
adminAxios.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
adminAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you could implement token refresh logic if needed
      // For now, just redirect to login on 401
      window.location.href = 'admin/admin-login';
    }
    
    return Promise.reject(error);
  }
);

