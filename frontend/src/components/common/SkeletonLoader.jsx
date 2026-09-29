import React from 'react';

/**
 * Skeleton Loader para la tarjeta del Deck de Tinder
 */
export function TinderCardSkeleton() {
  return (
    <div className="tinder-card-skeleton" aria-label="Cargando candidatos..." role="status">
      <div className="skeleton-hero-box skeleton-shimmer">
        <div className="skeleton-avatar-circle skeleton-shimmer" />
        <div className="skeleton-badge-pill skeleton-shimmer" />
      </div>

      <div className="skeleton-content-box">
        <div className="skeleton-line-title skeleton-shimmer" />
        <div className="skeleton-line-subtitle skeleton-shimmer" />

        <div className="skeleton-chips-row">
          <div className="skeleton-chip skeleton-shimmer" />
          <div className="skeleton-chip skeleton-shimmer" />
          <div className="skeleton-chip skeleton-shimmer" />
        </div>

        <div className="skeleton-bio-box skeleton-shimmer" />
      </div>

      <div className="skeleton-actions-bar">
        <div className="skeleton-action-btn btn-sm skeleton-shimmer" />
        <div className="skeleton-action-btn btn-lg skeleton-shimmer" />
        <div className="skeleton-action-btn btn-sm skeleton-shimmer" />
        <div className="skeleton-action-btn btn-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

/**
 * Skeleton Loader para filas de tablas en el panel de Administración
 */
export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="table-skeleton-row">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="table-skeleton-cell">
              <div
                className="skeleton-table-line skeleton-shimmer"
                style={{
                  width: cIdx === 0 ? '70%' : cIdx === cols - 1 ? '45%' : '85%',
                  height: '14px',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default {
  TinderCardSkeleton,
  TableSkeleton,
};
