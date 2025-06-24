// src/services/inventarioService.jsx
import jsonDataService from './jsonDataService';

export const inventarioService = {
  async getInventarioSuministros() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const suministros = jsonDataService.getInventarioSuministros();
      const centros = jsonDataService.getCentros();
      
      return suministros.map(suministro => {
        const centro = centros.find(c => c.id_centro === suministro.id_centro);
        
        // Calcular días para vencimiento
        const fechaVencimiento = new Date(suministro.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        // Calcular porcentaje de stock
        const porcentajeStock = (suministro.cantidad_disponible / suministro.cantidad_total) * 100;
        
        // Determinar estado del suministro
        let estado = 'normal';
        if (diasParaVencer <= 0) {
          estado = 'vencido';
        } else if (diasParaVencer <= 30) {
          estado = 'por_vencer';
        } else if (porcentajeStock <= 20) {
          estado = 'stock_bajo';
        } else if (porcentajeStock <= 10) {
          estado = 'stock_critico';
        }
        
        return {
          ...suministro,
          centro: centro,
          nombre_centro: centro?.nombre_centro || 'Centro desconocido',
          diasParaVencer,
          porcentajeStock,
          estado
        };
      });
    } catch (error) {
      console.error('Error obteniendo inventario de suministros:', error);
      return [];
    }
  },

  async getSuministrosPorCentro(centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const inventario = await this.getInventarioSuministros();
      return inventario.filter(suministro => suministro.id_centro === centroId);
    } catch (error) {
      console.error(`Error obteniendo suministros para centro ${centroId}:`, error);
      return [];
    }
  },

  async getSuministroById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const inventario = await this.getInventarioSuministros();
      const suministro = inventario.find(s => s.id_suministro === id);
      
      if (!suministro) {
        throw new Error('Suministro no encontrado');
      }
      
      // Obtener historial de uso
      const suministroVacunacion = jsonDataService.getSuministroVacunacion();
      const usos = suministroVacunacion.filter(sv => sv.id_suministro === id);
      
      return {
        ...suministro,
        usos: usos,
        totalUsos: usos.reduce((sum, uso) => sum + uso.cantidad_utilizada, 0)
      };
    } catch (error) {
      console.error(`Error obteniendo suministro ${id}:`, error);
      throw error;
    }
  },

  async getLotesVacunas() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const lotes = jsonDataService.getLotesVacunas();
      const vacunas = jsonDataService.getVacunas();
      const centros = jsonDataService.getCentros();
      
      return lotes.map(lote => {
        const vacuna = vacunas.find(v => v.id_vacuna === lote.id_vacuna);
        const centro = centros.find(c => c.id_centro === lote.id_centro);
        
        // Calcular días para vencimiento
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        const hoy = new Date();
        const diasParaVencer = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        // Calcular porcentaje de stock
        const porcentajeStock = (lote.cantidad_disponible / lote.cantidad_total) * 100;
        
        // Determinar estado del lote
        let estado = 'disponible';
        if (diasParaVencer <= 0) {
          estado = 'vencido';
        } else if (diasParaVencer <= 30) {
          estado = 'por_vencer';
        } else if (porcentajeStock <= 20) {
          estado = 'stock_bajo';
        } else if (lote.cantidad_disponible === 0) {
          estado = 'agotado';
        }
        
        return {
          ...lote,
          vacuna: vacuna,
          centro: centro,
          nombre_vacuna: vacuna?.nombre_vacuna || 'Vacuna desconocida',
          nombre_centro: centro?.nombre_centro || 'Centro desconocido',
          diasParaVencer,
          porcentajeStock,
          estado
        };
      });
    } catch (error) {
      console.error('Error obteniendo lotes de vacunas:', error);
      return [];
    }
  },

  async getLotesPorCentro(centroId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const lotes = await this.getLotesVacunas();
      return lotes.filter(lote => lote.id_centro === centroId);
    } catch (error) {
      console.error(`Error obteniendo lotes para centro ${centroId}:`, error);
      return [];
    }
  },

  async getLotesPorVacuna(vacunaId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const lotes = await this.getLotesVacunas();
      return lotes.filter(lote => lote.id_vacuna === vacunaId);
    } catch (error) {
      console.error(`Error obteniendo lotes para vacuna ${vacunaId}:`, error);
      return [];
    }
  },

  async getAlertasInventario() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const suministros = await this.getInventarioSuministros();
      const lotes = await this.getLotesVacunas();
      
      const alertas = [];
      
      // Alertas de suministros
      suministros.forEach(suministro => {
        if (suministro.estado === 'vencido') {
          alertas.push({
            tipo: 'error',
            categoria: 'suministros',
            titulo: 'Suministro vencido',
            mensaje: `${suministro.nombre_suministro} en ${suministro.nombre_centro} está vencido`,
            fecha: new Date().toISOString(),
            prioridad: 'alta',
            datos: suministro
          });
        } else if (suministro.estado === 'por_vencer') {
          alertas.push({
            tipo: 'warning',
            categoria: 'suministros',
            titulo: 'Suministro próximo a vencer',
            mensaje: `${suministro.nombre_suministro} en ${suministro.nombre_centro} vence en ${suministro.diasParaVencer} días`,
            fecha: new Date().toISOString(),
            prioridad: suministro.diasParaVencer <= 7 ? 'alta' : 'media',
            datos: suministro
          });
        } else if (suministro.estado === 'stock_critico') {
          alertas.push({
            tipo: 'error',
            categoria: 'suministros',
            titulo: 'Stock crítico',
            mensaje: `${suministro.nombre_suministro} en ${suministro.nombre_centro} tiene stock crítico (${suministro.cantidad_disponible} unidades)`,
            fecha: new Date().toISOString(),
            prioridad: 'alta',
            datos: suministro
          });
        } else if (suministro.estado === 'stock_bajo') {
          alertas.push({
            tipo: 'warning',
            categoria: 'suministros',
            titulo: 'Stock bajo',
            mensaje: `${suministro.nombre_suministro} en ${suministro.nombre_centro} tiene stock bajo (${suministro.cantidad_disponible} unidades)`,
            fecha: new Date().toISOString(),
            prioridad: 'media',
            datos: suministro
          });
        }
      });
      
      // Alertas de lotes de vacunas
      lotes.forEach(lote => {
        if (lote.estado === 'vencido') {
          alertas.push({
            tipo: 'error',
            categoria: 'vacunas',
            titulo: 'Lote de vacuna vencido',
            mensaje: `Lote ${lote.numero_lote} de ${lote.nombre_vacuna} en ${lote.nombre_centro} está vencido`,
            fecha: new Date().toISOString(),
            prioridad: 'alta',
            datos: lote
          });
        } else if (lote.estado === 'por_vencer') {
          alertas.push({
            tipo: 'warning',
            categoria: 'vacunas',
            titulo: 'Lote próximo a vencer',
            mensaje: `Lote ${lote.numero_lote} de ${lote.nombre_vacuna} vence en ${lote.diasParaVencer} días`,
            fecha: new Date().toISOString(),
            prioridad: lote.diasParaVencer <= 7 ? 'alta' : 'media',
            datos: lote
          });
        } else if (lote.estado === 'agotado') {
          alertas.push({
            tipo: 'warning',
            categoria: 'vacunas',
            titulo: 'Lote agotado',
            mensaje: `Lote ${lote.numero_lote} de ${lote.nombre_vacuna} en ${lote.nombre_centro} está agotado`,
            fecha: new Date().toISOString(),
            prioridad: 'media',
            datos: lote
          });
        } else if (lote.estado === 'stock_bajo') {
          alertas.push({
            tipo: 'info',
            categoria: 'vacunas',
            titulo: 'Stock bajo de vacuna',
            mensaje: `Lote ${lote.numero_lote} de ${lote.nombre_vacuna} tiene ${lote.cantidad_disponible} dosis disponibles`,
            fecha: new Date().toISOString(),
            prioridad: 'baja',
            datos: lote
          });
        }
      });
      
      return alertas.sort((a, b) => {
        const prioridadOrden = { alta: 3, media: 2, baja: 1 };
        return prioridadOrden[b.prioridad] - prioridadOrden[a.prioridad];
      });
    } catch (error) {
      console.error('Error obteniendo alertas de inventario:', error);
      return [];
    }
  },

  async actualizarSuministro(id, datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datosActualizados = {
        ...datos,
        id_suministro: id,
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Suministro actualizado:', datosActualizados);
      return {
        success: true,
        data: datosActualizados,
        message: 'Suministro actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando suministro:', error);
      throw error;
    }
  },

  async actualizarLote(id, datos) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datosActualizados = {
        ...datos,
        id_lote: id,
        fecha_actualizacion: new Date().toISOString(),
        fecha_ultima_verificacion: new Date().toISOString()
      };
      
      console.log('Lote actualizado:', datosActualizados);
      return {
        success: true,
        data: datosActualizados,
        message: 'Lote actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error actualizando lote:', error);
      throw error;
    }
  },

  async registrarUsoSuministro(idSuministro, idHistorial, cantidadUtilizada) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const nuevoUso = {
        id_suministro_vacunacion: `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`,
        id_historial: idHistorial,
        id_suministro: idSuministro,
        cantidad_utilizada: cantidadUtilizada,
        fecha_uso: new Date().toISOString().split('T')[0],
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      };
      
      console.log('Uso de suministro registrado:', nuevoUso);
      return {
        success: true,
        data: nuevoUso,
        message: 'Uso de suministro registrado exitosamente'
      };
    } catch (error) {
      console.error('Error registrando uso de suministro:', error);
      throw error;
    }
  },

  async getEstadisticasInventario() {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const suministros = await this.getInventarioSuministros();
      const lotes = await this.getLotesVacunas();
      
      // Estadísticas de suministros
      const totalSuministros = suministros.length;
      const suministrosVencidos = suministros.filter(s => s.estado === 'vencido').length;
      const suministrosPorVencer = suministros.filter(s => s.estado === 'por_vencer').length;
      const suministrosStockBajo = suministros.filter(s => s.estado === 'stock_bajo' || s.estado === 'stock_critico').length;
      
      // Estadísticas de lotes
      const totalLotes = lotes.length;
      const lotesVencidos = lotes.filter(l => l.estado === 'vencido').length;
      const lotesPorVencer = lotes.filter(l => l.estado === 'por_vencer').length;
      const lotesAgotados = lotes.filter(l => l.estado === 'agotado').length;
      const dosisDisponibles = lotes.reduce((sum, lote) => sum + lote.cantidad_disponible, 0);
      const dosisTotal = lotes.reduce((sum, lote) => sum + lote.cantidad_total, 0);
      
      // Suministros por tipo
      const suministrosPorTipo = suministros.reduce((acc, suministro) => {
        acc[suministro.tipo_suministro] = (acc[suministro.tipo_suministro] || 0) + 1;
        return acc;
      }, {});
      
      // Vacunas por fabricante
      const vacunasPorFabricante = lotes.reduce((acc, lote) => {
        if (lote.vacuna) {
          acc[lote.vacuna.fabricante] = (acc[lote.vacuna.fabricante] || 0) + lote.cantidad_disponible;
        }
        return acc;
      }, {});
      
      return {
        suministros: {
          total: totalSuministros,
          vencidos: suministrosVencidos,
          porVencer: suministrosPorVencer,
          stockBajo: suministrosStockBajo,
          porTipo: suministrosPorTipo
        },
        lotes: {
          total: totalLotes,
          vencidos: lotesVencidos,
          porVencer: lotesPorVencer,
          agotados: lotesAgotados,
          dosisDisponibles: dosisDisponibles,
          dosisTotal: dosisTotal,
          porcentajeDisponible: dosisTotal > 0 ? (dosisDisponibles / dosisTotal) * 100 : 0
        },
        vacunasPorFabricante
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de inventario:', error);
      return {
        suministros: { total: 0, vencidos: 0, porVencer: 0, stockBajo: 0, porTipo: {} },
        lotes: { total: 0, vencidos: 0, porVencer: 0, agotados: 0, dosisDisponibles: 0, dosisTotal: 0, porcentajeDisponible: 0 },
        vacunasPorFabricante: {}
      };
    }
  }
};

export default inventarioService;