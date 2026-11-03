import React from 'react';
export default function CuentaEstadoConfirmModal({ usuario, activo, pending, error, onClose, onConfirm }) {
  if (!usuario) return null;
  const accion = activo ? 'Reactivar' : 'Desactivar';
  return <div className={`modal ${activo ? '' : 'modal-danger'}`} onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }} role="dialog" aria-modal="true" aria-labelledby="cuenta-estado-title">
    <div className="modal-dialog modal-dialog-sm">
      <div className="modal-header"><h3 id="cuenta-estado-title">¿{accion} a {usuario.nombre} {usuario.apellido}?</h3></div>
      <div className="modal-body">
        <p>{activo ? 'El usuario podrá volver a utilizar Matchify con todos sus datos históricos.' : 'El usuario no podrá utilizar Matchify mientras permanezca desactivado. Sus datos y actividad histórica no serán eliminados.'}</p>
        <p className="text-muted">Esta acción no cambia el estado del reporte.</p>
        {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" disabled={pending} onClick={onClose}>Cancelar</button>
        <button className={`btn ${activo ? 'btn-primary' : 'btn-danger'}`} disabled={pending} onClick={onConfirm}>{pending ? 'Guardando...' : `${accion} usuario`}</button>
      </div>
    </div>
  </div>;
}
