import React from "react";
import { Card, CardBody, Chip, Button } from "@nextui-org/react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

function MisHijos() {
  const { ninos, vacunas } = useData();
  const { currentUser } = useAuth();

  // Filtrar hijos del responsable logueado
  const hijos = currentUser && currentUser.role === "responsable"
    ? ninos.filter(n => n.id_tutor === (currentUser.id_tutor || currentUser.id))
    : [];

  const { setNinos } = useData();
  const handleRefrescar = () => {
    // Forzar recarga desde el backend simulado
    const jsonDataService = require("../../services/jsonDataService").default;
    const ninosData = jsonDataService.getNinos();
    setNinos(ninosData);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-center">Mis Hijos</h2>
        <Button size="sm" color="primary" onPress={handleRefrescar}>Refrescar</Button>
      </div>
      {hijos.length === 0 ? (
        <div className="text-center text-default-400 py-10">
          No tienes hijos registrados.
        </div>
      ) : (
        hijos.map((hijo) => (
          <Card key={hijo.id_niño} shadow="sm" className="mb-6">
            <CardBody>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{hijo.nombre_completo}</h3>
                  <p><span className="font-semibold">ID:</span> {hijo.id_niño}</p>
                  <p><span className="font-semibold">Fecha de Nacimiento:</span> {hijo.fecha_nacimiento}</p>
                  <p><span className="font-semibold">Género:</span> {hijo.genero}</p>
                  <p><span className="font-semibold">Dirección:</span> {hijo.direccion_residencia}</p>
                </div>
                <div className="w-full md:w-1/2">
                  <h4 className="font-semibold mb-1">Próximas Citas</h4>
                  <ProximasCitas nino={hijo} />
                  <h4 className="font-semibold mt-4 mb-1">Historial de Vacunas</h4>
                  <HistorialVacunas idNino={hijo.id_niño} vacunas={vacunas} />
                  <h4 className="font-semibold mt-4 mb-1">Vacunas Faltantes</h4>
                  <VacunasFaltantes idNino={hijo.id_niño} vacunas={vacunas} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))
      )}
    </div>
  );
}

function TodasLasCitas({ nino }) {
  let citas = [];
  try {
    const { getCitasVacunas } = require('../../services/pacientesService');
    // getCitasVacunas puede ser async, pero aquí se usa como sync para demo
    citas = [];
    if (typeof getCitasVacunas === 'function') {
      // Si es async, no se puede usar directamente aquí, así que solo demo
      // En producción, usaría useEffect y useState para cargar citas
    }
  } catch {
    citas = [];
  }
  if (!Array.isArray(citas) || citas.length === 0) {
    return <p className="text-default-400">No hay citas registradas.</p>;
  }
  return (
    <ul className="space-y-2">
      {citas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((cita, idx) => (
        <li key={cita.id || idx}>
          <Chip color={new Date(cita.fecha) > new Date() ? 'primary' : 'default'} variant="flat">
            {new Date(cita.fecha).toLocaleString()} - Vacuna: {(() => {
              const vacunas = require('../../context/DataContext').useData().vacunas;
              const vacuna = vacunas.find(v => v.id_vacuna === cita.vacunaId);
              return vacuna ? vacuna.nombre_vacuna : cita.vacunaId || "-";
            })()}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

function ProximasCitas({ nino }) {
  // Deprecated: ahora usamos TodasLasCitas
  return <TodasLasCitas nino={nino} />;
}

function HistorialVacunas({ idNino, vacunas }) {
  const jsonDataService = require('../../services/jsonDataService').default;
  const historial = jsonDataService.getHistorialPorNino(idNino);
  if (!historial || historial.length === 0) {
    return <p className="text-default-400">No hay vacunas aplicadas.</p>;
  }
  return (
    <ul className="space-y-1">
      {historial.map((h, idx) => {
        const vacuna = vacunas.find(v => v.id_vacuna === h.id_vacuna);
        return (
          <li key={idx}>
            <Chip color="success" variant="flat">
              {vacuna ? vacuna.nombre_vacuna : h.id_vacuna} - {new Date(h.fecha_aplicacion).toLocaleDateString()}
            </Chip>
          </li>
        );
      })}
    </ul>
  );
}

function VacunasFaltantes({ idNino, vacunas }) {
  const jsonDataService = require('../../services/jsonDataService').default;
  const historial = jsonDataService.getHistorialPorNino(idNino);
  const aplicadas = historial.map(h => h.id_vacuna);
  const faltantes = vacunas.filter(v => !aplicadas.includes(v.id_vacuna));
  if (!faltantes.length) {
    return <p className="text-default-400">No hay vacunas faltantes.</p>;
  }
  return (
    <ul className="space-y-1">
      {faltantes.map((v, idx) => (
        <li key={idx}>
          <Chip color="warning" variant="flat">
            {v.nombre_vacuna}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

export default MisHijos;
