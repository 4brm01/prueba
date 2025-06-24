import React, { useState } from "react";
import VacunacionModal from './VacunacionModal';
import { useAuth } from '../../context/AuthContext';
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Select, 
  SelectItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  Chip,
} from "@nextui-org/react";
import RegistroForm from './forms/RegistroForm';
import CitaModal from './CitaModal';
import { useData } from '../../context/DataContext';

export default function GestionPacientes() {
  const { currentUser } = useAuth();
  const { 
    ninos, 
    tutores, 
    vacunas, 
    lotesVacunas, 
    setLotesVacunas,
    dosisAplicadas, 
    setDosisAplicadas,
    centrosVacunacion,
    handleUpdateNino,
    handleUpdateTutor,
    handleNinoAdd,
    handleTutorAdd
  } = useData();

  // Utility: obtener los IDs de centros donde trabaja el doctor
  const getCentrosDoctor = () => {
    if (!currentUser || currentUser.role !== 'doctor') return [];
    if (Array.isArray(currentUser.centrosAsignados) && currentUser.centrosAsignados.length > 0) {
      return currentUser.centrosAsignados;
    } else if (currentUser.id_centro) {
      return [currentUser.id_centro];
    }
    return [];
  };

  // Filtrado por centro: solo el doctor ve pacientes de sus centros asignados
  let pacientesFiltrados = ninos || [];
  if (currentUser && currentUser.role === 'doctor') {
    const centrosDoctor = getCentrosDoctor();
    if (centrosDoctor.length > 0) {
      pacientesFiltrados = (ninos || []).filter(n => centrosDoctor.includes(n.id_centro_salud));
    } else {
      pacientesFiltrados = [];
    }
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("nombre");
  const [searchResults, setSearchResults] = useState([]);

  const mostrarPacientes = searchTerm.trim() === "" ? pacientesFiltrados : searchResults;

  const [expandedNinoId, setExpandedNinoId] = useState(null);
  const [editingNino, setEditingNino] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para VacunacionModal
  const [vacunacionModalOpen, setVacunacionModalOpen] = useState(false);
  const [pacienteVacunacion, setPacienteVacunacion] = useState(null);
  const [loadingVacunacion, setLoadingVacunacion] = useState(false);
  const [citasPaciente, setCitasPaciente] = useState([]);
  const [citaModalOpen, setCitaModalOpen] = useState(false);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    let results = [];
    switch (filterType) {
      case "nombre":
        results = pacientesFiltrados.filter((nino) =>
          nino.nombre_completo.toLowerCase().includes(term)
        );
        break;
      case "id":
        results = pacientesFiltrados.filter(
          (nino) => nino.id_niño.toString().includes(term)
        );
        break;
      case "tutor":
        const tutoresFiltered = (tutores || []).filter(
          (tutor) =>
            tutor.nombre.toLowerCase().includes(term) ||
            tutor.apellido.toLowerCase().includes(term)
        );
        const tutorIds = tutoresFiltered.map((tutor) => tutor.id_tutor);
        results = pacientesFiltrados.filter((nino) => tutorIds.includes(nino.id_tutor));
        break;
      default:
        results = [];
    }
    if (currentUser && currentUser.role === 'doctor') {
      const centrosDoctor = getCentrosDoctor();
      if (centrosDoctor.length > 0) {
        results = results.filter(n => centrosDoctor.includes(n.id_centro_salud));
      } else {
        results = [];
      }
    }

    setSearchResults(results);
  };

  const handleToggleExpand = (ninoId) => {
    setExpandedNinoId(expandedNinoId === ninoId ? null : ninoId);
  };

  const handleEditNino = (nino) => {
    setEditingNino(nino);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNino(null);
  };

  const handleOpenVacunacionModal = (nino) => {
    setPacienteVacunacion(nino);
    try {
      const { getCitasVacunas } = require('../../services/pacientesService');
      setCitasPaciente(getCitasVacunas(nino.id_niño) || []);
    } catch (e) {
      setCitasPaciente([]);
    }
    setVacunacionModalOpen(true);
  };

  const getTutorNombre = (idTutor) => {
    const tutor = (tutores || []).find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  const getHistorialVacunas = (ninoId) => {
    if (!dosisAplicadas) return [];
    const dosisArray = Array.isArray(dosisAplicadas) ? dosisAplicadas : [];
    console.log('[Historial Vacunas] dosisAplicadas:', dosisArray);
    console.log('[Historial Vacunas] vacunas:', vacunas);
    const dosisDelNino = dosisArray.filter(d => d.id_niño === ninoId);
    return dosisDelNino.map(dosis => {
      const lote = (lotesVacunas || []).find(l => l.id_lote === dosis.id_lote);
      const vacuna = (vacunas || []).find(
        v => String(v.id_vacuna) === String(dosis.id_vacuna || lote?.id_vacuna)
      );
      return {
        ...dosis,
        nombre_vacuna: vacuna?.nombre_vacuna || 'Desconocida',
        numero_lote: lote?.numero_lote || dosis.id_lote || 'N/A',
        cantidad_dosis_lote: lote?.cantidad_dosis
      };
    });
  };

  const getCentroNombre = (idCentro) => {
    const centro = (centrosVacunacion || []).find(c => c.id_centro === idCentro);
    return centro ? centro.nombre_centro : "No especificado";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Pacientes</h2>
          <p className="text-default-500">
            Busca, visualiza y edita información de pacientes
          </p>
        </div>
        <Button
          color="success"
          onClick={() => setIsModalOpen(true)}
          startContent={<span>+</span>}
        >
          Registrar Nuevo Paciente
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              label="Tipo de búsqueda"
              selectedKeys={[filterType]}
              onChange={(e) => setFilterType(e.target.value)}
              className="md:max-w-xs"
            >
              <SelectItem key="nombre" value="nombre">Buscar por Nombre</SelectItem>
              <SelectItem key="id" value="id">Buscar por ID</SelectItem>
              <SelectItem key="tutor" value="tutor">Buscar por Tutor</SelectItem>
            </Select>
            
            <Input
              type="text"
              label="Buscar"
              placeholder={`Ingrese ${
                filterType === "nombre"
                  ? "nombre del paciente"
                  : filterType === "id"
                  ? "ID del paciente"
                  : "nombre del tutor"
              }`}
              value={searchTerm}
              onChange={handleSearch}
              className="flex-grow"
              isClearable
              startContent={<span className="text-default-400 text-small">🔍</span>}
            />
          </div>
        </CardBody>
      </Card>

      {mostrarPacientes.length > 0 ? (
        <div className="space-y-4">
          {mostrarPacientes.map((nino) => (
            <Card key={nino.id_niño} shadow="sm">
              <CardHeader className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/20">
                <h5 className="text-lg font-semibold">{nino.nombre_completo}</h5>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    onClick={() => handleToggleExpand(nino.id_niño)}
                  >
                    {expandedNinoId === nino.id_niño ? "Ocultar" : "Ver Detalles"}
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => handleEditNino(nino)}
                  >
                    Editar
                  </Button>
                  {currentUser && ['doctor', 'administrador', 'director'].includes(currentUser.role) && (
                    <>
                      <Button size="sm" color="success" variant="flat" onClick={() => handleOpenVacunacionModal(nino)}>
                        Registrar Vacunación
                      </Button>
                      <Button size="sm" color="secondary" variant="flat" onClick={() => { setPacienteVacunacion(nino); setCitaModalOpen(true); }}>
                        Registrar Próxima Cita
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              
              {expandedNinoId === nino.id_niño && (
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h6 className="text-md font-semibold mb-3">Información Personal</h6>
                      <div className="space-y-2">
                        <p><span className="font-semibold">ID:</span> {nino.id_niño}</p>
                        <p><span className="font-semibold">Fecha de Nacimiento:</span> {nino.fecha_nacimiento}</p>
                        <p><span className="font-semibold">Género:</span> {nino.genero}</p>
                        <p><span className="font-semibold">Dirección:</span> {nino.direccion_residencia}</p>
                        <p><span className="font-semibold">Tutor:</span> {getTutorNombre(nino.id_tutor)}</p>
                        <p><span className="font-semibold">Centro de Salud:</span> {getCentroNombre(nino.id_centro_salud)}</p>
                      </div>
                      {(() => {
                        try {
                          const { getCitasVacunas } = require('../../services/pacientesService');
                          const citas = getCitasVacunas(nino.id_niño) || [];
                          if (citas.length > 0) {
                            const proximaCita = citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
                            return (
                              <div className="mt-4 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700">
                                <span className="font-semibold text-primary-800 dark:text-primary-200">Próxima cita:</span>{" "}
                                <span className="font-medium">{new Date(proximaCita.fecha).toLocaleString()}</span>{" "}
                                <span className="font-medium">Vacuna: {vacunas.find(v => v.id_vacuna === proximaCita.vacunaId)?.nombre_vacuna || ''}</span>
                              </div>
                            );
                          }
                          return null;
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                    
                    <div>
                      <h6 className="text-md font-semibold mb-3">Historial de Vacunación</h6>
                      {getHistorialVacunas(nino.id_niño).length > 0 ? (
                        <Table aria-label="Historial de vacunación" isStriped isCompact removeWrapper>
                          <TableHeader>
                            <TableColumn>VACUNA</TableColumn>
                            <TableColumn>FECHA</TableColumn>
                            <TableColumn>LOTE</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {getHistorialVacunas(nino.id_niño).map((dosis, index) => (
                              <TableRow key={index}>
                                <TableCell>{dosis.nombre_vacuna}</TableCell>
                                <TableCell>{dosis.fecha_aplicacion}</TableCell>
                                <TableCell>{dosis.numero_lote}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-default-500">No hay registros de vacunación</p>
                      )}
                    </div>
                  </div>
                </CardBody>
              )}
            </Card>
          ))}
        </div>
      ) : searchTerm.trim() !== "" ? (
        <Card>
          <CardBody className="text-center py-8">
            <Chip color="warning" variant="flat" size="lg">
              No se encontraron resultados para la búsqueda.
            </Chip>
          </CardBody>
        </Card>
      ) : currentUser && currentUser.role === 'doctor' ? (
        <div className="text-center text-default-400 py-10">
          No hay pacientes registrados en tu(s) centro(s) asignado(s).
        </div>
      ) : (
        <div className="text-center text-default-400 py-10">
          No hay pacientes registrados.
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            {editingNino ? "Editar Paciente" : "Registrar Nuevo Paciente"}
          </ModalHeader>
          <ModalBody>
            <RegistroForm
              onClose={handleCloseModal}
              onNinoAdd={handleNinoAdd}
              onTutorAdd={handleTutorAdd}
              ninoToEdit={editingNino}
              onUpdateNino={handleUpdateNino}
              onUpdateTutor={handleUpdateTutor}
              tutores={tutores || []}
              centros={centrosVacunacion || []}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <VacunacionModal
        open={vacunacionModalOpen}
        onClose={() => setVacunacionModalOpen(false)}
        paciente={pacienteVacunacion}
        lotesVacunas={
          (lotesVacunas || [])
            .map((l, idx) => ({
              ...l,
              id_lote: l.id_lote || l.id || `${l.id_vacuna}_${l.numero_lote || idx}`
            }))
            .filter(l => pacienteVacunacion && l.id_centro === pacienteVacunacion.id_centro_salud && l.cantidad_disponible > 0)
        }
        vacunas={vacunas || []}
        historialVacunas={pacienteVacunacion ? getHistorialVacunas(pacienteVacunacion.id_niño) : []}
        citas={citasPaciente}
        onRegistrarVacuna={async (data) => {
          setLoadingVacunacion(true);
          try {
            if (!data.id_vacuna || !data.id_lote) {
              alert('Debes seleccionar vacuna y lote.');
              setLoadingVacunacion(false);
              return;
            }
            const nuevaDosis = {
              ...data,
              id_vacuna: String(data.id_vacuna),
              id_lote: String(data.id_lote),
              fecha_aplicacion: new Date().toISOString(),
            };
            const { jsonService } = require('../../services/jsonService');
            const dosisPrevias = jsonService.getData('Dosis_Aplicadas', 'GET') || [];
            jsonService.saveData('Dosis_Aplicadas', 'GET', [...dosisPrevias, nuevaDosis]);
            jsonService.saveData('Dosis_Aplicadas', 'POST', nuevaDosis);
            const lotes = jsonService.getData('Lotes_Vacunas', 'GET') || [];
            const loteIndex = lotes.findIndex(l => String(l.id_lote) === String(data.id_lote));
            if (loteIndex !== -1 && lotes[loteIndex].cantidad_disponible > 0) {
              lotes[loteIndex] = {
                ...lotes[loteIndex],
                cantidad_disponible: lotes[loteIndex].cantidad_disponible - 1
              };
              jsonService.saveData('Lotes_Vacunas', 'GET', lotes);
              jsonService.saveData('Lotes_Vacunas', 'PUT', lotes[loteIndex]);
              setLotesVacunas([...lotes]);
            }
            setDosisAplicadas(jsonService.getData('Dosis_Aplicadas', 'GET') || []);
            if (pacienteVacunacion) {
              const { getCitasVacunas } = require('../../services/pacientesService');
              setCitasPaciente(getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
          } catch (e) {
            alert('Error al registrar la vacunación');
            console.error('Error al registrar vacuna:', e);
          }
          setLoadingVacunacion(false);
        }}
        onRegistrarCita={async (cita) => {
          setLoadingVacunacion(true);
          try {
            const { agregarCitaVacuna, getCitasVacunas } = require('../../services/pacientesService');
            if (pacienteVacunacion) {
              await agregarCitaVacuna(pacienteVacunacion.id_niño, cita);
              setCitasPaciente(getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
            setCitaModalOpen(false);
          } catch (e) { console.error('Error al registrar cita:', e); }
          setLoadingVacunacion(false);
        }}
      />

      <CitaModal
        open={citaModalOpen}
        onClose={() => setCitaModalOpen(false)}
        paciente={pacienteVacunacion}
        vacunas={vacunas || []}
        loading={loadingVacunacion}
        onRegistrarCita={async (cita) => {
          setLoadingVacunacion(true);
          try {
            const { agregarCitaVacuna, getCitasVacunas } = require('../../services/pacientesService');
            if (pacienteVacunacion) {
              await agregarCitaVacuna(pacienteVacunacion.id_niño, cita);
              setCitasPaciente(getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
            setCitaModalOpen(false);
          } catch (e) { console.error('Error al registrar cita:', e); }
          setLoadingVacunacion(false);
        }}
        onEditarCita={async (citaId, datos) => {
          setLoadingVacunacion(true);
          try {
            const { editarCitaVacuna, getCitasVacunas } = require('../../services/pacientesService');
            if (pacienteVacunacion) {
              await editarCitaVacuna(pacienteVacunacion.id_niño, citaId, datos);
              setCitasPaciente(getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
          } catch (e) { console.error('Error al editar cita:', e); }
          setLoadingVacunacion(false);
        }}
        onEliminarCita={async (citaId) => {
          setLoadingVacunacion(true);
          try {
            const { eliminarCitaVacuna, getCitasVacunas } = require('../../services/pacientesService');
            if (pacienteVacunacion) {
              await eliminarCitaVacuna(pacienteVacunacion.id_niño, citaId);
              setCitasPaciente(getCitasVacunas(pacienteVacunacion.id_niño) || []);
            }
          } catch (e) { console.error('Error al eliminar cita:', e); }
          setLoadingVacunacion(false);
        }}
      />
    </div>
  );
}