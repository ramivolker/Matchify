import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function DevResetPanel({ usuarios, currentUserId, onReset, onShowToast }) {
  const [habilitado, setHabilitado] = useState(false);
  const [usuarioId, setUsuarioId] = useState(currentUserId || '');
  const [confirmation, setConfirmation] = useState(null);
  const [pending, setPending] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    api.getResetHabilitado().then((value) => {
      if (!cancelled) setHabilitado(value);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const confirmar = async () => {
    if (lock.current || !confirmation) return;
    lock.current = true;
    setPending(true);
    setConfirmation(null);
    try {
      const result = await api.resetearInteracciones(confirmation.usuarioId);
      onReset();
      onShowToast(`Reset completo: ${result.interaccionesEliminadas} interacciones y ${result.matchesEliminados} matches eliminados.`, 'success');
    } catch (error) {
      onShowToast(error.message, 'error');
    } finally {
      lock.current = false;
      setPending(false);
    }
  };

  if (!habilitado) return null;
  const selectedUser = usuarios.find((u) => u.id === Number(usuarioId));
  return (
    <section aria-label="Herramientas de desarrollo" style={{ marginBottom: '1rem' }}>
      <p>Herramientas de desarrollo</p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button className="btn btn-danger" disabled={pending} onClick={() => setConfirmation({
          title: 'Resetear todas las interacciones',
          message: 'Esto eliminará todos los likes, dislikes y matches. Los usuarios y datos de prueba se conservarán.',
        })}>Resetear interacciones</button>
        <select aria-label="Usuario para resetear interacciones" className="form-control" value={usuarioId} disabled={pending} onChange={(e) => setUsuarioId(e.target.value)}>
          <option value="">Seleccionar usuario</option>
          {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre} {u.apellido} (ID #{u.id})</option>)}
        </select>
        <button className="btn btn-secondary" disabled={pending || !selectedUser} onClick={() => setConfirmation({
          usuarioId: selectedUser.id,
          title: `Resetear interacciones de ${selectedUser.nombre} ${selectedUser.apellido} (ID #${selectedUser.id})`,
          message: 'Esto eliminará todos los likes y dislikes enviados o recibidos por este usuario y todos sus matches. Las interacciones entre otros usuarios, los usuarios y datos de prueba se conservarán.',
        })}>Resetear interacciones del usuario seleccionado</button>
      </div>
      {pending && <p role="status">Reseteando interacciones…</p>}
      <DeleteConfirmModal isOpen={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} onClose={() => setConfirmation(null)} onConfirm={confirmar} />
    </section>
  );
}
