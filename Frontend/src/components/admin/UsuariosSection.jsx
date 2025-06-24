import React from 'react';

const UsuariosSection = ({ usuarios, onAdd, onEdit, onDelete, onToggleStatus, canEdit, currentUser }) => (
  <div className="admin-section animate-fadeIn">
    <div className="section-header">
      <div className="section-title">
        <h3>Usuarios del Sistema</h3>
        <p className="section-description">Gestiona los usuarios y sus permisos</p>
      </div>
      {canEdit && (
        <button className="btn-primary" onClick={onAdd}>
          <span className="btn-icon">+</span>
          <span>Añadir Usuario</span>
        </button>
      )}
    </div>
    <div className="data-table-container">
      <div className="modern-table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Email</th>
              <th>Estado</th>
              {canEdit && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {/* Usuario administrador principal */}
            <tr>
              <td>
                <div className="cell-content">
                  <span className="cell-icon">👤</span>
                  <span>Administrador Sistema</span>
                </div>
              </td>
              <td>admin</td>
              <td><span className="badge badge-primary">Administrador</span></td>
              <td>admin@sistema.com</td>
              <td>
                <button
                  className="badge badge-success"
                  style={{ cursor: 'not-allowed', border: 'none', opacity: '0.8' }}
                  title="El administrador principal no puede ser desactivado"
                  disabled
                >
                  Activo
                </button>
              </td>
              {canEdit && (
                <td>
                  <div className="relative flex gap-2">
                    <button className="btn-edit" onClick={() => onEdit({
                      id: 'admin',
                      nombre: 'Administrador Sistema',
                      username: 'admin',
                      email: 'admin@sistema.com',
                      rol: 'administrador',
                      activo: true
                    })}>✏️ Editar</button>
                    <button className="btn-delete" disabled style={{ opacity: '0.5' }}>🗑️ Eliminar</button>
                  </div>
                </td>
              )}
            </tr>
            {/* Otros usuarios */}
            {usuarios.filter(user => user.id !== 'admin-1').map(usuario => (
              <tr key={usuario.id}>
                <td>
                  <div className="cell-content">
                    <span className="cell-icon">👤</span>
                    <span>{usuario.nombre}</span>
                  </div>
                </td>
                <td>{usuario.username}</td>
                <td>
                  <span className={`badge ${usuario.rol === 'director' ? 'badge-info' :
                    usuario.rol === 'doctor' ? 'badge-secondary' :
                    usuario.rol === 'responsable' ? 'badge-warning' :
                    'badge-primary'}`}>{usuario.rol === 'responsable' ? 'Responsable' : usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}</span>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <button
                    className={`badge ${usuario.activo !== false ? 'badge-success' : 'badge-danger'}`}
                    onClick={() => canEdit && onToggleStatus(usuario)}
                    style={{ cursor: canEdit ? 'pointer' : 'not-allowed', border: 'none' }}
                    title={usuario.activo !== false ? 'Clic para desactivar' : 'Clic para activar'}
                    disabled={!canEdit}
                  >
                    {usuario.activo !== false ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                {canEdit && (
                  <td>
                    <div className="relative flex gap-2">
                      <button className="btn-edit" onClick={() => onEdit(usuario)}>✏️ Editar</button>
                      <button className="btn-delete" onClick={() => onDelete(usuario)}>🗑️ Eliminar</button>
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

export default UsuariosSection;
