import React from 'react';

export default function Sidebar({
  session,
  onLogout,
  currentAdminTab,
  setCurrentAdminTab,
  currentUserTab,
  setCurrentUserTab,
  stats,
  isApiOnline,
  checkHealth,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
}) {
  const isAdmin = session?.role === 'admin';
  const currentUser = session?.user;

  return (
    <>
      {/* Backdrop para cerrar en móvil */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Marca y Botón de cierre en móvil */}
        <div className="brand sidebar-brand">
          <div className="brand-info">
            <div className="logo-icon">{isAdmin ? '🛡️' : '🔥'}</div>
            <div className="brand-text">
              <h1>Matchify</h1>
              <span className={`badge-dev ${isAdmin ? 'badge-admin' : ''}`}>
                {isAdmin ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
          <button className="btn-close-sidebar" onClick={onClose} aria-label="Cerrar menú">
            &times;
          </button>
        </div>

        {/* Tarjeta de Usuario Activo en Sesión */}
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            {isAdmin
              ? '👑'
              : `${currentUser?.nombre?.charAt(0) || 'U'}${currentUser?.apellido?.charAt(0) || ''}`.toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">
              {isAdmin ? 'Administrador' : `${currentUser?.nombre} ${currentUser?.apellido}`}
            </span>
            <span className="sidebar-user-email">
              {isAdmin ? session.email : currentUser?.email}
            </span>
          </div>
        </div>

        {/* Menú de Navegación ADMIN */}
        {isAdmin && (
          <nav className="nav-menu">
            <div className="nav-section-title">ADMINISTRACIÓN</div>
            <button
              className={`nav-item ${currentAdminTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => {
                setCurrentAdminTab('usuarios');
                onClose();
              }}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-label">Usuarios</span>
              <span className="counter-badge">{stats.totalUsuarios}</span>
            </button>
            <button
              className={`nav-item ${currentAdminTab === 'hobbies' ? 'active' : ''}`}
              onClick={() => {
                setCurrentAdminTab('hobbies');
                onClose();
              }}
            >
              <span className="nav-icon">🎨</span>
              <span className="nav-label">Hobbies</span>
              <span className="counter-badge">{stats.totalHobbies}</span>
            </button>
            <button
              className={`nav-item ${currentAdminTab === 'ubicaciones' ? 'active' : ''}`}
              onClick={() => {
                setCurrentAdminTab('ubicaciones');
                onClose();
              }}
            >
              <span className="nav-icon">📍</span>
              <span className="nav-label">Ubicaciones</span>
              <span className="counter-badge">{stats.totalUbicaciones}</span>
            </button>
          </nav>
        )}

        {/* Menú de Navegación USUARIO NORMAL */}
        {!isAdmin && (
          <nav className="nav-menu">
            <div className="nav-section-title">DESCUBRIR</div>
            <button
              className={`nav-item ${currentUserTab === 'swipe' ? 'active' : ''}`}
              onClick={() => {
                setCurrentUserTab('swipe');
                onClose();
              }}
            >
              <span className="nav-icon">🔥</span>
              <span className="nav-label">Explorar Perfiles</span>
            </button>
            <button
              className={`nav-item ${currentUserTab === 'matches' ? 'active' : ''}`}
              onClick={() => {
                setCurrentUserTab('matches');
                onClose();
              }}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-label">Mis Matches</span>
              <span className="counter-badge badge-match">{stats.matchesCount}</span>
            </button>
            <button
              className={`nav-item ${currentUserTab === 'perfil' ? 'active' : ''}`}
              onClick={() => {
                setCurrentUserTab('perfil');
                onClose();
              }}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Mi Perfil</span>
            </button>
          </nav>
        )}

        {/* Footer con Estado de la API, Tema y Cerrar Sesión */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-controls">
            <div className="api-status">
              <span className={`status-dot ${isApiOnline ? 'online' : 'offline'}`} />
              <span className="status-text">{isApiOnline ? 'API Conectada' : 'API Desconectada'}</span>
            </div>

            <button
              type="button"
              className="btn-sm btn-ghost btn-theme-toggle"
              onClick={onToggleDarkMode}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span>{darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</span>
            </button>
          </div>

          <button
            className="btn-sm btn-ghost btn-logout"
            onClick={onLogout}
            title="Cerrar Sesión"
          >
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
