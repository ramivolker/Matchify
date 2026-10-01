const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Se sustituye solo la persistencia; rutas, validadores y servicios son los reales.
let preferencia = null;
const ubicacion = { latitud: 0, longitud: 0 };
const year = new Date().getUTCFullYear();
const candidatos = [
  { id: 2, fechaNacimiento: `${year - 25}-01-01`, ubicacion, genero: 'FEMENINO', hobbies: [] },
  { id: 3, fechaNacimiento: `${year - 40}-01-01`, ubicacion, genero: 'FEMENINO', hobbies: [] },
  { id: 4, fechaNacimiento: `${year - 25}-01-01`, ubicacion: { latitud: 0, longitud: 1 }, genero: 'NO_BINARIO', hobbies: [] },
];
require.cache[require.resolve('../src/config/prisma')] = { exports: {
  usuario: {
    findUnique: async ({ where }) => where.id === 1 ? { id: 1, ubicacion, preferencia } : null,
    findMany: async ({ where }) => {
      assert.equal(where.id.not, 1);
      assert.equal(where.activo, true);
      assert.deepEqual(where.interaccionesRecibidas, { none: { usuarioEmisorId: 1 } });
      assert.deepEqual(where.bloqueosRecibidos, { none: { usuarioBloqueadorId: 1 } });
      assert.deepEqual(where.bloqueosRealizados, { none: { usuarioBloqueadoId: 1 } });
      assert.deepEqual(where.ubicacion, { isNot: null });
      return candidatos.filter((u) => where.genero.in.includes(u.genero));
    },
  },
  preferencia: {
    findUnique: async () => preferencia,
    create: async ({ data }) => (preferencia = { id: 1, ...data, generos: data.generos.create }),
    update: async ({ data }) => (preferencia = { ...preferencia, ...data, generos: data.generos.create }),
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
  const initial = { edadMinima: 18, edadMaxima: 60, distanciaMaxKm: 200, generos: ['MASCULINO', 'FEMENINO', 'NO_BINARIO', 'OTRO'] };
  for (const [edadMinima, edadMaxima] of [[20, 24], [22, 23], [30, 32]]) {
    const res = await request('preferencia', 'POST', { ...initial, edadMinima, edadMaxima });
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /al menos 5 años/);
    assert.equal(preferencia, null);
  }
  for (const generos of [[], ['FEMENINO', 'FEMENINO'], ['TODOS'], ['mujer'], 'FEMENINO', null]) {
    assert.equal((await request('preferencia', 'POST', { ...initial, generos })).status, 400);
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
  for (const invalid of [{ edadMinima: 31 }, { edadMinima: 17 }, { distanciaMaxKm: 0 }, { edadMaxima: 25.5 }, { genero: 'mujer' }, { generos: [] }, { generos: ['FEMENINO', 'FEMENINO'] }, { generos: ['TODOS'] }, { generos: null }, { generos: 'FEMENINO' }]) {
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
  candidatos.push({ id: 5, fechaNacimiento: `${year - 25}-01-01`, ubicacion: { latitud: 0, longitud: 180 }, genero: 'OTRO', hobbies: [] });
  assert.deepEqual(await ids(), [2, 4, 5]);
  assert.equal((await request('preferencia', 'PUT', narrow)).status, 200);
  assert.deepEqual(await ids(), [2]);
});

// Cada selecci?n se prueba junto a candidatos sin g?nero y preferencias heredadas.
test('selección de género, null y preferencias antiguas', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/api/usuarios/1`;
  candidatos.push({ id: 6, genero: null, fechaNacimiento: `${year - 25}-01-01`, ubicacion, hobbies: [] });
  candidatos.push({ id: 7, genero: 'MASCULINO', fechaNacimiento: `${year - 25}-01-01`, ubicacion, hobbies: [] });
  for (const [generos, expected] of [
    [['FEMENINO'], [2, 3]],
    [['FEMENINO', 'NO_BINARIO'], [2, 3, 4]],
    [['MASCULINO', 'FEMENINO', 'NO_BINARIO', 'OTRO'], [2, 3, 4, 5, 7]],
  ]) {
    const data = { edadMinima: 18, edadMaxima: 60, distanciaMaxKm: 100000, generos };
    const saved = await fetch(`${url}/preferencia`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    assert.equal(saved.status, 200);
    assert.deepEqual((await saved.json()).generos, generos);
    assert.deepEqual((await (await fetch(`${url}/preferencia`)).json()).generos, generos);
    assert.deepEqual((await (await fetch(`${url}/candidatos`)).json()).map((u) => u.id), expected);
  }
  preferencia.generos = [];
  assert.deepEqual((await (await fetch(`${url}/preferencia`)).json()).generos, []);
  const response = await fetch(`${url}/candidatos`);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /Seleccioná al menos un género/);
});
