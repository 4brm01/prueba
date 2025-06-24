import React, { useState } from "react";
import {
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Button, Select, SelectItem, Textarea, DatePicker, TimeInput
} from "@nextui-org/react";

export default function CitaModal({
  open,
  onClose,
  paciente,
  vacunas = [],
  onRegistrarCita,
  loading
}) {
  const [citaFecha, setCitaFecha] = useState(null);
  const [citaHora, setCitaHora] = useState(null);
  const [citaVacunaId, setCitaVacunaId] = useState("");
  const [citaNotas, setCitaNotas] = useState("");

  const handleRegistrarCita = () => {
    if (!citaFecha || !citaHora || !citaVacunaId) return;
    let dateObj;
    // Si citaFecha es Date
    if (citaFecha instanceof Date) {
      dateObj = citaFecha;
    } else if (typeof citaFecha === "string") {
      // Si es string tipo 'YYYY-MM-DD'
      const [year, month, day] = citaFecha.split("-").map(Number);
      dateObj = new Date(year, month - 1, day);
    } else if (typeof citaFecha === "object" && citaFecha !== null) {
      // Si es objeto plano tipo { year, month, day }
      const { year, month, day } = citaFecha;
      dateObj = new Date(year, (month || 1) - 1, day || 1);
    } else {
      // Fallback
      dateObj = new Date();
    }
    // Agregar hora
    let hours, minutes;
    if (typeof citaHora === "string") {
      [hours, minutes] = citaHora.split(":").map(Number);
    } else if (typeof citaHora === "object" && citaHora !== null) {
      hours = citaHora.hour ?? 0;
      minutes = citaHora.minute ?? 0;
    } else {
      hours = 0;
      minutes = 0;
    }
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    const fechaISO = dateObj.toISOString();
    onRegistrarCita({
      id_niño: paciente.id_niño,
      vacunaId: citaVacunaId,
      fecha: fechaISO,
      notas: citaNotas,
    });
    setCitaFecha(null);
    setCitaHora(null);
    setCitaVacunaId("");
    setCitaNotas("");
  };


  return (
    <Modal isOpen={open} onClose={onClose} size="md" scrollBehavior="inside" backdrop="blur">
      <ModalContent>
        <ModalHeader>
          Agendar Próxima Cita
        </ModalHeader>
        <ModalBody>
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
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={handleRegistrarCita} isDisabled={!citaFecha || !citaHora || !citaVacunaId || loading}>
            Agendar Cita
          </Button>
          <Button color="default" variant="flat" onClick={onClose}>Cancelar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
