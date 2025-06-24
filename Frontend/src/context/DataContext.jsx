import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import centrosService from '../services/centrosService.jsx';
import vacunasService from '../services/vacunasService.jsx';
import usuariosService from '../services/usuariosService.jsx';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [dosisAplicadas, setDosisAplicadas] = useState([]);
  const [directores, setDirectores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Función para recargar todos los datos
  const reloadData = useCallback(async () => {
    console.log('[DataContext] Reloading all data...');
    setLoading(true);
    setError(null);
    
    try {
      // Cargar datos desde el backend
      const [
        centrosData,
        vacunasData,
        lotesData,
        dosisData,
        usuariosData
      ] = await Promise.allSettled([
        centrosService.getCentros(),
        vacunasService.getVacunas(),
        vacunasService.getLotes(),
        vacunasService.getDosisAplicadas(),
        usuariosService.getUsuarios()
      ]);

      // Procesar centros
      if (centrosData.status === 'fulfilled') {
        setCentrosVacunacion(Array.isArray(centrosData.value) ? centrosData.value : []);
        console.log('[DataContext] Centros loaded:', centrosData.value);
      } else {
        console.error('[DataContext] Error loading centros:', centrosData.reason);
        setCentrosVacunacion([]);
      }

      // Procesar vacunas
      if (vacunasData.status === 'fulfilled') {
        setVacunas(Array.isArray(vacunasData.value) ? vacunasData.value : []);
        console.log('[DataContext] Vacunas loaded:', vacunasData.value);
      } else {
        console.error('[DataContext] Error loading vacunas:', vacunasData.reason);
        setVacunas([]);
      }

      // Procesar lotes
      if (lotesData.status === 'fulfilled') {
        setLotesVacunas(Array.isArray(lotesData.value) ? lotesData.value : []);
        console.log('[DataContext] Lotes loaded:', lotesData.value);
      } else {
        console.error('[DataContext] Error loading lotes:', lotesData.reason);
        setLotesVacunas([]);
      }

      // Procesar dosis aplicadas
      if (dosisData.status === 'fulfilled') {
        setDosisAplicadas(Array.isArray(dosisData.value) ? dosisData.value : []);
        console.log('[DataContext] Dosis aplicadas loaded:', dosisData.value);
      } else {
        console.error('[DataContext] Error loading dosis aplicadas:', dosisData.reason);
        setDosisAplicadas([]);
      }

      // Procesar usuarios
      if (usuariosData.status === 'fulfilled') {
        const usuarios = Array.isArray(usuariosData.value) ? usuariosData.value : [];
        // Filtrar directores
        const directoresData = usuarios.filter(user => user.role === 'director');
        setDirectores(directoresData);
        console.log('[DataContext] Directores loaded:', directoresData);
        // Filtrar tutores/padres/responsables
        const tutoresData = usuarios.filter(user => user.role === 'padre' || user.role === 'tutor' || user.role === 'responsable');
        setTutores(tutoresData.map(tutor => ({
          ...tutor,
          id_tutor: tutor.id_usuario || tutor.id,
          nombre: tutor.name || tutor.nombre || '',
          apellido: tutor.apellido || '',
          identificacion: tutor.identificacion || tutor.cedula || tutor.username || tutor.email || ''
        })));
        console.log('[DataContext] Tutores loaded:', tutoresData);
      } else {
        console.error('[DataContext] Error loading usuarios:', usuariosData.reason);
        setDirectores([]);
        setTutores([]);
      }

      // Procesar niños (pacientes)
      try {
        const ninosData = await import('../services/jsonDataService.jsx');
        const ninosList = ninosData.default.getNinos();
        setNinos(Array.isArray(ninosList) ? ninosList : []);
        console.log('[DataContext] Niños loaded:', ninosList);
      } catch (err) {
        console.error('[DataContext] Error loading niños:', err);
        setNinos([]);
      }

      console.log('[DataContext] All data loaded successfully');
    } catch (error) {
      console.error('[DataContext] Error loading data:', error);
      setError(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar recreación innecesaria

  useEffect(() => {
    console.log('[DataContext] useEffect triggered, currentUser:', currentUser);
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;
      
      try {
        await reloadData();
      } catch (error) {
        console.error('[DataContext] Error in loadData:', error);
        if (mounted) {
          setError(error.message || 'Error al cargar datos');
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [currentUser, reloadData]); // Recargar cuando cambie el usuario

  const value = {
    // Estados
    centrosVacunacion,
    ninos,
    tutores,
    vacunas,
    lotesVacunas,
    dosisAplicadas,
    directores,
    loading,
    error,
    
    // Setters
    setCentrosVacunacion,
    setNinos,
    setTutores,
    setVacunas,
    setLotesVacunas,
    setDosisAplicadas,
    setDirectores,
    
    // Función para recargar datos
    reloadData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;
