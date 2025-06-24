import jsonDataService from './jsonDataService';

export const getPacientesCentro = async (idCentro) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Solicitando pacientes para centro ${idCentro}`);
    const ninos = jsonDataService.getNinosConDatos();
    console.log('Niños obtenidos:', ninos.map(n => ({ id_niño: n.id_niño, id_centro_salud: n.id_centro_salud })));
    
    // Convertir idCentro a cadena para comparar con UUIDs si es necesario
    const centroIdStr = idCentro.toString();
    const pacientes = ninos.filter(nino => {
      const centroSaludStr = nino.id_centro_salud ? nino.id_centro_salud.toString() : '';
      console.log(`Comparando: centroId=${centroIdStr}, id_centro_salud=${centroSaludStr}`);
      return centroSaludStr === centroIdStr;
    });
    
    console.log(`Pacientes filtrados para centro ${idCentro}:`, pacientes);
    return pacientes;
  } catch (error) {
    console.error(`Error obteniendo pacientes para centro ${idCentro}:`, error);
    return [];
  }
};

export const getCitasVacunas = async (idNino) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log(`Solicitando citas para niño ${idNino}`);
    const citas = jsonDataService.getCitasPorNino(idNino);
    console.log(`Citas obtenidas:`, citas);
    return citas;
  } catch (error) {
    console.error(`Error obteniendo citas para niño ${idNino}:`, error);
    return [];
  }
};

export const agregarCitaVacuna = async (idNino, cita) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Agregando cita para niño ${idNino}:`, cita);
    const nuevaCita = { 
      ...cita, 
      id_niño: idNino,
      id_cita: `550e8400-e29b-41d4-a716-${Date.now().toString(16)}`,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };
    
    // En una implementación real, aquí se guardaría en el JSON o base de datos
    console.log('Cita que se agregaría:', nuevaCita);
    console.log('Cita agregada exitosamente');
  } catch (error) {
    console.error('Error agregando cita:', error);
    throw error;
  }
};

export const editarCitaVacuna = async (idNino, citaId, datos) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`Editando cita ${citaId} para niño ${idNino}:`, datos);
    const datosActualizados = { 
      ...datos, 
      id_cita: citaId,
      fecha_actualizacion: new Date().toISOString()
    };
    
    // En una implementación real, aquí se actualizaría en el JSON o base de datos
    console.log('Datos que se actualizarían:', datosActualizados);
    console.log('Cita editada exitosamente');
  } catch (error) {
    console.error('Error editando cita:', error);
    throw error;
  }
};

export const eliminarCitaVacuna = async (idNino, citaId) => {
  try {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`Eliminando cita ${citaId} para niño ${idNino}`);
    
    // En una implementación real, aquí se eliminaría del JSON o base de datos
    console.log('Cita eliminada exitosamente');
  } catch (error) {
    console.error('Error eliminando cita:', error);
    throw error;
  }
};

// Nuevas funciones para obtener más datos
export const getTutoresPorNino = async (idNino) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const tutores = jsonDataService.getTutoresPorNino(idNino);
    console.log(`Tutores para niño ${idNino}:`, tutores);
    return tutores;
  } catch (error) {
    console.error(`Error obteniendo tutores para niño ${idNino}:`, error);
    return [];
  }
};

export const getHistorialVacunacion = async (idNino) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const historial = jsonDataService.getHistorialPorNino(idNino);
    console.log(`Historial de vacunación para niño ${idNino}:`, historial);
    return historial;
  } catch (error) {
    console.error(`Error obteniendo historial para niño ${idNino}:`, error);
    return [];
  }
};

export const buscarPacientes = async (termino) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const resultados = jsonDataService.buscarNinos(termino);
    console.log(`Resultados de búsqueda para "${termino}":`, resultados);
    return resultados;
  } catch (error) {
    console.error('Error en búsqueda de pacientes:', error);
    return [];
  }
};