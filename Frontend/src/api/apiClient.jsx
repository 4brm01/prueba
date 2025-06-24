import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://sistema-vacunacion-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token de autenticación (si es necesario)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // Ajusta según tu implementación
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default apiClient;