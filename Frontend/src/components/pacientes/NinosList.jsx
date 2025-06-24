import React from "react";
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell, 
  Chip 
} from "@nextui-org/react";

function NinosList() {
  const { ninos, tutores, centrosVacunacion } = useData();
  const { currentUser } = useAuth();

  // Filtrado por centro para doctores
  const getCentrosDoctor = () => {
    if (!currentUser || currentUser.role !== 'doctor') return [];
    if (Array.isArray(currentUser.centrosAsignados) && currentUser.centrosAsignados.length > 0) {
      return currentUser.centrosAsignados;
    } else if (currentUser.id_centro) {
      return [currentUser.id_centro];
    }
    return [];
  };

  let pacientesFiltrados = ninos;
  if (currentUser && currentUser.role === 'doctor') {
    const centrosDoctor = getCentrosDoctor();
    if (centrosDoctor.length > 0) {
      pacientesFiltrados = ninos.filter(n => centrosDoctor.includes(n.id_centro_salud));
    } else {
      pacientesFiltrados = [];
    }
  }

  const getTutorNombre = (idTutor) => {
    const tutor = tutores.find((t) => t.id_tutor === idTutor);
    return tutor ? `${tutor.nombre} ${tutor.apellido}` : "No especificado";
  };

  const getCentroNombre = (idCentro) => {
    const centro = Array.isArray(centrosVacunacion) ? centrosVacunacion.find(c => c.id_centro === idCentro) : null;
    return centro ? centro.nombre_centro : "No especificado";
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold text-center mb-6">Listado de Niños</h2>
      <Card shadow="sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Pacientes Registrados</h3>
        </CardHeader>
        <CardBody>
          {pacientesFiltrados.length > 0 ? (
            <Table aria-label="Lista de niños" isStriped removeWrapper>
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Nombre</TableColumn>
                <TableColumn>Tutor</TableColumn>
                <TableColumn>Centro de Salud</TableColumn>
              </TableHeader>
              <TableBody>
                {pacientesFiltrados.map((nino) => (
                  <TableRow key={nino.id_niño}>
                    <TableCell>{nino.id_niño}</TableCell>
                    <TableCell>{nino.nombre_completo}</TableCell>
                    <TableCell>{getTutorNombre(nino.id_tutor)}</TableCell>
                    <TableCell>{getCentroNombre(nino.id_centro_salud)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Chip color="warning" variant="flat" size="lg">
              No hay pacientes registrados.
            </Chip>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default NinosList;