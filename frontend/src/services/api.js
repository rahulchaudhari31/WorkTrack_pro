// Axios instance with JWT interceptors
import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
      toast.error('Cannot connect to server. Please check if backend is running on port 8000.');
      return Promise.reject(err);
    }
    
    const msg = err.response?.data?.message || 'Something went wrong';
    
    if (err.response?.status === 401) {
      localStorage.removeItem('wt_token');
      window.location.href = '/login';
    } else if (err.response?.status !== 404) {
      // Don't show toast for 404 errors
      toast.error(msg);
    }
    
    return Promise.reject(err);
  }
);

export default api;
