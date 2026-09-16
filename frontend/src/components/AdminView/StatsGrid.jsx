import React from 'react';

export default function StatsGrid({ stats, onSelectTab }) {
  return (
    <section className="stats-grid">
      <div className="stat-card" onClick={() => onSelectTab('usuarios')}>
        <div className="stat-icon-wrap user-bg">👥</div>
        <div className="stat-details">
          <span className="stat-label">Usuarios Totales</span>
          <div className="stat-value">{stats.totalUsuarios}</div>
          <span className="stat-subtext">
            {stats.activos} activos / {stats.inactivos} inactivos
          </span>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectTab('hobbies')}>
        <div className="stat-icon-wrap hobbie-bg">🎨</div>
        <div className="stat-details">
          <span className="stat-label">Hobbies en Catálogo</span>
          <div className="stat-value">{stats.totalHobbies}</div>
          <span className="stat-subtext">Categorías de interés</span>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectTab('ubicaciones')}>
        <div className="stat-icon-wrap ubicacion-bg">📍</div>
        <div className="stat-details">
          <span className="stat-label">Ubicaciones</span>
          <div className="stat-value">{stats.totalUbicaciones}</div>
          <span className="stat-subtext">Ciudades registradas</span>
        </div>
      </div>

      <div className="stat-card" onClick={() => onSelectTab('relaciones')}>
        <div className="stat-icon-wrap match-bg">✨</div>
        <div className="stat-details">
          <span className="stat-label">Asignaciones</span>
          <div className="stat-value">{stats.totalRelaciones}</div>
          <span className="stat-subtext">Vínculos usuario-hobbie</span>
        </div>
      </div>
    </section>
  );
}
