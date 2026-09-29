import React, { useState } from 'react';
import UserAvatar from '../common/UserAvatar';

export default function TinderMatches({
  matches,
  onBackToExplore,
  onOpenDetail,
  onOpenReport,
  onShowToast,
  activeChatUser,
  onSelectChatUser,
}) {
  // State for simulated chat messages keyed by match user ID
  const [conversations, setConversations] = useState({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const currentChatUser = activeChatUser || null;
  const currentMessages = currentChatUser ? (conversations[currentChatUser.id] || []) : [];

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentChatUser) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent', // sent, delivered, read
    };

    const userKey = currentChatUser.id;
    setConversations((prev) => ({
      ...prev,
      [userKey]: [...(prev[userKey] || []), newMsg],
    }));

    const textToSend = inputText.trim();
    setInputText('');

    // Simulate reply after 1.2s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = `¡Hola! Me alegro mucho de que hayamos conectado 😊`;
      if (currentChatUser.commonHobbies && currentChatUser.commonHobbies.length > 0) {
        replyText = `¡Totalmente! A mí también me encanta ${currentChatUser.commonHobbies[0].nombre}. ¿Sueles practicarlo seguido?`;
      } else if (textToSend.toLowerCase().includes('hola') || textToSend.toLowerCase().includes('cómo estás')) {
        replyText = `¡Hola! Todo genial por aquí, ¿y vos cómo andás?`;
      }

      const replyMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) => ({
        ...prev,
        [userKey]: [...(prev[userKey] || []), replyMsg],
      }));

      if (navigator.vibrate) navigator.vibrate(15);
    }, 1200);
  };

  const handleUseStarter = (starterText) => {
    setInputText(starterText);
  };

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
                  key={m.id}
                  type="button"
                  className={`new-match-avatar-pill ${currentChatUser?.id === m.id ? 'active' : ''}`}
                  onClick={() => onSelectChatUser(m)}
                  title={`Conversar con ${m.nombre}`}
                >
                  <div className="match-avatar-ring">
                    <UserAvatar user={m} size="sm" className="match-avatar-inner" />
                    <span className="live-mini-dot" />
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
                const userMsgs = conversations[m.id] || [];
                const lastMsg = userMsgs[userMsgs.length - 1];
                const isSelected = currentChatUser?.id === m.id;

                return (
                  <div
                    key={m.id}
                    className={`conversation-item-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectChatUser(m)}
                  >
                    <div className="conversation-avatar">
                      <UserAvatar user={m} size="md" className="conversation-avatar-inner" />
                      <span className="live-mini-dot" />
                    </div>

                    <div className="conversation-content">
                      <div className="conversation-header-line">
                        <span className="conversation-name">
                          {m.nombre} {m.apellido}
                        </span>
                        <span className="conversation-time">
                          {lastMsg ? lastMsg.time : 'Nuevo'}
                        </span>
                      </div>
                      <p className="conversation-last-msg">
                        {lastMsg
                          ? (lastMsg.sender === 'me' ? `Tú: ${lastMsg.text}` : lastMsg.text)
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
                  <span className="live-mini-dot" />
                </div>
                <div>
                  <div className="chat-user-name-title">
                    {currentChatUser.nombre} {currentChatUser.apellido}{' '}
                    <span className="chat-verified-check">✓</span>
                  </div>
                  <span className="chat-online-status">● En línea ahora</span>
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
            <div className="chat-messages-scroll-area">
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

              {/* Mensajes */}
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-bubble-row ${msg.sender === 'me' ? 'outgoing' : 'incoming'}`}
                >
                  <div className="chat-bubble">
                    <p className="chat-bubble-text">{msg.text}</p>
                    <div className="chat-bubble-meta">
                      <span className="chat-time">{msg.time}</span>
                      {msg.sender === 'me' && <span className="chat-status-check">✓✓</span>}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-row incoming">
                  <div className="chat-bubble typing-bubble">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Conversation Starters Chips */}
            {currentMessages.length === 0 && (
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
            <form className="chat-input-bar" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="form-control chat-input"
                placeholder={`Envía un mensaje a ${currentChatUser.nombre}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary chat-send-btn"
                disabled={!inputText.trim()}
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
