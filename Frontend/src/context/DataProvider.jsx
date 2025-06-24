import React, { createContext, useState, useEffect } from 'react';
import jsonService from '../services/jsonService';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [ninos, setNinos] = useState([]);
  const [tutores, setTutores] = useState([]);
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [lotesVacunas, setLotesVacunas] = useState([]);
  const [dosisAplicadas, setDosisAplicadas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ninosData = await jsonService.getData('Niños', 'GET');
        const tutoresData = await jsonService.getData('Tutores', 'GET');
        const centrosData = await jsonService.getData('Centros_Vacunacion', 'GET');
        const vacunasData = await jsonService.getData('Vacunas', 'GET');
        const lotesVacunasData = await jsonService.getData('Lotes_Vacunas', 'GET');
        const dosisAplicadasData = await jsonService.getData('Dosis_Aplicadas', 'GET');

        setNinos(ninosData);
        setTutores(tutoresData);
        setCentrosVacunacion(centrosData);
        setVacunas(vacunasData);
        setLotesVacunas(lotesVacunasData);
        setDosisAplicadas(dosisAplicadasData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleNinoAdd = async (nino) => {
    try {
      await jsonService.saveData('Niños', 'POST', nino);
      const updatedNinos = await jsonService.getData('Niños', 'GET');
      setNinos(updatedNinos);
    } catch (error) {
      console.error('Error adding niño:', error);
      throw error;
    }
  };

  const handleTutorAdd = async (tutor) => {
    try {
      await jsonService.saveData('Tutores', 'POST', tutor);
      const updatedTutores = await jsonService.getData('Tutores', 'GET');
      setTutores(updatedTutores);
    } catch (error) {
      console.error('Error adding tutor:', error);
      throw error;
    }
  };

  const handleUpdateNino = async (nino) => {
    try {
      await jsonService.saveData('Niños', 'PUT', nino);
      const updatedNinos = await jsonService.getData('Niños', 'GET');
      setNinos(updatedNinos);
    } catch (error) {
      console.error('Error updating niño:', error);
      throw error;
    }
  };

  const handleUpdateTutor = async (tutor) => {
    try {
      await jsonService.saveData('Tutores', 'PUT', tutor);
      const updatedTutores = await jsonService.getData('Tutores', 'GET');
      setTutores(updatedTutores);
    } catch (error) {
      console.error('Error updating tutor:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      ninos,
      tutores,
      centrosVacunacion,
      vacunas,
      lotesVacunas,
      dosisAplicadas,
      setLotesVacunas,
      setDosisAplicadas,
      handleNinoAdd,
      handleTutorAdd,
      handleUpdateNino,
      handleUpdateTutor,
    }}>
      {children}
    </DataContext.Provider>
  );
};