import React, { useEffect, useRef, useState } from 'react';
import CuentaEstadoConfirmModal from './CuentaEstadoConfirmModal';
import { api } from '../../services/api';
import UserAvatar from '../common/UserAvatar';
import UserDetailModal from './UserDetailModal';
import ReporteContexto from './ReporteContexto';

const estados = { PENDIENTE: 'Pendiente', RESUELTO: 'Resuelto', DESCARTADO: 'Descartado' };
const SIN_USUARIOS = [];
const nombre = (user) => `${user.nombre} ${user.apellido}`;
const fecha = (value) => value ? new Date(value).toLocaleString('es-AR', { hourCycle: 'h23' }) : '?';
const Badge = ({ estado }) => <span className={`badge reporte-${estado.toLowerCase()}`}>{estados[estado]}</span>;
const UsuarioIdentidad = ({ user }) => <div className="reporte-usuario-info"><strong>{nombre(user)}</strong><span title={user.email}>{user.email}</span></div>;
const UsuarioCelda = ({ user }) => <div className="reporte-usuario-celda">
  <UserAvatar user={user} size="xs" className="reporte-tabla-avatar" alt={`Foto de ${nombre(user)}`} />
  <UsuarioIdentidad user={user} />
</div>;
const IconoRol = ({ reportado = false }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
  {reportado ? <><path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></> : <><path d="M4 22V3m0 1c5-4 11 4 16 0v11c-5 4-11-4-16 0" /></>}
</svg>;
const UsuarioCard = ({ user, mostrarEstado = false, onClick, disabled, children }) => <div className="reporte-usuario-card">
  <button type="button" className="reporte-perfil-trigger" onClick={onClick} disabled={disabled} aria-label={`Ver perfil de ${nombre(user)}`} />
  <UserAvatar user={user} size="lg" alt={`Foto de ${nombre(user)}`} />
  <UsuarioIdentidad user={user} />
  {mostrarEstado && <div className="reporte-cuenta-controles"><span aria-label={`Estado de la cuenta: ${user.activo ? 'activo' : 'inactivo'}`} className={`badge reporte-cuenta-badge ${user.activo ? 'badge-success' : 'badge-secondary'}`}>{user.activo ? 'ACTIVO' : 'INACTIVO'}</span>{children}</div>}
</div>;

export default function ReportesTab({ reportes, usuarios = SIN_USUARIOS, loading, error, onRefresh, onUpdated, onShowToast, onUserUpdated }) {
  const [perfil, setPerfil] = useState(null);
  const reportesOriginales = reportes;
  const usuarioActual = (user) => ({ ...user, ...usuarios.find((u) => u.id === user.id) });
  reportes = reportes.map((r) => ({ ...r, usuarioReportante: usuarioActual(r.usuarioReportante), usuarioReportado: usuarioActual(r.usuarioReportado) }));
  const [confirmacion, setConfirmacion] = useState(null);
  const confirmacionRef = useRef(null);
  confirmacionRef.current = confirmacion;
  const [filtro, setFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [motivos, setMotivos] = useState({});
  const [detalle, setDetalle] = useState(null);
  const [pending, setPending] = useState(false);
  const [detalleError, setDetalleError] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    let cancelled = false;
    api.getMotivosReporte().then((data) => { if (!cancelled) setMotivos(data); }).catch((err) => { if (!cancelled) onShowToast(err.message, 'error'); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape' && !lock.current) {
      if (perfil) setPerfil(null); else if (confirmacionRef.current) setConfirmacion(null); else setDetalle(null);
    } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [perfil]);
  const ver = async (id) => {
    if (lock.current) return;
    lock.current = true; setPending(true);
    try { setDetalle(await api.getReporte(id)); setDetalleError(''); }
    catch (err) { onShowToast(err.message, 'error'); }
    finally { lock.current = false; setPending(false); }
  };
  const cerrar = async (estado) => {
    if (lock.current) return;
    lock.current = true; setPending(true); setDetalleError('');
    try {
      const updated = await api.actualizarEstadoReporte(detalle.id, estado);
      setDetalle(updated); onUpdated(updated); setConfirmacion(null);
      onShowToast(estado === 'PENDIENTE' ? 'Reporte reabierto correctamente' : 'Reporte ' + estados[estado].toLowerCase(), 'success');
    } catch (err) { setDetalleError(err.message); onShowToast(err.message, 'error'); }
    finally { lock.current = false; setPending(false); }
  };
  const cambiarCuenta = async () => {
    if (lock.current || !confirmacion) return;
    lock.current = true; setPending(true); setDetalleError('');
    try {
      const user = await api.actualizarEstadoUsuario(detalle.usuarioReportado.id, confirmacion.activo);
      setDetalle((r) => ({ ...r, usuarioReportado: { ...r.usuarioReportado, ...user } }));
      onUserUpdated(user);
      setConfirmacion(null);
      onShowToast(user.activo ? 'Usuario reactivado correctamente' : 'Usuario desactivado correctamente', 'success');
    } catch (err) { setDetalleError(err.message); onShowToast(err.message, 'error'); }
    finally { lock.current = false; setPending(false); }
  };
  useEffect(() => {
    setDetalle((current) => {
      if (!current) return current;
      const fresh = reportes.find((r) => r.id === current.id);
      return fresh ? { ...current, usuarioReportado: fresh.usuarioReportado } : current;
    });
  }, [reportesOriginales, usuarios]);
  const query = busqueda.trim().toLocaleLowerCase();
  const rows = reportes.filter((r) => (!filtro || r.estado === filtro) &&
    [r.usuarioReportante, r.usuarioReportado].some((u) => `${nombre(u)} ${u.email}`.toLocaleLowerCase().includes(query)));
  return <>
    <section className="stats-grid reporte-stats" aria-label="Filtrar reportes por estado">
      {[['', 'Reportes totales'], ...Object.entries(estados)].map(([estado, label]) =>
        <button type="button" className={`stat-card${estado ? ` reporte-${estado.toLowerCase()}` : ''}`} key={estado} aria-pressed={filtro === estado} onClick={() => setFiltro(estado)}><div className="stat-details">
          <span className="stat-label">{label}</span><div className="stat-value">{error ? '?' : reportes.filter((r) => !estado || r.estado === estado).length}</div>
        </div></button>)}
    </section>
    <div className="card table-card">
      <div className="table-header"><h3>Reportes</h3><div className="table-tools">
        <input className="form-control" aria-label="Buscar reportes por nombre o email" placeholder="Buscar nombre o email" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>Refrescar</button>
      </div></div>
      {error ? <div className="empty-state" role="alert"><p>{error}</p><button className="btn btn-secondary" onClick={onRefresh}>Reintentar</button></div>
        : loading ? <div className="empty-state" role="status">Cargando reportes...</div>
        : !rows.length ? <div className="empty-state"><h4>{reportes.length ? 'No hay reportes que coincidan' : 'No hay reportes'}</h4><p>{reportes.length ? 'Probá con otros filtros.' : 'Los reportes enviados por los usuarios aparecerán acá.'}</p></div>
        : <div className="table-responsive"><table className="data-table reporte-tabla"><thead><tr>
          {['Reportante', 'Usuario reportado', 'Motivo', 'Fecha', 'Estado'].map((label) => <th key={label} scope="col">{label}</th>)}
        </tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="reporte-fila" tabIndex={pending ? -1 : 0}
          aria-label={`Abrir reporte #${r.id}: ${nombre(r.usuarioReportante)} reportó a ${nombre(r.usuarioReportado)}`}
          aria-haspopup="dialog" aria-disabled={pending}
          onClick={() => { if (!pending) return ver(r.id); }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              if (!pending && !event.repeat) return ver(r.id);
            }
          }}>
          <td><UsuarioCelda user={r.usuarioReportante} /></td>
          <td><UsuarioCelda user={r.usuarioReportado} /></td>
          <td>{motivos[r.motivo] || r.motivo}</td><td>{new Date(r.creadoEn).toLocaleDateString('es-AR')}</td>
          <td><Badge estado={r.estado} /></td>
        </tr>)}</tbody></table></div>}
    </div>
    {detalle && !confirmacion && !perfil && <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reporte-detail-title" onClick={(event) => { if (event.target === event.currentTarget && !pending) setDetalle(null); }}><div className="modal-dialog reporte-detail-dialog">
      <div className="modal-header reporte-modal-header"><div><div className="reporte-titulo-estado"><h3 id="reporte-detail-title">Reporte #{detalle.id}</h3><Badge estado={detalle.estado} /></div><p className="reporte-resumen"><strong>{nombre(detalle.usuarioReportante)}</strong> reportó a <strong>{nombre(detalle.usuarioReportado)}</strong></p></div><button type="button" className="btn-close profile-detail-close" disabled={pending} onClick={() => setDetalle(null)} aria-label="Cerrar">&times;</button></div>
      <div className="modal-body reporte-detalle">
        <section><h4 className="reporte-rol"><IconoRol />Reportante</h4><UsuarioCard user={usuarioActual(detalle.usuarioReportante)} disabled={pending} onClick={() => setPerfil(usuarioActual(detalle.usuarioReportante))} /></section>
        <section><h4 className="reporte-rol"><IconoRol reportado />Usuario reportado</h4><UsuarioCard user={usuarioActual(detalle.usuarioReportado)} mostrarEstado disabled={pending} onClick={() => setPerfil(usuarioActual(detalle.usuarioReportado))}>
        <button type="button" className={`btn btn-sm reporte-cuenta-accion ${usuarioActual(detalle.usuarioReportado).activo ? 'reporte-cuenta-desactivar' : 'reporte-cuenta-reactivar'}`} disabled={pending}
          onClick={(event) => { event?.stopPropagation(); setDetalleError(''); setConfirmacion({ activo: !usuarioActual(detalle.usuarioReportado).activo }); }}>{usuarioActual(detalle.usuarioReportado).activo ? 'Desactivar usuario' : 'Reactivar usuario'}</button>
          </UsuarioCard>
        </section>
        <div><strong>Motivo</strong><p>{motivos[detalle.motivo] || detalle.motivo}</p></div>
        <div><strong>Descripción</strong><p className="reporte-descripcion">{detalle.descripcion || 'Sin descripción adicional.'}</p></div>
        <div><strong>Fecha</strong><p>{fecha(detalle.creadoEn)}</p></div>
        <ReporteContexto key={detalle.id} reporte={detalle} motivo={motivos[detalle.motivo] || detalle.motivo} />
        {detalle.estado !== 'PENDIENTE' && detalle.resueltoEn && <div><strong>Fecha de cierre</strong><p>{fecha(detalle.resueltoEn)}</p></div>}
        {detalleError && <p role="alert" style={{ color: 'var(--danger)' }}>{detalleError}</p>}
      </div>
      <div className="modal-footer reporte-gestion" role="group" aria-label="Acciones del reporte">
        <div className="reporte-gestion-acciones">
          {detalle.estado === 'PENDIENTE' ? <>
            <button className="btn reporte-accion-descartar reporte-descartado" disabled={pending} onClick={() => cerrar('DESCARTADO')}>Descartar</button>
            <button className="btn reporte-accion-positiva reporte-resuelto" disabled={pending} onClick={() => cerrar('RESUELTO')}>Marcar como resuelto</button>
          </> : <button className="btn btn-secondary" disabled={pending} onClick={() => { setDetalleError(''); setConfirmacion({ reabrir: true }); }}>Reabrir reporte</button>}
        </div>
      </div>
    </div></div>}
    {confirmacion?.reabrir && detalle && <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reabrir-reporte-title" onClick={(event) => { if (event.target === event.currentTarget && !pending) setConfirmacion(null); }}>
      <div className="modal-dialog modal-dialog-sm">
        <div className="modal-header"><h3 id="reabrir-reporte-title">¿Reabrir este reporte?</h3></div>
        <div className="modal-body"><p>El reporte volverá al estado Pendiente y requerirá una nueva revisión.</p>{detalleError && <p role="alert" style={{ color: 'var(--danger)' }}>{detalleError}</p>}</div>
        <div className="modal-footer"><button className="btn btn-secondary" disabled={pending} onClick={() => setConfirmacion(null)}>Cancelar</button><button className="btn btn-secondary" disabled={pending} onClick={() => cerrar('PENDIENTE')}>{pending ? 'Guardando...' : 'Reabrir reporte'}</button></div>
      </div>
    </div>}
    {confirmacion && !confirmacion.reabrir && detalle && <CuentaEstadoConfirmModal usuario={detalle.usuarioReportado} activo={confirmacion.activo}
      pending={pending} error={detalleError} onClose={() => { if (!lock.current) { setConfirmacion(null); setDetalleError(''); } }} onConfirm={cambiarCuenta} />}
    <UserDetailModal isOpen={Boolean(perfil)} usuario={perfil && usuarioActual(perfil)} onClose={() => setPerfil(null)} />
  </>;
}
