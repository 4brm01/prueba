import React from 'react';

const LotesSection = ({ lotes, vacunas, centros, onAdd, onEdit, onDelete, canEdit }) => (
  <div className="admin-section animate-fadeIn">
    <div className="section-header">
      <div className="section-title">
        <h3>Lotes de Vacunas</h3>
        <p className="section-description">Gestiona los lotes de vacunas y su distribución</p>
      </div>
      {canEdit && (
        <button className="btn-primary" onClick={onAdd}>
          <span className="btn-icon">+</span>
          <span>Añadir Lote</span>
        </button>
      )}
    </div>
    <div className="data-table-container">
      <div className="modern-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Vacuna</th>
              <th>Número de Lote</th>
              <th>Fecha Vencimiento</th>
              <th>Cantidad Dosis</th>
              <th>Centro Asignado</th>
              {canEdit && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {lotes.map(lote => {
              const vacuna = vacunas.find(v => v.id_vacuna === lote.id_vacuna);
              const centro = centros.find(c => c.id_centro === lote.id_centro);
              return (
                <tr key={lote.id_lote}>
                  <td>{vacuna ? vacuna.nombre_vacuna : 'Desconocida'}</td>
                  <td>{lote.numero_lote}</td>
                  <td>{lote.fecha_vencimiento}</td>
                  <td>{lote.cantidad_dosis}</td>
                  <td>{centro ? centro.nombre_centro : 'No asignado'}</td>
                  {canEdit && (
                    <td>
                      <div className="relative flex gap-2">
                        <button className="btn-edit" onClick={() => onEdit(lote)}>✏️ Editar</button>
                        <button className="btn-delete" onClick={() => onDelete(lote)}>🗑️ Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default LotesSection;
