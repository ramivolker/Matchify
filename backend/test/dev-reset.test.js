const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Sustituir únicamente Prisma: probar las rutas, controller, service y repository reales.
let state;
let failInteractions = false;
let transactions = 0;
const prisma = {
  async $transaction(callback) {
    transactions++;
    const draft = structuredClone(state);
    const remove = (key, where) => {
      const before = draft[key].length;
      draft[key] = draft[key].filter((row) => where.OR && !where.OR.some((clause) =>
        Object.entries(clause).every(([field, value]) => row[field] === value)));
      return { count: before - draft[key].length };
    };
    const result = await callback({
      usuario: { findUnique: async ({ where }) => draft.usuarios.find((u) => u.id === where.id) },
      match: { deleteMany: async ({ where }) => remove('matches', where) },
      interaccion: { deleteMany: async ({ where }) => {
        if (failInteractions) throw new Error('Fallo simulado');
        return remove('interacciones', where);
      } },
    });
    state = draft;
    return result;
  },
};
require.cache[require.resolve('../src/config/prisma')] = { exports: prisma };
const app = express();
app.use('/api/dev', require('../src/routes/dev.routes'));
app.use(require('../src/middlewares/error.middleware'));

test('resets de desarrollo a través de HTTP', async (t) => {
  const previousEnv = process.env.NODE_ENV;
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => {
    if (previousEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousEnv;
    server.close();
  });
  const request = (path, method = 'DELETE') => fetch(`http://127.0.0.1:${server.address().port}/api/dev${path}`, { method });
  const initial = {
    usuarios: [{ id: 1 }, { id: 2 }, { id: 3 }],
    interacciones: [
      { usuarioEmisorId: 1, usuarioDestinatarioId: 2, tipo: 'LIKE' },
      { usuarioEmisorId: 3, usuarioDestinatarioId: 1, tipo: 'DISLIKE' },
      { usuarioEmisorId: 2, usuarioDestinatarioId: 3, tipo: 'LIKE' },
    ],
    matches: [{ usuario1Id: 1, usuario2Id: 2, activo: true }, { usuario1Id: 3, usuario2Id: 1, activo: false }, { usuario1Id: 2, usuario2Id: 3, activo: true }],
    preferencias: [{ usuarioId: 1 }], usuarioHobbies: [{ usuarioId: 1, hobbieId: 1 }],
    hobbies: [{ id: 1 }], ubicaciones: [{ id: 1 }], tiposUsuario: [{ id: 1 }],
  };
  state = structuredClone(initial);
  process.env.NODE_ENV = 'production';
  for (const [path, method] of [['/interacciones', 'GET'], ['/interacciones', 'DELETE'], ['/usuarios/1/interacciones', 'DELETE'], ['/usuarios/no/interacciones', 'DELETE']]) {
    assert.equal((await request(path, method)).status, 403);
  }
  assert.equal(transactions, 0);
  assert.deepEqual(state, initial);

  process.env.NODE_ENV = 'development';
  assert.deepEqual(await (await request('/interacciones', 'GET')).json(), { habilitado: true });
  assert.equal((await request('/usuarios/0/interacciones')).status, 400);
  assert.equal((await request('/usuarios/no/interacciones')).status, 400);
  assert.equal((await request('/usuarios/999/interacciones')).status, 404);
  assert.deepEqual(state, initial);

  assert.deepEqual(await (await request('/usuarios/1/interacciones')).json(), { interaccionesEliminadas: 2, matchesEliminados: 2 });
  assert.deepEqual(state, { ...initial, interacciones: [initial.interacciones[2]], matches: [initial.matches[2]] });
  assert.deepEqual(await (await request('/usuarios/1/interacciones')).json(), { interaccionesEliminadas: 0, matchesEliminados: 0 });

  state = structuredClone(initial);
  failInteractions = true;
  assert.equal((await request('/interacciones')).status, 500);
  assert.deepEqual(state, initial, 'Un fallo no debe confirmar la eliminación de matches');
  failInteractions = false;
  assert.deepEqual(await (await request('/interacciones')).json(), { interaccionesEliminadas: 3, matchesEliminados: 3 });
  assert.deepEqual(state, { ...initial, interacciones: [], matches: [] });
  assert.deepEqual(await (await request('/interacciones')).json(), { interaccionesEliminadas: 0, matchesEliminados: 0 });
});
