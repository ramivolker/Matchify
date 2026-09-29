import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import PreferenciasSection from './PreferenciasSection';
import { getHobbieEmoji } from '../../utils/hobbieUtils';
import { getUserAvatar } from '../../utils/userAvatarUtils';
import UserAvatar from '../common/UserAvatar';
import AvatarPickerModal from './AvatarPickerModal';

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
}) {
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
  const [biografia, setBiografia] = useState(currentUser?.biografia || '');
  const [ubicacionId, setUbicacionId] = useState(currentUser?.ubicacionId || '');

  // Privacy toggles
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [hideDistance, setHideDistance] = useState(false);

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

  // Calculate Profile Completeness Percentage
  let completionScore = 0;
  if (currentUser?.nombre && currentUser?.apellido) completionScore += 30;
  if (currentUser?.email) completionScore += 20;
  if (currentUser?.biografia && currentUser?.biografia.trim().length > 10) completionScore += 25;
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
        biografia: biografia.trim() || undefined,
        ubicacionId: ubicacionId ? parseInt(ubicacionId, 10) : null,
        activo: currentUser?.activo !== false,
      });
      onShowToast('Tu perfil ha sido actualizado con éxito ✨', 'success');
      setIsEditing(false);
      onProfileUpdated();
    } catch (err) {
      onShowToast(err.message || 'Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab-wrapper">
      <div className="card profile-tab-card">
        {/* Barra de Progreso de Completitud del Perfil (Onboarding progresivo) */}
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
              📷
            </button>
          </div>

          <div className="profile-banner-details">
            <h2>
              {currentUser?.nombre} {currentUser?.apellido}{' '}
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
              <button
                type="button"
                className="btn btn-outline btn-xs btn-change-photo"
                onClick={() => setIsAvatarModalOpen(true)}
              >
                📸 Cambiar foto
              </button>
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
              <label>Biografía / Presentación</label>
              <textarea
                className="form-control"
                rows="3"
                value={biografia}
                onChange={(e) => setBiografia(e.target.value)}
                placeholder="Escribe algo sobre ti, qué te gusta hacer en tu tiempo libre..."
                maxLength={400}
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

        {/* SECCIÓN DE PRIVACIDAD Y SEGURIDAD */}
        {currentUser?.id && (
          <PreferenciasSection key={currentUser.id} usuarioId={currentUser.id}
            onSaved={onPreferencesUpdated} onShowToast={onShowToast} />
        )}

        <div className="profile-privacy-section">
          <h3 className="section-title">🔒 Privacidad y Control de Perfil</h3>
          <div className="privacy-toggles-grid">
            <label className="toggle-control privacy-card-item">
              <input
                type="checkbox"
                checked={incognitoMode}
                onChange={(e) => {
                  setIncognitoMode(e.target.checked);
                  onShowToast(
                    e.target.checked
                      ? 'Modo incógnito activado: tu perfil no aparecerá en la baraja'
                      : 'Modo incógnito desactivado: tu perfil está visible',
                    'info'
                  );
                }}
              />
              <span className="toggle-switch"></span>
              <div>
                <span className="toggle-label">Modo Incógnito</span>
                <p className="toggle-sub">Pausa la visibilidad de tu cuenta sin perder tus chats ni matches existentes.</p>
              </div>
            </label>

            <label className="toggle-control privacy-card-item">
              <input
                type="checkbox"
                checked={hideDistance}
                onChange={(e) => {
                  setHideDistance(e.target.checked);
                  onShowToast(
                    e.target.checked
                      ? 'Ubicación exacta oculta para otros usuarios'
                      : 'Ubicación visible normalmente',
                    'info'
                  );
                }}
              />
              <span className="toggle-switch"></span>
              <div>
                <span className="toggle-label">Ocultar distancia exacta</span>
                <p className="toggle-sub">Solo muestra tu ciudad aproximada para mayor privacidad.</p>
              </div>
            </label>
          </div>
        </div>

        {/* SECCIÓN DE HOBBIES DEL USUARIO */}
        <div className="profile-hobbies-section">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">🎨 Tus Hobbies y Pasiones</h3>
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
