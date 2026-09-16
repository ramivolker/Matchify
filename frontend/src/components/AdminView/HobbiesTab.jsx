import React from 'react';

export default function HobbiesTab({
  hobbies,
  loading,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}) {
  return (
    <div className="card table-card">
      <div className="table-header">
        <h3>Catálogo de Intereses</h3>
        <div className="table-tools">
          <button className="btn btn-secondary btn-sm" onClick={onRefresh}>
            <span className="btn-icon">↻</span> Refrescar
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Hobbie</th>
              <th>Descripción</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-cell">
                  <div className="spinner"></div>
                  <p>Cargando hobbies...</p>
                </td>
              </tr>
            ) : hobbies.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="empty-state">
                    <div className="empty-state-icon">🎨</div>
                    <h4>No hay hobbies cargados</h4>
                    <p>Registra las actividades e intereses que los usuarios podrán elegir.</p>
                    <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>
                      + Crear Hobbie
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              hobbies.map((h) => (
                <tr key={h.id}>
                  <td>
                    <strong>#{h.id}</strong>
                  </td>
                  <td>
                    <strong>🎨 {h.nombre}</strong>
                  </td>
                  <td>
                    {h.descripcion ? (
                      h.descripcion
                    ) : (
                      <span className="text-muted">Sin descripción</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="actions-group">
                      <button
                        className="btn btn-action-edit btn-sm"
                        onClick={() => onOpenEdit(h)}
                        title="Editar hobbie"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-action-delete btn-sm"
                        onClick={() => onOpenDelete(h)}
                        title="Eliminar hobbie"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
