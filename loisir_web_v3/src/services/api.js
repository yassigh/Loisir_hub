//src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Laravel API
const AUTH_BASE_URL = 'http://127.0.0.1:8001/api'; // Auth Service

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
const addAuthToken = (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
authApi.interceptors.request.use(addAuthToken);

export { api, authApi };