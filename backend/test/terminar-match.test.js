const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

let matches = [
  { id: 10, usuario1Id: 1, usuario2Id: 2, activo: true, fecha: new Date('2026-01-01') },
  { id: 20, usuario1Id: 1, usuario2Id: 3, activo: true, fecha: new Date('2026-01-02') },
];
let messages = [];

const users = [1, 2, 3, 4].map((id) => ({ id, nombre: `Usuario ${id}` }));

const prisma = {
  $transaction: async (callback) => callback(prisma),
  usuario: { findUnique: async ({ where }) => users.find((u) => u.id === where.id) ?? null },
  match: {
    findUnique: async ({ where }) => matches.find((m) => m.id === where.id) ?? null,
    findMany: async ({ where }) => matches.filter((m) => m.activo && where.OR.some((clause) =>
      Object.entries(clause).every(([key, value]) => m[key] === value))).map((m) => ({
      ...m,
      usuario1: users.find((u) => u.id === m.usuario1Id),
      usuario2: users.find((u) => u.id === m.usuario2Id),
      mensajes: messages.filter((msg) => msg.matchId === m.id).slice(-1),
      _count: { mensajes: messages.filter((msg) => msg.matchId === m.id && !msg.leido && msg.emisorId !== where.OR[0].usuario1Id).length },
    })),
    update: async ({ where, data }) => {
      const match = matches.find((m) => m.id === where.id);
      if (!match) throw new Error('Match not found');
      Object.assign(match, data);
      return { ...match };
    },
    updateMany: async ({ where, data }) => {
      const found = matches.filter((m) => m.usuario1Id === where.usuario1Id && m.usuario2Id === where.usuario2Id && m.activo === where.activo);
      found.forEach((m) => Object.assign(m, data));
      return { count: found.length };
    },
  },
  bloqueo: { findFirst: async () => null },
  mensaje: {
    create: async ({ data }) => {
      const message = { id: messages.length + 1, ...data, enviadoEn: new Date(), leido: false };
      messages.push(message);
      return message;
    },
    findMany: async ({ where }) => messages.filter((m) => m.matchId === where.matchId),
    updateMany: async () => ({ count: 0 }),
  },
};

require.cache[require.resolve('../src/config/prisma')] = { exports: prisma };

const app = express();
app.use(express.json());
app.use('/api/matches', require('../src/routes/match.routes'));
app.use('/api/matches', require('../src/routes/mensaje.routes'));
app.use(require('../src/middlewares/error.middleware'));

test('terminar match: DELETE, PATCH, acceso, validación y efecto en mensajería', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());

  const baseUrl = `http://127.0.0.1:${server.address().port}/api/matches`;
  const request = (path, method = 'GET', body) => fetch(`${baseUrl}/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  // 1. Obtener matches iniciales para usuario 1: debe tener 2 matches activos
  let res = await request('1');
  assert.equal(res.status, 200);
  let userMatches = await res.json();
  assert.equal(userMatches.length, 2);

  // 2. Intentar terminar match con usuario ajeno (usuario 4): 403 Forbidden
  res = await request('10?usuarioId=4', 'DELETE');
  assert.equal(res.status, 403);
  let errorData = await res.json();
  assert.match(errorData.error, /No pertenecés a este match/);

  // 3. Intentar terminar match inexistente (id 999): 404 Not Found
  res = await request('999?usuarioId=1', 'DELETE');
  assert.equal(res.status, 404);

  // 4. Intentar con id inválido: 400 Bad Request
  res = await request('invalido?usuarioId=1', 'DELETE');
  assert.equal(res.status, 400);

  // 5. Terminar match 10 con usuario 1: 200 OK
  res = await request('10?usuarioId=1', 'DELETE');
  assert.equal(res.status, 200);
  let body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.match.activo, false);

  // 6. Consultar matches de usuario 1: ahora solo debe quedar 1 match activo (el match 20)
  res = await request('1');
  assert.equal(res.status, 200);
  userMatches = await res.json();
  assert.equal(userMatches.length, 1);
  assert.equal(userMatches[0].id, 20);

  // 7. Consultar matches de usuario 2: ya no debe tener ningún match activo
  res = await request('2');
  assert.equal(res.status, 200);
  userMatches = await res.json();
  assert.equal(userMatches.length, 0);

  // 8. Intentar enviar mensaje en el match terminado: debe fallar porque el match está inactivo
  res = await request('10/mensajes', 'POST', { emisorId: 1, contenido: 'Hola después de terminar' });
  assert.equal(res.status, 400);
  errorData = await res.json();
  assert.match(errorData.error, /inactivo/);

  // 9. Verificar PATCH /api/matches/:matchId/terminar para match 20
  res = await request('20/terminar', 'PATCH', { usuarioId: 3 });
  assert.equal(res.status, 200);
  body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.match.activo, false);

  // 10. Ahora el usuario 1 no tiene ningún match activo
  res = await request('1');
  userMatches = await res.json();
  assert.equal(userMatches.length, 0);
});
