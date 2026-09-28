import React from 'react';

export default function NavbarMobile({
  session,
  onLogout,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
}) {
  const isAdmin = session?.role === 'admin';

  return (
    <header className="mobile-nav-bar">
      <div className="brand">
        <div className="logo-icon">{isAdmin ? '🛡️' : '🔥'}</div>
        <div className="brand-text">
          <h1>Matchify</h1>
          <span className={`badge-dev ${isAdmin ? 'badge-admin' : ''}`}>
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
        </div>
      </div>

      <div className="mobile-top-actions">
        <button
          type="button"
          className="btn-sm btn-ghost btn-mobile-theme"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <button
          className="btn-sm btn-ghost btn-mobile-logout"
          onClick={onLogout}
          title="Cerrar Sesión"
        >
          🚪 Salir
        </button>

        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
      </div>
    </header>
  );
}
