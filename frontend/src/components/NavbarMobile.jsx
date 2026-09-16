import React from 'react';

export default function NavbarMobile({ appMode, setAppMode, onToggleSidebar }) {
  return (
    <header className="mobile-nav-bar">
      <div className="brand">
        <div className="logo-icon">🔥</div>
        <div className="brand-text">
          <h1>Matchify</h1>
        </div>
      </div>

      <div className="mobile-top-actions">
        <div className="mode-switch-compact">
          <button
            className={`btn-mode-toggle ${appMode === 'admin' ? 'active' : ''}`}
            onClick={() => setAppMode('admin')}
          >
            🛡️ Admin
          </button>
          <button
            className={`btn-mode-toggle ${appMode === 'user' ? 'active' : ''}`}
            onClick={() => setAppMode('user')}
          >
            🔥 Tinder
          </button>
        </div>

        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Abrir menú">
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>
      </div>
    </header>
  );
}
