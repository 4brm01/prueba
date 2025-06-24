import axios from 'axios';
import apiConfig from '../config/apiConfig.jsx';

const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRedirecting = false;

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 && !isRedirecting) {
        if (data.message && data.message.includes('Sesión expirada')) {
          isRedirecting = true;
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setTimeout(() => { isRedirecting = false; }, 1000);
          return Promise.reject(new Error('Sesión expirada'));
        }
      }
      if (status === 200 && data?.code === 403) {
        return Promise.reject(new Error(`Acceso prohibido: ${data.message || 'Sin detalles'}`));
      }
      return Promise.reject(new Error(data.message || 'Error en la solicitud al servidor'));
    }
    return Promise.reject(new Error('No se pudo conectar con el servidor'));
  }
);

const apiService = {
  async get(endpoint, params = {}) {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async post(endpoint, data) {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async put(endpoint, data) {
    try {
      const response = await apiClient.put(endpoint, data);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async delete(endpoint) {
    try {
      const response = await apiClient.delete(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default apiService;