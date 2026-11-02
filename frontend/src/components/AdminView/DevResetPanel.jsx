import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function DevResetPanel({ onReset, onShowToast }) {
  const [habilitado, setHabilitado] = useState(false);
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
      const result = await api.resetearInteracciones();
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
  return (
    <section aria-label="Herramientas de desarrollo" style={{ marginBottom: '1rem' }}>
      <p>Herramientas de desarrollo</p>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button className="btn btn-danger" disabled={pending} onClick={() => setConfirmation({
          title: 'Borrar todas las interacciones',
          message: 'Esto eliminará todos los likes, dislikes y matches. Los usuarios y datos de prueba se conservarán.',
        })}>Borrar todas las interacciones</button>
      </div>
      {pending && <p role="status">Reseteando interacciones…</p>}
      <DeleteConfirmModal isOpen={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} onClose={() => setConfirmation(null)} onConfirm={confirmar} />
    </section>
  );
}
