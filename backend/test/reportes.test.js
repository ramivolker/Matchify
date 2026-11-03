const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const rows = [];
const users = [1, 2].map((id) => ({ id, nombre: `Usuario ${id}`, apellido: 'Test', email: `${id}@test.test`, activo: true }));
const enrich = (r) => r && ({ ...r, usuarioReportante: users.find((u) => u.id === r.usuarioReportanteId), usuarioReportado: users.find((u) => u.id === r.usuarioReportadoId) });
// Doble de Prisma para probar HTTP y todas las capas; no representa una prueba MySQL.
const prisma = {
  usuario: { findUnique: async ({ where }) => users.find((u) => u.id === where.id) || null,
    update: async ({ where, data }) => { const u = users.find((u) => u.id === where.id); Object.assign(u, data); return { ...u }; } },
  reporte: {
    create: async ({ data }) => { const r = { id: rows.length + 1, ...data, estado: 'PENDIENTE', creadoEn: new Date(), resueltoEn: null }; rows.push(r); return enrich(r); },
    findUnique: async ({ where }) => enrich(rows.find((r) => r.id === where.id)) || null,
    findMany: async ({ where }) => rows.filter((r) => !where.estado || r.estado === where.estado).map(enrich),
    updateMany: async ({ where, data }) => { const r = rows.find((r) => r.id === where.id && r.estado === where.estado); if (r) Object.assign(r, data); return { count: r ? 1 : 0 }; },
  },
};
require.cache[require.resolve('../src/config/prisma')] = { exports: prisma };
const app = express(); app.use(express.json());
app.use('/api/reportes', require('../src/routes/reporte.routes'));
app.use(require('../src/middlewares/error.middleware'));
test('Reportes HTTP con doble de Prisma: creación, validación, consulta y cierre', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => server.close());
  const request = (path = '', method = 'GET', data) => fetch(`http://127.0.0.1:${server.address().port}/api/reportes${path}`, {
    method, headers: { 'Content-Type': 'application/json' }, body: data && JSON.stringify(data),
  });
  const valid = { usuarioReportanteId: 1, usuarioReportadoId: 2, motivo: 'spam', descripcion: '  Detalles  ' };
  const create = (data = valid) => request('', 'POST', data);
  await t.test('catálogo original de cinco motivos', async () => assert.equal(Object.keys(await (await request('/motivos')).json()).length, 5));
  await t.test('reportante inexistente', async () => assert.equal((await create({ ...valid, usuarioReportanteId: 999 })).status, 404));
  await t.test('reportado inexistente', async () => assert.equal((await create({ ...valid, usuarioReportadoId: 999 })).status, 404));
  await t.test('autorreporte', async () => assert.equal((await create({ ...valid, usuarioReportadoId: 1 })).status, 400));
  await t.test('payload inválido y límites', async () => {
    for (const data of [{ ...valid, motivo: '' }, { ...valid, motivo: 'inventado' }, { ...valid, descripcion: 'x'.repeat(301) }, { ...valid, descripcion: {} }, { ...valid, usuarioReportanteId: '1' }, { ...valid, estado: 'RESUELTO' }, null]) assert.equal((await create(data)).status, 400);
  });
  await t.test('crear reporte válido', async () => {
    const res = await create(); assert.equal(res.status, 201);
    const r = await res.json(); assert.equal(r.descripcion, 'Detalles'); assert.equal(r.estado, 'PENDIENTE'); assert.equal(r.resueltoEn, null); assert.ok(r.creadoEn);
    assert.equal((await create({ ...valid, descripcion: undefined })).status, 201);
  });
  await t.test('listar y filtrar', async () => { assert.equal((await (await request()).json()).length, 2); assert.equal((await (await request('?estado=RESUELTO')).json()).length, 0); assert.equal((await request('?estado=INVALIDO')).status, 400); });
  await t.test('detalle y ausente', async () => { const r = await (await request('/1')).json(); assert.equal(r.usuarioReportante.email, '1@test.test'); assert.equal(r.usuarioReportado.activo, true); assert.equal((await request('/999')).status, 404); assert.equal((await request('/abc')).status, 400); });
  await t.test('estado inválido', async () => assert.equal((await request('/1/estado', 'PATCH', { estado: 'OTRO' })).status, 400));
  for (const [id, estado] of [[1, 'RESUELTO'], [2, 'DESCARTADO']]) await t.test(`cerrar ${estado}`, async () => {
    const res = await request(`/${id}/estado`, 'PATCH', { estado }); assert.equal(res.status, 200);
    const r = await res.json(); assert.equal(r.estado, estado); assert.ok(r.resueltoEn);
    assert.equal((await request(`/${id}/estado`, 'PATCH', { estado })).status, 400);
    const other = estado === 'RESUELTO' ? 'DESCARTADO' : 'RESUELTO';
    const denied = await request(`/${id}/estado`, 'PATCH', { estado: other });
    assert.equal(denied.status, 400); assert.match((await denied.json()).error, /primero debe reabrirse/);
  });
  assert.equal((await request('/999/estado', 'PATCH', { estado: 'RESUELTO' })).status, 404);
  assert.equal((await (await request('?estado=PENDIENTE')).json()).length, 0);
  assert.ok(users.every((u) => u.activo));
  for (const id of [1, 2]) await t.test(`reabrir ${rows[id - 1].estado} sin cambiar cuenta`, async () => {
    users[1].activo = false;
    const original = { ...rows[id - 1] };
    const res = await request(`/${id}/estado`, 'PATCH', { estado: 'PENDIENTE' });
    assert.equal(res.status, 200); const r = await res.json();
    assert.equal(r.estado, 'PENDIENTE'); assert.equal(r.resueltoEn, null);
    assert.equal(r.usuarioReportado.activo, false); assert.equal(r.id, original.id);
    assert.equal(r.creadoEn, original.creadoEn.toISOString());
    assert.equal(rows.length, 2);
    assert.equal((await request(`/${id}/estado`, 'PATCH', { estado: 'PENDIENTE' })).status, 400);
  });
  await t.test('reactivar y desactivar no modifican reportes ni sus fechas', async () => {
    const service = require('../src/services/usuario.service');
    const before = JSON.stringify(rows);
    for (const activo of [true, false, true]) {
      const user = await service.actualizarEstado(2, { activo });
      assert.equal(user.activo, activo); assert.equal(JSON.stringify(rows), before);
    }
  });
  await t.test('cerrar nuevamente después de reabrir asigna fecha de cierre', async () => {
    const res = await request('/1/estado', 'PATCH', { estado: 'DESCARTADO' });
    assert.equal(res.status, 200); const r = await res.json();
    assert.equal(r.estado, 'DESCARTADO'); assert.ok(r.resueltoEn);
  });
});
