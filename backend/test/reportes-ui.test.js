const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const React = require('../../frontend/node_modules/react');
const { build } = require('../../frontend/node_modules/esbuild');

// Harness de hooks: ejecuta efectos, cleanup y handlers reales sin simular una red/DOM.
function mount(renderComponent, initialProps) {
  const slots = [];
  let props = initialProps;
  let cursor;
  let effects;
  let value;
  const dispatcher = {
    useState(initial) {
      const i = cursor++;
      slots[i] ??= { value: typeof initial === 'function' ? initial() : initial };
      return [slots[i].value, (next) => { slots[i].value = typeof next === 'function' ? next(slots[i].value) : next; }];
    },
    useRef(initial) { const i = cursor++; slots[i] ??= { current: initial }; return slots[i]; },
    useEffect(callback, deps) {
      const i = cursor++;
      if (!slots[i] || deps.some((v, index) => !Object.is(v, slots[i].deps[index]))) {
        const previous = slots[i];
        slots[i] = { deps };
        effects.push(() => { previous?.cleanup?.(); slots[i].cleanup = callback(); });
      }
    },
  };
  const render = (nextProps = props) => {
    props = nextProps; cursor = 0; effects = [];
    const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    const previous = internals.ReactCurrentDispatcher.current;
    internals.ReactCurrentDispatcher.current = dispatcher;
    try { value = renderComponent(props); } finally { internals.ReactCurrentDispatcher.current = previous; }
    effects.forEach((run) => run());
    return value;
  };
  render();
  return { render, get value() { return value; },
    async settle() { await new Promise(setImmediate); return render(); },
    unmount() { slots.forEach((slot) => slot?.cleanup?.()); },
  };
}
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const allNodes = (tree) => {
  if (Array.isArray(tree)) return tree.flatMap(allNodes);
  if (!tree?.props) return [];
  return [tree, ...allNodes(tree.props.children)];
};

