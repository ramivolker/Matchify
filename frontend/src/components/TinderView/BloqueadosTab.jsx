import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function BloqueadosTab({
  currentUserId,
  onShowToast,
  onUnblocked,
}) {
  const [bloqueados, setBloqueados] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarBloqueados = async () => {
    if (!currentUserId) return;

    setLoading(true);

    try {
      const data = await api.getBloqueados(currentUserId);
      setBloqueados(Array.isArray(data) ? data : []);
    } catch (err) {
      onShowToast?.(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBloqueados();
  }, [currentUserId]);

  const handleDesbloquear = async (usuarioBloqueadoId) => {
    try {
      await api.desbloquearUsuario(
        currentUserId,
        usuarioBloqueadoId
      );

      setBloqueados((prev) =>
        prev.filter(
          (bloqueo) =>
            bloqueo.usuarioBloqueadoId !== usuarioBloqueadoId
        )
      );

      onShowToast?.('Usuario desbloqueado correctamente', 'success');
      onUnblocked?.(usuarioBloqueadoId);
    } catch (err) {
      onShowToast?.(err.message, 'error');
    }
  };

  if (loading) {
    return <p>Cargando perfiles bloqueados...</p>;
  }

  return (
    <div className="card blocked-users-page">
      <h2>Perfiles Bloqueados</h2>

      {bloqueados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚫</div>
          <h4>No tenés perfiles bloqueados</h4>
          <p>
            Los usuarios que bloquees aparecerán acá.
          </p>
        </div>
      ) : (
        <div className="blocked-users-list">
          {bloqueados.map((bloqueo) => {
            const usuario = bloqueo.usuarioBloqueado;

            return (
              <div
                key={bloqueo.id}
                className="blocked-user-card"
              >
                <div className="blocked-user-info">
                  <div className="avatar">
                    {`${usuario?.nombre?.charAt(0) || 'U'}${
                      usuario?.apellido?.charAt(0) || ''
                    }`.toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {usuario?.nombre} {usuario?.apellido}
                    </strong>

                    <div className="text-muted">
                      {usuario?.email}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    handleDesbloquear(usuario.id)
                  }
                >
                  Desbloquear
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}