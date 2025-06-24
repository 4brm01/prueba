import React from 'react';
import { Card, CardBody, CardHeader, Button, Divider } from "@nextui-org/react";

const CentrosList = ({ 
  filteredCentros, 
  handleCentroClick, 
  handleVerPacientes, 
  currentUser 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredCentros.map((centro) => (
        <div key={centro.id_centro} className="h-full flex flex-col">
          <Card 
            isPressable
            onPress={() => handleCentroClick(centro)}
            className="flex-grow"
            shadow="sm"
          >
            <CardHeader className="flex gap-3 bg-primary-50 dark:bg-primary-900/20">
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{centro.nombre_centro}</p>
                <p className="text-small text-default-500">{centro.nombre_corto || "Sin nombre corto"}</p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Dirección:</span> {centro.direccion}
                </p>
                <p>
                  <span className="font-semibold">Teléfono:</span> {centro.telefono}
                </p>
                <p>
                  <span className="font-semibold">Director:</span> {centro.director || "No asignado"}
                </p>
              </div>
            </CardBody>
          </Card>
          
          {(currentUser?.role === 'doctor' || 
            currentUser?.role === 'administrador' || 
            currentUser?.role === 'director') && (
            <div className="mt-2">
              <Button
                color="primary"
                fullWidth
                onClick={() => handleVerPacientes(null, centro)}
              >
                Ver Pacientes
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CentrosList;