import React from 'react';

export default function TinderMatches({
  matches,
  onBackToExplore,
  onOpenDetail,
  onShowToast,
}) {
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

  return (
    <div className="card matches-card">
      <div className="matches-header">
        <button className="btn btn-secondary btn-sm" onClick={onBackToExplore}>
          ← Volver a Explorar
        </button>
        <h3>Tus Matches y Conexiones ({matches.length})</h3>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💔</div>
          <h4>Aún no tienes ningún match</h4>
          <p>Sigue deslizando perfiles y dale Like o Super Like a los que te interesen.</p>
          <button className="btn btn-primary btn-sm" onClick={onBackToExplore}>
            🔥 Empezar a deslizar
          </button>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((user) => {
            const iniciales = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
            const edad = calcularEdad(user.fechaNacimiento);
            const ubicacion = user.ubicacion
              ? `${user.ubicacion.ciudad}, ${user.ubicacion.provincia}`
              : 'Ubicación no especificada';

            return (
              <div key={user.id} className="match-item-card">
                <div className="match-item-avatar">{iniciales}</div>
                <div className="match-item-name">
                  {user.nombre} {user.apellido}, {edad}
                </div>
                <div className="match-item-location">📍 {ubicacion}</div>

                <div className="match-item-chips">
                  {user.hobbies && user.hobbies.length > 0
                    ? user.hobbies.slice(0, 3).map((item) => {
                        const h = item.hobbie || item;
                        return (
                          <span key={h.id || item.hobbieId} className="tinder-chip" style={{ fontSize: '0.7rem' }}>
                            🎨 {h.nombre}
                          </span>
                        );
                      })
                    : null}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onShowToast(`¡Mensaje enviado a ${user.nombre}! 💌`, 'success')}
                  >
                    💬 Chatear
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenDetail(user)}
                  >
                    Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
