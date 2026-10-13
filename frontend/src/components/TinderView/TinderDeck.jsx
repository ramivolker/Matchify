import React, { useState, useEffect, useRef } from 'react';
import { getHobbieEmoji } from '../../utils/hobbieUtils';
import UserAvatar from '../common/UserAvatar';
import { GENEROS } from '../../utils/generoUtils';

export default function TinderDeck({
  usuarios = [],
  candidatos = [],
  disabled = false,
  currentUserId,
  currentUser: currentUserProp,
  onSwipe,
  onPass,
  onRefresh,
  onOpenDetail,
  onOpenReport,
  blockedUserIds = [],
}) {
  const [pending, setPending] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAnimation, setSwipeAnimation] = useState('');
  const actionLock = useRef(false);
  const startXRef = useRef(0);

  const deckQueue = candidatos;

  const currentUser =
    currentUserProp ??
    usuarios.find((u) => u.id === currentUserId);

  const activeProfile = deckQueue[0];

  // Reset drag state on profile change
  useEffect(() => {
    setDragX(0);
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
      navigator.vibrate(20);
    }

    try {
      await onSwipe(activeProfile, direction);
    } finally {
      setSwipeAnimation('');
      setDragX(0);
      actionLock.current = false;
      setPending(false);
    }
  };

  const handlePass = () => {
    if (!activeProfile || pending || disabled || actionLock.current || deckQueue.length < 2) return;
    onPass(activeProfile);
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
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handlePass();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProfile, pending, disabled, candidatos, onPass, onSwipe, onOpenDetail]);

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
    return edad;
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

  const generoLabel = GENEROS.find(({ value }) => value === activeProfile?.genero)?.label;
  const visibleHobbies = sortedUserHobbies.slice(0, 4);
  const remainingHobbies = Math.max(0, userHobbies.length - visibleHobbies.length);

  // Dynamic card drag styles
  const cardRotation = dragX * 0.08;
  const dynamicCardStyle = isDragging
    ? {
        transform: `translate3d(${dragX}px, 0, 0) rotate(${cardRotation}deg)`,
        transition: 'none',
      }
    : undefined;

  // Swipe Stamp opacity
  const likeStampOpacity = swipeAnimation === 'right' ? 1 : Math.min(Math.max(dragX / 80, 0), 1);
  const nopeStampOpacity = swipeAnimation === 'left' ? 1 : Math.min(Math.max(-dragX / 80, 0), 1);

  return (
    <div className="tinder-deck-wrapper">
      <div className="tinder-deck">
        {!activeProfile ? (
          <div className="tinder-empty-state" role="status">
            <div className="radar-wrap">
              <div className="radar-wave" />
              <div className="radar-center">&#128101;</div>
            </div>
            <h4>No hay candidatos disponibles</h4>
            {onRefresh && <button type="button" className="btn btn-primary btn-sm"
              disabled={pending || disabled} onClick={onRefresh}>Buscar nuevos perfiles</button>}
            <p>No se encontraron perfiles o candidatos para este usuario en este momento.</p>
          </div>
        ) : (
          <article
            className={`tinder-card ${swipeAnimation ? `swipe-${swipeAnimation}` : ''}`}
            key={activeProfile.id}
            style={dynamicCardStyle}
          >
            <div className="tinder-card-hero"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <UserAvatar user={activeProfile} size="hero" className="tinder-hero-photo"
                alt={`Foto de ${activeProfile.nombre} ${activeProfile.apellido || ''}`} />
              {likeStampOpacity > 0.1 && <div className="swipe-stamp stamp-like" style={{ opacity: likeStampOpacity }}>LIKE</div>}
              {nopeStampOpacity > 0.1 && <div className="swipe-stamp stamp-nope" style={{ opacity: nopeStampOpacity }}>NOPE</div>}
            </div>

            <div className="tinder-card-body">
              {onOpenReport && (
                <button type="button" className="tinder-report-btn"
                  onClick={() => onOpenReport(activeProfile)}
                  title="Reportar o bloquear este perfil" aria-label="Reportar perfil">
                  <span aria-hidden="true">&#8943;</span>
                </button>
              )}
              <header className="tinder-profile-header">
                <h2 className="tinder-name" title={`${activeProfile.nombre} ${activeProfile.apellido}, ${calcularEdad(activeProfile.fechaNacimiento)}`}>
                  {activeProfile.nombre} {activeProfile.apellido}<span className="tinder-age">, {calcularEdad(activeProfile.fechaNacimiento)}</span>
                </h2>
                {activeProfile.verificado === true && <span className="tinder-verified-badge">&#10003; Verificado</span>}
              </header>
              <div className="tinder-profile-metadata">
                <p className="tinder-location"><span aria-hidden="true">&#128205;</span> {activeProfile.ubicacion
                  ? [activeProfile.ubicacion.ciudad, activeProfile.ubicacion.provincia].filter(Boolean).join(', ')
                  : 'Ubicación oculta'}</p>
                {Number.isFinite(activeProfile.distanciaKm) && <p className="tinder-location">A {activeProfile.distanciaKm} km</p>}
                {(generoLabel || activeProfile.tipoUsuario?.nombre) && <div className="tinder-metadata">
                  {generoLabel && <span>{generoLabel}</span>}
                  {activeProfile.tipoUsuario?.nombre && <span>{activeProfile.tipoUsuario.nombre}</span>}
                </div>}
              </div>
              <section className="tinder-bio-section" aria-label="Biografía">
                <h3 className="tinder-section-title">Sobre mí</h3>
                <p className="tinder-bio">{activeProfile.biografia || 'Hola, estoy usando Matchify para conocer personas con mis mismos gustos y aficiones.'}</p>
              </section>
              <section className="tinder-hobbies-section" aria-label="Hobbies">
                <h3 className="tinder-section-title">Hobbies</h3>
                <div className="tinder-hobbies-chips">
                  {visibleHobbies.map((h) => {
                    const isCommon = myHobbyIds.includes(h.id);
                    return <span key={h.id} title={h.nombre} className={`tinder-chip ${isCommon ? 'match-chip' : ''}`}>
                      {isCommon ? '🔥' : getHobbieEmoji(h)} {h.nombre}
                    </span>;
                  })}
                  {remainingHobbies > 0 && <span className="tinder-chip tinder-chip-more" aria-label={`${remainingHobbies} hobbies adicionales`}>+{remainingHobbies}</span>}
                  {!userHobbies.length && <span className="tinder-common-hint">Sin hobbies especificados</span>}
                </div>
                {commonCount > 0 && <p className="tinder-common-hint">{commonCount} {commonCount === 1 ? 'hobbie en común' : 'hobbies en común'}</p>}
              </section>
              <div className="tinder-profile-actions">
                <button type="button" className="tinder-detail-btn" disabled={pending || disabled}
                  onClick={() => onOpenDetail(activeProfile)}>Ver perfil completo</button>
                <div className="tinder-controls">
                  <button type="button" className="tinder-btn btn-pass" disabled={pending || disabled || deckQueue.length < 2}
                    onClick={handlePass} title="Mover este perfil al final de la cola">
                    <span className="tinder-action-icon" aria-hidden="true">&#8595;</span><span>Pasar</span>
                  </button>
                  <button type="button" className="tinder-btn btn-dislike" disabled={pending || disabled}
                    onClick={() => handleAction('left')}>
                    <span className="tinder-action-icon" aria-hidden="true">&#10005;</span><span>Descartar</span>
                  </button>
                  <button type="button" className="tinder-btn btn-like" disabled={pending || disabled}
                    onClick={() => handleAction('right')}>
                    <span className="tinder-action-icon" aria-hidden="true">&#9829;</span><span>Me gusta</span>
                  </button>
                </div>
              </div>

            </div>
          </article>
        )}
      </div>
      {activeProfile && <div className="keyboard-shortcuts-helper" aria-label="Atajos de teclado">
        <span className="kbd-chip"><kbd>&#8592;</kbd> Descartar</span>
        <span className="kbd-chip"><kbd>&#8594;</kbd> Me gusta</span>
        <span className="kbd-chip"><kbd>&#8595;</kbd> Pasar</span>
        <span className="kbd-chip"><kbd>Espacio</kbd> Ver perfil</span>
      </div>}
    </div>
  );
}
