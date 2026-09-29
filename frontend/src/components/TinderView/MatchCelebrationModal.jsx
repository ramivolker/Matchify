import React from 'react';
import UserAvatar from '../common/UserAvatar';

export default function MatchCelebrationModal({
  isOpen,
  currentUser,
  matchedUser,
  commonHobbies = [],
  onClose,
  onOpenChatWithUser,
}) {
  if (!isOpen || !matchedUser) return null;

  // Generate conversation starters
  const starters = [];
  if (commonHobbies && commonHobbies.length > 0) {
    starters.push(`¡Hola ${matchedUser.nombre}! Vi que compartimos ${commonHobbies[0].nombre} 🔥`);
    if (commonHobbies.length > 1) {
      starters.push(`¿Hace cuánto practicas ${commonHobbies[1].nombre}?`);
    }
  } else {
    starters.push(`¡Hola ${matchedUser.nombre}! ¿Cómo estás?`);
    starters.push(`¡Qué buen perfil! Me dio curiosidad saludarte 👋`);
  }

  const handleStartChat = (initialMessage = '') => {
    onOpenChatWithUser(matchedUser, initialMessage);
    onClose();
  };

  return (
    <div className="modal modal-match-celebration" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-match-dialog">
        <div className="match-badge-banner">¡ES UN MATCH!</div>
        <p className="match-subheading">
          Tú y <strong>{matchedUser.nombre}</strong> se han gustado mutuamente.
        </p>

        {/* Avatars Collision with Animated Heart */}
        <div className="match-avatars-collision">
          <div className="match-avatar-circle">
            <UserAvatar user={currentUser} size="lg" className="match-avatar-circle-img" />
          </div>
          <div className="match-heart-center">💚</div>
          <div className="match-avatar-circle">
            <UserAvatar user={matchedUser} size="lg" className="match-avatar-circle-img" />
          </div>
        </div>

        <div className="match-name-title">
          {matchedUser.nombre} {matchedUser.apellido}
        </div>

        {/* Common hobbies */}
        {commonHobbies.length > 0 && (
          <div className="match-common-hobbies">
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', width: '100%', marginBottom: '0.4rem' }}>
              Intereses compartidos:
            </span>
            {commonHobbies.map((h) => (
              <span key={h.id} className="badge badge-success">
                🔥 {h.nombre}
              </span>
            ))}
          </div>
        )}

        {/* Conversation Starters */}
        <div className="conversation-starters-box">
          <span className="starters-label">Rompe el hielo con un mensaje:</span>
          <div className="starters-chips">
            {starters.map((msg, i) => (
              <button
                key={i}
                type="button"
                className="starter-chip-btn"
                onClick={() => handleStartChat(msg)}
              >
                "{msg}"
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="match-actions">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => handleStartChat('')}
          >
            💬 Abrir Chat y Enviar Mensaje
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            🔥 Seguir Explorando Perfiles
          </button>
        </div>
      </div>
    </div>
  );
}
