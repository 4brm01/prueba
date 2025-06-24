// src/services/dashboardService.jsx
import jsonDataService from './jsonDataService';

export const dashboardService = {
  async getEstadisticasGenerales() {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const estadisticas = jsonDataService.getEstadisticas();
      
      // Calcular estadísticas adicionales
      const centros = jsonDataService.getCentros();
      const ninos = jsonDataService.getNinos();
      const citas = jsonDataService.getCitas();
      const historial = jsonDataService.getHistorialVacunacion();
      const lotes = jsonDataService.getLotesVacunas();
      const usuarios = jsonDataService.getUsuarios();
      
      // Estadísticas de citas por estado
      const citasPendientes = citas.filter(c => c.estado === 'Pendiente').length;
      const citasConfirmadas = citas.filter(c => c.estado === 'Confirmada').length;
      const citasCompletadas = citas.filter(c => c.estado === 'Completada').length;
      
      // Estadísticas de vacunación por edad
      const ninosPorEdad = ninos.reduce((acc, nino) => {
        const fechaNac = new Date(nino.fecha_nacimiento);
        const edad = new Date().getFullYear() - fechaNac.getFullYear();
        const rangoEdad = edad < 1 ? '0-1' : edad < 2 ? '1-2' : edad < 5 ? '2-5' : '5+';
        acc[rangoEdad] = (acc[rangoEdad] || 0) + 1;
        return acc;
      }, {});
      
      // Estadísticas de lotes por vencimiento
      const lotesProximosAVencer = lotes.filter(lote => {
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 30 && diasParaVencer > 0;
      }).length;
      
      const lotesVencidos = lotes.filter(lote => {
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        return fechaVencimiento < new Date();
      }).length;
      
      // Estadísticas de usuarios por rol
      const usuariosPorRol = usuarios.reduce((acc, usuario) => {
        acc[usuario.rol] = (acc[usuario.rol] || 0) + 1;
        return acc;
      }, {});
      
      return {
        ...estadisticas,
        citas: {
          total: citas.length,
          pendientes: citasPendientes,
          confirmadas: citasConfirmadas,
          completadas: citasCompletadas
        },
        edades: ninosPorEdad,
        lotes: {
          total: lotes.length,
          proximosAVencer: lotesProximosAVencer,
          vencidos: lotesVencidos,
          disponibles: lotes.reduce((sum, lote) => sum + lote.cantidad_disponible, 0)
        },
        usuariosPorRol,
        centrosActivos: centros.length,
        vacunasAplicadas: historial.length
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del dashboard:', error);
      return {
        totalCentros: 0,
        totalVacunas: 0,
        totalNinos: 0,
        totalTutores: 0,
        totalCitas: 0,
        totalHistorial: 0,
        totalUsuarios: 0,
        totalCampanas: 0
      };
    }
  },

  async getActividadReciente() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const historial = jsonDataService.getHistorialVacunacion();
      const citas = jsonDataService.getCitas();
      const centros = jsonDataService.getCentros();
      const ninos = jsonDataService.getNinos();
      const vacunas = jsonDataService.getVacunas();
      
      // Ordenar historial por fecha más reciente
      const historialReciente = historial
        .sort((a, b) => new Date(b.fecha_aplicacion) - new Date(a.fecha_aplicacion))
        .slice(0, 10)
        .map(h => {
          const nino = ninos.find(n => n.id_niño === h.id_niño);
          const centro = centros.find(c => c.id_centro === h.id_centro);
          const vacuna = vacunas.find(v => v.id_vacuna === h.id_vacuna);
          
          return {
            tipo: 'vacunacion',
            fecha: h.fecha_aplicacion,
            descripcion: `Vacuna ${vacuna?.nombre_vacuna || 'Desconocida'} aplicada a ${nino?.nombre_completo || 'Paciente'}`,
            centro: centro?.nombre_centro || 'Centro desconocido',
            detalles: {
              niño: nino?.nombre_completo,
              vacuna: vacuna?.nombre_vacuna,
              centro: centro?.nombre_centro,
              dosis: h.tipo_dosis
            }
          };
        });
      
      // Citas próximas
      const citasProximas = citas
        .filter(c => new Date(c.fecha_cita) >= new Date())
        .sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita))
        .slice(0, 5)
        .map(c => {
          const nino = ninos.find(n => n.id_niño === c.id_niño);
          const centro = centros.find(ct => ct.id_centro === c.id_centro);
          
          return {
            tipo: 'cita',
            fecha: c.fecha_cita,
            descripcion: `Cita programada: ${c.vacuna_programada} para ${nino?.nombre_completo || 'Paciente'}`,
            centro: centro?.nombre_centro || 'Centro desconocido',
            estado: c.estado,
            detalles: {
              niño: nino?.nombre_completo,
              vacuna: c.vacuna_programada,
              centro: centro?.nombre_centro,
              estado: c.estado
            }
          };
        });
      
      return {
        vacunacionesRecientes: historialReciente,
        citasProximas: citasProximas,
        resumen: {
          vacunacionesHoy: historial.filter(h => {
            const hoy = new Date().toISOString().split('T')[0];
            return h.fecha_aplicacion === hoy;
          }).length,
          citasHoy: citas.filter(c => {
            const hoy = new Date().toISOString().split('T')[0];
            return c.fecha_cita.split('T')[0] === hoy;
          }).length
        }
      };
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return {
        vacunacionesRecientes: [],
        citasProximas: [],
        resumen: { vacunacionesHoy: 0, citasHoy: 0 }
      };
    }
  },

  async getCentrosSummary() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const centros = jsonDataService.getCentrosConDatos();
      
      return centros.map(centro => ({
        id: centro.id_centro,
        nombre: centro.nombre_centro,
        director: centro.director,
        totalPacientes: centro.totalPacientes || 0,
        usuariosAsignados: centro.usuarios?.length || 0,
        lotesDisponibles: centro.lotes?.length || 0,
        ubicacion: centro.direccion
      }));
    } catch (error) {
      console.error('Error obteniendo resumen de centros:', error);
      return [];
    }
  },

  async getVacunasSummary() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const vacunas = jsonDataService.getVacunas();
      const lotes = jsonDataService.getLotesVacunas();
      const historial = jsonDataService.getHistorialVacunacion();
      
      return vacunas.map(vacuna => {
        const lotesVacuna = lotes.filter(l => l.id_vacuna === vacuna.id_vacuna);
        const aplicaciones = historial.filter(h => h.id_vacuna === vacuna.id_vacuna);
        
        return {
          id: vacuna.id_vacuna,
          nombre: vacuna.nombre_vacuna,
          fabricante: vacuna.fabricante,
          tipo: vacuna.tipo_vacuna,
          dosisRequeridas: vacuna.dosis_totales_requeridas,
          lotesDisponibles: lotesVacuna.length,
          dosisDisponibles: lotesVacuna.reduce((sum, lote) => sum + lote.cantidad_disponible, 0),
          aplicaciones: aplicaciones.length
        };
      });
    } catch (error) {
      console.error('Error obteniendo resumen de vacunas:', error);
      return [];
    }
  },

  async getAlertas() {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const lotes = jsonDataService.getLotesVacunas();
      const citas = jsonDataService.getCitas();
      
      const alertas = [];
      
      // Alertas de lotes próximos a vencer
      lotes.forEach(lote => {
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        if (diasParaVencer <= 30 && diasParaVencer > 0) {
          alertas.push({
            tipo: 'warning',
            titulo: 'Lote próximo a vencer',
            mensaje: `El lote ${lote.numero_lote} vence en ${diasParaVencer} días`,
            fecha: new Date().toISOString(),
            prioridad: diasParaVencer <= 7 ? 'alta' : 'media'
          });
        } else if (diasParaVencer <= 0) {
          alertas.push({
            tipo: 'error',
            titulo: 'Lote vencido',
            mensaje: `El lote ${lote.numero_lote} está vencido`,
            fecha: new Date().toISOString(),
            prioridad: 'alta'
          });
        }
      });
      
      // Alertas de stock bajo
      lotes.forEach(lote => {
        const porcentajeDisponible = (lote.cantidad_disponible / lote.cantidad_total) * 100;
        if (porcentajeDisponible <= 20) {
          alertas.push({
            tipo: 'warning',
            titulo: 'Stock bajo',
            mensaje: `El lote ${lote.numero_lote} tiene solo ${lote.cantidad_disponible} dosis disponibles`,
            fecha: new Date().toISOString(),
            prioridad: porcentajeDisponible <= 5 ? 'alta' : 'media'
          });
        }
      });
      
      // Alertas de citas pendientes por confirmar
      const citasPendientes = citas.filter(c => {
        const fechaCita = new Date(c.fecha_cita);
        const hoy = new Date();
        const diasParaCita = Math.ceil((fechaCita - hoy) / (1000 * 60 * 60 * 24));
        return c.estado === 'Pendiente' && diasParaCita <= 7 && diasParaCita >= 0;
      });
      
      if (citasPendientes.length > 0) {
        alertas.push({
          tipo: 'info',
          titulo: 'Citas pendientes por confirmar',
          mensaje: `Hay ${citasPendientes.length} citas pendientes por confirmar esta semana`,
          fecha: new Date().toISOString(),
          prioridad: 'media'
        });
      }
      
      return alertas.sort((a, b) => {
        const prioridadOrden = { alta: 3, media: 2, baja: 1 };
        return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
      });
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      return [];
    }
  }
};

export default dashboardService;