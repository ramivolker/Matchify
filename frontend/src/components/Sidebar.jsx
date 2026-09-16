import React from 'react';

export default function Sidebar({
  appMode,
  setAppMode,
  currentAdminTab,
  setCurrentAdminTab,
  currentUserTab,
  setCurrentUserTab,
  stats,
  isApiOnline,
  checkHealth,
  isOpen,
  onClose,
}) {
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
            <div className="logo-icon">🔥</div>
            <div className="brand-text">
              <h1>Matchify</h1>
              <span className="badge-dev">{appMode === 'admin' ? 'Admin' : 'Usuario'}</span>
            </div>
          </div>
          <button className="btn-close-sidebar" onClick={onClose} aria-label="Cerrar menú">
            &times;
          </button>
        </div>

        {/* Selector de Modo: Admin vs Tinder */}
        <div className="mode-switcher-card">
          <span className="mode-switcher-title">Modo de Vista:</span>
          <div className="segmented-control">
            <button
              className={`seg-btn ${appMode === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setAppMode('admin');
                onClose();
              }}
            >
              <span>🛡️</span> Admin
            </button>
            <button
              className={`seg-btn ${appMode === 'user' ? 'active' : ''}`}
              onClick={() => {
                setAppMode('user');
                onClose();
              }}
            >
              <span>🔥</span> Tinder
            </button>
          </div>
        </div>

        {/* Menú de Navegación ADMIN */}
        {appMode === 'admin' && (
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
            <button
              className={`nav-item ${currentAdminTab === 'relaciones' ? 'active' : ''}`}
              onClick={() => {
                setCurrentAdminTab('relaciones');
                onClose();
              }}
            >
              <span className="nav-icon">🔗</span>
              <span className="nav-label">Asignar Hobbies</span>
            </button>
          </nav>
        )}

        {/* Menú de Navegación TINDER USER */}
        {appMode === 'user' && (
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
          </nav>
        )}

        {/* Footer con Estado de la API */}
        <div className="sidebar-footer">
          <div className="api-status">
            <span className={`status-dot ${isApiOnline ? 'online' : 'offline'}`} />
            <span className="status-text">{isApiOnline ? 'API Conectada' : 'API Desconectada'}</span>
          </div>
          <button className="btn-sm btn-ghost" onClick={checkHealth} title="Verificar API">
            <span>↻</span> Probar API
          </button>
        </div>
      </aside>
    </>
  );
}
