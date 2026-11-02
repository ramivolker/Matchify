import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';

const nombre = (u) => `${u.nombre} ${u.apellido}`;

export default function ReporteContexto({ reporte, motivo }) {
  const [contexto, setContexto] = useState(null);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const scroll = useRef(null);
  const volver = useRef(null);
  const cerrarBoton = useRef(null);
  const cerrar = () => { setAbierto(false); volver.current?.focus(); };
  useEffect(() => {
    const controller = new AbortController();
    setContexto(null); setError(''); setAbierto(false);
    api.getConversacionReporte(reporte.id, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setContexto(data); })
      .catch((err) => { if (!controller.signal.aborted) setError(err.message); });
    return () => controller.abort();
  }, [reporte.id, intento]);
  useEffect(() => {
    if (!abierto) return;
    cerrarBoton.current?.focus();
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
    const teclado = (event) => {
      if (event.key === 'Escape') { event.stopImmediatePropagation(); cerrar(); }
      // El único control interactivo del visor es Cerrar.
      if (event.key === 'Tab') { event.preventDefault(); cerrarBoton.current?.focus(); }
    };
    window.addEventListener('keydown', teclado, true);
    return () => window.removeEventListener('keydown', teclado, true);
  }, [abierto]);
  return <section className="reporte-contexto">
    <h4 className="reporte-rol"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></svg>Contexto de conversación</h4>
    <div className="reporte-contexto-card">
    {error ? <div role="alert"><p>{error}</p><button className="btn btn-secondary btn-sm" onClick={() => setIntento((i) => i + 1)}>Reintentar</button></div>
      : !contexto ? <p role="status">Cargando contexto...</p>
      : contexto.cantidadMensajes ? <><div className="reporte-contexto-info"><strong>{contexto.cantidadMensajes} {contexto.cantidadMensajes === 1 ? 'mensaje intercambiado' : 'mensajes intercambiados'}</strong><p>{nombre(contexto.reportante)} ↔ {nombre(contexto.reportado)}</p></div>
        <button ref={volver} className="btn btn-secondary btn-sm" onClick={() => setAbierto(true)}>Ver conversación</button></>
      : <p>{contexto.match ? 'Estos usuarios hicieron Match, pero no intercambiaron mensajes.' : 'No existe una conversación entre estos usuarios.'}</p>}
    </div>
    {abierto && contexto && <div className="modal reporte-conversacion-overlay" role="dialog" aria-modal="true" aria-labelledby="reporte-conversacion-title" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) cerrar(); }}>
      <div className="modal-dialog reporte-conversacion-dialog">
        <div className="modal-header"><div><h3 id="reporte-conversacion-title">Conversación relacionada al reporte</h3>
          <p>{nombre(contexto.reportante)} ↔ {nombre(contexto.reportado)}</p></div>
          <button ref={cerrarBoton} className="btn-close profile-detail-close" aria-label="Cerrar conversación" onClick={cerrar}>&times;</button></div>
        <div className="reporte-conversacion-resumen"><div className="reporte-conversacion-identificacion"><strong>Reporte #{reporte.id}</strong><span className="badge badge-secondary">Solo lectura</span></div><p>{nombre(contexto.reportante)} reportó a {nombre(contexto.reportado)}</p><p>Motivo: {motivo}</p></div>
        <div ref={scroll} className="reporte-conversacion-mensajes" tabIndex={0} aria-label="Historial de mensajes">
          {contexto.mensajes.map((m) => {
            const reportante = m.emisorId === contexto.reportante.id;
            return <div key={m.id} className={`chat-bubble-row ${reportante ? 'incoming' : 'outgoing'}`}><div className="chat-bubble">
              <strong>{nombre(reportante ? contexto.reportante : contexto.reportado)}</strong>
              <div className="chat-bubble-text">{m.contenido}</div>
              <time className="chat-bubble-meta" dateTime={m.enviadoEn}>{new Date(m.enviadoEn).toLocaleString('es-AR', { hourCycle: 'h23' })}</time>
            </div></div>;
          })}
          <p className="reporte-conversacion-fin">Fin de la conversación</p>
        </div>
      </div>
    </div>}
  </section>;
}
