const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

test('Contexto HTTP del reporte: aislamiento, historial y lectura sin mutaciones', async (t) => {
  const usuarios = [1, 2, 3].map((id) => ({ id, nombre: `Persona ${id}`, apellido: 'Test', activo: true, email: 'privado' }));
  const reporte = { id: 4, usuarioReportanteId: 2, usuarioReportadoId: 1, estado: 'PENDIENTE',
    usuarioReportante: usuarios[1], usuarioReportado: usuarios[0] };
  const matches = [{ id: 10, usuario1Id: 1, usuario2Id: 2, activo: true }, { id: 11, usuario1Id: 1, usuario2Id: 3, activo: true }];
  const mensajes = [
    { id: 3, matchId: 10, emisorId: 1, contenido: 'tercero', enviadoEn: '2026-01-02', leido: false },
    { id: 2, matchId: 10, emisorId: 2, contenido: 'segundo', enviadoEn: '2026-01-01', leido: true },
    { id: 1, matchId: 10, emisorId: 1, contenido: 'primero', enviadoEn: '2026-01-01', leido: false },
    { id: 4, matchId: 11, emisorId: 3, contenido: 'privado tercero', enviadoEn: '2026-01-01', leido: false },
  ];
  const prisma = {
    reporte: { findUnique: async ({ where }) => where.id === reporte.id ? reporte : null },
    match: { findUnique: async ({ where, select }) => {
      assert.deepEqual(Object.keys(where), ['usuario1Id_usuario2Id']);
      assert.deepEqual(where.usuario1Id_usuario2Id, { usuario1Id: 1, usuario2Id: 2 });
      assert.deepEqual(select, { id: true, activo: true });
      const m = matches.find((m) => m.usuario1Id === 1 && m.usuario2Id === 2);
      return m ? { id: m.id, activo: m.activo } : null;
    } },
    mensaje: { findMany: async ({ where, orderBy }) => {
      assert.deepEqual(where, { matchId: 10 });
      assert.deepEqual(orderBy, [{ enviadoEn: 'asc' }, { id: 'asc' }]);
      return mensajes.filter((m) => m.matchId === where.matchId).sort((a, b) => new Date(a.enviadoEn) - new Date(b.enviadoEn) || a.id - b.id);
    } },
  }; // No se ofrecen métodos de escritura: cualquier intento de mutación falla.
  require.cache[require.resolve('../src/config/prisma')] = { exports: prisma };
  const app = express(); app.use('/api/reportes', require('../src/routes/reporte.routes'));
  app.use(require('../src/middlewares/error.middleware'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve)); t.after(() => server.close());
  const request = (id = '4', query = '') => fetch(`http://127.0.0.1:${server.address().port}/api/reportes/${id}/conversacion${query}`);
  const contexto = async () => { const r = await request(); assert.equal(r.status, 200); assert.equal(r.headers.get('cache-control'), 'no-store'); return r.json(); };
  await t.test('Match con mensajes, orden cronológico y sin campos sensibles', async () => {
    const r = await contexto(); assert.equal(r.hayConversacion, true); assert.equal(r.cantidadMensajes, 3);
    assert.deepEqual(r.mensajes.map((m) => m.id), [1, 2, 3]); assert.equal(r.reportante.email, undefined);
    assert.equal(r.mensajes[0].matchId, undefined);
  });
  await t.test('no expone terceros aunque se envíen IDs arbitrarios', async () => {
    const r = await (await request('4', '?usuarioReportanteId=1&usuarioReportadoId=3&matchId=11')).json();
    assert.ok(r.mensajes.every((m) => [1, 2].includes(m.emisorId))); assert.equal(r.match.id, 10);
  });
  await t.test('match inactivo, participantes inactivos y todos los estados de reporte', async () => {
    matches[0].activo = false; usuarios[0].activo = false; usuarios[1].activo = false;
    for (const estado of ['PENDIENTE', 'RESUELTO', 'DESCARTADO']) {
      reporte.estado = estado; const r = await contexto(); assert.equal(r.match.activo, false); assert.equal(r.cantidadMensajes, 3);
    }
  });
  await t.test('consulta no cambia leido, timestamps, match, usuarios ni reporte', async () => {
    const antes = JSON.stringify({ mensajes, matches, usuarios, reporte }); await contexto();
    assert.equal(JSON.stringify({ mensajes, matches, usuarios, reporte }), antes);
  });
  await t.test('match sin mensajes', async () => {
    mensajes.splice(0, 3); const r = await contexto(); assert.equal(r.match.id, 10);
    assert.equal(r.hayConversacion, false); assert.equal(r.cantidadMensajes, 0); assert.deepEqual(r.mensajes, []);
  });
  await t.test('sin match es respuesta válida', async () => {
    matches.shift(); const r = await contexto(); assert.equal(r.match, null); assert.equal(r.hayConversacion, false);
    assert.equal(r.cantidadMensajes, 0); assert.deepEqual(r.mensajes, []);
  });
  await t.test('reporte inexistente e IDs inválidos', async () => {
    assert.equal((await request('999')).status, 404);
    for (const id of ['abc', '0', '-1', '1.5']) assert.equal((await request(id)).status, 400);
  });
});
