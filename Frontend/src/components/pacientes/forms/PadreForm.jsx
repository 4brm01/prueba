import React from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";

function ResponsableForm({ formData, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        type="text"
        label="Nombre Completo"
        name="nombre_completo"
        value={formData.nombre_completo}
        onChange={handleChange}
        placeholder="Ingrese el nombre completo del tutor"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">👤</span>
        }
      />
      
      <Input
        type="text"
        label="Identificación"
        name="identificacion"
        value={formData.identificacion}
        onChange={handleChange}
        placeholder="Número de identificación"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🪪</span>
        }
      />
      
      <Input
        type="tel"
        label="Teléfono"
        name="telefono"
        value={formData.telefono}
        onChange={handleChange}
        placeholder="Número de teléfono"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📞</span>
        }
      />
      
      <Input
        type="email"
        label="Correo Electrónico"
        name="correo_electronico"
        value={formData.correo_electronico}
        onChange={handleChange}
        placeholder="Dirección de correo electrónico"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📧</span>
        }
      />
      
      <Input
        type="text"
        label="Dirección"
        name="direccion"
        value={formData.direccion}
        onChange={handleChange}
        placeholder="Dirección completa"
        isRequired
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">📍</span>
        }
      />
      
      <Select
        label="Relación con el Niño"
        name="relacion"
        selectedKeys={formData.relacion ? [formData.relacion] : []}
        onChange={handleChange}
        isRequired
        variant="bordered"
        placeholder="Seleccione relación"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">👨‍👧</span>
        }
      >
        <SelectItem key="Responsable" value="Responsable">Responsable</SelectItem>
        <SelectItem key="Madre" value="Madre">Madre</SelectItem>
        <SelectItem key="Abuelo/a" value="Abuelo/a">Abuelo/a</SelectItem>
        <SelectItem key="Tío/a" value="Tío/a">Tío/a</SelectItem>
        <SelectItem key="Tutor Legal" value="Tutor Legal">Tutor Legal</SelectItem>
        <SelectItem key="Otro" value="Otro">Otro</SelectItem>
      </Select>
    </div>
  );
}

export default ResponsableForm;