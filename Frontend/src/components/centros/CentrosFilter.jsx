import React, { useMemo } from 'react';
import centrosService from '../../services/centrosService';
import { Select, SelectItem } from "@nextui-org/react";

const CentrosFilter = ({ filterType, setFilterType, filterTerm, setFilterTerm, centrosVacunacion }) => {
  const filterTypes = useMemo(() => [
    {
      value: "provincia",
      label: "Filtrar por Provincia",
      allLabel: "Todas las Provincias"
    },
    {
      value: "sector",
      label: "Filtrar por Sector",
      allLabel: "Todos los Sectores"
    },
    {
      value: "director",
      label: "Filtrar por Director",
      allLabel: "Todos los Directores"
    }
  ], []);

  const getCurrentFilterType = () => filterTypes.find(type => type.value === filterType);
  const filterOptions = centrosService.getFilterOptions(filterType, centrosVacunacion);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select
        label="Tipo de filtro"
        placeholder="Selecciona un tipo de filtro"
        selectedKeys={[filterType]}
        className="md:max-w-xs"
        onChange={(e) => {
          setFilterType(e.target.value);
          setFilterTerm("");
        }}
      >
        {filterTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </Select>
      
      <Select
        label={getCurrentFilterType()?.label}
        placeholder={getCurrentFilterType()?.allLabel}
        selectedKeys={filterTerm ? [filterTerm] : []}
        className="md:max-w-xs flex-grow"
        onChange={(e) => setFilterTerm(e.target.value)}
      >
        <SelectItem key="" value="">
          {getCurrentFilterType()?.allLabel}
        </SelectItem>
        {filterOptions.map((option, index) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
};

export default CentrosFilter;