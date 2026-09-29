import React, { useState, useEffect } from 'react';
import { getHobbieEmoji } from '../../utils/hobbieUtils';

const EMOJI_OPTIONS = [
  '🎨', '🎭', '🎬', '🎥', '📷', '📸', '🎵', '🎶', '🎸', '🎹', '🎺', '🥁',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '⛷️',
  '🚴', '🏊', '🏋️', '🤸', '🧘', '🤺', '🏇', '🧗', '🤿', '🎣', '🏄',
  '🍳', '🧁', '🍕', '☕', '🍺', '🍷', '🎂', '🥗',
  '📚', '📖', '✍️', '📝', '🖊️', '🎓', '🔬', '🔭', '🧪', '💻', '🖥️', '🎮',
  '🌿', '🌱', '🌾', '🌸', '🐾', '🐕', '🐈', '🐠',
  '✈️', '🏕️', '🗺️', '🏔️', '🌊', '🏜️', '🌆', '🧳',
  '🎯', '🎲', '🧩', '♟️', '🎰', '🎡', '🎪',
  '🛠️', '🔧', '🪚', '🎤', '📻', '📡', '🚗', '🏍️', '⛵',
];

export default function HobbieModal({ isOpen, onClose, onSubmit, hobbie }) {
  const [nombre, setNombre] = useState('');
  const [emoji, setEmoji] = useState('🎨');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (hobbie) {
      setNombre(hobbie.nombre || '');
      setEmoji(hobbie.emoji || getHobbieEmoji(hobbie));
    } else {
      setNombre('');
      setEmoji('🎨');
    }
    setShowPicker(false);
  }, [hobbie, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: nombre.trim(),
      emoji: emoji,
    });
  };

  return (
    <div className="modal">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>{hobbie ? `Editar Hobbie: ${hobbie.nombre}` : 'Crear Nuevo Hobbie'}</h3>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Emoji selector */}
            <div className="form-group">
              <label>Emoji <span className="required-star">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPicker((v) => !v)}
                  style={{
                    fontSize: '1.8rem',
                    width: '3rem',
                    height: '3rem',
                    border: '2px solid var(--border)',
                    borderRadius: '10px',
                    background: 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  title="Elegir emoji"
                >
                  {emoji}
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hacé click para cambiar el emoji
                </span>
              </div>

              {showPicker && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.35rem',
                    maxHeight: '180px',
                    overflowY: 'auto',
                  }}
                >
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setEmoji(e); setShowPicker(false); }}
                      style={{
                        fontSize: '1.4rem',
                        width: '2.4rem',
                        height: '2.4rem',
                        border: emoji === e ? '2px solid var(--primary)' : '1px solid transparent',
                        borderRadius: '8px',
                        background: emoji === e ? 'rgba(99,102,241,0.1)' : 'transparent',
                        cursor: 'pointer',
                      }}
                      title={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label>
                Nombre del Hobbie <span className="required-star">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                required
                placeholder="Ej: Trekking, Fotografía, Gaming..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Hobbie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
