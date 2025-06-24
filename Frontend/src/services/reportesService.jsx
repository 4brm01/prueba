// src/services/reportesService.jsx
import jsonDataService from './jsonDataService';

export const reportesService = {
  async getReporteVacunacion(filtros = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const historial = jsonDataService.getHistorialVacunacion();
      const ninos = jsonDataService.getNinos();
      const vacunas = jsonDataService.getVacunas();
      const centros = jsonDataService.getCentros();
      const lotes = jsonDataService.getLotesVacunas();
      
      let historialFiltrado = historial;
      
      // Aplicar filtros
      if (filtros.fechaInicio) {
        historialFiltrado = historialFiltrado.filter(h => 
          new Date(h.fecha_aplicacion) >= new Date(filtros.fechaInicio)
        );
      }
      
      if (filtros.fechaFin) {
        historialFiltrado = historialFiltrado.filter(h => 
          new Date(h.fecha_aplicacion) <= new Date(filtros.fechaFin)
        );
      }
      
      if (filtros.centroId) {
        historialFiltrado = historialFiltrado.filter(h => h.id_centro === filtros.centroId);
      }
      
      if (filtros.vacunaId) {
        historialFiltrado = historialFiltrado.filter(h => h.id_vacuna === filtros.vacunaId);
      }
      
      // Generar reporte detallado
      const reporte = historialFiltrado.map(h => {
        const nino = ninos.find(n => n.id_niño === h.id_niño);
        const vacuna = vacunas.find(v => v.id_vacuna === h.id_vacuna);
        const centro = centros.find(c => c.id_centro === h.id_centro);
        const lote = lotes.find(l => l.id_lote === h.id_lote);
        
        return {
          fecha_aplicacion: h.fecha_aplicacion,
          paciente: {
            nombre: nino?.nombre_completo || 'Desconocido',
            identificacion: nino?.identificacion || 'N/A',
            fecha_nacimiento: nino?.fecha_nacimiento,
            genero: nino?.genero,
            edad_al_vacunarse: h.edad_al_vacunarse
          },
          vacuna: {
            nombre: vacuna?.nombre_vacuna || 'Desconocida',
            fabricante: vacuna?.fabricante || 'Desconocido',
            tipo: vacuna?.tipo_vacuna || 'N/A'
          },
          centro: {
            nombre: centro?.nombre_centro || 'Desconocido',
            director: centro?.director || 'N/A'
          },
          lote: {
            numero: lote?.numero_lote || 'N/A',
            fecha_vencimiento: lote?.fecha_vencimiento
          },
          dosis: h.tipo_dosis,
          observaciones: h.observaciones || 'Ninguna'
        };
      });
      
      // Estadísticas del reporte
      const estadisticas = {
        totalVacunaciones: reporte.length,
        vacunacionesPorVacuna: this.agruparPor(reporte, 'vacuna.nombre'),
        vacunacionesPorCentro: this.agruparPor(reporte, 'centro.nombre'),
        vacunacionesPorGenero: this.agruparPor(reporte, 'paciente.genero'),
        vacunacionesPorEdad: this.agruparPorEdad(reporte),
        vacunacionesPorMes: this.agruparPorMes(reporte)
      };
      
      return {
        datos: reporte,
        estadisticas,
        filtros,
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de vacunación:', error);
      throw error;
    }
  },

  async getReporteCentros() {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const centros = jsonDataService.getCentros();
      const ninos = jsonDataService.getNinos();
      const usuarios = jsonDataService.getUsuarios();
      const lotes = jsonDataService.getLotesVacunas();
      const historial = jsonDataService.getHistorialVacunacion();
      const citas = jsonDataService.getCitas();
      
      const reporte = centros.map(centro => {
        const pacientesCentro = ninos.filter(n => n.id_centro_salud === centro.id_centro);
        const usuariosCentro = usuarios.filter(u => u.id_centro === centro.id_centro);
        const lotesCentro = lotes.filter(l => l.id_centro === centro.id_centro);
        const historialCentro = historial.filter(h => h.id_centro === centro.id_centro);
        const citasCentro = citas.filter(c => c.id_centro === centro.id_centro);
        
        return {
          centro: {
            nombre: centro.nombre_centro,
            director: centro.director,
            direccion: centro.direccion,
            telefono: centro.telefono,
            fecha_creacion: centro.fecha_creacion
          },
          estadisticas: {
            totalPacientes: pacientesCentro.length,
            totalUsuarios: usuariosCentro.length,
            totalLotes: lotesCentro.length,
            totalVacunacionesAplicadas: historialCentro.length,
            totalCitas: citasCentro.length,
            citasPendientes: citasCentro.filter(c => c.estado === 'Pendiente').length,
            dosisDisponibles: lotesCentro.reduce((sum, lote) => sum + lote.cantidad_disponible, 0)
          },
          pacientes: pacientesCentro.map(p => ({
            nombre: p.nombre_completo,
            identificacion: p.identificacion,
            fecha_nacimiento: p.fecha_nacimiento,
            genero: p.genero
          })),
          personal: usuariosCentro.map(u => ({
            nombre: u.nombre,
            rol: u.rol,
            email: u.email,
            telefono: u.telefono
          }))
        };
      });
      
      return {
        datos: reporte,
        resumen: {
          totalCentros: centros.length,
          totalPacientes: ninos.length,
          totalPersonal: usuarios.length,
          promediosPacientesPorCentro: centros.length > 0 ? ninos.length / centros.length : 0
        },
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de centros:', error);
      throw error;
    }
  },

  async getReporteInventario() {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const lotes = jsonDataService.getLotesVacunas();
      const vacunas = jsonDataService.getVacunas();
      const centros = jsonDataService.getCentros();
      const suministros = jsonDataService.getInventarioSuministros();
      
      const reporteLotes = lotes.map(lote => {
        const vacuna = vacunas.find(v => v.id_vacuna === lote.id_vacuna);
        const centro = centros.find(c => c.id_centro === lote.id_centro);
        
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        return {
          lote: {
            numero: lote.numero_lote,
            fecha_vencimiento: lote.fecha_vencimiento,
            cantidad_total: lote.cantidad_total,
            cantidad_disponible: lote.cantidad_disponible,
            temperatura_registrada: lote.temperatura_registrada
          },
          vacuna: {
            nombre: vacuna?.nombre_vacuna || 'Desconocida',
            fabricante: vacuna?.fabricante || 'Desconocido',
            tipo: vacuna?.tipo_vacuna || 'N/A'
          },
          centro: {
            nombre: centro?.nombre_centro || 'Desconocido',
            director: centro?.director || 'N/A'
          },
          estado: {
            diasParaVencer,
            porcentajeDisponible: (lote.cantidad_disponible / lote.cantidad_total) * 100,
            alertas: this.getAlertasLote(lote, diasParaVencer)
          }
        };
      });
      
      const reporteSuministros = suministros.map(suministro => {
        const centro = centros.find(c => c.id_centro === suministro.id_centro);
        
        const fechaVencimiento = new Date(suministro.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        return {
          suministro: {
            nombre: suministro.nombre_suministro,
            tipo: suministro.tipo_suministro,
            cantidad_total: suministro.cantidad_total,
            cantidad_disponible: suministro.cantidad_disponible,
            proveedor: suministro.proveedor,
            fecha_vencimiento: suministro.fecha_vencimiento
          },
          centro: {
            nombre: centro?.nombre_centro || 'Desconocido'
          },
          estado: {
            diasParaVencer,
            porcentajeDisponible: (suministro.cantidad_disponible / suministro.cantidad_total) * 100,
            alertas: this.getAlertasSuministro(suministro, diasParaVencer)
          }
        };
      });
      
      return {
        lotes: reporteLotes,
        suministros: reporteSuministros,
        estadisticas: {
          totalLotes: lotes.length,
          totalSuministros: suministros.length,
          lotesVencidos: reporteLotes.filter(r => r.estado.diasParaVencer <= 0).length,
          lotesPorVencer: reporteLotes.filter(r => r.estado.diasParaVencer > 0 && r.estado.diasParaVencer <= 30).length,
          dosisDisponibles: lotes.reduce((sum, lote) => sum + lote.cantidad_disponible, 0),
          dosisTotal: lotes.reduce((sum, lote) => sum + lote.cantidad_total, 0)
        },
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de inventario:', error);
      throw error;
    }
  },

  async getReporteCampanas() {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const campanas = jsonDataService.getCampanasVacunacion();
      const vacunas = jsonDataService.getVacunas();
      const citas = jsonDataService.getCitas();
      const historial = jsonDataService.getHistorialVacunacion();
      const campanaCentro = jsonDataService.getCampanaCentro();
      const centros = jsonDataService.getCentros();
      
      const reporte = campanas.map(campana => {
        const vacuna = vacunas.find(v => v.id_vacuna === campana.id_vacuna);
        const citasCampana = citas.filter(c => c.id_campaña === campana.id_campaña);
        const historialCampana = historial.filter(h => h.id_campaña === campana.id_campaña);
        const centrosAsignados = campanaCentro
          .filter(cc => cc.id_campaña === campana.id_campaña)
          .map(cc => {
            const centro = centros.find(c => c.id_centro === cc.id_centro);
            return centro?.nombre_centro || 'Centro desconocido';
          });
        
        const fechaInicio = new Date(campana.fecha_inicio);
        const fechaFin = new Date(campana.fecha_fin);
        const hoy = new Date();
        
        let estado = 'planificada';
        if (hoy >= fechaInicio && hoy <= fechaFin) {
          estado = 'en_curso';
        } else if (hoy > fechaFin) {
          estado = 'finalizada';
        }
        
        return {
          campana: {
            nombre: campana.nombre_campaña,
            objetivo: campana.objetivo,
            fecha_inicio: campana.fecha_inicio,
            fecha_fin: campana.fecha_fin,
            estado: estado
          },
          vacuna: {
            nombre: vacuna?.nombre_vacuna || 'Desconocida',
            fabricante: vacuna?.fabricante || 'Desconocido'
          },
          centros: centrosAsignados,
          estadisticas: {
            totalCitas: citasCampana.length,
            citasPendientes: citasCampana.filter(c => c.estado === 'Pendiente').length,
            citasConfirmadas: citasCampana.filter(c => c.estado === 'Confirmada').length,
            citasCompletadas: citasCampana.filter(c => c.estado === 'Completada').length,
            vacunasAplicadas: historialCampana.length,
            porcentajeCompletado: citasCampana.length > 0 ? 
              (citasCampana.filter(c => c.estado === 'Completada').length / citasCampana.length) * 100 : 0
          }
        };
      });
      
      return {
        datos: reporte,
        resumen: {
          totalCampanas: campanas.length,
          campanasActivas: reporte.filter(r => r.campana.estado === 'en_curso').length,
          campanasFinalizadas: reporte.filter(r => r.campana.estado === 'finalizada').length,
          totalVacunasAplicadas: reporte.reduce((sum, r) => sum + r.estadisticas.vacunasAplicadas, 0)
        },
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando reporte de campañas:', error);
      throw error;
    }
  },

  async exportarReporte(tipoReporte, formato = 'json', filtros = {}) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let reporte;
      
      switch (tipoReporte) {
        case 'vacunacion':
          reporte = await this.getReporteVacunacion(filtros);
          break;
        case 'centros':
          reporte = await this.getReporteCentros();
          break;
        case 'inventario':
          reporte = await this.getReporteInventario();
          break;
        case 'campanas':
          reporte = await this.getReporteCampanas();
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }
      
      // Simular exportación
      const nombreArchivo = `reporte_${tipoReporte}_${new Date().toISOString().split('T')[0]}.${formato}`;
      
      console.log(`Exportando reporte: ${nombreArchivo}`);
      console.log('Datos del reporte:', reporte);
      
      return {
        success: true,
        nombreArchivo,
        formato,
        datos: reporte,
        message: `Reporte exportado como ${nombreArchivo}`
      };
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw error;
    }
  },

  // Funciones auxiliares
  agruparPor(datos, campo) {
    return datos.reduce((acc, item) => {
      const valor = this.getValorAnidado(item, campo);
      acc[valor] = (acc[valor] || 0) + 1;
      return acc;
    }, {});
  },

  agruparPorEdad(datos) {
    return datos.reduce((acc, item) => {
      const edad = item.paciente.edad_al_vacunarse;
      let rango;
      if (edad < 1) rango = '0-1 años';
      else if (edad < 2) rango = '1-2 años';
      else if (edad < 5) rango = '2-5 años';
      else rango = '5+ años';
      
      acc[rango] = (acc[rango] || 0) + 1;
      return acc;
    }, {});
  },

  agruparPorMes(datos) {
    return datos.reduce((acc, item) => {
      const fecha = new Date(item.fecha_aplicacion);
      const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {});
  },

  getValorAnidado(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj) || 'N/A';
  },

  getAlertasLote(lote, diasParaVencer) {
    const alertas = [];
    
    if (diasParaVencer <= 0) {
      alertas.push('Lote vencido');
    } else if (diasParaVencer <= 30) {
      alertas.push('Próximo a vencer');
    }
    
    const porcentajeStock = (lote.cantidad_disponible / lote.cantidad_total) * 100;
    if (porcentajeStock <= 10) {
      alertas.push('Stock crítico');
    } else if (porcentajeStock <= 20) {
      alertas.push('Stock bajo');
    }
    
    return alertas;
  },

  getAlertasSuministro(suministro, diasParaVencer) {
    const alertas = [];
    
    if (diasParaVencer <= 0) {
      alertas.push('Suministro vencido');
    } else if (diasParaVencer <= 30) {
      alertas.push('Próximo a vencer');
    }
    
    const porcentajeStock = (suministro.cantidad_disponible / suministro.cantidad_total) * 100;
    if (porcentajeStock <= 10) {
      alertas.push('Stock crítico');
    } else if (porcentajeStock <= 20) {
      alertas.push('Stock bajo');
    }
    
    return alertas;
  }
};

export default reportesService;