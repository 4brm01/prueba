// src/services/centrosService.jsx
import apiService from './apiService.jsx';

export const provinciasRD = [
  "Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "Elías Piña",
  "El Seibo", "Espaillat", "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia",
  "La Romana", "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi",
  "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná", "San Cristóbal",
  "San José de Ocoa", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago",
  "Santiago Rodríguez", "Santo Domingo", "Valverde"
];

export const sectoresRD = [
  "Salud Pública", "Privado", "ONG", "Militar", "Educativo"
];

const centrosService = {
  // Obtener todos los centros de vacunación
  async getCentros() {
    try {
      const response = await apiService.get('/api/centers');
      console.log('[centrosService] Get centros response:', response);
      const centros = Array.isArray(response) ? response : [];
      return centros.sort((a, b) => a.nombre_centro.localeCompare(b.nombre_centro));
    } catch (error) {
      console.error('[centrosService] Error getting centros:', error);
      return [];
    }
  },

  // Obtener un centro por ID
  async getCentroById(id) {
    try {
      const response = await apiService.get(`/api/centers/${id}`);
      console.log('[centrosService] Get centro by ID response:', response);
      return response;
    } catch (error) {
      console.error('[centrosService] Error getting centro by ID:', error);
      throw new Error(error.message || 'Error al obtener centro');
    }
  },

  // Crear un nuevo centro
  async createCentro(centroData) {
    try {
      // Limpiar payload: solo incluir campos definidos y no vacíos
      const payload = {};
      if (centroData.nombre_centro) payload.nombre_centro = centroData.nombre_centro;
      if (centroData.nombre_corto) payload.nombre_corto = centroData.nombre_corto;
      if (centroData.direccion) payload.direccion = centroData.direccion;
      if (centroData.latitud) payload.latitud = parseFloat(centroData.latitud);
      if (centroData.longitud) payload.longitud = parseFloat(centroData.longitud);
      if (centroData.telefono) payload.telefono = centroData.telefono;
      if (centroData.director) payload.director = centroData.director;
      if (centroData.sitio_web) payload.sitio_web = centroData.sitio_web;
      const response = await apiService.post('/api/centers', payload);
      console.log('[centrosService] Create centro response:', response);
      return response;
    } catch (error) {
      console.error('[centrosService] Error creating centro:', error);
      throw new Error(error.message || 'Error al crear centro');
    }
  },

  // Actualizar un centro existente
  async updateCentro(id, centroData) {
    try {
      // Limpiar payload: solo incluir campos definidos y no vacíos
      const payload = {};
      if (centroData.nombre_centro) payload.nombre_centro = centroData.nombre_centro;
      if (centroData.nombre_corto) payload.nombre_corto = centroData.nombre_corto;
      if (centroData.direccion) payload.direccion = centroData.direccion;
      if (centroData.latitud) payload.latitud = parseFloat(centroData.latitud);
      if (centroData.longitud) payload.longitud = parseFloat(centroData.longitud);
      if (centroData.telefono) payload.telefono = centroData.telefono;
      if (centroData.director) payload.director = centroData.director;
      if (centroData.sitio_web) payload.sitio_web = centroData.sitio_web;
      const response = await apiService.put(`/api/centers/${id}`, payload);
      console.log('[centrosService] Update centro response:', response);
      return response;
    } catch (error) {
      console.error('[centrosService] Error updating centro:', error);
      throw new Error(error.message || 'Error al actualizar centro');
    }
  },

  // Eliminar un centro
  async deleteCentro(id) {
    try {
      const response = await apiService.delete(`/api/centers/${id}`);
      console.log('[centrosService] Delete centro response:', response);
      return response;
    } catch (error) {
      console.error('[centrosService] Error deleting centro:', error);
      throw new Error(error.message || 'Error al eliminar centro');
    }
  },

  // Guardar centro (crear o actualizar)
  async saveCentro(centroData) {
    try {
      if (centroData.id_centro) {
        // Actualizar centro existente
        return await this.updateCentro(centroData.id_centro, centroData);
      } else {
        // Crear nuevo centro
        return await this.createCentro(centroData);
      }
    } catch (error) {
      console.error('[centrosService] Error saving centro:', error);
      throw new Error(error.message || 'Error al guardar centro');
    }
  },

  // Obtener centros por director
  async getCentrosByDirector(directorName) {
    try {
      const allCentros = await this.getCentros();
      return allCentros.filter(centro => centro.director === directorName);
    } catch (error) {
      console.error('[centrosService] Error getting centros by director:', error);
      return [];
    }
  },

  // Asignar director a centro
  async assignDirectorToCentro(centroId, directorName) {
    try {
      const response = await apiService.put(`/api/centers/${centroId}`, {
        director: directorName
      });
      console.log('[centrosService] Assign director response:', response);
      return response;
    } catch (error) {
      console.error('[centrosService] Error assigning director:', error);
      throw new Error(error.message || 'Error al asignar director');
    }
  },

  // Filtrar centros
  filterCentros(centros, filterTerm, filterType) {
    const centrosData = Array.isArray(centros) ? centros : [];
    console.log('Filtering centers:', centrosData, 'Filter term:', filterTerm, 'Filter type:', filterType);

    if (!filterTerm || filterTerm.trim() === "") {
      return centrosData;
    }

    const term = filterTerm.toLowerCase();

    switch (filterType) {
      case "provincia":
        return centrosData.filter(centro => 
          centro.direccion && centro.direccion.toLowerCase().includes(term)
        );
      case "sector":
        return centrosData.filter(centro => 
          centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)
        );
      case "director":
        return centrosData.filter(centro => 
          centro.director && centro.director.toLowerCase().includes(term)
        );
      default:
        return centrosData.filter(centro => 
          (centro.nombre_centro && centro.nombre_centro.toLowerCase().includes(term)) ||
          (centro.direccion && centro.direccion.toLowerCase().includes(term)) ||
          (centro.director && centro.director.toLowerCase().includes(term)) ||
          (centro.telefono && centro.telefono.toLowerCase().includes(term))
        );
    }
  },

  // Opciones de filtro
  getFilterOptions(filterType, centros) {
    const centrosData = Array.isArray(centros) ? centros : [];
    
    switch (filterType) {
      case "provincia":
        return provinciasRD;
      case "sector":
        return sectoresRD;
      case "director":
        const directores = [...new Set(
          centrosData
            .filter(centro => centro.director)
            .map(centro => centro.director)
        )];
        return directores.sort();
      default:
        return [];
    }
  }
};

export default centrosService;