const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Se sustituye solo la persistencia; rutas, validadores y servicios son los reales.
let preferencia = null;
const ubicacion = { latitud: 0, longitud: 0 };
const year = new Date().getUTCFullYear();
const candidatos = [
  { id: 2, fechaNacimiento: `${year - 25}-01-01`, ubicacion, hobbies: [] },
  { id: 3, fechaNacimiento: `${year - 40}-01-01`, ubicacion, hobbies: [] },
  { id: 4, fechaNacimiento: `${year - 25}-01-01`, ubicacion: { latitud: 0, longitud: 1 }, hobbies: [] },
];
require.cache[require.resolve('../src/config/prisma')] = { exports: {
  usuario: {
    findUnique: async ({ where }) => where.id === 1 ? { id: 1, ubicacion, preferencia } : null,
    findMany: async () => candidatos,
  },
  preferencia: {
    findUnique: async () => preferencia,
    create: async ({ data }) => (preferencia = { id: 1, ...data }),
    update: async ({ data }) => (preferencia = { ...preferencia, ...data }),
  },
} };
const app = express();
app.use(express.json());
app.use('/api/usuarios', require('../src/routes/preferencia.routes'));
app.use('/api/usuarios', require('../src/routes/candidato.routes'));
app.use(require('../src/middlewares/error.middleware'));

test('guardar preferencias cambia inmediatamente los candidatos por edad y distancia', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const request = (path, method = 'GET', data) => fetch(`http://127.0.0.1:${server.address().port}/api/usuarios/1/${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: data && JSON.stringify(data),
  });
  const ids = async () => {
    const res = await request('candidatos');
    assert.equal(res.status, 200);
    return (await res.json()).map((u) => u.id);
  };
  assert.equal((await request('preferencia')).status, 404);
  assert.equal((await request('candidatos')).status, 400);
  const initial = { edadMinima: 18, edadMaxima: 60, distanciaMaxKm: 200 };
  for (const [edadMinima, edadMaxima] of [[20, 24], [22, 23], [30, 32]]) {
    const res = await request('preferencia', 'POST', { ...initial, edadMinima, edadMaxima });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /al menos 5 años/);
    assert.equal(preferencia, null);
  }
  assert.equal((await request('preferencia', 'POST', initial)).status, 201);
  assert.deepEqual(await ids(), [2, 3, 4]);
  for (const [edadMinima, edadMaxima] of [[20, 24], [22, 23], [30, 32]]) {
    const before = { ...preferencia };
    const res = await request('preferencia', 'PUT', { ...initial, edadMinima, edadMaxima });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /al menos 5 años/);
    assert.deepEqual(preferencia, before);
  }
  for (const [edadMinima, edadMaxima] of [[20, 25], [20, 30], [35, 40], [18, 100], [95, 100]]) {
    assert.equal((await request('preferencia', 'PUT', { ...initial, edadMinima, edadMaxima })).status, 200);
  }
  assert.equal((await request('preferencia', 'PUT', { ...initial, edadMaxima: 30 })).status, 200);
  assert.deepEqual(await ids(), [2, 4]);
  const narrow = { ...initial, edadMaxima: 30, distanciaMaxKm: 50 };
  assert.equal((await request('preferencia', 'PUT', narrow)).status, 200);
  assert.deepEqual(await ids(), [2]);
  assert.deepEqual(await (await request('preferencia')).json(), { id: 1, usuarioId: 1, ...narrow });
  for (const invalid of [{ edadMinima: 31 }, { edadMinima: 17 }, { distanciaMaxKm: 0 }, { edadMaxima: 25.5 }, { genero: 'mujer' }]) {
    assert.equal((await request('preferencia', 'PUT', { ...narrow, ...invalid })).status, 400);
    assert.deepEqual(await ids(), [2]);
  }
  assert.equal((await request('preferencia', 'PUT', initial)).status, 200);
  assert.deepEqual(await ids(), [2, 3, 4]);
  // Exact manual values must survive persistence without snapping to slider options.
  for (const distanciaMaxKm of [37, 82, 100000]) {
    assert.equal((await request('preferencia', 'PUT', { ...narrow, distanciaMaxKm })).status, 200);
    assert.equal((await (await request('preferencia')).json()).distanciaMaxKm, distanciaMaxKm);
    assert.deepEqual(await ids(), distanciaMaxKm === 100000 ? [2, 4] : [2]);
  }
  // The sentinel also covers the farthest possible location, while age still filters.
  candidatos.push({ id: 5, fechaNacimiento: `${year - 25}-01-01`, ubicacion: { latitud: 0, longitud: 180 }, hobbies: [] });
  assert.deepEqual(await ids(), [2, 4, 5]);
  assert.equal((await request('preferencia', 'PUT', narrow)).status, 200);
  assert.deepEqual(await ids(), [2]);
});
