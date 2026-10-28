import React from 'react';

export default function ProfileActionsModal({ user, confirming, pending, onClose, onReport, onRequestBlock, onConfirmBlock }) {
  if (!user) return null;

  return (
    <div className="modal profile-actions-overlay" role="dialog" aria-modal="true" aria-labelledby="profile-actions-title"
      aria-busy={pending} onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }}>
      <div className="modal-dialog modal-dialog-sm profile-actions-dialog">
        <div className="modal-header">
          <h3 id="profile-actions-title">{confirming ? 'Bloquear usuario' : 'Acciones del perfil'}</h3>
          <button type="button" className="btn-close" onClick={onClose} disabled={pending} aria-label="Cerrar modal">&times;</button>
        </div>
        {confirming ? (
          <>
            <div className="modal-body">
              <p>¿Querés bloquear a <strong>{user.nombre} {user.apellido}</strong>?</p>
              <p className="profile-actions-hint">Ya no podrán verse ni interactuar entre sí.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={pending} autoFocus>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={onConfirmBlock} disabled={pending}>
                {pending ? 'Bloqueando…' : 'Bloquear'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="modal-body profile-actions-options">
              <button type="button" className="profile-action-button profile-action-block" onClick={onRequestBlock} autoFocus>
                <span className="profile-action-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <circle cx="12" cy="12" r="9" /><path d="m5.64 5.64 12.72 12.72" />
                  </svg>
                </span>
                <span>Bloquear usuario</span>
              </button>
              <button type="button" className="profile-action-button profile-action-report" onClick={onReport}>
                <span className="profile-action-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                    <path d="M4 22V3m0 0c5-4 11 4 16 0v12c-5 4-11-4-16 0" />
                  </svg>
                </span>
                <span>Reportar usuario</span>
              </button>
            </div>
            <div className="modal-footer profile-actions-cancel-footer">
              <button type="button" className="profile-actions-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
