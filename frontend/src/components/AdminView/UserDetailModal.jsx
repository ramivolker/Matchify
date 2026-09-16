import React from 'react';

export default function UserDetailModal({ isOpen, onClose, usuario }) {
  if (!isOpen || !usuario) return null;

  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}`.toUpperCase();

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

  const fechaNac = usuario.fechaNacimiento
    ? new Date(usuario.fechaNacimiento).toLocaleDateString()
    : 'No indicada';

  const ubicacion = usuario.ubicacion
    ? `${usuario.ubicacion.ciudad}, ${usuario.ubicacion.provincia} (${usuario.ubicacion.pais})`
    : 'Sin asignar';

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>Detalle del Perfil</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-detail-card">
            <div className="profile-avatar-lg">{iniciales}</div>
            <div className="profile-name">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="profile-email">{usuario.email}</div>

            <div className="profile-meta-grid">
              <div className="profile-meta-box">
                <span>Edad / Nacimiento</span>
                <strong>
                  {calcularEdad(usuario.fechaNacimiento)} ({fechaNac})
                </strong>
              </div>
              <div className="profile-meta-box">
                <span>Estado del Perfil</span>
                <strong>{usuario.activo ? '🟢 Activo' : '⚪ Inactivo'}</strong>
              </div>
              <div className="profile-meta-box" style={{ gridColumn: '1 / -1' }}>
                <span>Ubicación</span>
                <strong>📍 {ubicacion}</strong>
              </div>
            </div>

            <div className="profile-bio-box">
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Biografía
              </span>
              <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                {usuario.biografia || <em>Sin biografía registrada.</em>}
              </p>
            </div>

            <div className="profile-hobbies-box">
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                Hobbies e Intereses
              </span>
              <div className="profile-hobbies-list">
                {usuario.hobbies && usuario.hobbies.length > 0 ? (
                  usuario.hobbies.map((item) => {
                    const h = item.hobbie || item;
                    return (
                      <span key={h.id || item.hobbieId} className="badge badge-tag">
                        🎨 {h.nombre || 'Hobbie'}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    No tiene hobbies vinculados aún.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
