import React from 'react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-danger">
      <div className="modal-dialog modal-dialog-sm">
        <div className="modal-body text-center">
          <div className="danger-icon-badge">🗑️</div>
          <h3>{title || '¿Estás seguro?'}</h3>
          <p className="confirm-text">{message || 'Esta acción no se puede deshacer.'}</p>
        </div>
        <div className="modal-footer justify-center">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Eliminar Definitivamente
          </button>
        </div>
      </div>
    </div>
  );
}
