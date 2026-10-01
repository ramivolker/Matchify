const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

let messages = [];
let blocked = [];
const users = [1, 2, 3, 4].map((id) => ({ id, nombre: `Usuario ${id}` }));
const matches = [{ id: 10, usuario1Id: 1, usuario2Id: 2, activo: true, fecha: new Date('2026-01-01') }];
const ordered = (rows) => [...rows].sort((a, b) => a.enviadoEn - b.enviadoEn || a.id - b.id);
const prisma = {
  $transaction: async (callback) => callback(prisma),
  usuario: { findUnique: async ({ where }) => users.find((u) => u.id === where.id) ?? null },
  match: {
    findUnique: async ({ where }) => matches.find((m) => m.id === where.id) ?? null,
    findMany: async ({ where }) => matches.filter((m) => m.activo && where.OR.some((clause) =>
      Object.entries(clause).every(([key, value]) => m[key] === value))).map((m) => ({
      ...m, usuario1: users.find((u) => u.id === m.usuario1Id), usuario2: users.find((u) => u.id === m.usuario2Id),
      mensajes: ordered(messages.filter((msg) => msg.matchId === m.id)).slice(-1),
      _count: { mensajes: messages.filter((msg) => msg.matchId === m.id && !msg.leido && msg.emisorId !== where.OR[0].usuario1Id).length },
    })),
  },
  bloqueo: { findFirst: async ({ where }) => blocked.find((b) => where.OR.some((clause) =>
    Object.entries(clause).every(([key, value]) => b[key] === value))) ?? null },
  mensaje: {
    create: async ({ data }) => {
      const message = { id: messages.length + 1, ...data, enviadoEn: new Date(), leido: false };
      messages.push(message);
      return message;
    },
    findMany: async ({ where, orderBy }) => {
      assert.deepEqual(orderBy, [{ enviadoEn: 'asc' }, { id: 'asc' }]);
      return ordered(messages.filter((m) => m.matchId === where.matchId));
    },
    updateMany: async ({ where, data }) => {
      const received = messages.filter((m) => m.matchId === where.matchId && m.emisorId !== where.emisorId.not && !m.leido && m.id <= where.id.lte);
      received.forEach((m) => Object.assign(m, data));
      return { count: received.length };
    },
  },
};
require.cache[require.resolve('../src/config/prisma')] = { exports: prisma };
const app = express();
app.use(express.json());
app.use('/api/matches', require('../src/routes/mensaje.routes'));
app.use('/api/matches', require('../src/routes/match.routes'));
app.use(require('../src/middlewares/error.middleware'));

test('mensajería HTTP: acceso, validación, historial compartido y lecturas', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const request = (path, method = 'GET', body) => fetch(`http://127.0.0.1:${server.address().port}/api/matches/${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
  });
  const send = (body, match = 10) => request(`${match}/mensajes`, 'POST', body);
  assert.deepEqual(await (await request('10/mensajes?usuarioId=1')).json(), []);
  for (const contenido of ['', '   ', '\n\t', 'x'.repeat(1001), null, {}, 123]) {
    assert.equal((await send({ emisorId: 1, contenido })).status, 400);
  }
  for (const emisorId of [0, -1, 1.5, '1', null]) {
    assert.equal((await send({ emisorId, contenido: 'Hola' })).status, 400);
  }
  assert.equal((await send({ emisorId: 1, contenido: 'Hola', leido: true })).status, 400);
  assert.equal((await send({ emisorId: 1, contenido: 'Hola' }, 999)).status, 404);
  assert.equal((await send({ emisorId: 999, contenido: 'Hola' })).status, 404);
  assert.equal((await send({ emisorId: 3, contenido: 'Hola' })).status, 403);
  assert.equal((await request('10/mensajes?usuarioId=3')).status, 403);
  assert.equal((await request('10/mensajes')).status, 400);
  assert.equal((await request('no/mensajes?usuarioId=1')).status, 400);
  assert.equal(messages.length, 0);

  const first = await send({ emisorId: 1, contenido: '  Hola Lucía  ' });
  assert.equal(first.status, 201);
  assert.equal((await first.json()).contenido, 'Hola Lucía');
  assert.equal((await send({ emisorId: 2, contenido: 'Hola Mateo' })).status, 201);
  assert.equal((await send({ emisorId: 1, contenido: 'x'.repeat(1000) })).status, 201);
  // Forzar empate de fechas y almacenamiento desordenado: id desempata.
  messages.forEach((m) => { m.enviadoEn = new Date('2026-10-01'); });
  messages.reverse();
  const a = await (await request('10/mensajes?usuarioId=1')).json();
  const b = await (await request('10/mensajes?usuarioId=2')).json();
  assert.deepEqual(a, b);
  assert.deepEqual(a.map((m) => m.id), [1, 2, 3]);
  assert.equal(a.filter((m) => m.emisorId === 1).length, 2);
  assert.equal(b.filter((m) => m.emisorId === 2).length, 1);

  const listA = await (await request('1')).json();
  assert.equal(listA[0].id, 10);
  assert.equal(listA[0].otroUsuario.id, 2);
  assert.equal(listA[0].ultimoMensaje.id, 3);
  assert.equal(listA[0].noLeidos, 1);
  assert.equal((await (await request('2')).json())[0].noLeidos, 2);
  assert.equal((await request('10/mensajes/leidos', 'PATCH', { usuarioId: 3, hastaMensajeId: 3 })).status, 403);
  assert.equal((await request('10/mensajes/leidos', 'PATCH', { usuarioId: 1 })).status, 400);
  await request('10/mensajes/leidos', 'PATCH', { usuarioId: 2, hastaMensajeId: 1 });
  assert.equal(messages.find((m) => m.id === 1).leido, true);
  assert.equal(messages.find((m) => m.id === 2).leido, false);
  assert.equal(messages.find((m) => m.id === 3).leido, false);
  await request('10/mensajes/leidos', 'PATCH', { usuarioId: 1, hastaMensajeId: 3 });
  assert.equal((await (await request('1')).json())[0].noLeidos, 0);

  matches.push({ id: 20, usuario1Id: 1, usuario2Id: 3, activo: true, fecha: new Date('2026-01-02') },
    { id: 30, usuario1Id: 1, usuario2Id: 4, activo: true, fecha: new Date('2026-12-01') });
  messages.push({ id: 99, matchId: 20, emisorId: 3, contenido: 'Más reciente', enviadoEn: new Date('2026-11-01'), leido: false });
  assert.deepEqual((await (await request('1')).json()).map((m) => m.id), [20, 10, 30]);
  assert.equal((await (await request('1')).json())[2].ultimoMensaje, null);
  assert.equal((await (await request('1')).json())[2].noLeidos, 0);
  messages = messages.filter((m) => m.id !== 99);
  matches.splice(1);

  for (const [from, to] of [[1, 2], [2, 1]]) {
    blocked = [{ usuarioBloqueadorId: from, usuarioBloqueadoId: to }];
    const res = await send({ emisorId: 1, contenido: 'No permitido' });
    assert.equal(res.status, 403);
    assert.match((await res.json()).error, /bloqueo/);
    assert.equal((await request('10/mensajes?usuarioId=2')).status, 403);
  }
  blocked = [];
  matches[0].activo = false;
  assert.equal((await send({ emisorId: 1, contenido: 'No permitido' })).status, 400);
  assert.equal((await request('10/mensajes?usuarioId=1')).status, 400);
  assert.equal(messages.length, 3);
  assert.deepEqual(await (await request('1')).json(), []);
  assert.equal((await request('999')).status, 404);
  assert.equal((await request('0')).status, 400);
});
