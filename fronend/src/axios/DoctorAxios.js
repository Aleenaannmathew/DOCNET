import axios from 'axios';
import { doctorApi } from '../constants/api';
import { logout, updateToken } from '../store/authSlice';
import store from '../store/store';

export const doctorAxios = axios.create({
  baseURL: doctorApi,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

doctorAxios.interceptors.request.use(
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


doctorAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log('No refresh token available');
          store.dispatch(logout());
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${doctorApi}/token/refresh/`, 
          { refresh: refreshToken },
          { skipAuthRefresh: true,
            timeout: 50000
           } 
        );
        
        const { access } = response.data;
        
        store.dispatch(updateToken({access}));
        originalRequest.headers.Authorization = `Bearer ${access}`;
        console.log('Token refreshed successfully')
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed: ', refreshError)
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);