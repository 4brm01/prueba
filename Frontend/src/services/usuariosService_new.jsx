// src/services/usuariosService.jsx
import apiService from './apiService.jsx';
import authService from './authService.jsx';

const usuariosService = {
  // Obtener todos los usuarios
  async getUsuarios() {
    try {
      const response = await apiService.get('/api/users');
      console.log('[usuariosService] Get usuarios response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => ({
        ...u,
        name: u.nombre || u.name || u.username,
        role: (u.rol || u.role || 'usuario').toLowerCase(),
        rol: (u.rol || u.role || 'usuario').toLowerCase(),
        id: u.id_usuario || u.id,
        active: u.estado === 'Activo' || u.active !== false
      }));
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios:', error);
      return [];
    }
  },

  // Obtener un usuario por ID
  async getUsuarioById(id) {
    try {
      const response = await apiService.get(`/api/users/${id}`);
      console.log('[usuariosService] Get usuario by ID response:', response);
      
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error getting usuario by ID:', error);
      throw new Error(error.message || 'Error al obtener usuario');
    }
  },

  // Crear un nuevo usuario
  async createUsuario(userData) {
    try {
      const response = await apiService.post('/api/users', {
        nombre: userData.nombre,
        username: userData.username,
        password: userData.password,
        email: userData.email || null,
        telefono: userData.telefono || null,
        rol: userData.rol || 'usuario',
        id_centro: userData.id_centro || null,
        activo: userData.activo !== undefined ? userData.activo : true
      });
      console.log('[usuariosService] Create usuario response:', response);
      
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error creating usuario:', error);
      throw new Error(error.message || 'Error al crear usuario');
    }
  },

  // Actualizar un usuario existente
  async updateUsuario(id, userData) {
    try {
      const payload = {
        nombre: userData.nombre,
        username: userData.username,
        password: userData.password, // Siempre requerido
        email: userData.email || null,
        telefono: userData.telefono || null,
        rol: userData.rol || 'usuario',
        id_centro: userData.id_centro || null,
        activo: userData.activo !== undefined ? userData.activo : true
      };
      const response = await apiService.put(`/api/users/${id}`, payload);
      console.log('[usuariosService] Update usuario response:', response);
      
      return {
        ...response,
        name: response.nombre || response.name || response.username,
        role: (response.rol || response.role || 'usuario').toLowerCase(),
        rol: (response.rol || response.role || 'usuario').toLowerCase(),
        id: response.id_usuario || response.id,
        active: response.estado === 'Activo' || response.active !== false
      };
    } catch (error) {
      console.error('[usuariosService] Error updating usuario:', error);
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  // Eliminar un usuario
  async deleteUsuario(id) {
    try {
      const response = await apiService.delete(`/api/users/${id}`);
      console.log('[usuariosService] Delete usuario response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error deleting usuario:', error);
      throw new Error(error.message || 'Error al eliminar usuario');
    }
  },

  // Guardar usuario (crear o actualizar)
  async saveUsuario(userData) {
    try {
      if (userData.id || userData.id_usuario) {
        const id = userData.id || userData.id_usuario;
        return await this.updateUsuario(id, userData);
      } else {
        return await this.createUsuario(userData);
      }
    } catch (error) {
      console.error('[usuariosService] Error saving usuario:', error);
      throw new Error(error.message || 'Error al guardar usuario');
    }
  },

  // Obtener usuarios por centro
  async getUsuariosPorCentro(centroId) {
    try {
      const response = await apiService.get(`/api/users?centroId=${centroId}`);
      console.log('[usuariosService] Get usuarios por centro response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => ({
        ...u,
        name: u.nombre || u.name || u.username,
        role: (u.rol || u.role || 'usuario').toLowerCase(),
        rol: (u.rol || u.role || 'usuario').toLowerCase(),
        id: u.id_usuario || u.id,
        active: u.estado === 'Activo' || u.active !== false
      }));
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios por centro:', error);
      return [];
    }
  },

  // Obtener usuarios por rol
  async getUsuariosPorRol(rol) {
    try {
      const response = await apiService.get(`/api/users?rol=${rol}`);
      console.log('[usuariosService] Get usuarios por rol response:', response);
      
      const usuarios = Array.isArray(response) ? response : [];
      return usuarios.map(u => ({
        ...u,
        name: u.nombre || u.name || u.username,
        role: (u.rol || u.role || 'usuario').toLowerCase(),
        rol: (u.rol || u.role || 'usuario').toLowerCase(),
        id: u.id_usuario || u.id,
        active: u.estado === 'Activo' || u.active !== false
      }));
    } catch (error) {
      console.error('[usuariosService] Error getting usuarios por rol:', error);
      return [];
    }
  },

  // Validar login
  async validateLogin(username, password) {
    try {
      const result = await authService.login(username, password);
      if (result.success) {
        return result.user;
      } else {
        throw new Error(result.error || 'Error de autenticación');
      }
    } catch (error) {
      console.error('[usuariosService] Error validating login:', error);
      throw error;
    }
  },

  // Asignar centro a director
  async asignarCentroADirector(directorId, centro) {
    try {
      const response = await apiService.put(`/api/users/${directorId}`, {
        id_centro: centro.id_centro || centro.id
      });
      console.log('[usuariosService] Assign centro to director response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error assigning centro to director:', error);
      throw new Error(error.message || 'Error al asignar centro al director');
    }
  },

  // Desasignar centro de director
  async desasignarCentroDeDirector(directorId) {
    try {
      const response = await apiService.put(`/api/users/${directorId}`, {
        id_centro: null
      });
      console.log('[usuariosService] Unassign centro from director response:', response);
      return response;
    } catch (error) {
      console.error('[usuariosService] Error unassigning centro from director:', error);
      throw new Error(error.message || 'Error al desasignar centro del director');
    }
  }
};

export default usuariosService;
