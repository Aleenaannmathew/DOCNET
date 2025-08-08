import axios from 'axios';
import { doctorApi } from '../constants/Api';
import { logout, updateToken } from '../store/authSlice';
import store from '../store/store';

export const doctorAxios = axios.create({
  baseURL: doctorApi,
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

    const responseStatus = error.response?.status;
    const errorDetail = error.response?.data?.detail;
    const errorCode = error.response?.data?.code;


  
    if (responseStatus === 403 && originalRequest.url.includes('logout')) {
      return Promise.reject(error);
    }

    
    if (responseStatus === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');

        const response = await axios.post(
  'http://127.0.0.1:8000/api/token/refresh/', 
          { refresh: refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            skipAuthRefresh: true,
          }
        );
        const { access, refresh} = response.data;
        store.dispatch(updateToken({ access, refresh }));
        localStorage.setItem('token', access);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return doctorAxios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
