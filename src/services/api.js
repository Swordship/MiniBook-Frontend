import axios from 'axios';

// Create an axios instance
const api = axios.create({
  // Set the base URL for all requests
  baseURL: 'http://localhost:4000', // Your backend URL
});

export default api;