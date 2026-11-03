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

async function loadUI() {
  const frontend = path.resolve(__dirname, '../../frontend');
  const bundle = await build({ stdin: { contents: `export { default as App } from './src/App';
    export { default as AuthView } from './src/components/AuthView';
    export { default as ReportesTab } from './src/components/AdminView/ReportesTab';
    export { default as Confirm } from './src/components/AdminView/CuentaEstadoConfirmModal';
    export { api } from './src/services/api';`, resolveDir: frontend }, bundle: true, platform: 'node', format: 'cjs', external: ['react'], loader: { '.png': 'dataurl', '.css': 'empty' }, write: false });
  const filename = path.join(frontend, 'usuario-estado-test.cjs');
  const compiled = new Module(filename, module); compiled.filename = filename; compiled.paths = Module._nodeModulePaths(frontend);
  compiled._compile(bundle.outputFiles[0].text, filename); return compiled.exports;
}
const text = (tree) => Array.isArray(tree) ? tree.map(text).join('') : tree?.props ? text(tree.props.children) : typeof tree === 'string' ? tree : '';

test('UI sancion: confirmar, cancelar, error y desactivar sin cerrar reporte', async (t) => {
  const { ReportesTab, Confirm, api } = await loadUI();
  global.window = { addEventListener() {}, removeEventListener() {} }; t.after(() => { delete global.window; });
  const user = { id: 2, nombre: 'B', apellido: 'Test', email: 'b@test.test', activo: true };
  const report = { id: 10, motivo: 'spam', estado: 'PENDIENTE', creadoEn: new Date().toISOString(), usuarioReportante: { ...user, id: 1 }, usuarioReportado: user };
  const calls = []; const toasts = []; let reportUpdates = 0;
  const props = { reportes: [report], onRefresh() {}, onOpenUser() {}, onUpdated() { reportUpdates++; }, onShowToast: (message) => toasts.push(message), onUserUpdated(updated) {
    props.reportes = props.reportes.map((r) => ({ ...r, usuarioReportado: { ...r.usuarioReportado, ...updated } }));
  } };
  api.getMotivosReporte = async () => ({ spam: 'Spam' }); api.getReporte = async () => props.reportes[0];
  api.actualizarEstadoUsuario = async (id, activo) => { calls.push({ id, activo }); return { ...user, activo }; };
  const admin = mount(ReportesTab, props); await admin.settle();
  const button = (label) => allNodes(admin.render(props)).find((n) => n.type === 'button' && n.props.children === label);
  const confirm = () => allNodes(admin.render(props)).find((n) => n.type === Confirm);
  await allNodes(admin.render(props)).find((n) => n.props.className === 'reporte-fila').props.onClick(); button('Desactivar usuario').props.onClick();
  assert.ok(confirm()); assert.equal(calls.length, 0);
  confirm().props.onClose(); assert.equal(calls.length, 0); assert.ok(button('Desactivar usuario'));
  button('Desactivar usuario').props.onClick();
  const realConfirm = Confirm(confirm().props);
  assert.match(text(realConfirm), /no ser.n eliminados/);
  assert.ok(allNodes(realConfirm).some((n) => n.type === 'button' && n.props.children === 'Cancelar'));
  api.actualizarEstadoUsuario = async () => { throw new Error('Fallo real'); };
  await confirm().props.onConfirm(); assert.equal(confirm().props.error, 'Fallo real');
  assert.equal(props.reportes[0].usuarioReportado.activo, true);
  api.actualizarEstadoUsuario = async (id, activo) => { calls.push({ id, activo }); return { ...user, activo }; };
  await confirm().props.onConfirm(); admin.render(props);
  assert.deepEqual(calls, [{ id: 2, activo: false }]); assert.ok(button('Reactivar usuario'));
  assert.equal(button('Desactivar usuario'), undefined);
  assert.ok(allNodes(admin.render(props)).some((n) => n.props.mostrarEstado && n.props.user.activo === false));
  assert.ok(button('Marcar como resuelto')); assert.equal(reportUpdates, 0);
  assert.ok(button('Descartar')); assert.equal(props.reportes[0].estado, 'PENDIENTE');
  assert.ok(toasts.includes('Usuario desactivado correctamente'));
  button('Reactivar usuario').props.onClick(); assert.equal(confirm().props.activo, true);
  await confirm().props.onConfirm(); admin.render(props);
  assert.equal(props.reportes[0].usuarioReportado.activo, true);
  assert.equal(props.reportes[0].estado, 'PENDIENTE'); assert.equal(reportUpdates, 0);
  assert.ok(button('Desactivar usuario')); assert.ok(toasts.includes('Usuario reactivado correctamente'));
  admin.unmount();
});

