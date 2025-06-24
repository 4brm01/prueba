// src/services/index.jsx
// Servicio principal que maneja todos los datos del JSON
export { default as jsonDataService } from './jsonDataService';

// Servicios de autenticación y usuarios
export { default as authService } from './authService';
export { default as usuariosService } from './usuariosService';

// Servicios de gestión médica
export { centrosService } from './centrosService';
export { vacunasService } from './vacunasService';
export * from './pacientesService';

// Servicios de operaciones
export { default as campanasService } from './campanasService';
export { default as inventarioService } from './inventarioService';
export { default as dashboardService } from './dashboardService';
export { default as reportesService } from './reportesService';

// Constantes útiles
export { provinciasRD, sectoresRD } from './centrosService';

// Re-exportar todo como un objeto para compatibilidad
export const services = {
  jsonDataService: require('./jsonDataService').default,
  authService: require('./authService').default,
  usuariosService: require('./usuariosService').default,
  centrosService: require('./centrosService').centrosService,
  vacunasService: require('./vacunasService').vacunasService,
  pacientesService: {
    getPacientesCentro: require('./pacientesService').getPacientesCentro,
    getCitasVacunas: require('./pacientesService').getCitasVacunas,
    agregarCitaVacuna: require('./pacientesService').agregarCitaVacuna,
    editarCitaVacuna: require('./pacientesService').editarCitaVacuna,
    eliminarCitaVacuna: require('./pacientesService').eliminarCitaVacuna,
    getTutoresPorNino: require('./pacientesService').getTutoresPorNino,
    getHistorialVacunacion: require('./pacientesService').getHistorialVacunacion,
    buscarPacientes: require('./pacientesService').buscarPacientes
  },
  campanasService: require('./campanasService').default,
  inventarioService: require('./inventarioService').default,
  dashboardService: require('./dashboardService').default,
  reportesService: require('./reportesService').default
};