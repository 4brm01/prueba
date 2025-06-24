// src/services/jsonService.jsx
import apiService from './apiService.jsx';

// Mapping de entidades locales a endpoints del backend
const ENTITY_ENDPOINTS = {
  'Centros_Vacunacion': '/api/centers',
  'Vacunas': '/api/vaccines',
  'Lotes_Vacunas': '/api/vaccine-lots',
  'Usuarios': '/api/users',
  'Ninos': '/api/children',
  'Padres': '/api/guardians',
  'Historial_Vacunacion': '/api/vaccination-history',
  'Citas': '/api/appointments',
  'Campanas': '/api/campaigns'
};

const jsonService = {
  // Obtener datos de una entidad
  async getData(entityName) {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityName];
      if (!endpoint) {
        console.warn(`[jsonService] No endpoint found for entity: ${entityName}`);
        return [];
      }

      const response = await apiService.get(endpoint);
      console.log(`[jsonService] Get data for ${entityName}:`, response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`[jsonService] Error getting data for ${entityName}:`, error);
      return [];
    }
  },

  // Guardar datos de una entidad
  async saveData(entityName, data, method = 'POST') {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityName];
      if (!endpoint) {
        throw new Error(`No endpoint found for entity: ${entityName}`);
      }

      let response;
      if (method === 'POST') {
        response = await apiService.post(endpoint, data);
      } else if (method === 'PUT') {
        // Para PUT, necesitamos el ID en la URL
        const id = this.getEntityId(entityName, data);
        if (!id) {
          throw new Error(`No ID found for entity ${entityName}`);
        }
        response = await apiService.put(`${endpoint}/${id}`, data);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`[jsonService] Save data for ${entityName} (${method}):`, response);
      return response;
    } catch (error) {
      console.error(`[jsonService] Error saving data for ${entityName}:`, error);
      throw error;
    }
  },

  // Eliminar datos de una entidad
  async deleteData(entityName, id) {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityName];
      if (!endpoint) {
        throw new Error(`No endpoint found for entity: ${entityName}`);
      }

      const response = await apiService.delete(`${endpoint}/${id}`);
      console.log(`[jsonService] Delete data for ${entityName}:`, response);
      return response;
    } catch (error) {
      console.error(`[jsonService] Error deleting data for ${entityName}:`, error);
      throw error;
    }
  },

  // Obtener el ID de una entidad según su tipo
  getEntityId(entityName, data) {
    const idMappings = {
      'Centros_Vacunacion': 'id_centro',
      'Vacunas': 'id_vacuna',
      'Lotes_Vacunas': 'id_lote',
      'Usuarios': 'id_usuario',
      'Ninos': 'id_nino',
      'Padres': 'id_padre',
      'Historial_Vacunacion': 'id_historial',
      'Citas': 'id_cita',
      'Campanas': 'id_campana'
    };

    const idField = idMappings[entityName];
    return data[idField] || data.id;
  },

  // Obtener datos por ID
  async getDataById(entityName, id) {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityName];
      if (!endpoint) {
        throw new Error(`No endpoint found for entity: ${entityName}`);
      }

      const response = await apiService.get(`${endpoint}/${id}`);
      console.log(`[jsonService] Get data by ID for ${entityName}:`, response);
      return response;
    } catch (error) {
      console.error(`[jsonService] Error getting data by ID for ${entityName}:`, error);
      throw error;
    }
  },

  // Búsqueda con filtros
  async searchData(entityName, filters = {}) {
    try {
      const endpoint = ENTITY_ENDPOINTS[entityName];
      if (!endpoint) {
        throw new Error(`No endpoint found for entity: ${entityName}`);
      }

      const response = await apiService.get(endpoint, filters);
      console.log(`[jsonService] Search data for ${entityName}:`, response);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`[jsonService] Error searching data for ${entityName}:`, error);
      return [];
    }
  }
};

export default jsonService;
