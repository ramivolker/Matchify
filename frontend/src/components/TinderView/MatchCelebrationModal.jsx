import React from 'react';

export default function MatchCelebrationModal({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  commonHobbies,
  onGoToMatches,
}) {
  if (!isOpen || !matchedUser) return null;

  const myInitials = currentUser
    ? `${currentUser.nombre.charAt(0)}${currentUser.apellido.charAt(0)}`.toUpperCase()
    : 'TÚ';

  const theirInitials = `${matchedUser.nombre.charAt(0)}${matchedUser.apellido.charAt(0)}`.toUpperCase();

  return (
    <div className="modal modal-match-celebration">
      <div className="modal-dialog modal-match-dialog">
        <div className="match-badge-banner">🔥 ¡ES UN MATCH! 🔥</div>
        <p className="match-subheading">A ambos les interesa conectar</p>

        <div className="match-avatars-collision">
          <div className="match-avatar-circle">{myInitials}</div>
          <div className="match-heart-center">💚</div>
          <div className="match-avatar-circle">{theirInitials}</div>
        </div>

        <h3 className="match-name-title">Tú y {matchedUser.nombre} se han gustado</h3>

        <div className="match-common-hobbies">
          {commonHobbies && commonHobbies.length > 0 ? (
            commonHobbies.map((h) => (
              <span key={h.id} className="badge badge-success">
                🔥 {h.nombre}
              </span>
            ))
          ) : (
            <span className="badge badge-tag">✨ Conexión espontánea</span>
          )}
        </div>

        <div className="match-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              onClose();
              onGoToMatches();
            }}
          >
            💬 Enviar Mensaje
          </button>
          <button className="btn btn-ghost btn-lg" onClick={onClose}>
            Continuar Deslizando 🔥
          </button>
        </div>
      </div>
    </div>
  );
}
