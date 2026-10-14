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
              <button type="button" className="btn btn-danger" onClick={onRequestBlock} autoFocus>Bloquear usuario</button>
              <button type="button" className="btn btn-secondary" onClick={onReport}>Reportar usuario</button>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
