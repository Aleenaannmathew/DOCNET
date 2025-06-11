import axios from 'axios';
import { userApi } from '../constants/api';
import { logout, updateToken } from '../store/authSlice';
import store from '../store/store';

export const userAxios = axios.create({
  baseURL: userApi,
  headers: {
    'Content-Type': 'application/json',
  }
});

userAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Token",token)
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

    const responseStatus = error.response?.status;
    const errorDetail = error.response?.data?.detail;
    const errorCode = error.response?.data?.code;

 
    if (
      responseStatus === 403 &&
      (errorDetail === 'User is inactive' ||
       errorCode === 'user_inactive')
    ) 
  
    {
      console.log("hii")
      store.dispatch(logout());
      window.location.href = '/login?message=account_deactivated';
      return Promise.reject(error);
    }

  
    if (responseStatus === 403 && originalRequest.url.includes('logout')) {
      return Promise.reject(error);
    }

    
    if (responseStatus === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("**Hii")
      try {
        console.log("HHIIII")
        const refreshToken = localStorage.getItem('refreshToken');
        console.log("refreshToken", refreshToken)

        const response = await axios.post(
  'http://localhost:8000/api/token/refresh/', 
          { refresh: refreshToken },
          {
            headers: { 'Content-Type': 'application/json' },
            skipAuthRefresh: true,
          }
        );
        console.log(response.data)
        const { access, refresh} = response.data;
        store.dispatch(updateToken({ access, refresh }));
        localStorage.setItem('token', access);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return userAxios(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
