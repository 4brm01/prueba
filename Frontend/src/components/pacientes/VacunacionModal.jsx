import React, { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Input, Select, SelectItem, Textarea, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, DatePicker, TimeInput
} from "@nextui-org/react";

export default function VacunacionModal({
  open,
  onClose,
  paciente,
  vacunas,
  lotesVacunas,
  historialVacunas = [],
  citas = [],
  onRegistrarVacuna,
  onRegistrarCita,
  onEditarCita,
  onEliminarCita,
  loading
}) {
  const [vacunaId, setVacunaId] = useState("");
  const [loteId, setLoteId] = useState("");
  const [notasVacuna, setNotasVacuna] = useState("");
  const [citaFecha, setCitaFecha] = useState(null);
  const [citaHora, setCitaHora] = useState(null);
  const [citaVacunaId, setCitaVacunaId] = useState("");
  const [citaNotas, setCitaNotas] = useState("");
  const [editCitaId, setEditCitaId] = useState(null);
  const [editCitaData, setEditCitaData] = useState(null);

  // Sincronización automática de vacunaId y loteId
  React.useEffect(() => {
    // Si el modal se abre o cambia el paciente/vacunas, resetear selección
    if (open) {
      if (vacunas && vacunas.length === 1) {
        setVacunaId(vacunas[0].id_vacuna);
      } else {
        setVacunaId("");
      }
      setLoteId("");
    }
  }, [open, paciente, vacunas]);

  // Cuando cambia la vacuna seleccionada, resetear loteId y seleccionar automáticamente si solo hay un lote
  React.useEffect(() => {
    if (!vacunaId) {
      setLoteId("");
      return;
    }
    const lotesFiltrados = lotesVacunas.filter(l => l.id_vacuna === vacunaId && l.cantidad_disponible > 0);
    if (lotesFiltrados.length === 1) {
      setLoteId(lotesFiltrados[0].id_lote);
    } else {
      setLoteId("");
    }
  }, [vacunaId, lotesVacunas]);


  // Manejo de edición de cita
  const handleEditCita = (cita) => {
    setEditCitaId(cita.id);
    setEditCitaData({ ...cita });
    setCitaFecha(new Date(cita.fecha));
    setCitaHora(cita.hora);
    setCitaVacunaId(cita.vacunaId);
    setCitaNotas(cita.notas || "");
  };

  const handleSaveEditCita = () => {
    if (!editCitaId) return;
    onEditarCita(editCitaId, {
      ...editCitaData,
      fecha: citaFecha,
      hora: citaHora,
      vacunaId: citaVacunaId,
      notas: citaNotas,
    });
    setEditCitaId(null);
    setEditCitaData(null);
    setCitaFecha(null);
    setCitaHora(null);
    setCitaVacunaId("");
    setCitaNotas("");
  };

  // Manejo de registro de vacunación
  const handleRegistrarVacuna = () => {
    if (!vacunaId || !loteId) return;
    // Solo pasa los datos al handler padre, la lógica de descuento está en GestionPacientes.jsx
    onRegistrarVacuna({
      id_niño: paciente.id_niño,
      id_vacuna: vacunaId,
      id_lote: loteId,
      fecha_aplicacion: new Date().toISOString(),
      notas: notasVacuna,
    });
    setVacunaId("");
    setLoteId("");
    setNotasVacuna("");
  };


  // Manejo de agendar nueva cita


  // --- Cálculo de próxima cita ---
  const now = new Date();
  const proximaCita = Array.isArray(citas)
    ? citas
        .filter(cita => cita.fecha && new Date(cita.fecha) > now)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0]
    : null;

  return (
    <Modal isOpen={open} onClose={onClose} size="2xl" scrollBehavior="inside" backdrop="blur">
      <ModalContent>
        <ModalHeader>
          Registrar Vacunación y Próxima Cita
        </ModalHeader>
        <ModalBody>
          {/* Próxima cita destacada */}
          {proximaCita && (
            <div className="mb-4 p-3 rounded-lg bg-primary-100 dark:bg-primary-900/40 border border-primary-300 dark:border-primary-700">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="font-semibold text-primary-800 dark:text-primary-200">Próxima cita:</span>
                <span className="font-medium">{new Date(proximaCita.fecha).toLocaleString()}</span>
                <span className="font-medium">Vacuna: {vacunas.find(v => v.id_vacuna === proximaCita.vacunaId)?.nombre_vacuna || ''}</span>
              </div>
            </div>
          )}
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Historial de Vacunas Recientes</h5>
            {historialVacunas.length > 0 ? (
              <Table aria-label="Historial de vacunación" isStriped removeWrapper>
                <TableHeader>
                  <TableColumn>Vacuna</TableColumn>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Lote</TableColumn>
                  <TableColumn>Notas</TableColumn>
                </TableHeader>
                <TableBody>
                  {historialVacunas.slice(-5).reverse().map((dosis, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{dosis.nombre_vacuna}</TableCell>
                      <TableCell>{dosis.fecha_aplicacion ? new Date(dosis.fecha_aplicacion).toLocaleString() : ""}</TableCell>
                      <TableCell>{dosis.numero_lote || "N/A"}</TableCell>
                      <TableCell>{dosis.notas || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-default-400">No hay historial de vacunación registrado.</p>
            )}
          </div>

          <div className="mb-4">
            <h5 className="font-semibold mb-2">Registrar Nueva Vacunación</h5>
            <Select
              label="Vacuna Aplicada"
              value={vacunaId}
              onChange={e => { setVacunaId(e.target.value); setLoteId(''); }}
              className="mb-2"
              required
            >
              {vacunas.map(v => (
                <SelectItem key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</SelectItem>
              ))}
            </Select>
            <Select
              label="Lote de Vacuna"
              value={loteId}
              onChange={e => setLoteId(e.target.value)}
              className="mb-2"
              required
              isDisabled={!vacunaId}
              placeholder={vacunaId ? "Selecciona un lote" : "Selecciona primero una vacuna"}
            >
              {vacunaId && lotesVacunas.filter(l => l.id_vacuna === vacunaId && l.cantidad_disponible > 0).length === 0 && (
                <SelectItem key="no-lotes" value="" disabled>
                  No hay lotes disponibles para esta vacuna
                </SelectItem>
              )}
              {vacunaId && lotesVacunas.filter(l => l.id_vacuna === vacunaId && l.cantidad_disponible > 0).map(l => (
                <SelectItem key={l.id_lote} value={l.id_lote}>
                  {l.numero_lote} (Disponibles: {l.cantidad_disponible})
                </SelectItem>
              ))}
            </Select>
            <Input
              label="Fecha y Hora de Aplicación"
              value={new Date().toLocaleString()}
              disabled
              className="mb-2"
            />
            <Textarea
              label="Notas (opcional)"
              value={notasVacuna}
              onChange={e => setNotasVacuna(e.target.value)}
              className="mb-2"
            />
            <Button color="primary" onClick={handleRegistrarVacuna} isDisabled={!vacunaId || loading} fullWidth>
              Registrar Vacunación
            </Button>
          </div>



          <div className="mb-4">
            <h5 className="font-semibold mb-2">Próximas Citas</h5>
            {citas.length > 0 ? (
              <Table aria-label="Citas futuras" isStriped removeWrapper>
                <TableHeader>
                  <TableColumn>Vacuna</TableColumn>
                  <TableColumn>Fecha</TableColumn>
                  <TableColumn>Notas</TableColumn>
                  <TableColumn>Acciones</TableColumn>
                </TableHeader>
                <TableBody>
                  {citas.map((cita, idx) => (
                    <TableRow key={cita.id || idx}>
                      <TableCell>{vacunas.find(v => v.id_vacuna === cita.vacunaId)?.nombre_vacuna || ""}</TableCell>
                      <TableCell>{cita.fecha ? new Date(cita.fecha).toLocaleString() : ""}</TableCell>
                      <TableCell>{cita.notas || ""}</TableCell>
                      <TableCell>
                        <Button size="sm" color="primary" variant="flat" onClick={() => handleEditCita(cita)} className="mr-1">Editar</Button>
                        <Button size="sm" color="danger" variant="flat" onClick={() => onEliminarCita(cita.id)}>Cancelar</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-default-400">No hay citas futuras registradas.</p>
            )}
          </div>

          {/* Modal de edición de cita */}
          {editCitaId && (
            <div className="mb-4 border-t pt-4 mt-4">
              <h5 className="font-semibold mb-2">Editar Cita</h5>
              <div className="flex gap-2 mb-2">
                <DatePicker
                  label="Fecha de la cita"
                  value={citaFecha}
                  onChange={setCitaFecha}
                  required
                />
                <TimeInput
                  label="Hora de la cita"
                  value={citaHora}
                  onChange={setCitaHora}
                  required
                />
              </div>
              <Select
                label="Vacuna a aplicar"
                value={citaVacunaId}
                onChange={e => setCitaVacunaId(e.target.value)}
                className="mb-2"
                required
              >
                {vacunas.map(v => (
                  <SelectItem key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</SelectItem>
                ))}
              </Select>
              <Textarea
                label="Notas para la cita (opcional)"
                value={citaNotas}
                onChange={e => setCitaNotas(e.target.value)}
                className="mb-2"
              />
              <Button color="primary" onClick={handleSaveEditCita} isDisabled={!citaFecha || !citaHora || !citaVacunaId || loading} className="mr-2">Guardar Cambios</Button>
              <Button color="default" variant="flat" onClick={() => setEditCitaId(null)}>Cancelar</Button>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onClick={onClose}>Cerrar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
