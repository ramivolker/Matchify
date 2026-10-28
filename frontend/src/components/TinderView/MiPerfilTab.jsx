import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import PreferenciasSection from './PreferenciasSection';
import { getHobbieEmoji } from '../../utils/hobbieUtils';
import { getUserAvatar, getUserPhotos } from '../../utils/userAvatarUtils';
import UserAvatar from '../common/UserAvatar';
import AvatarPickerModal from './AvatarPickerModal';
import { GENEROS } from '../../utils/generoUtils';

// Categorización inteligente de hobbies
export const HOBBIE_CATEGORIES = [
  { id: 'all', label: 'Todos', icon: '🌟' },
  {
    id: 'deportes',
    label: 'Deporte & Fitness',
    icon: '⚽',
    keywords: ['fútbol', 'gimnasio', 'running', 'ciclismo', 'pádel', 'padel', 'tenis', 'básquet', 'basquet', 'natación', 'natacion', 'yoga', 'trekking', 'montaña', 'deporte'],
  },
  {
    id: 'arte',
    label: 'Arte & Cultura',
    icon: '🎨',
    keywords: ['fotografía', 'fotografia', 'arte', 'música', 'musica', 'en vivo', 'lectura', 'cine', 'series', 'teatro', 'diseño', 'dibujo'],
  },
  {
    id: 'social',
    label: 'Social & Salidas',
    icon: '☕',
    keywords: ['gastronomía', 'gastronomia', 'café', 'cafe', 'cocina', 'viajes', 'mascotas', 'bar', 'amigos', 'fiesta'],
  },
  {
    id: 'tech',
    label: 'Tecnología & Geek',
    icon: '💻',
    keywords: ['programación', 'programacion', 'tecnología', 'tecnologia', 'videojuegos', 'gaming', 'computacion', 'software'],
  },
  { id: 'mine', label: 'Mis Hobbies', icon: '🔥' },
];

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
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(() => getUserAvatar(currentUser));

  // Buscador y categoría activa de hobbies
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // ── Fotos de perfil (galería) ────────────────────────────────
  const [fotos, setFotos] = useState(() => {
    const list = currentUser?.fotos;
    if (Array.isArray(list) && list.length > 0) return list;
    return getUserPhotos(currentUser).map((url, i) => ({ id: `local-${i}`, url, orden: i }));
  });
  const [fotosLoading, setFotosLoading] = useState(false);

  // Cargar fotos del backend cuando cambia el usuario
  useEffect(() => {
    if (!currentUser?.id) return;
    let cancelled = false;
    api.getFotos(currentUser.id)
      .then((data) => {
        if (!cancelled) setFotos(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Fallback a fotos locales si falla la API
        setFotos(getUserPhotos(currentUser).map((url, i) => ({ id: `local-${i}`, url, orden: i })));
      });
    return () => { cancelled = true; };
  }, [currentUser?.id]);

  const MAX_PHOTOS = 6;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onShowToast('Seleccioná un archivo de imagen válido (JPG, PNG, WebP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 800;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        try {
          setFotosLoading(true);
          const nueva = await api.agregarFoto(currentUser.id, { url: dataUrl });
          setFotos((prev) => [...prev, nueva]);
          setCurrentAvatarUrl(dataUrl);
          onShowToast('¡Foto agregada a tu galería! 📸', 'success');
        } catch (err) {
          onShowToast(err.message || 'Error al subir la foto', 'error');
        } finally {
          setFotosLoading(false);
          const inputEl = document.getElementById('profile-photo-upload-input');
          if (inputEl) inputEl.value = '';
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarFoto = async (foto) => {
    if (foto.id?.toString().startsWith('local-')) {
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      return;
    }
    try {
      setFotosLoading(true);
      await api.eliminarFoto(currentUser.id, foto.id);
      setFotos((prev) => prev.filter((f) => f.id !== foto.id));
      onShowToast('Foto eliminada', 'info');
    } catch (err) {
      onShowToast(err.message || 'Error al eliminar la foto', 'error');
    } finally {
      setFotosLoading(false);
    }
  };

  const handleMarcarPrincipal = async (foto) => {
    if (foto.id?.toString().startsWith('local-')) {
      setCurrentAvatarUrl(foto.url);
      setFotos((prev) => [foto, ...prev.filter((f) => f.id !== foto.id)]);
      return;
    }
    try {
      setFotosLoading(true);
      const nuevas = await api.marcarFotoPrincipal(currentUser.id, foto.id);
      setFotos(Array.isArray(nuevas) ? nuevas : fotos);
      setCurrentAvatarUrl(foto.url);
      onShowToast('Foto principal actualizada ✨', 'success');
    } catch (err) {
      onShowToast(err.message || 'Error al marcar foto principal', 'error');
    } finally {
      setFotosLoading(false);
    }
  };

  const handleReordenarFoto = async (index, direccion) => {
    const nuevoIndex = index + direccion;
    if (nuevoIndex < 0 || nuevoIndex >= fotos.length || fotosLoading) return;
    const nuevas = [...fotos];
    const temp = nuevas[index];
    nuevas[index] = nuevas[nuevoIndex];
    nuevas[nuevoIndex] = temp;
    setFotos(nuevas);

    const ids = nuevas.map((f) => f.id).filter((id) => typeof id === 'number');
    if (ids.length === nuevas.length) {
      try {
        setFotosLoading(true);
        const res = await api.reordenarFotos(currentUser.id, ids);
        setFotos(res);
        if (res[0]?.url) setCurrentAvatarUrl(res[0].url);
        onShowToast('Orden actualizado ✨', 'info');
      } catch (err) {
        console.warn('Error reordenando fotos:', err);
      } finally {
        setFotosLoading(false);
      }
    }
  };

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

  // Filtrado reactivo de hobbies por texto y categoría
  const filteredHobbies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return hobbies.filter((hobbie) => {
      const hobbieNombre = (hobbie.nombre || '').toLowerCase();

      // Filtro por texto de búsqueda
      if (q && !hobbieNombre.includes(q)) {
        return false;
      }

      // Filtro por categoría seleccionada
      if (selectedCategory === 'all') return true;

      if (selectedCategory === 'mine') {
        return localHobbyIds.includes(hobbie.id);
      }

      const categoryObj = HOBBIE_CATEGORIES.find((cat) => cat.id === selectedCategory);
      if (!categoryObj || !categoryObj.keywords) return true;

      return categoryObj.keywords.some((keyword) => hobbieNombre.includes(keyword));
    });
  }, [hobbies, searchQuery, selectedCategory, localHobbyIds]);

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
    setLoading(true);
    try {
      await api.actualizarUsuario(currentUser.id, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        fechaNacimiento: currentUser?.fechaNacimiento || '2000-01-01',
        biografia: biografia.trim(),
        genero: genero || null,
        ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null,
        activo: currentUser?.activo !== false,
      });
      await onProfileUpdated();
      onShowToast('Tu perfil ha sido actualizado con éxito ✨', 'success');
      setIsEditing(false);
    } catch (err) {
      onShowToast(err.message || 'Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
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
              <span>{currentUser?.nombre} {currentUser?.apellido}</span>
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
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} btn-sm profile-edit-btn`}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancelar' : '✏️ Editar Perfil'}
          </button>
        </div>

        {/* MODO EDICIÓN */}
        {isEditing ? (
          <form className="profile-edit-form" onSubmit={handleSaveProfile}>
            <h3 className="section-title">Editar Información Personal</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
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
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <select
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

            <div className="form-group">
              <label>Biografía / Presentación</label>
              <textarea
                className="form-control"
                rows="3"
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Escribe algo sobre ti, qué te gusta hacer en tu tiempo libre..."
                maxLength={500}
              />
            </div>

            <div className="form-actions-row">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Descartar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          /* MODO VISTA DE PERFIL */
          <div className="profile-view-details">
            <div className="profile-info-section">
              <h3 className="section-title">Sobre mí</h3>
              <p className="profile-bio-text">
                {currentUser?.biografia ||
                  'Aún no has agregado una descripción a tu perfil. Haz clic en "Editar Perfil" para agregarla y conseguir más conexiones.'}
              </p>
            </div>
          </div>
        )}

      </div>

        {currentUser?.id && (
          <PreferenciasSection key={currentUser.id} usuarioId={currentUser.id}
            onSaved={onPreferencesUpdated} onShowToast={onShowToast} />
        )}

        {/* ── SECCIÓN DE FOTOS DE PERFIL ── */}
        <div className="profile-section-card profile-photos-section">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">Fotos del perfil</h3>
              <p className="section-subtitle">
                La primera foto es tu foto principal. Podés tener hasta {MAX_PHOTOS} fotos y ordenarlas como quieras.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-tag">{fotos.length}/{MAX_PHOTOS}</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Abrir gestor de fotos"
              >
                Gestionar fotos
              </button>
            </div>
          </div>

          <div className="profile-photos-grid">
            {fotos.map((foto, idx) => (
              <div
                key={foto.id}
                className={`photo-thumb-wrapper ${idx === 0 ? 'is-main' : ''}`}
              >
                <img
                  src={foto.url}
                  alt={`Foto ${idx + 1}`}
                  className="photo-thumb-img"
                  loading="lazy"
                />
                {idx === 0 && (
                  <span className="photo-main-badge">Principal</span>
                )}
                <div className="photo-thumb-actions">
                  <div className="photo-thumb-reorder-row">
                    <button
                      type="button"
                      className="photo-thumb-arrow-btn"
                      onClick={() => handleReordenarFoto(idx, -1)}
                      disabled={idx === 0 || fotosLoading}
                      title="Mover a la izquierda"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="photo-thumb-arrow-btn"
                      onClick={() => handleReordenarFoto(idx, 1)}
                      disabled={idx === fotos.length - 1 || fotosLoading}
                      title="Mover a la derecha"
                    >
                      ▶
                    </button>
                  </div>
                  {idx !== 0 && (
                    <button
                      type="button"
                      className="photo-thumb-action-btn"
                      onClick={() => handleMarcarPrincipal(foto)}
                      disabled={fotosLoading}
                      title="Usar como foto principal"
                    >
                      ⭐ Principal
                    </button>
                  )}
                  <button
                    type="button"
                    className="photo-thumb-action-btn danger"
                    onClick={() => handleEliminarFoto(foto)}
                    disabled={fotosLoading}
                    title="Eliminar foto"
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            ))}

            {/* Botón de agregar foto */}
            {fotos.length < MAX_PHOTOS && (
              <>
                <input
                  id="profile-photo-upload-input"
                  type="file"
                  accept="image/*"
                  className="photo-upload-input"
                  onChange={handleFileUpload}
                  disabled={fotosLoading}
                />
                <button
                  type="button"
                  className="photo-add-btn"
                  onClick={() => document.getElementById('profile-photo-upload-input')?.click()}
                  disabled={fotosLoading}
                  title="Agregar foto"
                >
                  <span>{fotosLoading ? '⏳' : '+'}</span>
                  <span className="add-label">{fotosLoading ? 'Subiendo...' : 'Agregar'}</span>
                </button>
              </>
            )}
          </div>

          {fotos.length === 0 && (
            <p className="photos-hint">
              Todavía no tenés fotos. Subí al menos una para que tu perfil sea más atractivo.
            </p>
          )}
        </div>

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

          {/* Barra de Búsqueda y Filtros por Categoría */}
          <div className="hobbies-filter-toolbar">
            <div className="hobbies-search-box">
              <span className="hobbies-search-icon">🔍</span>
              <input
                type="text"
                className="hobbies-search-input"
                placeholder="Buscar hobbie (ej. fútbol, música, cocina)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="hobbies-search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Categorías de Hobbies */}
            <div className="hobbies-category-chips-row">
              {HOBBIE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                let count = 0;
                if (cat.id === 'all') {
                  count = hobbies.length;
                } else if (cat.id === 'mine') {
                  count = localHobbyIds.length;
                } else if (cat.keywords) {
                  count = hobbies.filter((h) =>
                    cat.keywords.some((k) => (h.nombre || '').toLowerCase().includes(k))
                  ).length;
                }

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`hobby-category-filter-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span>{cat.icon} {cat.label}</span>
                    <span className="category-filter-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grilla de Hobbies Filtrados */}
          {filteredHobbies.length === 0 ? (
            <div className="hobbies-empty-filter-state">
              <span style={{ fontSize: '2rem' }}>🔎</span>
              <p>No se encontraron hobbies que coincidan con tu búsqueda.</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="interactive-hobbies-grid">
              {filteredHobbies.map((h) => {
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
      {/* Modal para administrar y cargar fotos de perfil */}
      <AvatarPickerModal
        currentUser={currentUser}
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarSaved={(newAvatar) => {
          setCurrentAvatarUrl(newAvatar);
        }}
        onFotosUpdated={(newFotos) => {
          setFotos(newFotos);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
