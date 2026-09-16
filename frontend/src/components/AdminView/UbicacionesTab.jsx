import React from 'react';

export default function UbicacionesTab({
  ubicaciones,
  loading,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
}) {
  return (
    <div className="card table-card">
      <div className="table-header">
        <h3>Ciudades y Regiones</h3>
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
              <th>Ciudad</th>
              <th>Provincia / Región</th>
              <th>País</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  <div className="spinner"></div>
                  <p>Cargando ubicaciones...</p>
                </td>
              </tr>
            ) : ubicaciones.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-state-icon">📍</div>
                    <h4>No hay ubicaciones registradas</h4>
                    <p>Agrega ciudades y regiones para asociar a los usuarios.</p>
                    <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>
                      + Crear Ubicación
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              ubicaciones.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>#{u.id}</strong>
                  </td>
                  <td>
                    <strong>📍 {u.ciudad}</strong>
                  </td>
                  <td>{u.provincia}</td>
                  <td>{u.pais}</td>
                  <td className="text-right">
                    <div className="actions-group">
                      <button
                        className="btn btn-action-edit btn-sm"
                        onClick={() => onOpenEdit(u)}
                        title="Editar ubicación"
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-action-delete btn-sm"
                        onClick={() => onOpenDelete(u)}
                        title="Eliminar ubicación"
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
