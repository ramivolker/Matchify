import React, { useState, useEffect, useRef } from 'react';

export default function TinderDeck({
  usuarios = [],
  candidatos = [],
  disabled = false,
  currentUserId,
  currentUser: currentUserProp,
  onSwipe,
  onRewind,
  onOpenDetail,
  onOpenReport,
  blockedUserIds = [],
}) {
  const [pending, setPending] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState('');
  const actionLock = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const deckQueue = candidatos;

  const currentUser =
    currentUserProp ??
    usuarios.find((u) => u.id === currentUserId);

  const activeProfile = deckQueue[0];

  // Reset photo index and drag state on profile change
  useEffect(() => {
    setPhotoIndex(0);
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setSwipeAnimation('');
  }, [activeProfile?.id]);

  const handleAction = async (direction) => {
    if (!activeProfile || disabled || pending || actionLock.current) return;
    actionLock.current = true;
    setPending(true);
    setSwipeAnimation(direction);

    // Haptic feedback
    if (navigator.vibrate) {
      if (direction === 'up') navigator.vibrate([20, 30, 20]);
      else navigator.vibrate(20);
    }

    try {
      await onSwipe(activeProfile, direction);
    } finally {
      setSwipeAnimation('');
      setDragOffset({ x: 0, y: 0 });
      actionLock.current = false;
      setPending(false);
    }
  };

  const handleRewind = () => {
    if (!pending && !disabled) {
      if (navigator.vibrate) navigator.vibrate(15);
      onRewind();
    }
  };

  // Keyboard navigation for Desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (!activeProfile || pending || disabled) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAction('right');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAction('left');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleAction('up');
      } else if (e.code === 'Space') {
        e.preventDefault();
        onOpenDetail(activeProfile);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRewind();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, pending, disabled]);

  // Touch handlers for mobile fluid swipe
  const handleTouchStart = (e) => {
    if (!activeProfile || pending || disabled) return;
    const touch = e.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !activeProfile) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || !activeProfile) return;
    setIsDragging(false);

    const thresholdX = 90;
    const thresholdY = -100;

    if (dragOffset.x > thresholdX) {
      handleAction('right');
    } else if (dragOffset.x < -thresholdX) {
      handleAction('left');
    } else if (dragOffset.y < thresholdY) {
      handleAction('up');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
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

  // Shared hobbies calculation
  const myHobbyIds =
    currentUser && currentUser.hobbies
      ? currentUser.hobbies.map((h) => (h.hobbie || h).id || h.hobbieId)
      : [];

  const userHobbies = activeProfile && activeProfile.hobbies
    ? activeProfile.hobbies.map((h) => h.hobbie || h)
    : [];

  const commonCount = userHobbies.filter((h) => myHobbyIds.includes(h.id)).length;

  // Touch edges to cycle photos
  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % 3);
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  // Dynamic card drag styles
  const cardRotation = dragOffset.x * 0.08;
  const dynamicCardStyle = isDragging
    ? {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${cardRotation}deg)`,
        transition: 'none',
      }
    : undefined;

  // Swipe Stamp opacity
  const likeStampOpacity = Math.min(Math.max(dragOffset.x / 80, 0), 1);
  const nopeStampOpacity = Math.min(Math.max(-dragOffset.x / 80, 0), 1);
  const superStampOpacity = Math.min(Math.max(-dragOffset.y / 80, 0), 1);

  return (
    <div className="tinder-deck-wrapper">
      {/* Desktop Keyboard Shortcuts Helper Banner */}
      <div className="keyboard-shortcuts-helper" aria-hidden="true">
        <span>⌨️ Atajos:</span>
        <span className="kbd-chip"><kbd>←</kbd> Descartar</span>
        <span className="kbd-chip"><kbd>→</kbd> Me Gusta</span>
        <span className="kbd-chip"><kbd>↑</kbd> Super Like</span>
        <span className="kbd-chip"><kbd>Espacio</kbd> Ver Perfil</span>
        <span className="kbd-chip"><kbd>R</kbd> Rebobinar</span>
      </div>

      <div className="tinder-deck">
        {!deckQueue.length ? (
          <div className="tinder-empty-state">
            <div className="radar-wrap">
              <div className="radar-wave"></div>
              <div className="radar-center">👥</div>
            </div>
            <h4>No hay candidatos disponibles</h4>
            <p>No se encontraron perfiles o candidatos para este usuario en este momento.</p>
          </div>
        ) : !activeProfile ? (
          <div className="tinder-empty-state">
            <div className="radar-wrap">
              <div className="radar-wave"></div>
              <div className="radar-center">🔥</div>
            </div>
            <h4>¡Te pusiste al día!</h4>
            <p>Has explorado todos los perfiles cercanos por el momento.</p>
            <button
            disabled={pending || disabled}
              className="btn btn-primary btn-sm"
              onClick={handleRewind}
              style={{ marginTop: '1rem' }}
            >
              🔄 Buscar nuevos perfiles
            </button>
          </div>
        ) : (
          <div
            className={`tinder-card ${swipeAnimation ? `swipe-${swipeAnimation}` : ''}`}
            key={activeProfile.id}
            style={dynamicCardStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Visual Action Stamps while dragging */}
            {likeStampOpacity > 0.1 && (
              <div className="swipe-stamp stamp-like" style={{ opacity: likeStampOpacity }}>
                LIKE
              </div>
            )}
            {nopeStampOpacity > 0.1 && (
              <div className="swipe-stamp stamp-nope" style={{ opacity: nopeStampOpacity }}>
                NOPE
              </div>
            )}
            {superStampOpacity > 0.1 && (
              <div className="swipe-stamp stamp-super" style={{ opacity: superStampOpacity }}>
                SUPER LIKE
              </div>
            )}

            {/* Photo Indicators Bar */}
            <div className="photo-indicators-bar">
              <span className={`photo-dot ${photoIndex === 0 ? 'active' : ''}`} />
              <span className={`photo-dot ${photoIndex === 1 ? 'active' : ''}`} />
              <span className={`photo-dot ${photoIndex === 2 ? 'active' : ''}`} />
            </div>

            {/* Main Visual Hero */}
            <div className="tinder-card-hero">
              {/* Photo edge tap zones */}
              <div className="photo-tap-edge tap-left" onClick={handlePrevPhoto} title="Foto anterior" />
              <div className="photo-tap-edge tap-right" onClick={handleNextPhoto} title="Siguiente foto" />

              <div className="tinder-online-badge">
                <span className="live-pulse-dot" /> Online
              </div>

              <button
                type="button"
                className="tinder-report-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenReport) onOpenReport(activeProfile);
                }}
                title="Reportar o bloquear este perfil"
                aria-label="Reportar perfil"
              >
                ⚠️
              </button>

              <div className="tinder-avatar-big">
                {`${activeProfile.nombre?.charAt(0) || 'U'}${activeProfile.apellido?.charAt(0) || ''}`.toUpperCase()}
              </div>

              {commonCount > 0 && (
                <div className="badge badge-success common-hobbies-badge">
                  🔥 {commonCount} {commonCount === 1 ? 'hobbie en común' : 'hobbies en común'}
                </div>
              )}
            </div>

            {/* Card Body & Dark Gradient Text Area */}
            <div className="tinder-card-body">
              <div>
                <div className="tinder-name-row">
                  <span className="tinder-name">
                    {activeProfile.nombre} {activeProfile.apellido}
                  </span>
                  <span className="tinder-age">{calcularEdad(activeProfile.fechaNacimiento)}</span>
                  <span className="tinder-verified-badge" title="Perfil Verificado Oficial">
                    ✓ Verificado
                  </span>
                </div>

                <div className="tinder-location">
                  <span>📍</span>{' '}
                  {activeProfile.ubicacion
                    ? `${activeProfile.ubicacion.ciudad}, ${activeProfile.ubicacion.provincia}`
                    : 'Ubicación oculta'}
                </div>
                {Number.isFinite(activeProfile.distanciaKm) && (
                  <div className="tinder-location">A {activeProfile.distanciaKm} km</div>
                )}
                {activeProfile.tipoUsuario && (
                  <div className="tinder-location">{activeProfile.tipoUsuario.nombre}</div>
                )}
                <p className="tinder-bio">
                  {activeProfile.biografia || 'Hola, estoy usando Matchify para conocer personas con mis mismos gustos y aficiones.'}
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
                    <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                      Sin hobbies especificados
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de Acción */}
      {activeProfile && (
        <div className="tinder-controls">
          <button
            disabled={pending || disabled}
            className="tinder-btn btn-rewind"
            onClick={handleRewind}
            title="Buscar nuevos perfiles"
          >
            <span>🔄</span>
          </button>
          <button
            disabled={pending || disabled}
            className="tinder-btn btn-dislike"
            onClick={() => handleAction('left')}
            title="Pasar (Dislike)"
          >
            <span>✕</span>
          </button>
          <button
            disabled={pending || disabled}
            className="tinder-btn btn-superlike"
            onClick={() => handleAction('up')}
            title="Like (★)"
          >
            <span>★</span>
          </button>
          <button
            disabled={pending || disabled}
            className="tinder-btn btn-like"
            onClick={() => handleAction('right')}
            title="Like"
          >
            <span>💚</span>
          </button>
          <button
            disabled={pending || disabled}
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
