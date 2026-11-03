import React, { useEffect } from 'react';

export default function TerminarMatchModal({
  isOpen,
  user,
  pending = false,
  onClose,
  onConfirm,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !pending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pending, onClose]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="modal profile-actions-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminar-match-title"
      aria-busy={pending}
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <div className="modal-dialog modal-dialog-sm profile-actions-dialog">
        <div className="modal-header">
          <h3 id="terminar-match-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger, #ff4757)' }}>
            <span aria-hidden="true">💔</span> Terminar Match
          </h3>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            disabled={pending}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p>
            ¿Estás seguro de que querés terminar el match con <strong>{user.nombre} {user.apellido}</strong>?
          </p>
          <p
            className="profile-actions-hint"
            style={{
              marginTop: '0.65rem',
              color: 'var(--text-muted, #8a8d98)',
              fontSize: '0.88rem',
              lineHeight: 1.45,
            }}
          >
            Ya no podrán enviarse mensajes ni interactuar, y esta conversación desaparecerá de tus conexiones.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={pending}
            autoFocus
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Terminando match…' : 'Terminar match'}
          </button>
        </div>
      </div>
    </div>
  );
}
