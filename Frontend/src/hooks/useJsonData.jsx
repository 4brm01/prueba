import { useState, useEffect, useCallback } from 'react';
import jsonDataService from '../services/jsonDataService';

// Hook personalizado para acceder a los datos del JSON de manera reactiva
export const useJsonData = (endpoint, method = 'GET', params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = jsonDataService.getData(endpoint, method);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, method]); 

  const updateData = async (newData, updateMethod = 'POST') => {
    try {
      // En el contexto del JSON, solo simulamos la actualización
      console.log(`Actualizando ${endpoint} con método ${updateMethod}:`, newData);
      
      // Recargar los datos después de la "actualización"
      const updatedData = jsonDataService.getData(endpoint, 'GET');
      setData(updatedData);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { data, loading, error, updateData };
};

// Hook completo para todos los datos del JSON
export const useAllJsonData = () => {
  const [data, setData] = useState({
    centros: [],
    vacunas: [],
    ninos: [],
    tutores: [],
    usuarios: [],
    campanas: [],
    citas: [],
    historial: [],
    lotes: [],
    suministros: [],
    loaded: false,
    loading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      // Cargar todos los datos del JSON
      const allData = {
        centros: jsonDataService.getCentros(),
        vacunas: jsonDataService.getVacunas(),
        ninos: jsonDataService.getNinos(),
        tutores: jsonDataService.getTutores(),
        usuarios: jsonDataService.getUsuarios(),
        campanas: jsonDataService.getCampanasVacunacion(),
        citas: jsonDataService.getCitas(),
        historial: jsonDataService.getHistorialVacunacion(),
        lotes: jsonDataService.getLotesVacunas(),
        suministros: jsonDataService.getInventarioSuministros(),
        loaded: true,
        loading: false,
        error: null
      };
      
      setData(allData);
    } catch (error) {
      console.error('Error cargando datos del JSON:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error cargando datos'
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    refresh,
    estadisticas: data.loaded ? jsonDataService.getEstadisticas() : null
  };
};

// Hook específico para centros
export const useCentros = () => {
  const [centros, setCentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCentros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const centrosData = jsonDataService.getCentrosConDatos();
      setCentros(centrosData);
    } catch (err) {
      console.error('Error cargando centros:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCentros();
  }, [loadCentros]);

  return {
    centros,
    loading,
    error,
    refresh: loadCentros
  };
};

// Hook específico para pacientes
export const usePacientes = (centroId = null) => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let pacientesData = jsonDataService.getNinosConDatos();
      
      if (centroId) {
        pacientesData = pacientesData.filter(p => p.id_centro_salud === centroId);
      }
      
      setPacientes(pacientesData);
    } catch (err) {
      console.error('Error cargando pacientes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [centroId]);

  useEffect(() => {
    loadPacientes();
  }, [loadPacientes]);

  return {
    pacientes,
    loading,
    error,
    refresh: loadPacientes
  };
};

// Hook para búsquedas
export const useBusqueda = (entidad) => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscar = useCallback(async (termino) => {
    if (!termino || termino.trim() === '') {
      setResultados([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let resultadosBusqueda = [];
      
      switch (entidad) {
        case 'pacientes':
        case 'ninos':
          resultadosBusqueda = jsonDataService.buscarNinos(termino);
          break;
        case 'centros':
          resultadosBusqueda = jsonDataService.buscarCentros(termino);
          break;
        default:
          console.warn(`Entidad de búsqueda no soportada: ${entidad}`);
      }
      
      setResultados(resultadosBusqueda);
    } catch (err) {
      console.error(`Error buscando ${entidad}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entidad]);

  const limpiar = useCallback(() => {
    setResultados([]);
    setError(null);
  }, []);

  return {
    resultados,
    loading,
    error,
    buscar,
    limpiar
  };
};

export default useJsonData;