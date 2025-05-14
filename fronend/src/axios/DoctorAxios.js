import axios from 'axios';
import { doctorApi } from '../constants/api';

export const doctorAxios = axios.create({
  baseURL: doctorApi,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

doctorAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or your token storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);