test('UI login: inactivos fuera del selector y rechazo por email', async (t) => {
  const { AuthView } = await loadUI();
  const users = [{ id: 1, nombre: 'Activo', apellido: 'Test', email: 'a@test.test', activo: true }, { id: 2, nombre: 'Inactivo', apellido: 'Test', email: 'b@test.test', activo: false }];
  const logins = []; const errors = []; let pending;
  const original = global.setTimeout; global.setTimeout = (fn) => { pending = fn; return 1; }; t.after(() => { global.setTimeout = original; });
  const auth = mount(AuthView, { usuarios: users, onLogin: (data) => logins.push(data), onShowToast: (message) => errors.push(message) });
  const nodes = () => allNodes(auth.render());
  assert.equal(nodes().filter((n) => n.props.className === 'user-quick-chip').length, 1);
  nodes().find((n) => n.props.id === 'login-email').props.onChange({ target: { value: 'b@test.test' } });
  nodes().find((n) => n.type === 'form').props.onSubmit({ preventDefault() {} }); pending();
  assert.equal(logins.length, 0); assert.match(errors[0], /desactivada/);
  nodes().find((n) => n.props.className === 'user-quick-chip').props.onClick(); assert.equal(logins[0].user.id, 1); auth.unmount();
});

test('UI sesion restaurada: verifica MySQL antes de operar y expulsa cuenta desactivada', async (t) => {
  const { App, AuthView, api } = await loadUI();
  const user = { id: 2, nombre: 'B', apellido: 'Test', email: 'b@test.test', activo: true };
  const storage = new Map([['matchify_session', JSON.stringify({ role: 'user', user })]]);
  const originals = { localStorage: global.localStorage, window: global.window, document: global.document, setTimeout: global.setTimeout, clearTimeout: global.clearTimeout, setInterval: global.setInterval, clearInterval: global.clearInterval };
  const timers = [];
  global.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) };
  global.window = { addEventListener() {}, removeEventListener() {} };
  global.document = { documentElement: { setAttribute() {}, removeAttribute() {} } };
  global.setTimeout = (fn, delay) => { timers.push({ fn, delay }); return timers.length; }; global.clearTimeout = () => {};
  global.setInterval = () => 1; global.clearInterval = () => {};
  t.after(() => Object.assign(global, originals));
  api.getHealth = async () => ({}); api.getUsuarios = async () => [user]; api.getHobbies = async () => []; api.getUbicaciones = async () => [];
  let candidateCalls = 0;
  api.getCandidatos = async () => { candidateCalls++; return []; }; api.getMatches = async () => [];
  const first = deferred(); api.getUsuario = () => first.promise;
  const app = mount(App, {}); assert.equal(candidateCalls, 0); assert.match(text(app.value), /Verificando/);
  first.resolve(user); await app.settle(); await app.settle(); assert.equal(candidateCalls, 1);
  api.getUsuario = async () => ({ ...user, activo: false });
  await timers.find((timer) => timer.delay === 5000).fn(); app.render();
  assert.equal(storage.has('matchify_session'), false);
  const login = allNodes(app.value).find((n) => n.type === AuthView);
  assert.ok(login);
  await login.props.onLogin({ role: 'user', user }); app.render();
  assert.equal(storage.has('matchify_session'), false);
  assert.equal(candidateCalls, 1);
  app.unmount();
});
