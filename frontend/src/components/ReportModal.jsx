import React, { useState } from 'react';

export default function ReportModal({ isOpen, userToReport, onClose, onSubmitReport }) {
  const [reason, setReason] = useState('inappropriate');
  const [details, setDetails] = useState('');
  const [blockUser, setBlockUser] = useState(true);

  if (!isOpen || !userToReport) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReport({
      userId: userToReport.id,
      userName: `${userToReport.nombre} ${userToReport.apellido}`,
      reason,
      details,
      blocked: blockUser,
    });
    setDetails('');
    onClose();
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal-dialog modal-dialog-sm">
        <div className="modal-header">
          <h3 id="report-title" style={{ color: 'var(--danger)' }}>
            ⚠️ Reportar Perfil
          </h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              ¿Tienes algún problema con <strong>{userToReport.nombre} {userToReport.apellido}</strong>? Nos tomamos la seguridad muy en serio.
            </p>

            <div className="form-group">
              <label htmlFor="report-reason">Motivo del reporte</label>
              <select
                id="report-reason"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="inappropriate">Contenido o fotos inapropiadas</option>
                <option value="spam">Spam, estafa o cuenta falsa</option>
                <option value="harassment">Acoso o comportamiento irrespetuoso</option>
                <option value="underage">Sospecha de menor de edad</option>
                <option value="other">Otro motivo</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="report-details">Detalles adicionales (opcional)</label>
              <textarea
                id="report-details"
                className="form-control"
                rows="3"
                placeholder="Explica brevemente lo ocurrido..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={300}
              />
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label className="toggle-control">
                <input
                  type="checkbox"
                  checked={blockUser}
                  onChange={(e) => setBlockUser(e.target.checked)}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-label">Bloquear a este usuario para que no vuelva a aparecer</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger">
              Enviar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
