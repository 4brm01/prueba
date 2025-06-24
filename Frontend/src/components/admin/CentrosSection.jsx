import React from 'react';

const CentrosSection = ({ centros, directores, onAdd, onEdit, onDelete, canEdit }) => (
  <div className="admin-section animate-fadeIn">
    <div className="section-header">
      <div className="section-title">
        <h3>Centros de Vacunación</h3>
        <p className="section-description">Gestiona los centros de vacunación del sistema</p>
      </div>
      {canEdit && (
        <button className="btn-primary" onClick={onAdd}>
          <span className="btn-icon">+</span>
          <span>Añadir Centro</span>
        </button>
      )}
    </div>
    <div className="data-table-container">
      <div className="modern-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Director</th>
              {canEdit && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {centros.map(centro => (
              <tr key={centro.id_centro}>
                <td>
                  <div className="cell-content">
                    <span className="cell-icon">🏥</span>
                    <span>{centro.nombre_centro}</span>
                  </div>
                </td>
                <td>{centro.direccion}</td>
                <td>{centro.telefono}</td>
                <td>
                  <div className="cell-content">
                    <span className="cell-icon">👤</span>
                    <span>{centro.director || 'No asignado'}</span>
                  </div>
                </td>
                {canEdit && (
                  <td>
                    <div className="relative flex gap-2">
                      <button className="btn-edit" onClick={() => onEdit(centro)}>✏️ Editar</button>
                      <button className="btn-delete" onClick={() => onDelete(centro)}>🗑️ Eliminar</button>
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

export default CentrosSection;
