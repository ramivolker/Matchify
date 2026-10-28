import React from 'react';
import UserAvatar from './common/UserAvatar';
import adminAvatarImg from '../assets/admin-avatar.png';

export default function Sidebar({
  session,
  onLogout,
  currentAdminTab,
  setCurrentAdminTab,
  currentUserTab,
  setCurrentUserTab,
  stats,
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
            <div className="sidebar-brand-logo-container">
              <img src="/logo.png" alt="Matchify Logo" className="sidebar-brand-logo-img" />
            </div>
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
        <div
          className={`sidebar-user-card ${!isAdmin ? 'clickable' : ''}`}
          onClick={!isAdmin ? () => { setCurrentUserTab('perfil'); onClose(); } : undefined}
          title={!isAdmin ? 'Ir a Mi Perfil' : undefined}
          role={!isAdmin ? 'button' : undefined}
          tabIndex={!isAdmin ? 0 : undefined}
        >
          {isAdmin ? (
            <div className="sidebar-admin-avatar-container">
              <img
                src={adminAvatarImg}
                alt="Administrador"
                className="sidebar-admin-avatar-img"
              />
            </div>
          ) : (
            <UserAvatar
              user={currentUser}
              size="sm"
              className="sidebar-user-avatar-custom"
            />
          )}
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

            <button
              className={`nav-item ${currentUserTab === 'bloqueados' ? 'active' : ''}`}
              onClick={() => {
                setCurrentUserTab('bloqueados');
                onClose();
              }}
            >
              <span className="nav-icon">🚫</span>
              <span className="nav-label">Perfiles Bloqueados</span>
            </button>
          </nav>
        )}

        {/* Tema y cierre de sesión */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-controls">
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={onToggleDarkMode}
              aria-label="Modo oscuro"
              aria-pressed={darkMode}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span className="theme-toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {darkMode ? <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>}
                </svg>
              </span>
              <span className="theme-toggle-label">Modo {darkMode ? 'oscuro' : 'claro'}</span>
              <span className={`theme-toggle-track ${darkMode ? 'is-dark' : ''}`} aria-hidden="true">
                <span className="theme-toggle-thumb" />
              </span>
            </button>
          </div>

          <button
            className="btn-sm btn-ghost btn-logout"
            onClick={onLogout}
            title="Cerrar Sesión"
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ verticalAlign: 'middle', transform: 'translateY(-1px)' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg> Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
