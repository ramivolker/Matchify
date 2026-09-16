import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function RelacionesTab({
  usuarios,
  hobbies,
  onRelationChanged,
  onShowToast,
}) {
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [selectedHobbieId, setSelectedHobbieId] = useState('');
  const [userHobbies, setUserHobbies] = useState([]);
  const [loadingHobbies, setLoadingHobbies] = useState(false);

  useEffect(() => {
    if (selectedUsuarioId) {
      cargarHobbiesDeUsuario(selectedUsuarioId);
    } else {
      setUserHobbies([]);
    }
  }, [selectedUsuarioId]);

  const cargarHobbiesDeUsuario = async (userId) => {
    setLoadingHobbies(true);
    try {
      const data = await api.getHobbiesDeUsuario(userId);
      setUserHobbies(data);
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoadingHobbies(false);
    }
  };

  const handleAsociar = async (e) => {
    e.preventDefault();
    if (!selectedUsuarioId || !selectedHobbieId) {
      onShowToast('Selecciona un usuario y un hobbie', 'error');
      return;
    }

    try {
      await api.asociarHobbie(selectedUsuarioId, selectedHobbieId);
      onShowToast('Hobbie asignado al usuario con éxito', 'success');
      cargarHobbiesDeUsuario(selectedUsuarioId);
      onRelationChanged();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  const handleDesasociar = async (hobbieId) => {
    try {
      await api.desasociarHobbie(selectedUsuarioId, hobbieId);
      onShowToast('Hobbie quitado con éxito', 'info');
      cargarHobbiesDeUsuario(selectedUsuarioId);
      onRelationChanged();
    } catch (err) {
      onShowToast(err.message, 'error');
    }
  };

  return (
    <div className="grid-2-cols">
      {/* Formulario para asociar */}
      <div className="card form-card">
        <div className="card-header-icon">
          <span className="card-badge-icon">🔗</span>
          <div>
            <h3>Asignar Hobbie a Usuario</h3>
            <p className="subtitle">
              Endpoint: <code>POST /api/usuarios/:usuarioId/hobbies/:hobbieId</code>
            </p>
          </div>
        </div>

        <form onSubmit={handleAsociar} className="form-vertical">
          <div className="form-group">
            <label htmlFor="relUserSelect">Seleccionar Usuario</label>
            <select
              id="relUserSelect"
              className="form-control"
              value={selectedUsuarioId}
              onChange={(e) => setSelectedUsuarioId(e.target.value)}
              required
            >
              <option value="">-- Selecciona un usuario --</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} (ID #{u.id})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="relHobSelect">Seleccionar Hobbie a Vincular</label>
            <select
              id="relHobSelect"
              className="form-control"
              value={selectedHobbieId}
              onChange={(e) => setSelectedHobbieId(e.target.value)}
              required
            >
              <option value="">-- Selecciona un hobbie --</option>
              {hobbies.map((h) => (
                <option key={h.id} value={h.id}>
                  🎨 {h.nombre}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            <span className="btn-icon">＋</span> Vincular Hobbie
          </button>
        </form>
      </div>

      {/* Lista de hobbies asignados al usuario seleccionado */}
      <div className="card">
        <div className="card-header-icon">
          <span className="card-badge-icon">🏷️</span>
          <div>
            <h3>Hobbies Asignados</h3>
            <p className="subtitle">Intereses vinculados al usuario seleccionado.</p>
          </div>
        </div>

        <div className="user-hobbies-list">
          {!selectedUsuarioId ? (
            <div className="empty-state-small">
              <span>👈</span>
              <p>Selecciona un usuario de la lista para gestionar sus hobbies.</p>
            </div>
          ) : loadingHobbies ? (
            <div className="spinner"></div>
          ) : userHobbies.length === 0 ? (
            <div className="empty-state-small">
              <span>🎨</span>
              <p>Este usuario no tiene ningún hobbie asignado aún.</p>
            </div>
          ) : (
            userHobbies.map((item) => {
              const h = item.hobbie || item;
              const hobbieId = h.id || item.hobbieId;
              const nombre = h.nombre || `Hobbie #${hobbieId}`;

              return (
                <div key={hobbieId} className="hobbie-chip-row">
                  <span>
                    <strong>🎨 {nombre}</strong>
                  </span>
                  <button
                    className="btn btn-action-delete btn-sm"
                    onClick={() => handleDesasociar(hobbieId)}
                  >
                    Quitar
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
