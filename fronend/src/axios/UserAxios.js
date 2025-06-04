import axios from 'axios';
import { userApi } from '../constants/api';
import { logout } from '../store/authSlice';
import store from '../store/store';

export const userAxios = axios.create({
  baseURL: userApi,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

userAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


userAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
   
    if (
      error.response?.status === 403 || 
      (error.response?.status === 401 && 
       error.response?.data?.detail === 'Your account has been deactivated by admin.')
    ) {
      store.dispatch(logout());
      window.location.href = '/login?message=account_deactivated';
      return Promise.reject(error);
    }

    // Handle expired token scenario
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('No refresh token available');
          store.dispatch(logout());
          return Promise.reject(error);
        }
        console.log('Attempting token refresh...');
        const response = await axios.post(
          `${userApi}/token/refresh/`, 
          { refresh: refreshToken },
          { skipAuthRefresh: true } 
        );
        
        const { access } = response.data;
        store.dispatch(updateToken({ access }));
        originalRequest.headers.Authorization = `Bearer ${access}`;
        console.log('Token refreshed successfully');
        return axios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);