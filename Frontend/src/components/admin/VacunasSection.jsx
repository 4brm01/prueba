import React from 'react';

const VacunasSection = ({ vacunas, onAdd, onEdit, onDelete, canEdit }) => (
  <div className="admin-section animate-fadeIn">
    <div className="section-header">
      <div className="section-title">
        <h3>Vacunas</h3>
        <p className="section-description">Gestiona el catálogo de vacunas disponibles</p>
      </div>
      {canEdit && (
        <button className="btn-primary" onClick={onAdd}>
          <span className="btn-icon">+</span>
          <span>Añadir Vacuna</span>
        </button>
      )}
    </div>
    <div className="data-table-container">
      <div className="modern-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fabricante</th>
              <th>Tipo</th>
              <th>Dosis Requeridas</th>
              {canEdit && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {vacunas.map(vacuna => (
              <tr key={vacuna.id_vacuna}>
                <td>
                  <div className="cell-content">
                    <span className="cell-icon">💉</span>
                    <span>{vacuna.nombre_vacuna}</span>
                  </div>
                </td>
                <td>{vacuna.fabricante}</td>
                <td><span className="badge">{vacuna.tipo}</span></td>
                <td><span className="badge badge-info">{vacuna.dosis_requeridas}</span></td>
                {canEdit && (
                  <td>
                    <div className="relative flex gap-2">
                      <button className="btn-edit" onClick={() => onEdit(vacuna)}>✏️ Editar</button>
                      <button className="btn-delete" onClick={() => onDelete(vacuna)}>🗑️ Eliminar</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default VacunasSection;
