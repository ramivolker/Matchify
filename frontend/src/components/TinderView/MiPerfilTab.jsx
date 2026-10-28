import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { profileAge } from '../../utils/profileAge';
import { api } from '../../services/api';
import PreferenciasSection from './PreferenciasSection';
import { getHobbieEmoji } from '../../utils/hobbieUtils';
import { getUserAvatar } from '../../utils/userAvatarUtils';
import UserAvatar from '../common/UserAvatar';
import AvatarPickerModal from './AvatarPickerModal';
import { GENEROS } from '../../utils/generoUtils';

export default function MiPerfilTab({
  currentUser,
  ubicaciones,
  hobbies,
  onProfileUpdated,
  onPreferencesUpdated,
  onShowToast,
  scrollToPreferences = false,
  onPreferencesFocused,
}) {
  useEffect(() => {
    if (!scrollToPreferences || !currentUser?.id) return;
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById('preferencias-busqueda');
      if (!section) return;
      section.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      section.focus({ preventScroll: true });
      onPreferencesFocused?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [scrollToPreferences, currentUser?.id, onPreferencesFocused]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [bioError, setBioError] = useState('');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioTruncated, setBioTruncated] = useState(false);
  const bioTextRef = useRef(null);

  useEffect(() => {
    setBioExpanded(false);
  }, [currentUser?.biografia]);

  useEffect(() => {
    const text = bioTextRef.current;
    if (!text || bioExpanded) return;
    const measure = () => setBioTruncated(text.scrollHeight > text.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, [currentUser?.biografia, isEditingBio, bioExpanded]);
  const modalRef = useRef(null);
  const profileEditButtonRef = useRef(null);
  const loadingRef = useRef(false);
  loadingRef.current = loading;
  const edad = profileAge(currentUser?.fechaNacimiento);

  useEffect(() => {
    if (!isEditing) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !loadingRef.current) setIsEditing(false);
      if (event.key !== 'Tab') return;
      const controls = [...modalRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      profileEditButtonRef.current?.focus({ preventScroll: true });
    };
  }, [isEditing]);

  const openProfileEditor = () => {
    setNombre(currentUser?.nombre || '');
    setApellido(currentUser?.apellido || '');
    setEmail(currentUser?.email || '');
    setGenero(currentUser?.genero ?? '');
    setUbicacionId(currentUser?.ubicacionId || '');
    setProfileError('');
    setIsEditing(true);
  };

  const openBioEditor = () => {
    setBiografia(currentUser?.biografia ?? '');
    setBioError('');
    setIsEditingBio(true);
  };
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(() => getUserAvatar(currentUser));


  // Form states
  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [apellido, setApellido] = useState(currentUser?.apellido || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [biografia, setBiografia] = useState(currentUser?.biografia ?? '');
  const [genero, setGenero] = useState(currentUser?.genero ?? '');
  const [ubicacionId, setUbicacionId] = useState(currentUser?.ubicacionId || '');

  // Assigned hobbies with local optimistic state
  const extractHobbyIds = (user) => {
    return (
      user?.hobbies
        ?.map((h) => (h.hobbie || h).id || h.hobbieId)
        .filter(Boolean) || []
    );
  };

  const [localHobbyIds, setLocalHobbyIds] = useState(() => extractHobbyIds(currentUser));
  const [busyHobbyId, setBusyHobbyId] = useState(null);

  useEffect(() => {
    setLocalHobbyIds(extractHobbyIds(currentUser));
    setCurrentAvatarUrl(getUserAvatar(currentUser));
  }, [currentUser]);

  useEffect(() => {
    setBiografia(currentUser?.biografia ?? '');
  }, [currentUser?.id, currentUser?.biografia]);

  useEffect(() => {
    setGenero(currentUser?.genero ?? '');
  }, [currentUser?.id, currentUser?.genero, isEditing]);

  // Calculate Profile Completeness Percentage
  let completionScore = 0;
  if (currentUser?.nombre && currentUser?.apellido) completionScore += 30;
  if (currentUser?.email) completionScore += 20;
  if (currentUser?.biografia != null && currentUser.biografia.trim().length > 0) completionScore += 25;
  if (currentUser?.ubicacionId || currentUser?.ubicacion) completionScore += 10;
  if (localHobbyIds.length >= 2) completionScore += 15;

  const handleToggleHobbie = async (hobbieId) => {
    if (busyHobbyId) return;
    if (navigator.vibrate) navigator.vibrate(15);
    const isAssigned = localHobbyIds.includes(hobbieId);

    // Optimistic UI update
    setLocalHobbyIds((prev) =>
      isAssigned ? prev.filter((id) => id !== hobbieId) : [...prev, hobbieId]
    );
    setBusyHobbyId(hobbieId);

    try {
      if (isAssigned) {
        await api.desasociarHobbie(currentUser.id, hobbieId);
        onShowToast('Hobbie removido de tu perfil', 'info');
      } else {
        await api.asociarHobbie(currentUser.id, hobbieId);
        onShowToast('¡Hobbie agregado a tu perfil! 🔥', 'success');
      }
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (err) {
      const msg = err.message || '';
      // Self-heal if state got desynced with server
      if (msg.includes('ya está asociado')) {
        setLocalHobbyIds((prev) => (prev.includes(hobbieId) ? prev : [...prev, hobbieId]));
      } else if (msg.includes('no está asociado')) {
        setLocalHobbyIds((prev) => prev.filter((id) => id !== hobbieId));
      } else {
        setLocalHobbyIds((prev) =>
          isAssigned ? [...prev, hobbieId] : prev.filter((id) => id !== hobbieId)
        );
        onShowToast(msg || 'Error al actualizar hobbies', 'error');
      }
    } finally {
      setBusyHobbyId(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setProfileError('');
    try {
      await api.actualizarUsuario(currentUser.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        fechaNacimiento: currentUser?.fechaNacimiento,
        genero: genero || null,
        ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null,
        activo: currentUser?.activo !== false,
      });
      await onProfileUpdated();
      onShowToast('Tu perfil ha sido actualizado con éxito ✨', 'success');
      setIsEditing(false);
    } catch (err) {
      setProfileError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async (event) => {
    event.preventDefault();
    if (savingBio) return;
    setSavingBio(true);
    setBioError('');
    try {
      await api.actualizarUsuario(currentUser.id, {
        nombre: currentUser.nombre,
        apellido: currentUser.apellido,
        email: currentUser.email,
        fechaNacimiento: currentUser.fechaNacimiento,
        ubicacionId: currentUser.ubicacionId,
        genero: currentUser.genero ?? null,
        activo: currentUser.activo !== false,
        biografia: biografia.trim(),
      });
      await onProfileUpdated();
      setIsEditingBio(false);
      onShowToast('Tu biografía se guardó correctamente', 'success');
    } catch (error) {
      setBioError(error.message || 'No se pudo guardar la biografía');
    } finally {
      setSavingBio(false);
    }
  };

  return (
    <div className="profile-tab-wrapper">
      <div className="profile-section-card">
        {/* Barra de Progreso de Completitud del Perfil (Onboarding progresivo) */}
        {completionScore < 100 && (
          <div className="profile-completeness-banner">
            <div className="completeness-header">
              <div>
                <span className="completeness-title">Nivel de completitud de tu perfil</span>
                <p className="completeness-sub">
                  Los perfiles con biografía y al menos 2 hobbies reciben 4 veces más matches.
                </p>
              </div>
              <span className="completeness-percentage">{completionScore}%</span>
            </div>
            <div className="completeness-bar-track">
              <div
                className="completeness-bar-fill"
                style={{
                  width: `${completionScore}%`,
                  background:
                    completionScore >= 80
                      ? 'var(--success)'
                      : completionScore >= 50
                      ? 'var(--primary)'
                      : 'var(--warning)',
                }}
              />
            </div>
          </div>
        )}

        {/* Header con Avatar y Verificación */}
        <div className="profile-header-banner">
          <div className="profile-banner-avatar-wrapper" onClick={() => setIsAvatarModalOpen(true)} title="Cambiar foto de perfil">
            <UserAvatar
              user={currentUser}
              customAvatar={currentAvatarUrl}
              size="lg"
              className="profile-banner-avatar"
            />
            <button
              type="button"
              className="avatar-edit-badge-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsAvatarModalOpen(true);
              }}
              title="Cambiar foto de perfil"
              aria-label="Cambiar foto de perfil"
            >
              <span className="avatar-edit-badge-icon" aria-hidden="true">📷</span>
            </button>
          </div>

          <div className="profile-banner-details">
            <h2>
              <span>{currentUser?.nombre} {currentUser?.apellido}{edad !== null && `, ${edad}`}</span>
              <span className="tinder-verified-badge" title="Perfil Verificado">
                ✓ Verificado
              </span>
            </h2>
            <p className="profile-email-sub">{currentUser?.email}</p>
            <div className="profile-badges-row">
              <span className="badge badge-success">● Perfil Visible</span>
              <span className="badge badge-secondary">
                📍{' '}
                {currentUser?.ubicacion
                  ? `${currentUser.ubicacion.ciudad}, ${currentUser.ubicacion.provincia}`
                  : 'Sin ubicación asignada'}
              </span>
              <span className="badge badge-tag">🔥 {localHobbyIds.length} Hobbies</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm profile-edit-btn"
            ref={profileEditButtonRef}
            onClick={openProfileEditor}
          >
            ✏️ Editar Perfil
          </button>
        </div>

      </div>

      <section className="profile-section-card profile-about-card" aria-labelledby="profile-about-title">
        <div className="profile-about-header">
          <h3 id="profile-about-title" className="section-title">Biografía</h3>
          {!isEditingBio && currentUser?.biografia?.trim() && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={openBioEditor}>✏️ Editar</button>
          )}
        </div>
        {isEditingBio ? (
          <form onSubmit={handleSaveBio} aria-busy={savingBio}>
            <label className="preferences-sr-only" htmlFor="perfil-biografia">Biografía</label>
            <textarea id="perfil-biografia" className="form-control profile-about-editor" rows={4}
              value={biografia} onChange={(event) => setBiografia(event.target.value)}
              maxLength={500} disabled={savingBio} autoFocus placeholder="Contá algo sobre vos…" />
            {bioError && <p className="profile-save-error" role="alert">{bioError}</p>}
            <div className="form-actions-row">
              <button type="button" className="btn btn-secondary" disabled={savingBio} onClick={() => {
                setBiografia(currentUser?.biografia ?? '');
                setIsEditingBio(false);
                setBioError('');
              }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={savingBio}>{savingBio ? 'Guardando…' : 'Guardar biografía'}</button>
            </div>
          </form>
        ) : currentUser?.biografia?.trim() ? (
          <div>
            <p id="profile-biography-text" ref={bioTextRef} className={`profile-bio-text ${bioExpanded ? '' : 'profile-bio-clamped'}`}>{currentUser.biografia}</p>
            {(bioTruncated || bioExpanded) && (
              <button type="button" className="profile-bio-expand" aria-expanded={bioExpanded}
                aria-controls="profile-biography-text" onClick={() => setBioExpanded((expanded) => !expanded)}>
                {bioExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        ) : (
          <div className="profile-about-empty">
            <p>Todavía no agregaste una biografía.</p>
            <p className="section-subtitle">Contale algo sobre vos a las personas que visiten tu perfil.</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={openBioEditor}>+ Agregar biografía</button>
          </div>
        )}
      </section>

      {isEditing && createPortal(
        <div className="modal profile-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title"
          onClick={(event) => { if (event.target === event.currentTarget && !loading) setIsEditing(false); }}>
          <div className="modal-dialog profile-editor-dialog" ref={modalRef}>
            <div className="modal-header">
              <h3 id="profile-editor-title">Editar perfil</h3>
              <button type="button" className="btn-close" aria-label="Cerrar modal" disabled={loading} onClick={() => setIsEditing(false)} autoFocus>&times;</button>
            </div>
            <form onSubmit={handleSaveProfile} aria-busy={loading}>
              <div className="modal-body">
                <fieldset disabled={loading} className="profile-editor-fields">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="perfil-nombre">Nombre</label>
                      <input id="perfil-nombre"
                        type="text"
                        className="form-control"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="perfil-apellido">Apellido</label>
                      <input id="perfil-apellido"
                        type="text"
                        className="form-control"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="perfil-email">Correo Electrónico</label>
                      <input id="perfil-email"
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="perfil-ubicacion">Ubicación</label>
                      <select id="perfil-ubicacion"
                        className="form-control"
                        value={ubicacionId}
                        onChange={(e) => setUbicacionId(e.target.value)}
                      >
                        <option value="">Seleccionar ciudad...</option>
                        {ubicaciones.map((ub) => (
                          <option key={ub.id} value={ub.id}>
                            {ub.ciudad}, {ub.provincia} ({ub.pais})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="perfil-genero">Género</label>
                    <select id="perfil-genero" className="form-control" value={genero}
                      onChange={(event) => setGenero(event.target.value)} disabled={loading}>
                      <option value="">Sin especificar</option>
                      {GENEROS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>

                </fieldset>
                {profileError && <p className="profile-save-error" role="alert">{profileError}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" disabled={loading} onClick={() => setIsEditing(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Guardando…' : 'Guardar cambios'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

        {currentUser?.id && (
          <PreferenciasSection key={currentUser.id} usuarioId={currentUser.id}
            onSaved={onPreferencesUpdated} onShowToast={onShowToast} />
        )}

        {/* SECCIÓN DE HOBBIES DEL USUARIO */}
        <div className="profile-section-card profile-hobbies-section">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">🎨 Tus hobbies</h3>
              <p className="section-subtitle">
                Haz clic sobre un hobbie para activarlo o quitarlo de tu perfil en tiempo real.
              </p>
            </div>
            <span className="badge badge-tag">{localHobbyIds.length} seleccionados</span>
          </div>

          {hobbies.length === 0 ? (
            <p className="hobbies-empty-filter-state">No hay hobbies disponibles.</p>
          ) : (
            <div className="interactive-hobbies-grid">
              {hobbies.map((h) => {
                const isSelected = localHobbyIds.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    className={`hobby-select-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleHobbie(h.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="hobby-chip-icon">{isSelected ? '✓' : '+'}</span>
                    <span className="hobby-chip-name">{getHobbieEmoji(h)} {h.nombre}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      {/* Modal para cambiar foto de perfil o avatar */}
      <AvatarPickerModal
        currentUser={currentUser}
        currentAvatar={currentAvatarUrl}
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSaved={(newAvatar) => {
          setCurrentAvatarUrl(newAvatar);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
