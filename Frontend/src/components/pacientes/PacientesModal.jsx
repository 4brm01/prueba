import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter 
} from "@nextui-org/react";
import { 
  Button, 
  Input, 
  Card, 
  CardBody, 
  Chip, 
  Accordion, 
  AccordionItem, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Divider,
  Spinner
} from "@nextui-org/react";
import { getPacientesCentro } from '../../services/pacientesService';
import vacunasService from '../../services/vacunasService';

const PacientesModal = ({ isOpen, onClose, centro }) => {
  const { dosisAplicadas, vacunas, lotesVacunas, tutores } = useData();
  const [pacientesCentro, setPacientesCentro] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPacienteId, setExpandedPacienteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historialVacunas, setHistorialVacunas] = useState({});
  const [vacunasFaltantes, setVacunasFaltantes] = useState({});
  const initialLoadRef = useRef(false);

  useEffect(() => {
    let shouldLoad = true; // Flag to control loading

    const loadPacientes = async () => {
      if (!isOpen || !centro?.id_centro || initialLoadRef.current || loading) {
        console.log(`[Load] Skipping load: isOpen=${isOpen}, centro.id_centro=${centro?.id_centro}, initialLoadRef=${initialLoadRef.current}, loading=${loading}`);
        return;
      }

      setLoading(true);
      setError(null);
      initialLoadRef.current = true;
      console.log(`[Load #${Date.now()}] Cargando pacientes para centro ${centro.id_centro} (${centro.nombre_centro})`);

      try {
        const pacientesDelCentro = await getPacientesCentro(centro.id_centro);
        console.log(`[Load #${Date.now()}] Pacientes cargados desde getPacientesCentro:`, pacientesDelCentro);
        if (Array.isArray(pacientesDelCentro)) {
          setPacientesCentro(pacientesDelCentro);
        } else {
          console.error(`[Load #${Date.now()}] Los pacientes no son un arreglo válido:`, pacientesDelCentro);
          setError('Error en el formato de datos de pacientes');
        }
      } catch (error) {
        console.error(`[Load #${Date.now()}] Error cargando pacientes:`, error);
        setError('No se pudieron cargar los pacientes');
      } finally {
        if (shouldLoad) {
          console.log(`[Load #${Date.now()}] Finalizando carga, setting loading=false`);
          setLoading(false);
        }
      }
    };

    if (isOpen && !initialLoadRef.current) {
      loadPacientes();
    }

    return () => {
      shouldLoad = false; // Cancel state updates on unmount
      console.log(`[Load] Componente desmontado`);
    };
  }, [isOpen, centro?.id_centro, centro?.nombre_centro, loading]); // Dependency array

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredPacientes = pacientesCentro.filter(paciente => 
    (paciente.nombre_completo && paciente.nombre_completo.toLowerCase().includes(searchTerm)) ||
    (paciente.id_niño && paciente.id_niño.toString().includes(searchTerm))
  );

  const loadHistorialVacunas = (id_niño) => {
    if (!historialVacunas[id_niño]) {
      const historial = vacunasService.getHistorialVacunas(id_niño, { dosisAplicadas, vacunas, lotesVacunas });
      setHistorialVacunas(prev => ({ ...prev, [id_niño]: historial }));
    }
    return historialVacunas[id_niño] || [];
  };

  const loadVacunasFaltantes = (id_niño) => {
    if (!vacunasFaltantes[id_niño]) {
      const faltantes = vacunasService.getVacunasFaltantes(id_niño, { dosisAplicadas, vacunas });
      setVacunasFaltantes(prev => ({ ...prev, [id_niño]: faltantes }));
    }
    return vacunasFaltantes[id_niño] || [];
  };

  const getTutorNombre = (id_tutor) => {
    if (!id_tutor) return 'No especificado';
    const tutor = tutores.find(t => Number(t.id_tutor) === Number(id_tutor));
    return tutor ? `${tutor.nombre} ${tutor.apellido || ''}` : 'No encontrado';
  };

  const handleToggleExpand = (pacienteId, keys) => {
    if (keys && keys.has("details")) {
      setExpandedPacienteId(pacienteId);
    } else {
      setExpandedPacienteId(null);
    }
  };

  const handleToggleStatus = (e, pacienteId) => {
    e.stopPropagation();
    const paciente = pacientesCentro.find(p => p.id_niño === pacienteId);
    if (paciente) {
      const updatedPaciente = { ...paciente, activo: !paciente.activo };
      // Assuming jsonService.saveData is defined elsewhere
      // jsonService.saveData('Niños', 'PUT', updatedPaciente);
      setPacientesCentro(pacientesCentro.map(p => 
        p.id_niño === pacienteId ? { ...p, activo: updatedPaciente.activo } : p
      ));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>
          Pacientes de {centro?.nombre_centro || 'Centro no especificado'}
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Buscar paciente por nombre o ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="mb-4"
            isClearable
            startContent={<span className="text-default-400 text-small">🔍</span>}
          />

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" label="Cargando pacientes..." />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Chip color="danger" variant="flat" size="lg">{error}</Chip>
            </div>
          ) : filteredPacientes.length > 0 ? (
            <div className="space-y-3">
              {filteredPacientes.map(paciente => (
                <Card 
                  key={paciente.id_niño} 
                  className={`${!paciente.activo ? 'opacity-70' : ''}`}
                  shadow="sm"
                >
                  <CardBody className="p-0">
                    <Accordion 
                      variant="shadow"
                      selectionMode="single"
                      selectedKeys={expandedPacienteId === paciente.id_niño ? ["details"] : []}
                      onSelectionChange={(keys) => handleToggleExpand(paciente.id_niño, keys)}
                    >
                      <AccordionItem
                        key="details"
                        aria-label={`Detalles de ${paciente.nombre_completo}`}
                        title={
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{paciente.nombre_completo}</span>
                              {!paciente.activo && <Chip color="warning" size="sm" variant="flat">Inactivo</Chip>}
                            </div>
                            <div className="text-small text-default-500">
                              ID: {paciente.id_niño} | Tutor: {getTutorNombre(paciente.id_tutor)}
                            </div>
                          </div>
                        }
                        indicator={
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color={paciente.activo ? "danger" : "success"}
                              variant="flat"
                              onClick={(e) => handleToggleStatus(e, paciente.id_niño)}
                            >
                              {paciente.activo ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                        }
                      >
                        <div className="px-2 py-3 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div><span className="font-semibold">Fecha de Nacimiento:</span> {paciente.fecha_nacimiento || 'No especificada'}</div>
                            <div><span className="font-semibold">Género:</span> {paciente.genero || 'No especificado'}</div>
                            <div><span className="font-semibold">Dirección:</span> {paciente.direccion_residencia || 'No especificada'}</div>
                          </div>
                          
                          <Divider />
                          
                          <div>
                            <h6 className="text-md font-semibold mb-2">Historial de Vacunación</h6>
                            {loadHistorialVacunas(paciente.id_niño).length > 0 ? (
                              <Table aria-label="Historial de vacunación" isStriped isCompact removeWrapper>
                                <TableHeader>
                                  <TableColumn>VACUNA</TableColumn>
                                  <TableColumn>FECHA</TableColumn>
                                  <TableColumn>LOTE</TableColumn>
                                </TableHeader>
                                <TableBody>
                                  {loadHistorialVacunas(paciente.id_niño).map((dosis, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{dosis.nombre_vacuna}</TableCell>
                                      <TableCell>{dosis.fecha_aplicacion || 'No especificada'}</TableCell>
                                      <TableCell>{dosis.numero_lote}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : <p className="text-default-500">No hay registros de vacunación</p>}
                          </div>
                          
                          <Divider />
                          
                          <div>
                            <h6 className="text-md font-semibold mb-2">Vacunas Pendientes</h6>
                            {loadVacunasFaltantes(paciente.id_niño).length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {loadVacunasFaltantes(paciente.id_niño).map((vacuna, index) => (
                                  <Chip key={index} color="warning" variant="flat">{vacuna}</Chip>
                                ))}
                              </div>
                            ) : <Chip color="success" variant="flat">Todas las vacunas aplicadas</Chip>}
                          </div>
                        </div>
                      </AccordionItem>
                    </Accordion>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Chip color="warning" variant="flat" size="lg">
                {searchTerm 
                  ? "No se encontraron pacientes que coincidan con la búsqueda." 
                  : "No hay pacientes registrados en este centro."}
              </Chip>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PacientesModal;