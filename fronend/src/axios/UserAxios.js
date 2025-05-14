import axios from 'axios';
import { userApi } from '../constants/api';

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