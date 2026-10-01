const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
const { build } = require('../../frontend/node_modules/esbuild');
const React = require('../../frontend/node_modules/react');

// Ejecuta los componentes reales con hooks controlados, sin DOM ni dependencias nuevas.
// Verifica transiciones y handlers; no reemplaza una revisión visual en navegador.
function mount(Component, props) {
  const slots = [];
  let cursor;
  let effects;
  let tree;
  const dispatcher = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], (value) => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      if (!slots[index] || deps.some((value, i) => value !== slots[index][i])) {
        slots[index] = deps;
        effects.push(callback);
      }
    },
    useMemo(callback) { return callback(); },
  };
  const render = () => {
    cursor = 0;
    effects = [];
    const internals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    const previous = internals.ReactCurrentDispatcher.current;
    internals.ReactCurrentDispatcher.current = dispatcher;
    try { tree = Component(props); } finally { internals.ReactCurrentDispatcher.current = previous; }
    effects.forEach((effect) => effect());
  };
  const all = () => {
    const nodes = [];
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== 'object') return;
      nodes.push(node);
      visit(node.props?.children);
    };
    visit(tree);
    return nodes;
  };
  render();
  return {
    render,
    async settle() { await new Promise(setImmediate); render(); },
    find(predicate) { const node = all().find(predicate); assert.ok(node, 'Control encontrado'); return node; },
    has(predicate) { return all().some(predicate); },
  };
}
const text = (node) => Array.isArray(node) ? node.map(text).join('') :
  node?.props ? text(node.props.children) : typeof node === 'string' ? node : '';
const button = (label) => (node) => node.type === 'button' && text(node).trim().replace(/^[✓+]\s*/, '') === label;

test('géneros en formularios: selección, Todos, cancelar, guardar y recargar', async () => {
  const frontend = path.resolve(__dirname, '../../frontend');
  const bundle = await build({
    stdin: { contents: `export { default as Preferences } from './src/components/TinderView/PreferenciasSection.jsx';
      export { default as Profile } from './src/components/TinderView/MiPerfilTab.jsx';
      export { api } from './src/services/api.js';`, resolveDir: frontend },
    bundle: true, platform: 'node', format: 'cjs', external: ['react'], write: false,
  });
  const filename = path.join(frontend, 'gender-ui-test.cjs');
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(frontend);
  compiled._compile(bundle.outputFiles[0].text, filename);
  const { Preferences, Profile, api } = compiled.exports;
  let stored;
  let savedCalls = 0;
  api.getPreferencia = async () => structuredClone(stored);
  api.guardarPreferencia = async (id, data, exists) => {
    assert.equal(exists, stored !== null);
    assert.ok(data.generos.length > 0);
    assert.ok(!data.generos.includes('TODOS'));
    stored = { id: 1, usuarioId: id, ...structuredClone(data) };
    return structuredClone(stored);
  };
  const props = { usuarioId: 1, onSaved: () => savedCalls++, onShowToast: () => {} };
  for (const initial of [null, { edadMinima: 20, edadMaxima: 30, distanciaMaxKm: 50, generos: [] },
    { edadMinima: 20, edadMaxima: 30, distanciaMaxKm: 50, generos: ['FEMENINO'] }]) {
    stored = structuredClone(initial);
    const ui = mount(Preferences, props);
    await ui.settle();
    const click = (label) => { ui.find(button(label)).props.onClick(); ui.render(); };
    click('No binario');
    assert.ok(ui.has((node) => text(node) === 'Cambios sin guardar'));
    assert.equal(ui.find(button('Guardar preferencias')).props.disabled, false);
    click('Cancelar');
    assert.equal(ui.find(button('No binario')).props['aria-pressed'], false);
    assert.equal(ui.find(button('Femenino')).props['aria-pressed'], !!initial?.generos.length);
    assert.equal(ui.find(button('Guardar preferencias')).props.disabled, true);
    click('Todos');
    assert.equal(ui.find(button('Todos')).props['aria-pressed'], true);
    click('Masculino');
    assert.equal(ui.find(button('Todos')).props['aria-pressed'], false);
    click('Todos');
    await ui.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
    ui.render();
    assert.equal(stored.generos.length, 4);
    assert.equal(ui.find(button('Guardar preferencias')).props.disabled, true);
    const reloaded = mount(Preferences, props);
    await reloaded.settle();
    assert.equal(reloaded.find(button('Todos')).props['aria-pressed'], true);
    for (const label of ['Masculino', 'Femenino', 'No binario', 'Otro']) click(label);
    assert.equal(ui.find(button('Guardar preferencias')).props.disabled, true);
    click('Cancelar');
    assert.equal(ui.find(button('Todos')).props['aria-pressed'], true);
    // Un conjunto idéntico en otro orden no cuenta como cambio.
    click('Masculino'); click('Masculino');
    assert.equal(ui.find(button('Guardar preferencias')).props.disabled, true);
  }
  assert.equal(savedCalls, 3);

  const user = { id: 1, nombre: 'Prueba', genero: 'FEMENINO' };
  api.actualizarUsuario = async (id, data) => { assert.equal(id, 1); Object.assign(user, data); };
  const profile = mount(Profile, { currentUser: user, hobbies: [], ubicaciones: [], onProfileUpdated: async () => {}, onShowToast: () => {} });
  profile.find((node) => node.type === 'button' && text(node).includes('Editar Perfil')).props.onClick();
  profile.render(); profile.render();
  const select = () => profile.find((node) => node.props.id === 'perfil-genero');
  assert.equal(select().props.value, 'FEMENINO');
  select().props.onChange({ target: { value: 'NO_BINARIO' } }); profile.render();
  await profile.find((node) => node.type === 'form').props.onSubmit({ preventDefault() {} });
  profile.render();
  assert.equal(user.genero, 'NO_BINARIO');
  profile.find((node) => node.type === 'button' && text(node).includes('Editar Perfil')).props.onClick();
  profile.render(); profile.render();
  assert.equal(select().props.value, 'NO_BINARIO');
  select().props.onChange({ target: { value: 'OTRO' } }); profile.render();
  profile.find(button('Descartar')).props.onClick(); profile.render();
  profile.find((node) => node.type === 'button' && text(node).includes('Editar Perfil')).props.onClick();
  profile.render(); profile.render();
  assert.equal(select().props.value, 'NO_BINARIO');
});
