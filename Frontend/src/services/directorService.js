// src/services/directorService.js
import apiService from './apiService';

const directorService = {
  // Obtener los centros asignados a un director por su ID de usuario
  async getCentrosAsignados(id_usuario) {
    try {
      // Suponiendo que el backend tiene este endpoint:
      // /api/directores/:id_usuario/centros
      const centros = await apiService.get(`/api/directores/${id_usuario}/centros`);
      return Array.isArray(centros) ? centros : [centros];
    } catch (error) {
      console.error('Error fetching centros asignados al director:', error);
      return [];
    }
  },

  // Obtener todos los directores (si el backend lo permite)
  async getDirectores() {
    try {
      const directores = await apiService.get('/api/directores');
      return Array.isArray(directores) ? directores : [directores];
    } catch (error) {
      console.error('Error fetching directores:', error);
      return [];
    }
  },
};

export default directorService;
