import React from 'react';

export default function NavbarMobile({
  session,
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
          {isAdmin && <span className="badge-dev badge-admin">Admin</span>}
        </div>
      </div>

      <div className="mobile-top-actions">
        <button
          type="button"
          className="btn-sm btn-ghost btn-mobile-theme"
          onClick={onToggleDarkMode}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
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
