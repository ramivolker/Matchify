import React, { useState, useEffect, useRef } from 'react';

import { api } from '../services/api';

export default function ReportModal({ isOpen, userToReport, onClose, onSubmitReport }) {
  const [reason, setReason] = useState('inappropriate');
  const [details, setDetails] = useState('');
  const [motivos, setMotivos] = useState({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setError(''); setMotivos({}); setReason('inappropriate'); setDetails('');
    api.getMotivosReporte().then((data) => { if (!cancelled) setMotivos(data); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [isOpen, userToReport?.id]);

  if (!isOpen || !userToReport) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setPending(true); setError('');
    try {
      await onSubmitReport({ userId: userToReport.id, reason, details });
      setDetails('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally { lock.current = false; setPending(false); }
  };

  return (
    <div className="modal" onClick={(event) => { if (event.target === event.currentTarget && !pending) onClose(); }} role="dialog" aria-modal="true" aria-labelledby="report-title">
      <div className="modal-dialog modal-dialog-sm">
        <div className="modal-header">
          <h3 id="report-title" style={{ color: 'var(--danger)' }}>
            ⚠️ Reportar Perfil
          </h3>
          <button className="btn-close" onClick={pending ? undefined : onClose} disabled={pending} aria-label="Cerrar modal">
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
                {Object.entries(motivos).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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

            {error && <p role="alert" style={{ color: 'var(--danger)' }}>{error}</p>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={pending ? undefined : onClose} disabled={pending}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger" disabled={pending || !Object.keys(motivos).length}>
              {pending ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
