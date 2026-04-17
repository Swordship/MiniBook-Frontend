import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Your backend URL
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;