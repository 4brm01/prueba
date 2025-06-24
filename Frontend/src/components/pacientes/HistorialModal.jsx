import React from 'react';
import { useData } from '../../context/DataContext';
import { Modal, ModalBody, ModalHeader, ModalFooter } from "../ui/Modal";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "../ui/Table";
import { Button, Chip, Divider } from "@nextui-org/react";

const HistorialModal = ({ isOpen, onClose, paciente }) => {
  const { getHistorialVacunas, getVacunasFaltantes } = useData();
  
  const historialVacunas = getHistorialVacunas(paciente.id_niño);
  const vacunasFaltantes = getVacunasFaltantes(paciente.id_niño);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalHeader>
        Historial de Vacunación - {paciente.nombre_completo || `${paciente.nombre} ${paciente.apellido}`}
      </ModalHeader>
      <ModalBody>
        <div className="space-y-6">
          <div>
            <h5 className="text-lg font-semibold mb-3">Vacunas Aplicadas</h5>
            {historialVacunas.length > 0 ? (
              <Table
                isStriped
                isCompact
                removeWrapper
                aria-label="Historial de vacunación"
              >
                <TableHeader>
                  <TableColumn>VACUNA</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>LOTE</TableColumn>
                  <TableColumn>DOSIS</TableColumn>
                </TableHeader>
                <TableBody>
                  {historialVacunas.map((dosis, index) => (
                    <TableRow key={index}>
                      <TableCell>{dosis.nombre_vacuna}</TableCell>
                      <TableCell>{dosis.fecha_aplicacion}</TableCell>
                      <TableCell>{dosis.numero_lote}</TableCell>
                      <TableCell>{dosis.numero_dosis}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-default-500">No hay vacunas registradas para este paciente.</p>
            )}
          </div>

          <Divider />

          <div>
            <h5 className="text-lg font-semibold mb-3">Vacunas Pendientes</h5>
            {vacunasFaltantes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {vacunasFaltantes.map((vacuna, index) => (
                  <Chip key={index} color="warning" variant="flat">
                    {vacuna}
                  </Chip>
                ))}
              </div>
            ) : (
              <Chip color="success" variant="flat">
                El paciente tiene todas las vacunas requeridas.
              </Chip>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" variant="light" onPress={onClose}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default HistorialModal;