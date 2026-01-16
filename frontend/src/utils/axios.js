import axios from 'axios';

// Detectamos si estamos en localhost o en el dominio de Render
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const baseURL = isLocalhost 
  ? '/api' 
  : 'https://facturly-glt4.onrender.com/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
