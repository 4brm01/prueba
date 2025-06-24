import React from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";

function NinoForm({ formData, handleChange, centros }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        type="text"
        label="Nombre Completo"
        name="nombre_completo"
        value={formData.nombre_completo}
        onChange={handleChange}
        placeholder="Ingrese el nombre completo"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">👤</span>
        }
      />
      
      <Input
        type="date"
        label="Fecha de Nacimiento"
        name="fecha_nacimiento"
        value={formData.fecha_nacimiento}
        onChange={handleChange}
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📅</span>
        }
      />
      
      <Select
        label="Género"
        name="genero"
        selectedKeys={formData.genero ? [formData.genero] : []}
        onChange={handleChange}
        isRequired
        variant="bordered"
        placeholder="Seleccione género"
        startContent={
          <span className="text-default-400 text-small">⚥</span>
        }
      >
        <SelectItem key="Masculino" value="Masculino">Masculino</SelectItem>
        <SelectItem key="Femenino" value="Femenino">Femenino</SelectItem>
        <SelectItem key="Otro" value="Otro">Otro</SelectItem>
      </Select>
      
      <Input
        type="text"
        label="Identificación"
        name="identificacion"
        value={formData.identificacion}
        onChange={handleChange}
        placeholder="Número de identificación (si aplica)"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🪪</span>
        }
      />
      
      <Input
        type="text"
        label="Dirección de Residencia"
        name="direccion_residencia"
        value={formData.direccion_residencia}
        onChange={handleChange}
        placeholder="Ingrese la dirección completa"
        isRequired
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">📍</span>
        }
      />
      
      <Input
        type="text"
        label="Nacionalidad"
        name="nacionalidad"
        value={formData.nacionalidad}
        onChange={handleChange}
        placeholder="Ingrese la nacionalidad"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🏳️</span>
        }
      />
      
      <Input
        type="text"
        label="País de Nacimiento"
        name="pais_nacimiento"
        value={formData.pais_nacimiento}
        onChange={handleChange}
        placeholder="Ingrese el país de nacimiento"
        isRequired
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">🌎</span>
        }
      />
      
      <Select
        label="Centro de Salud"
        name="id_centro_salud"
        selectedKeys={formData.id_centro_salud ? [formData.id_centro_salud] : []}
        onChange={handleChange}
        isRequired
        variant="bordered"
        placeholder="Seleccione un centro"
        startContent={
          <span className="text-default-400 text-small">🏥</span>
        }
      >
        {centros && centros.map((centro) => (
          <SelectItem key={centro.id_centro} value={centro.id_centro}>
            {centro.nombre_centro}
          </SelectItem>
        ))}
      </Select>
      
      <Input
        type="tel"
        label="Contacto Principal"
        name="contacto_principal"
        value={formData.contacto_principal}
        onChange={handleChange}
        placeholder="Número de teléfono de contacto"
        variant="bordered"
        startContent={
          <span className="text-default-400 text-small">📞</span>
        }
      />
      
      <Input
        type="text"
        label="ID Salud Nacional"
        name="id_salud_nacional"
        value={formData.id_salud_nacional}
        onChange={handleChange}
        placeholder="Número de identificación del sistema de salud (si aplica)"
        variant="bordered"
        className="md:col-span-2"
        startContent={
          <span className="text-default-400 text-small">🏥</span>
        }
      />
    </div>
  );
}

export default NinoForm;