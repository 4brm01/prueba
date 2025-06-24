// src/services/jsonDataService.jsx
import jsonData from '../json_prueba.json';

class JsonDataService {
  constructor() {
    // Leer de localStorage si existe, si no usar el JSON original y guardarlo en localStorage
    const localData = typeof window !== 'undefined' ? localStorage.getItem('sistema_vacunacion_data') : null;
    if (localData) {
      this.data = JSON.parse(localData);
    } else {
      this.data = jsonData;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sistema_vacunacion_data', JSON.stringify(jsonData));
      }
    }
  }

  persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sistema_vacunacion_data', JSON.stringify(this.data));
    }
  }

  // Método genérico para obtener datos de cualquier entidad
  getData(entity, operation = 'GET') {
    if (!this.data[entity] || !this.data[entity][operation]) {
      return [];
    }
    return this.data[entity][operation];
  }

  // Métodos específicos para cada entidad
  getCentros() {
    return this.getData('Centros_Vacunacion', 'GET');
  }

  getVacunas() {
    return this.getData('Vacunas', 'GET');
  }

  getNinos() {
    return this.getData('Niños', 'GET');
  }

  getTutores() {
    return this.getData('Tutores', 'GET');
  }

  getLotesVacunas() {
    return this.getData('Lotes_Vacunas', 'GET');
  }

  getDosisAplicadas() {
    return this.getData('Dosis_Aplicadas', 'GET');
  }

  getUsuarios() {
    // Normaliza el rol a minúsculas y agrega la propiedad 'role' a cada usuario
    return this.getData('Usuarios', 'GET').map(u => ({
      ...u,
      role: (u.rol || u.role || '').toLowerCase(),
      rol: u.rol // mantiene la original por compatibilidad
    }));
  }

  getCampanasVacunacion() {
    return this.getData('Campañas_Vacunacion', 'GET');
  }

  getCampanaCentro() {
    return this.getData('Campaña_Centro', 'GET');
  }

  getCitas() {
    return this.getData('Citas', 'GET');
  }

  getHistorialVacunacion() {
    return this.getData('Historial_Vacunacion', 'GET');
  }

  getInventarioSuministros() {
    return this.getData('Inventario_Suministros', 'GET');
  }

  getSuministroVacunacion() {
    return this.getData('Suministro_Vacunacion', 'GET');
  }

  // Método para obtener datos relacionados
  getCentroById(id) {
    const centros = this.getCentros();
    return centros.find(centro => centro.id_centro === id);
  }

  getVacunaById(id) {
    const vacunas = this.getVacunas();
    return vacunas.find(vacuna => vacuna.id_vacuna === id);
  }

  getNinoById(id) {
    const ninos = this.getNinos();
    return ninos.find(nino => nino.id_niño === id);
  }

  getTutoresPorNino(idNino) {
    const tutores = this.getTutores();
    return tutores.filter(tutor => tutor.id_niño === idNino);
  }

  getLotesPorCentro(idCentro) {
    const lotes = this.getLotesVacunas();
    return lotes.filter(lote => lote.id_centro === idCentro);
  }

  getCitasPorNino(idNino) {
    const citas = this.getCitas();
    return citas.filter(cita => cita.id_niño === idNino);
  }

  getHistorialPorNino(idNino) {
    const historial = this.getHistorialVacunacion();
    return historial.filter(h => h.id_niño === idNino);
  }

  // Método para autenticación
  authenticate(username, password) {
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => 
      u.username === username && 
      u.password_hash === password // En una app real, esto sería hasheado
    );
    
    if (usuario) {
      return {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        rol: usuario.rol,
        role: usuario.rol, // Para compatibilidad
        email: usuario.email,
        telefono: usuario.telefono,
        id_centro: usuario.id_centro,
        estado: usuario.estado
      };
    }
    
    return null;
  }

  // Método para obtener estadísticas
  getEstadisticas() {
    return {
      totalCentros: this.getCentros().length,
      totalVacunas: this.getVacunas().length,
      totalNinos: this.getNinos().length,
      totalTutores: this.getTutores().length,
      totalCitas: this.getCitas().length,
      totalHistorial: this.getHistorialVacunacion().length,
      totalUsuarios: this.getUsuarios().length,
      totalCampanas: this.getCampanasVacunacion().length
    };
  }

  // Método para simular búsquedas
  buscarNinos(termino) {
    const ninos = this.getNinos();
    return ninos.filter(nino => 
      nino.nombre_completo.toLowerCase().includes(termino.toLowerCase()) ||
      nino.identificacion.includes(termino) ||
      nino.id_salud_nacional.toLowerCase().includes(termino.toLowerCase())
    );
  }

  buscarCentros(termino) {
    const centros = this.getCentros();
    return centros.filter(centro => 
      centro.nombre_centro.toLowerCase().includes(termino.toLowerCase()) ||
      centro.nombre_corto.toLowerCase().includes(termino.toLowerCase()) ||
      centro.director.toLowerCase().includes(termino.toLowerCase())
    );
  }

  // Método para obtener usuarios por centro
  getUsuariosPorCentro(idCentro) {
    const usuarios = this.getUsuarios();
    return usuarios.filter(usuario => usuario.id_centro === idCentro);
  }

  // Método para obtener datos completos con relaciones
  getNinosConDatos() {
    const ninos = this.getNinos();
    const centros = this.getCentros();
    const tutores = this.getTutores();
    
    return ninos.map(nino => {
      const centro = centros.find(c => c.id_centro === nino.id_centro_salud);
      const tutoresNino = tutores.filter(t => t.id_niño === nino.id_niño);
      const historial = this.getHistorialPorNino(nino.id_niño);
      const citas = this.getCitasPorNino(nino.id_niño);
      
      return {
        ...nino,
        centro: centro,
        tutores: tutoresNino,
        historialVacunacion: historial,
        citas: citas
      };
    });
  }

  getCentrosConDatos() {
    const centros = this.getCentros();
    const ninos = this.getNinos();
    const usuarios = this.getUsuarios();
    const lotes = this.getLotesVacunas();
    
    return centros.map(centro => {
      const ninosCentro = ninos.filter(n => n.id_centro_salud === centro.id_centro);
      const usuariosCentro = usuarios.filter(u => u.id_centro === centro.id_centro);
      const lotesCentro = lotes.filter(l => l.id_centro === centro.id_centro);
      
      return {
        ...centro,
        totalPacientes: ninosCentro.length,
        usuarios: usuariosCentro,
        lotes: lotesCentro,
        pacientes: ninosCentro
      };
    });
  }

  // Métodos simulados para escritura en memoria
  saveData(entity, operation = 'POST', data) {
    if (!this.data[entity]) {
      this.data[entity] = { GET: [], POST: [], PUT: [], DELETE: [] };
    }
    if (operation === 'POST') {
      this.data[entity]['GET'].push(data);
      this.data[entity]['POST'].push(data);
      this.persist();
      return data;
    } else if (operation === 'PUT') {
      const idField = Object.keys(data).find(k => k.startsWith('id_'));
      if (idField) {
        const idx = this.data[entity]['GET'].findIndex(item => item[idField] === data[idField]);
        if (idx !== -1) {
          this.data[entity]['GET'][idx] = { ...this.data[entity]['GET'][idx], ...data };
        }
        this.data[entity]['PUT'].push(data);
        this.persist();
      }
      return data;
    } else if (operation === 'DELETE') {
      const idField = Object.keys(data).find(k => k.startsWith('id_'));
      if (idField) {
        this.data[entity]['GET'] = this.data[entity]['GET'].filter(item => item[idField] !== data[idField]);
        this.data[entity]['DELETE'].push(data);
        this.persist();
      }
      return data;
    }
    return null;
  }
}

// Exportar una instancia única (singleton)
const jsonDataService = new JsonDataService();
export default jsonDataService;