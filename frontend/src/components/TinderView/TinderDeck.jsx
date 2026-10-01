import React, { useState, useEffect, useRef } from 'react';
import { getHobbieEmoji } from '../../utils/hobbieUtils';
import { getUserAvatar } from '../../utils/userAvatarUtils';

export default function TinderDeck({
  usuarios = [],
  candidatos = [],
  disabled = false,
  currentUserId,
  currentUser: currentUserProp,
  onSwipe,
  onRefresh,
  onOpenDetail,
  onOpenReport,
  blockedUserIds = [],
}) {
  const [pending, setPending] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState('');
  const [heroImgError, setHeroImgError] = useState(false);
  const actionLock = useRef(false);
  const startXRef = useRef(0);

  const deckQueue = candidatos;

  const currentUser =
    currentUserProp ??
    usuarios.find((u) => u.id === currentUserId);

  const activeProfile = deckQueue[0];

  // Reset photo index and drag state on profile change
  useEffect(() => {
    setPhotoIndex(0);
    setDragX(0);
    setIsDragging(false);
    setSwipeAnimation('');
    setHeroImgError(false);
  }, [activeProfile?.id]);

  const handleAction = async (direction) => {
    if (!activeProfile || disabled || pending || actionLock.current) return;
    actionLock.current = true;
    setPending(true);
    setSwipeAnimation(direction);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(20);

    try {
      await onSwipe(activeProfile, direction);
    } finally {
      setSwipeAnimation('');
      setDragX(0);
      actionLock.current = false;
      setPending(false);
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
      } else if (e.code === 'Space') {
        e.preventDefault();
        onOpenDetail(activeProfile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, pending, disabled]);

  // Touch handlers for mobile fluid swipe
  const handleTouchStart = (e) => {
    if (!activeProfile || pending || disabled) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !activeProfile) return;
    setDragX(e.touches[0].clientX - startXRef.current);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !activeProfile) return;
    setIsDragging(false);

    const thresholdX = 90;

    if (dragX > thresholdX) {
      handleAction('right');
    } else if (dragX < -thresholdX) {
      handleAction('left');
    } else {
      setDragX(0);
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

  const isCommonHobby = (hobbie) => myHobbyIds.includes(hobbie.id);

  // Los hobbies en común se muestran primero (manteniendo el orden original dentro de cada grupo)
  const sortedUserHobbies = [...userHobbies].sort(
    (a, b) => Number(isCommonHobby(b)) - Number(isCommonHobby(a))
  );

  const commonCount = sortedUserHobbies.filter(isCommonHobby).length;

  const avatarUrl = activeProfile ? getUserAvatar(activeProfile) : null;
  const initials = activeProfile
    ? `${activeProfile.nombre?.charAt(0) || 'U'}${activeProfile.apellido?.charAt(0) || ''}`.toUpperCase()
    : '';

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
  const cardRotation = dragX * 0.08;
  const dynamicCardStyle = isDragging
    ? {
        transform: `translate3d(${dragX}px, 0, 0) rotate(${cardRotation}deg)`,
        transition: 'none',
      }
    : undefined;

  // Swipe Stamp opacity
  const likeStampOpacity = Math.min(Math.max(dragX / 80, 0), 1);
  const nopeStampOpacity = Math.min(Math.max(-dragX / 80, 0), 1);

  return (
    <div className="tinder-deck-wrapper">
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
              onClick={onRefresh}
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

            {/* LEFT: Foto completa de la persona */}
            <div className="tinder-photo-pane">
              <div className="photo-indicators-bar">
                <span className={`photo-dot ${photoIndex === 0 ? 'active' : ''}`} />
                <span className={`photo-dot ${photoIndex === 1 ? 'active' : ''}`} />
                <span className={`photo-dot ${photoIndex === 2 ? 'active' : ''}`} />
              </div>

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

              {avatarUrl && !heroImgError ? (
                <img
                  className="tinder-photo-img"
                  src={avatarUrl}
                  alt={`${activeProfile.nombre} ${activeProfile.apellido}`}
                  onError={() => setHeroImgError(true)}
                  draggable={false}
                />
              ) : (
                <div className="tinder-photo-initials">{initials}</div>
              )}

              {commonCount > 0 && (
                <div className="badge badge-success common-hobbies-badge">
                  🔥 {commonCount} {commonCount === 1 ? 'hobbie en común' : 'hobbies en común'}
                </div>
              )}
            </div>

            {/* RIGHT: Panel blanco con info, acciones y atajos */}
            <div className="tinder-panel">
              <div className="tinder-panel-info">
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

                <div className="tinder-hobbies-chips">
                  {sortedUserHobbies.length > 0 ? (
                    sortedUserHobbies.map((h) => {
                      const isCommon = isCommonHobby(h);
                      return (
                        <span
                          key={h.id}
                          className={`tinder-chip ${isCommon ? 'match-chip' : ''}`}
                        >
                          {isCommon ? '🔥' : getHobbieEmoji(h)} {h.nombre}
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

              {/* Acciones principales */}
              <div className="tinder-panel-actions">
                <button
                  disabled={pending || disabled}
                  className="tinder-action-btn action-like"
                  onClick={() => handleAction('right')}
                  title="Dar Like"
                >
                  <span>💚</span> Me gusta
                </button>
                <button
                  disabled={pending || disabled}
                  className="tinder-action-btn action-dislike"
                  onClick={() => handleAction('left')}
                  title="Descartar (Dislike)"
                >
                  <span>✕</span> Descartar
                </button>
                <button
                  disabled={pending || disabled}
                  className="tinder-action-btn action-profile"
                  onClick={() => onOpenDetail(activeProfile)}
                  title="Ver perfil completo"
                >
                  <span>👤</span> Ver perfil completo
                </button>
              </div>

              {/* Atajos de teclado (gris claro) */}
              <div className="tinder-panel-shortcuts" aria-hidden="true">
                <span className="kbd-chip"><kbd>←</kbd> Descartar</span>
                <span className="kbd-chip"><kbd>→</kbd> Me Gusta</span>
                <span className="kbd-chip"><kbd>Espacio</kbd> Ver Perfil</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
