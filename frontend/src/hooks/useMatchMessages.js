import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const empty = (key) => ({ key, messages: [], loading: true, sending: false, input: '', error: '', unavailable: false });
const sameMessages = (a, b) => a.length === b.length && a.every((m, i) =>
  m.id === b[i].id && m.leido === b[i].leido);

export default function useMatchMessages(matchId, usuarioId) {
  const key = `${usuarioId}:${matchId}`;
  const [state, setState] = useState(() => empty(key));
  const sessionRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollPending = useRef(false);

  useEffect(() => {
    const session = { key, disposed: false, revision: 0, sending: false, first: true };
    sessionRef.current = session;
    setState(empty(key));
    if (!matchId || !usuarioId) return;
    const controller = new AbortController();
    let timer;
    const poll = async () => {
      const revision = session.revision;
      try {
        const messages = await api.getMensajes(matchId, usuarioId, { signal: controller.signal });
        if (session.disposed || revision !== session.revision || session.sending) return;
        const area = scrollRef.current;
        scrollPending.current = session.first || !area || area.scrollHeight - area.scrollTop - area.clientHeight < 100;
        session.first = false;
        setState((previous) => ({ ...previous, loading: false, error: '', unavailable: false,
          messages: sameMessages(previous.messages, messages) ? previous.messages : messages }));
        if (document.visibilityState === 'visible' && messages.some((m) => m.emisorId !== usuarioId && !m.leido)) {
          await api.marcarMensajesLeidos(matchId, usuarioId, messages.reduce((max, m) => Math.max(max, m.id), 0), { signal: controller.signal });
        }
      } catch (error) {
        if (!session.disposed && revision === session.revision && error.name !== 'AbortError') {
          setState((previous) => ({ ...previous, loading: false, error: error.message,
            unavailable: [400, 403, 404].includes(error.status) }));
        }
      } finally {
        // Un único temporizador, programado al finalizar: nunca solapar consultas.
        if (!session.disposed) timer = setTimeout(poll, 2500);
      }
    };
    poll();
    return () => { session.disposed = true; clearTimeout(timer); controller.abort(); };
  }, [matchId, usuarioId, key]);

  useEffect(() => {
    if (state.key === key && scrollPending.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      scrollPending.current = false;
    }
  }, [state.messages, state.loading, key, state.key]);

  const send = async (event) => {
    event?.preventDefault();
    const session = sessionRef.current;
    const contenido = state.input.trim();
    if (!session || state.key !== key || session.key !== key || session.disposed || session.sending || !contenido || state.loading || state.unavailable) return;
    session.sending = true;
    session.revision++;
    setState((previous) => ({ ...previous, sending: true, error: '' }));
    try {
      const message = await api.enviarMensaje(matchId, usuarioId, contenido);
      if (session.disposed) return;
      session.revision++;
      scrollPending.current = true;
      setState((previous) => ({ ...previous, input: '', messages:
        [...previous.messages.filter((m) => m.id !== message.id), message]
          .sort((a, b) => new Date(a.enviadoEn) - new Date(b.enviadoEn) || a.id - b.id) }));
    } catch (error) {
      if (!session.disposed) setState((previous) => ({ ...previous, error: error.message,
        unavailable: [403, 404].includes(error.status) }));
    } finally {
      session.sending = false;
      if (!session.disposed) setState((previous) => ({ ...previous, sending: false }));
    }
  };

  return { ...(state.key === key ? state : empty(key)), scrollRef, send,
    setInput: (input) => setState((previous) => ({ ...previous, input })) };
}
