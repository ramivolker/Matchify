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

test('chat real: polling, cambios de usuario, carreras, envío y perspectiva', async (t) => {
  const frontend = path.resolve(__dirname, '../../frontend');
  const bundle = await build({
    stdin: { contents: `export { default as useMessages } from './src/hooks/useMatchMessages';
      export { default as Matches } from './src/components/TinderView/TinderMatches';
      export { api } from './src/services/api';`, resolveDir: frontend },
    bundle: true, platform: 'node', format: 'cjs', external: ['react'], write: false,
  });
  const filename = path.join(frontend, 'messages-test.cjs');
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = Module._nodeModulePaths(frontend);
  compiled._compile(bundle.outputFiles[0].text, filename);
  const { useMessages, Matches, api } = compiled.exports;
  const timers = new Map();
  let timerId = 0;
  const originalTimeout = global.setTimeout;
  const originalClear = global.clearTimeout;
  const originalDocument = global.document;
  global.setTimeout = (fn, delay) => { assert.equal(delay, 2500); timers.set(++timerId, fn); return timerId; };
  global.clearTimeout = (id) => timers.delete(id);
  global.document = { visibilityState: 'visible' };
  t.after(() => { global.setTimeout = originalTimeout; global.clearTimeout = originalClear; global.document = originalDocument; });
  const tick = () => {
    assert.equal(timers.size, 1);
    const [id, fn] = timers.entries().next().value;
    timers.delete(id); fn();
  };
  const gets = [];
  const posts = [];
  const reads = [];
  api.getMensajes = (matchId, usuarioId, options) => {
    const pending = deferred(); gets.push({ matchId, usuarioId, ...options, ...pending }); return pending.promise;
  };
  api.enviarMensaje = (matchId, emisorId, contenido) => {
    const pending = deferred(); posts.push({ matchId, emisorId, contenido, ...pending }); return pending.promise;
  };
  api.marcarMensajesLeidos = async (...args) => { reads.push(args); };
  const messages = [
    { id: 1, matchId: 10, emisorId: 1, contenido: 'Hola B', enviadoEn: '2026-10-01T10:00:00Z', leido: false },
    { id: 2, matchId: 10, emisorId: 2, contenido: 'Hola A', enviadoEn: '2026-10-01T10:01:00Z', leido: false },
  ];
  const hook = mount(({ matchId, userId }) => useMessages(matchId, userId), { matchId: 10, userId: 1 });
  const area = { scrollTop: 0, scrollHeight: 1000, clientHeight: 200 };
  hook.value.scrollRef.current = area;
  gets[0].resolve(structuredClone(messages));
  await hook.settle();
  assert.equal(area.scrollTop, 1000);
  assert.equal(reads.length, 1);
  assert.deepEqual(reads[0].slice(0, 3), [10, 1, 2]);
  assert.equal(timers.size, 1);
  hook.render(); hook.render();
  assert.equal(gets.length, 1);

  tick(); // GET anterior al POST; su respuesta no debe borrar el mensaje recién enviado.
  hook.value.setInput('  Nuevo  '); hook.render();
  const sending = hook.value.send();
  hook.value.send();
  assert.equal(posts.length, 1);
  hook.render();
  assert.equal(hook.value.sending, true);
  const third = { ...messages[0], id: 3, contenido: 'Nuevo', enviadoEn: '2026-10-01T10:02:00Z' };
  posts[0].resolve(third); await sending; hook.render();
  assert.equal(hook.value.input, '');
  gets[1].resolve(structuredClone(messages)); await hook.settle();
  assert.deepEqual(hook.value.messages.map((m) => m.id), [1, 2, 3]);

  area.scrollTop = 20;
  tick();
  const fourth = { ...messages[1], id: 4, enviadoEn: '2026-10-01T10:03:00Z' };
  gets[2].resolve([...messages, third, fourth]); await hook.settle();
  assert.equal(area.scrollTop, 20, 'Leer mensajes antiguos no fuerza autoscroll');
  assert.equal(hook.value.messages.length, 4);
  hook.value.setInput('Conservar ante error'); hook.render();
  const failed = hook.value.send();
  posts[1].reject(new Error('Servidor no disponible')); await failed; hook.render();
  assert.equal(hook.value.input, 'Conservar ante error');
  assert.equal(hook.value.messages.length, 4);
  assert.equal(hook.value.error, 'Servidor no disponible');

  tick();
  const stale = gets[3];
  hook.render({ matchId: 20, userId: 2 });
  assert.equal(stale.signal.aborted, true);
  stale.resolve(messages); await hook.settle();
  assert.equal(hook.value.messages.length, 0);
  gets[4].resolve([]); await hook.settle();
  assert.equal(hook.value.messages.length, 0);
  assert.equal(timers.size, 1);
  hook.unmount();
  assert.equal(timers.size, 0);
  assert.equal(gets[4].signal.aborted, true);

  // Mismo historial al remontar desde cualquiera de las identidades: cambian los lados.
  api.getMensajes = async () => structuredClone(messages);
  const matchProfile = { id: 2, matchId: 10, nombre: 'B', fechaMatch: messages[0].enviadoEn, ultimoMensaje: messages[1], noLeidos: 1 };
  for (const currentUserId of [1, 2, 1]) {
    const profile = { ...matchProfile, id: currentUserId === 1 ? 2 : 1 };
    const component = mount(Matches, { matches: [profile], currentUserId, activeChatUser: profile });
    await component.settle();
    const bubbles = allNodes(component.value).filter((n) => n.props.className?.startsWith('chat-bubble-row'));
    assert.equal(bubbles.length, 2);
    assert.equal(bubbles[0].props.className, `chat-bubble-row ${currentUserId === 1 ? 'outgoing' : 'incoming'}`);
    assert.equal(bubbles[1].props.className, `chat-bubble-row ${currentUserId === 2 ? 'outgoing' : 'incoming'}`);
    component.unmount();
    assert.equal(timers.size, 0);
  }
  assert.equal(posts.length, 2, 'No se genera ninguna respuesta automática');
});
