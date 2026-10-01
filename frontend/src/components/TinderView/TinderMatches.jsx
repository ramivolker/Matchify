import React from 'react';
import useMatchMessages from '../../hooks/useMatchMessages';
import UserAvatar from '../common/UserAvatar';

export default function TinderMatches({
  matches,
  currentUserId,
  onBackToExplore,
  onOpenDetail,
  onOpenReport,
  activeChatUser,
  onSelectChatUser,
}) {
  const currentChatUser = matches.find((match) => match.matchId === activeChatUser?.matchId) || null;
  const chat = useMatchMessages(currentChatUser?.matchId, currentUserId);
  const currentMessages = chat.messages;
  const inputText = chat.input;
  const setInputText = chat.setInput;
  const handleSendMessage = chat.send;
  const handleUseStarter = chat.setInput;
  const formatTime = (date) => new Date(date).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="matches-chat-container">
      {/* =========================================================================
          PANEL IZQUIERDO: LISTA DE MATCHES Y CONVERSACIONES
          ========================================================================= */}
      <div className={`matches-sidebar-panel ${currentChatUser ? 'hidden-mobile' : ''}`}>
        {/* Header */}
        <div className="matches-panel-header">
          <div>
            <h3>Tus Conexiones</h3>
            <span className="matches-count-subtitle">
              {matches.length} {matches.length === 1 ? 'match total' : 'matches totales'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onBackToExplore}
          >
            🔥 Explorar
          </button>
        </div>

        {/* Sección: Nuevos Matches (Carrusel Horizontal) */}
        <div className="new-matches-carousel-section">
          <span className="section-small-title">Nuevos Matches</span>
          {matches.length === 0 ? (
            <div className="empty-new-matches">
              <span style={{ fontSize: '1.5rem' }}>⏳</span>
              <p>Desliza a la derecha en la pestaña Explorar para conseguir matches.</p>
            </div>
          ) : (
            <div className="new-matches-horizontal-list">
              {matches.map((m) => (
                <button
                  key={m.matchId}
                  type="button"
                  className={`new-match-avatar-pill ${currentChatUser?.matchId === m.matchId ? 'active' : ''}`}
                  onClick={() => onSelectChatUser(m)}
                  title={`Conversar con ${m.nombre}`}
                >
                  <div className="match-avatar-ring">
                    <UserAvatar user={m} size="sm" className="match-avatar-inner" />

                  </div>
                  <span className="match-pill-name">{m.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sección: Conversaciones Activas */}
        <div className="active-conversations-section">
          <span className="section-small-title">Mensajes Recientes</span>
          {matches.length === 0 ? (
            <div className="empty-state-small">
              <span>💬</span>
              <p>Aún no tienes chats abiertos.</p>
            </div>
          ) : (
            <div className="conversations-list">
              {matches.map((m) => {
                const lastMsg = m.ultimoMensaje;
                const isSelected = currentChatUser?.matchId === m.matchId;

                return (
                  <div
                    key={m.matchId}
                    className={`conversation-item-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectChatUser(m)}
                  >
                    <div className="conversation-avatar">
                      <UserAvatar user={m} size="md" className="conversation-avatar-inner" />

                    </div>

                    <div className="conversation-content">
                      <div className="conversation-header-line">
                        <span className="conversation-name">
                          {m.nombre} {m.apellido}
                        </span>
                        <span className="conversation-time">
                          {formatTime(lastMsg?.enviadoEn ?? m.fechaMatch)}
                        </span>
                        {m.noLeidos > 0 && <span className="badge badge-tag" aria-label={`${m.noLeidos} mensajes sin leer`}>{m.noLeidos}</span>}
                      </div>
                      <p className="conversation-last-msg">
                        {lastMsg
                          ? (lastMsg.emisorId === currentUserId ? `Tú: ${lastMsg.contenido}` : lastMsg.contenido)
                          : '¡Has hecho match! Envía el primer mensaje.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          PANEL DERECHO: VISTA DE CHAT INTERACTIVO
          ========================================================================= */}
      <div className={`chat-active-panel ${!currentChatUser ? 'hidden-mobile' : ''}`}>
        {!currentChatUser ? (
          <div className="chat-placeholder-state">
            <div className="chat-placeholder-icon">💬</div>
            <h3>Selecciona un match</h3>
            <p>Elige a una persona de la lista izquierda para comenzar a chatear.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onBackToExplore}
              style={{ marginTop: '1rem' }}
            >
              🔥 Volver a Explorar Perfiles
            </button>
          </div>
        ) : (
          <div className="chat-conversation-wrapper">
            {/* Header del Chat */}
            <div className="chat-top-header">
              <button
                type="button"
                className="btn-back-chat-mobile"
                onClick={() => onSelectChatUser(null)}
                title="Volver a la lista"
              >
                ←
              </button>

              <div
                className="chat-user-header-info"
                onClick={() => onOpenDetail(currentChatUser)}
                title="Ver perfil completo"
              >
                <div className="chat-user-avatar">
                  <UserAvatar user={currentChatUser} size="md" className="chat-avatar-inner" />

                </div>
                <div>
                  <div className="chat-user-name-title">
                    {currentChatUser.nombre} {currentChatUser.apellido}{' '}
                    <span className="chat-verified-check">✓</span>
                  </div>
                  <span className="chat-online-status">Match activo</span>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenDetail(currentChatUser)}
                >
                  👤 Perfil
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onOpenReport && onOpenReport(currentChatUser)}
                  title="Reportar o Bloquear"
                >
                  ⚠️
                </button>
              </div>
            </div>

            {/* Área de Mensajes */}
            <div className="chat-messages-scroll-area" ref={chat.scrollRef} aria-busy={chat.loading}>
              {/* Saludo inicial con Hobbies en Común */}
              <div className="chat-intro-banner">
                <div className="chat-intro-avatar">
                  <UserAvatar user={currentChatUser} size="lg" className="chat-intro-avatar-inner" />
                </div>
                <h4>Hiciste match con {currentChatUser.nombre}</h4>
                <p>
                  {currentChatUser.ubicacion
                    ? `Vive en ${currentChatUser.ubicacion.ciudad}, ${currentChatUser.ubicacion.provincia}`
                    : 'Ubicación cercana'}
                </p>

                {currentChatUser.commonHobbies && currentChatUser.commonHobbies.length > 0 && (
                  <div className="chat-shared-hobbies-chips">
                    <span>Intereses en común:</span>
                    {currentChatUser.commonHobbies.map((h) => (
                      <span key={h.id} className="badge badge-success">
                        🔥 {h.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {chat.loading && <p role="status">Cargando conversación…</p>}
              {/* Mensajes */}
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.emisorId === currentUserId ? 'outgoing' : 'incoming'}`}
                >
                  <div className="chat-bubble">
                    <p className="chat-bubble-text">{msg.contenido}</p>
                    <div className="chat-bubble-meta">
                      <span className="chat-time">{formatTime(msg.enviadoEn)}</span>
                      {msg.emisorId === currentUserId && <span className="chat-status-check" aria-label={msg.leido ? 'Leído' : 'Enviado'}>{msg.leido ? '✓✓' : '✓'}</span>}
                    </div>
                  </div>
                </div>
              ))}


            </div>

            {/* Conversation Starters Chips */}
            {!chat.loading && !chat.error && currentMessages.length === 0 && (
              <div className="chat-inline-starters">
                <span className="starters-tip-title">Sugerencias para romper el hielo:</span>
                <div className="starters-buttons-row">
                  {currentChatUser.commonHobbies && currentChatUser.commonHobbies.length > 0 ? (
                    <button
                      type="button"
                      className="starter-btn-pill"
                      onClick={() =>
                        handleUseStarter(
                          `¡Hola! Vi que te gusta ${currentChatUser.commonHobbies[0].nombre} 🤩`
                        )
                      }
                    >
                      "¡Hola! Vi que te gusta {currentChatUser.commonHobbies[0].nombre} 🤩"
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="starter-btn-pill"
                    onClick={() => handleUseStarter('¡Hola! ¿Cómo estás? Me gustó mucho tu perfil 👋')}
                  >
                    "¡Hola! ¿Cómo estás? Me gustó mucho tu perfil 👋"
                  </button>
                  <button
                    type="button"
                    className="starter-btn-pill"
                    onClick={() => handleUseStarter('¿Qué planes tienes para el fin de semana? ☕')}
                  >
                    "¿Qué planes tienes para el fin de semana? ☕"
                  </button>
                </div>
              </div>
            )}

            {/* Formulario de Envío de Mensaje */}
            {chat.error && <p className="chat-error" role="alert">{chat.error}</p>}
            <form className="chat-input-bar" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control chat-input"
                placeholder={`Envía un mensaje a ${currentChatUser.nombre}...`}
                value={inputText}
                maxLength={1000}
                aria-label="Mensaje"
                disabled={chat.loading || chat.sending || chat.unavailable}
                onChange={(e) => setInputText(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary chat-send-btn"
                disabled={!inputText.trim() || chat.loading || chat.sending || chat.unavailable}
                title="Enviar mensaje (Enter)"
                aria-label="Enviar mensaje"
              >
                <span>➤</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