test('UI reportes: espera persistencia, conserva errores, detalle y cierre independiente', async (t) => {
  const frontend = path.resolve(__dirname, '../../frontend');
  const bundle = await build({ stdin: { contents: `export { default as ReportModal } from './src/components/ReportModal';
    export { default as ReportesTab } from './src/components/AdminView/ReportesTab';
    export { default as ReporteContexto } from './src/components/AdminView/ReporteContexto';
    export { api } from './src/services/api';`, resolveDir: frontend }, bundle: true, platform: 'node', format: 'cjs', external: ['react'], write: false });
  const filename = path.join(frontend, 'reportes-test.cjs');
  const compiled = new Module(filename, module); compiled.filename = filename; compiled.paths = Module._nodeModulePaths(frontend);
  compiled._compile(bundle.outputFiles[0].text, filename);
  const { ReportModal, ReportesTab, ReporteContexto, api } = compiled.exports;
  const originalWindow = global.window;
  global.window = { addEventListener() {}, removeEventListener() {} };
  for (const match of [null, { id: 5, activo: false }]) {
    api.getConversacionReporte = async () => ({ match, cantidadMensajes: 0, mensajes: [] });
    const contexto = mount(ReporteContexto, { reporte: { id: 10 }, motivo: 'Spam' });
    await contexto.settle();
    assert.ok(allNodes(contexto.render()).some((n) => n.type === 'p' && n.props.children === (match
      ? 'Estos usuarios hicieron Match, pero no intercambiaron mensajes.' : 'No existe una conversación entre estos usuarios.')));
    contexto.unmount();
  }
  api.getConversacionReporte = async (id) => {
    assert.equal(id, 10);
    return { match: { id: 5 }, cantidadMensajes: 1, reportante: { id: 1, nombre: 'A', apellido: 'Test' },
      reportado: { id: 2, nombre: 'B', apellido: 'Test' }, mensajes: [{ id: 1, emisorId: 1, contenido: 'Evidencia', enviadoEn: '2026-01-01' }] };
  };
  const evidencia = mount(ReporteContexto, { reporte: { id: 10 }, motivo: 'Spam' });
  await evidencia.settle();
  allNodes(evidencia.render()).find((n) => n.props.children === 'Ver conversación').props.onClick();
  const visor = allNodes(evidencia.render());
  assert.ok(visor.some((n) => n.props.role === 'dialog'));
  assert.ok(visor.some((n) => n.props.children === 'Solo lectura'));
  assert.ok(visor.some((n) => n.props.children === 'Evidencia'));
  assert.ok(!visor.some((n) => ['input', 'textarea', 'form'].includes(n.type)));
  visor.find((n) => n.props['aria-label'] === 'Cerrar conversación').props.onClick();
  assert.ok(!allNodes(evidencia.render()).some((n) => n.props.role === 'dialog'));
  evidencia.unmount(); global.window = originalWindow;
  api.getMotivosReporte = async () => ({ spam: 'Spam', inappropriate: 'Contenido inapropiado' });
  let closed = 0; const sent = []; const waiting = deferred();
  const modal = mount(ReportModal, { isOpen: true, userToReport: { id: 2, nombre: 'B', apellido: 'Test' }, onClose: () => closed++, onSubmitReport: (data) => { sent.push(data); return waiting.promise; } });
  await modal.settle();
  const nodes = () => allNodes(modal.render());
  nodes().find((n) => n.props.id === 'report-details').props.onChange({ target: { value: 'Detalles' } });
  nodes().find((n) => n.props.id === 'report-reason').props.onChange({ target: { value: 'spam' } });
  const form = nodes().find((n) => n.type === 'form');
  const submit = form.props.onSubmit({ preventDefault() {} });
  await form.props.onSubmit({ preventDefault() {} });
  assert.equal(sent.length, 1); assert.equal(closed, 0);
  assert.equal(nodes().find((n) => n.props.type === 'submit').props.disabled, true);
  waiting.reject(new Error('Error real del servidor')); await submit;
  assert.equal(closed, 0); assert.equal(nodes().find((n) => n.props.role === 'alert').props.children, 'Error real del servidor');
  assert.equal(nodes().find((n) => n.props.id === 'report-details').props.value, 'Detalles');
  const props = { isOpen: true, userToReport: { id: 2 }, onClose: () => closed++, onSubmitReport: async (data) => { sent.push(data); } };
  modal.render(props); await nodes().find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(closed, 1); assert.equal(sent[1].reason, 'spam'); assert.equal(sent[1].details, 'Detalles'); modal.unmount();
  global.window = { addEventListener() {}, removeEventListener() {} }; t.after(() => { delete global.window; });
  const user = { id: 1, nombre: 'A', apellido: 'Test', email: 'a@test.test', activo: true };
  const report = { id: 10, usuarioReportante: user, usuarioReportado: { ...user, id: 2 }, motivo: 'spam', estado: 'PENDIENTE', creadoEn: new Date().toISOString() };
  api.getReporte = async () => report;
  let updated;
  let stateCalls = 0;
  api.actualizarEstadoReporte = async (id, estado) => { stateCalls++; assert.equal(id, 10); return { ...report, estado, resueltoEn: estado === 'PENDIENTE' ? null : new Date().toISOString() }; };
  const usuarios = [user, { ...report.usuarioReportado, fotos: [{ url: 'foto-real', orden: 0 }] }];
  const propsAdmin = { reportes: [report], usuarios, loading: false, error: '', onRefresh() {}, onUpdated: (r) => { updated = r; propsAdmin.reportes = [r]; }, onShowToast() {} };
  const admin = mount(ReportesTab, propsAdmin);
  await admin.settle();
  const button = (label) => allNodes(admin.render()).find((n) => n.type === 'button' && n.props.children === label);
  const fila = () => allNodes(admin.render()).find((n) => n.props.className === 'reporte-fila');
  assert.equal(button('Ver'), undefined);
  assert.equal(fila().props.tabIndex, 0);
  let prevented = false;
  await fila().props.onKeyDown({ key: ' ', preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.ok(allNodes(admin.render()).some((n) => n.props.role === 'dialog'));
  await button('Marcar como resuelto').props.onClick(); assert.equal(updated.estado, 'RESUELTO'); assert.equal(updated.usuarioReportado.activo, true);
  assert.equal(button('Marcar como resuelto'), undefined);
  assert.equal(button('Ver usuario reportado'), undefined);
  assert.ok(button('Desactivar usuario'));
  for (const id of [1, 2]) {
    const card = allNodes(admin.render()).find((n) => n.props.user?.id === id && n.props.onClick);
    card.props.onClick();
    const perfil = allNodes(admin.render()).find((n) => n.props.isOpen && n.props.usuario);
    assert.equal(perfil.props.usuario.id, id);
    if (id === 2) assert.deepEqual(perfil.props.usuario.fotos, usuarios[1].fotos);
    perfil.props.onClose();
    assert.ok(allNodes(admin.render()).some((n) => n.props['aria-labelledby'] === 'reporte-detail-title'));
  }
  const stats = () => allNodes(admin.render()).filter((n) => n.type === 'button' && n.props.className?.startsWith('stat-card'));
  stats()[2].props.onClick();
  button('Reabrir reporte').props.onClick();
  assert.equal(stateCalls, 1);
  button('Cancelar').props.onClick(); assert.equal(stateCalls, 1);
  button('Reabrir reporte').props.onClick();
  api.actualizarEstadoReporte = async () => { throw new Error('No se pudo reabrir'); };
  await button('Reabrir reporte').props.onClick();
  assert.ok(allNodes(admin.render()).some((n) => n.props.role === 'alert' && n.props.children === 'No se pudo reabrir'));
  api.actualizarEstadoReporte = async () => ({ ...report, estado: 'PENDIENTE', resueltoEn: null });
  await button('Reabrir reporte').props.onClick();
  assert.equal(updated.estado, 'PENDIENTE'); assert.equal(updated.resueltoEn, null);
  assert.ok(button('Marcar como resuelto')); assert.equal(button('Reabrir reporte'), undefined);
  assert.ok(!allNodes(admin.render()).some((n) => n.props.children === 'Fecha de cierre'));
  assert.equal(allNodes(stats()[1]).find((n) => n.props.className === 'stat-value').props.children, 1);
  assert.equal(allNodes(stats()[2]).find((n) => n.props.className === 'stat-value').props.children, 0);
  assert.equal(fila(), undefined);
  stats()[1].props.onClick(); assert.ok(fila());
  admin.unmount();
});

test('Avatar: foto real por orden, misma principal en galería y sin asignación por ID', async () => {
  const { getUserAvatar, getUserPhotos } = await import('../../frontend/src/utils/userAvatarUtils.js');
  const fotos = [{ url: 'segunda', orden: 2 }, { url: 'principal', orden: 0 }];
  const user = { id: 6, genero: 'MASCULINO', fotos };
  assert.equal(getUserAvatar(user), 'principal');
  assert.deepEqual(getUserPhotos(user), ['principal', 'segunda']);
  assert.equal(fotos[0].url, 'segunda');
  assert.equal(getUserAvatar({ id: 6 }), null);
  assert.deepEqual(getUserPhotos({ id: 6 }), []);
  assert.equal(getUserAvatar({ id: 6, fotos: [] }), null);
});
