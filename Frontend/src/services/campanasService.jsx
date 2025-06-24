// src/services/campanasService.jsx
import jsonDataService from './jsonDataService';

export const campanasService = {
  async getCampanas() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const campanas = jsonDataService.getCampanasVacunacion();
      const vacunas = jsonDataService.getVacunas();
      const campanaCentro = jsonDataService.getCampanaCentro();
      const centros = jsonDataService.getCentros();
      
      return campanas.map(campana => {
        const vacuna = vacunas.find(v => v.id_vacuna === campana.id_vacuna);
        const centrosAsignados = campanaCentro
          .filter(cc => cc.id_campaña === campana.id_campaña)
          .map(cc => {
            const centro = centros.find(c => c.id_centro === cc.id_centro);
            return {
              ...cc,
              centro: centro
            };
          });
        
        return {
          ...campana,
          vacuna: vacuna,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Vacuna desconocida',
          centros: centrosAsignados,
          totalCentros: centrosAsignados.length
        };
      });
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      return [];
    }
  },

  async getCampanaById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const campanas = await this.getCampanas();
      const campana = campanas.find(c => c.id_campaña === id);
      
      if (!campana) {
        throw new Error('Campaña no encontrada');
      }
      
      // Obtener estadísticas adicionales
      const citas = jsonDataService.getCitas().filter(c => c.id_campaña === id);
      const historial = jsonDataService.getHistorialVacunacion().filter(h => h.id_campaña === id);
      
      return {
        ...campana,
        estadisticas: {
          citasProgromadas: citas.length,
          vacunasAplicadas: historial.length,
          citasPendientes: citas.filter(c => c.estado === 'Pendiente').length,
          citasCompletadas: citas.filter(c => c.estado === 'Completada').length
        },
        citas: citas,
        historial: historial
      };
    } catch (error) {
      console.error(`Error obteniendo campaña ${id}:`, error);
      throw error;
    }
  },

  async getCampanasActivas() {
    try {
      const campanas = await this.getCampanas();
      const hoy = new Date();
      
      return campanas.filter(campana => {
        const fechaInicio = new Date(campana.fecha_inicio);
        const fechaFin = new Date(campana.fecha_fin);
        return fechaInicio <= hoy && fechaFin >= hoy && campana.estado === 'En Curso';
      });
    } catch (error) {
      console.error('Error obteniendo campañas activas:', error);
      return [];
    }
  },

  async getCampanasPorCentro(centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const campanaCentro = jsonDataService.getCampanaCentro();
      const campanas = await this.getCampanas();
      
      const campanasDelCentro = campanaCentro
        .filter(cc => cc.id_centro === centroId)
        .map(cc => {
          const campana = campanas.find(c => c.id_campaña === cc.id_campaña);
          return {
            ...campana,
            fechaAsignacion: cc.fecha_asignacion
          };
        })
        .filter(c => c.id_campaña); // Filtrar las que no se encontraron
      
      return campanasDelCentro;
    } catch (error) {
      console.error(`Error obteniendo campañas para centro ${centroId}:`, error);
      return [];
    }
  },

  async crearCampana(datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const nuevaCampana = {
        id_campaña: `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`,
        ...datos,
        estado: 'Planificada',
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Campaña creada:', nuevaCampana);
      return {
        success: true,
        data: nuevaCampana,
        message: 'Campaña creada exitosamente'
      };
    } catch (error) {
      console.error('Error creando campaña:', error);
      throw error;
    }
  },

  async actualizarCampana(id, datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datosActualizados = {
        ...datos,
        id_campaña: id,
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Campaña actualizada:', datosActualizados);
      return {
        success: true,
        data: datosActualizados,
        message: 'Campaña actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      throw error;
    }
  },

  async eliminarCampana(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Campaña eliminada:', id);
      return {
        success: true,
        message: 'Campaña eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error eliminando campaña:', error);
      throw error;
    }
  },

  async asignarCentroACampana(campaniaId, centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const nuevaAsignacion = {
        id_campaña_centro: `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`,
        id_campaña: campaniaId,
        id_centro: centroId,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Centro asignado a campaña:', nuevaAsignacion);
      return {
        success: true,
        data: nuevaAsignacion,
        message: 'Centro asignado a campaña exitosamente'
      };
    } catch (error) {
      console.error('Error asignando centro a campaña:', error);
      throw error;
    }
  },

  async desasignarCentroDecampana(campaniaId, centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Desasignando centro ${centroId} de campaña ${campaniaId}`);
      return {
        success: true,
        message: 'Centro desasignado de campaña exitosamente'
      };
    } catch (error) {
      console.error('Error desasignando centro de campaña:', error);
      throw error;
    }
  },

  async getEstadisticasCampana(campaniaId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const citas = jsonDataService.getCitas().filter(c => c.id_campaña === campaniaId);
      const historial = jsonDataService.getHistorialVacunacion().filter(h => h.id_campaña === campaniaId);
      const ninos = jsonDataService.getNinos();
      
      // Estadísticas por edad
      const edades = historial.map(h => {
        const nino = ninos.find(n => n.id_niño === h.id_niño);
        if (nino) {
          const fechaNac = new Date(nino.fecha_nacimiento);
          const fechaVacuna = new Date(h.fecha_aplicacion);
          const edad = fechaVacuna.getFullYear() - fechaNac.getFullYear();
          return edad;
        }
        return null;
      }).filter(edad => edad !== null);
      
      const estadisticasEdad = edades.reduce((acc, edad) => {
        const rango = edad < 1 ? '0-1' : edad < 2 ? '1-2' : edad < 5 ? '2-5' : '5+';
        acc[rango] = (acc[rango] || 0) + 1;
        return acc;
      }, {});
      
      // Estadísticas por género
      const generos = historial.map(h => {
        const nino = ninos.find(n => n.id_niño === h.id_niño);
        return nino?.genero;
      }).filter(g => g);
      
      const estadisticasGenero = generos.reduce((acc, genero) => {
        acc[genero] = (acc[genero] || 0) + 1;
        return acc;
      }, {});
      
      return {
        totalCitas: citas.length,
        totalVacunasAplicadas: historial.length,
        citasPendientes: citas.filter(c => c.estado === 'Pendiente').length,
        citasConfirmadas: citas.filter(c => c.estado === 'Confirmada').length,
        citasCompletadas: citas.filter(c => c.estado === 'Completada').length,
        porcentajeCompletado: citas.length > 0 ? (citas.filter(c => c.estado === 'Completada').length / citas.length) * 100 : 0,
        estadisticasEdad,
        estadisticasGenero,
        vacunacionesPorDia: this.getVacunacionesPorDia(historial)
      };
    } catch (error) {
      console.error(`Error obteniendo estadísticas de campaña ${campaniaId}:`, error);
      return {
        totalCitas: 0,
        totalVacunasAplicadas: 0,
        citasPendientes: 0,
        citasConfirmadas: 0,
        citasCompletadas: 0,
        porcentajeCompletado: 0,
        estadisticasEdad: {},
        estadisticasGenero: {},
        vacunacionesPorDia: []
      };
    }
  },

  getVacunacionesPorDia(historial) {
    const vacunacionesPorDia = historial.reduce((acc, h) => {
      const fecha = h.fecha_aplicacion;
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(vacunacionesPorDia)
      .map(([fecha, cantidad]) => ({ fecha, cantidad }))
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  },

  async buscarCampanas(termino) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const campanas = await this.getCampanas();
      return campanas.filter(campana => 
        campana.nombre_campaña.toLowerCase().includes(termino.toLowerCase()) ||
        campana.objetivo.toLowerCase().includes(termino.toLowerCase()) ||
        campana.estado.toLowerCase().includes(termino.toLowerCase()) ||
        campana.nombre_vacuna.toLowerCase().includes(termino.toLowerCase())
      );
    } catch (error) {
      console.error('Error buscando campañas:', error);
      return [];
    }
  }
};

export default campanasService;