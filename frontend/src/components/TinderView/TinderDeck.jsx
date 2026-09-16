import React, { useState } from 'react';

export default function TinderDeck({
  usuarios,
  currentUserId,
  onSwipe,
  onRewind,
  onOpenDetail,
}) {
  const [swipeAnimation, setSwipeAnimation] = useState(''); // 'left' | 'right' | 'up' | ''
  const [currentIndex, setCurrentIndex] = useState(0);

  // Perfiles a mostrar: todos los activos excepto el usuario logueado
  const deckQueue = usuarios.filter((u) => u.id !== currentUserId && u.activo !== false);

  const currentUser = usuarios.find((u) => u.id === currentUserId);
  const activeProfile = deckQueue[currentIndex];

  const handleAction = (direction) => {
    if (!activeProfile) return;
    setSwipeAnimation(direction);

    setTimeout(() => {
      onSwipe(activeProfile, direction);
      setCurrentIndex((prev) => prev + 1);
      setSwipeAnimation('');
    }, 280);
  };

  const handleRewind = () => {
    setCurrentIndex(0);
    onRewind();
  };

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

  // Comparar hobbies en común
  const myHobbyIds =
    currentUser && currentUser.hobbies
      ? currentUser.hobbies.map((h) => (h.hobbie || h).id || h.hobbieId)
      : [];

  const userHobbies = activeProfile && activeProfile.hobbies
    ? activeProfile.hobbies.map((h) => h.hobbie || h)
    : [];

  const commonCount = userHobbies.filter((h) => myHobbyIds.includes(h.id)).length;

  return (
    <div className="tinder-deck-wrapper">
      <div className="tinder-deck">
        {!usuarios.length || !currentUserId ? (
          <div className="tinder-empty-state">
            <div className="radar-wrap">
              <div className="radar-wave"></div>
              <div className="radar-center">👥</div>
            </div>
            <h4>No hay usuarios registrados</h4>
            <p>Crea perfiles en el panel de Admin para empezar a hacer match.</p>
          </div>
        ) : currentIndex >= deckQueue.length ? (
          <div className="tinder-empty-state">
            <div className="radar-wrap">
              <div className="radar-wave"></div>
              <div className="radar-center">🔥</div>
            </div>
            <h4>¡Te pusiste al día!</h4>
            <p>No hay más perfiles nuevos para descubrir en este momento.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleRewind}
              style={{ marginTop: '1rem' }}
            >
              🔄 Volver a explorar perfiles
            </button>
          </div>
        ) : (
          <div
            className={`tinder-card ${swipeAnimation ? `swipe-${swipeAnimation}` : ''}`}
            key={activeProfile.id}
          >
            <div className="tinder-card-hero">
              <div className="tinder-online-badge">● Online</div>
              <div className="tinder-avatar-big">
                {`${activeProfile.nombre.charAt(0)}${activeProfile.apellido.charAt(0)}`.toUpperCase()}
              </div>
              {commonCount > 0 && (
                <div
                  className="badge badge-success"
                  style={{ fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  🔥 {commonCount} {commonCount === 1 ? 'hobbie en común' : 'hobbies en común'}
                </div>
              )}
            </div>

            <div className="tinder-card-body">
              <div>
                <div className="tinder-name-row">
                  <span className="tinder-name">
                    {activeProfile.nombre} {activeProfile.apellido}
                  </span>
                  <span className="tinder-age">{calcularEdad(activeProfile.fechaNacimiento)}</span>
                  <span className="tinder-verified" title="Perfil verificado">
                    ✓
                  </span>
                </div>
                <div className="tinder-location">
                  <span>📍</span>{' '}
                  {activeProfile.ubicacion
                    ? `${activeProfile.ubicacion.ciudad}, ${activeProfile.ubicacion.provincia}`
                    : 'Ubicación oculta'}
                </div>
                <p className="tinder-bio">
                  {activeProfile.biografia || 'Sin biografía disponible aún.'}
                </p>
              </div>

              <div>
                <div className="tinder-hobbies-chips">
                  {userHobbies.length > 0 ? (
                    userHobbies.map((h) => {
                      const isCommon = myHobbyIds.includes(h.id);
                      return (
                        <span
                          key={h.id}
                          className={`tinder-chip ${isCommon ? 'match-chip' : ''}`}
                        >
                          {isCommon ? '🔥' : '🎨'} {h.nombre}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Sin hobbies asignados
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      {currentIndex < deckQueue.length && (
        <div className="tinder-controls">
          <button
            className="tinder-btn btn-rewind"
            onClick={handleRewind}
            title="Rebobinar / Volver a empezar"
          >
            <span>🔄</span>
          </button>
          <button
            className="tinder-btn btn-dislike"
            onClick={() => handleAction('left')}
            title="Pasar (Dislike)"
          >
            <span>✕</span>
          </button>
          <button
            className="tinder-btn btn-superlike"
            onClick={() => handleAction('up')}
            title="Super Like!"
          >
            <span>★</span>
          </button>
          <button
            className="tinder-btn btn-like"
            onClick={() => handleAction('right')}
            title="Like / Match!"
          >
            <span>💚</span>
          </button>
          <button
            className="tinder-btn btn-info"
            onClick={() => onOpenDetail(activeProfile)}
            title="Ver información completa"
          >
            <span>ℹ️</span>
          </button>
        </div>
      )}
    </div>
  );
}
