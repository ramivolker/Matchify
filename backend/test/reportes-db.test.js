const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
test('MySQL: reportes persistidos, cierre y usuarios sin sanciones', { skip: process.env.RUN_DB_TESTS !== '1' }, async () => {
  require('dotenv').config();
  const prisma = require('../src/config/prisma');
  const { PrismaClient } = require('@prisma/client');
  const service = require('../src/services/reporte.service');
  const ids = []; const token = randomUUID();
  try {
    for (const nombre of ['A', 'B']) ids.push((await prisma.usuario.create({ data: { nombre, apellido: 'Reporte test', email: `${token}-${nombre}@test.matchify.test`, fechaNacimiento: new Date('2000-01-01') } })).id);
    const data = { usuarioReportanteId: ids[0], usuarioReportadoId: ids[1], motivo: 'spam', descripcion: 'Prueba persistente' };
    const first = await service.crear(data); const second = await service.crear({ ...data, descripcion: undefined });
    assert.equal(first.estado, 'PENDIENTE'); assert.equal(first.descripcion, data.descripcion);
    const other = new PrismaClient();
    try { assert.equal((await other.reporte.findUnique({ where: { id: first.id } })).descripcion, data.descripcion); } finally { await other.$disconnect(); }
    assert.ok((await service.listar('PENDIENTE')).some((r) => r.id === first.id));
    await assert.rejects(service.crear({ ...data, usuarioReportanteId: 2147483647 }), { statusCode: 404 });
    await assert.rejects(service.crear({ ...data, usuarioReportadoId: 2147483647 }), { statusCode: 404 });
    await assert.rejects(service.crear({ ...data, usuarioReportadoId: ids[0] }), { statusCode: 400 });
    await assert.rejects(service.actualizarEstado(first.id, { estado: 'INVALIDO' }), { statusCode: 400 });
    for (const [r, estado] of [[first, 'RESUELTO'], [second, 'DESCARTADO']]) {
      const updated = await service.actualizarEstado(r.id, { estado }); assert.equal(updated.estado, estado); assert.ok(updated.resueltoEn);
      assert.equal((await service.obtener(r.id)).estado, estado);
      await assert.rejects(service.actualizarEstado(r.id, { estado: estado === 'RESUELTO' ? 'DESCARTADO' : 'RESUELTO' }), { statusCode: 400 });
      const reopened = await service.actualizarEstado(r.id, { estado: 'PENDIENTE' });
      assert.equal(reopened.estado, 'PENDIENTE'); assert.equal(reopened.resueltoEn, null);
      const persisted = await prisma.reporte.findUnique({ where: { id: r.id } });
      assert.equal(persisted.resueltoEn, null); assert.equal(persisted.estado, 'PENDIENTE');
    }
    assert.equal(await prisma.usuario.count({ where: { id: { in: ids }, activo: true } }), 2);
    assert.equal(await prisma.bloqueo.count({ where: { usuarioBloqueadorId: { in: ids } } }), 0);
  } finally {
    await prisma.usuario.deleteMany({ where: { id: { in: ids }, email: { startsWith: token } } });
    await prisma.$disconnect();
  }
});
