import React from 'react';

export default function BottomNav({
  currentUserTab,
  setCurrentUserTab,
  matchesCount,
  darkMode,
  onToggleDarkMode,
}) {
  const handleTabClick = (tab) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setCurrentUserTab(tab);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación principal móvil">
      <button
        type="button"
        className={`bottom-nav-item ${currentUserTab === 'swipe' ? 'active' : ''}`}
        onClick={() => handleTabClick('swipe')}
        aria-label="Descubrir perfiles"
      >
        <span className="bottom-nav-icon">🔥</span>
        <span className="bottom-nav-label">Descubrir</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentUserTab === 'matches' ? 'active' : ''}`}
        onClick={() => handleTabClick('matches')}
        aria-label={`Matches y chat (${matchesCount} activos)`}
      >
        <div className="bottom-nav-icon-wrap">
          <span className="bottom-nav-icon">💬</span>
          {matchesCount > 0 && <span className="bottom-nav-badge">{matchesCount}</span>}
        </div>
        <span className="bottom-nav-label">Matches</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${currentUserTab === 'perfil' ? 'active' : ''}`}
        onClick={() => handleTabClick('perfil')}
        aria-label="Mi perfil y ajustes"
      >
        <span className="bottom-nav-icon">👤</span>
        <span className="bottom-nav-label">Perfil</span>
      </button>

      <button
        type="button"
        className="bottom-nav-item"
        onClick={() => {
          if (navigator.vibrate) navigator.vibrate(15);
          onToggleDarkMode();
        }}
        aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <span className="bottom-nav-icon">{darkMode ? '☀️' : '🌙'}</span>
        <span className="bottom-nav-label">{darkMode ? 'Claro' : 'Oscuro'}</span>
      </button>
    </nav>
  );
}
