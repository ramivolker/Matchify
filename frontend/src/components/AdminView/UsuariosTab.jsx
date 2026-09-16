import React, { useState } from 'react';

export default function UsuariosTab({
  usuarios,
  loading,
  onRefresh,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenDetail,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [searchTerm, setSearchTerm] = useState('');

  // Helper para calcular la edad
  const calcularEdad = (fechaString) => {
    if (!fechaString) return '-';
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return '-';
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const m = hoy.getMonth() - fecha.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    if (filter === 'active') return u.activo !== false;
    if (filter === 'inactive') return u.activo === false;
    return true;
  });

  const totalActivos = usuarios.filter((u) => u.activo !== false).length;
  const totalInactivos = usuarios.length - totalActivos;

  return (
    <div className="card table-card">
      <div className="table-header">
        <div className="filter-pills">
          <button
            className={`pill-filter ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos <span>({usuarios.length})</span>
          </button>
          <button
            className={`pill-filter ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Activos <span>({totalActivos})</span>
          </button>
          <button
            className={`pill-filter ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Inactivos <span>({totalInactivos})</span>
          </button>
        </div>

        <div className="table-tools">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn-clear"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
              >
                &times;
              </button>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onRefresh} title="Refrescar">
            <span className="btn-icon">↻</span> Refrescar
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Edad</th>
              <th>Ubicación</th>
              <th>Hobbies</th>
              <th>Estado</th>
              <th className="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-cell">
                  <div className="spinner"></div>
                  <p>Cargando usuarios...</p>
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">{searchTerm ? '🔍' : '👥'}</div>
                    <h4>{searchTerm ? 'No se encontraron resultados' : 'No hay usuarios registrados'}</h4>
                    <p>
                      {searchTerm
                        ? 'Prueba con otro término de búsqueda.'
                        : 'Comienza creando tu primer usuario para Matchify.'}
                    </p>
                    {!searchTerm && (
                      <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>
                        + Crear Usuario
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((u) => {
                const hobbiesCount = u.hobbies ? u.hobbies.length : 0;
                const iniciales = `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
                const ubicacionTexto = u.ubicacion
                  ? `${u.ubicacion.ciudad}, ${u.ubicacion.provincia}`
                  : 'Sin asignar';

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">{iniciales}</div>
                        <div>
                          <div className="user-name-text">
                            {u.nombre} {u.apellido}
                          </div>
                          <div className="user-id-sub">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <strong>{calcularEdad(u.fechaNacimiento)}</strong>
                    </td>
                    <td>
                      {u.ubicacion ? (
                        ubicacionTexto
                      ) : (
                        <span className="text-muted">{ubicacionTexto}</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-tag">
                        🏷️ {hobbiesCount} {hobbiesCount === 1 ? 'hobbie' : 'hobbies'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge-success' : 'badge-secondary'}`}>
                        {u.activo ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="actions-group">
                        <button
                          className="btn btn-action-view btn-sm"
                          onClick={() => onOpenDetail(u)}
                          title="Ver perfil completo"
                        >
                          Ver
                        </button>
                        <button
                          className="btn btn-action-edit btn-sm"
                          onClick={() => onOpenEdit(u)}
                          title="Editar usuario"
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-action-delete btn-sm"
                          onClick={() => onOpenDelete(u)}
                          title="Eliminar usuario"
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
