import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import centrosService from '../../services/centrosService';
import usuariosService from '../../services/usuariosService';
import CentrosFilter from './CentrosFilter';
import CentrosMap from './CentrosMap';
import CentrosList from './CentrosList';
import PacientesModal from '../pacientes/PacientesModal';
import { Card, CardBody, CardHeader, Divider, Spinner } from "@nextui-org/react";

const CentrosPage = () => {
  const { currentUser } = useAuth();
  const [centrosVacunacion, setCentrosVacunacion] = useState([]);
  const [filterType, setFilterType] = useState("provincia");
  const [filterTerm, setFilterTerm] = useState("");
  const [filteredCentros, setFilteredCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [showPacientesModal, setShowPacientesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCentros = async () => {
      setLoading(true);
      try {
        let centros = await centrosService.getCentros();
        console.log('Centros cargados en CentrosPage:', centros);

        if (currentUser?.role === 'director') {
          const centrosAsignados = await usuariosService.getCentrosAsignadosADirector(currentUser.id);
          centros = centros.filter(centro => centrosAsignados.includes(centro.id_centro));
        } else if (currentUser?.role === 'doctor') {
          const centroAsignado = await usuariosService.getCentroAsignadoADoctor(currentUser.id);
          centros = centros.filter(centro => centro.id_centro === centroAsignado);
        }
        setCentrosVacunacion(centros);
      } catch (error) {
        console.error('Error loading centros:', error);
        setCentrosVacunacion([]);
      } finally {
        setLoading(false);
      }
    };

    loadCentros();
  }, [currentUser]);

  useEffect(() => {
    const loadFilteredCentros = async () => {
      try {
        const filtered = await centrosService.filterCentros(centrosVacunacion, filterTerm, filterType);
        console.log('Centros filtrados:', filtered);
        setFilteredCentros(filtered);
      } catch (error) {
        console.error('Error filtering centros:', error);
        setFilteredCentros([]);
      }
    };

    loadFilteredCentros();
  }, [filterTerm, filterType, centrosVacunacion]);

  const handleCentroClick = (centro) => {
    console.log("Centro seleccionado para mapa:", centro.id_centro);
  };

  const handleVerPacientes = (e, centro) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    console.log('Abriendo PacientesModal para centro:', centro.id_centro); // Verificar valor completo
    // Crear una copia inmutable para evitar mutaciones
    const centroCopy = { ...centro, id_centro: centro.id_centro.trim() }; // Eliminar espacios o caracteres extra
    setSelectedCentro(centroCopy);
    setShowPacientesModal(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <CentrosFilter
            filterType={filterType}
            setFilterType={setFilterType}
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
            centrosVacunacion={centrosVacunacion}
          />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="bg-primary-50 dark:bg-primary-900/20">
          <h3 className="text-lg font-semibold">Mapa de Centros de Vacunación</h3>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spinner size="lg" label="Cargando centros..." />
            </div>
          ) : (
            <CentrosMap
              filteredCentros={Array.isArray(filteredCentros) ? filteredCentros : []}
              handleCentroClick={handleCentroClick}
              handleVerPacientes={handleVerPacientes}
              currentUser={currentUser}
            />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="bg-primary-50 dark:bg-primary-900/20">
          <h3 className="text-lg font-semibold">Listado de Centros</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" label="Cargando centros..." />
            </div>
          ) : (
            <CentrosList
              filteredCentros={Array.isArray(filteredCentros) ? filteredCentros : []}
              handleCentroClick={handleCentroClick}
              handleVerPacientes={handleVerPacientes}
              currentUser={currentUser}
            />
          )}
        </CardBody>
      </Card>

      {showPacientesModal && selectedCentro && (
        <PacientesModal
          isOpen={showPacientesModal}
          onClose={() => {
            console.log('Cerrando PacientesModal');
            setShowPacientesModal(false);
            setSelectedCentro(null);
          }}
          centro={selectedCentro}
        />
      )}
    </div>
  );
};

export default CentrosPage;