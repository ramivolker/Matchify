const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

test('MySQL: mensajes persistentes, mismos datos en otra conexión, historial y bloqueos', {
  skip: process.env.RUN_DB_TESTS !== '1',
}, async () => {
  require('dotenv').config();
  const prisma = require('../src/config/prisma');
  const { PrismaClient } = require('@prisma/client');
  const service = require('../src/services/mensaje.service');
  const matchService = require('../src/services/match.service');
  const ids = [];
  const token = randomUUID();
  const originals = {
    matches: await prisma.match.findMany({ orderBy: { id: 'asc' } }),
    interacciones: await prisma.interaccion.findMany({ orderBy: { id: 'asc' } }),
  };
  try {
    for (const name of ['A', 'B', 'C']) {
      const user = await prisma.usuario.create({ data: { nombre: `Chat test ${name}`, apellido: 'Temporal',
        email: `${token}-${name}@test.matchify.test`, fechaNacimiento: new Date('2000-01-01') } });
      ids.push(user.id);
    }
    const [a, b, outsider] = ids;
    const match = await prisma.match.create({ data: { usuario1Id: a, usuario2Id: b } });
    assert.deepEqual(await service.obtenerHistorial(match.id, a), []);
    const first = await service.crear(match.id, { emisorId: a, contenido: 'Hola desde A' });
    const second = await service.crear(match.id, { emisorId: b, contenido: 'Respuesta de B' });
    assert.deepEqual(await service.obtenerHistorial(match.id, a), await service.obtenerHistorial(match.id, b));
    await assert.rejects(service.crear(match.id, { emisorId: outsider, contenido: 'Ajeno' }), { statusCode: 403 });
    await prisma.$disconnect();
    // Una conexión nueva no tiene acceso al estado de React ni del proceso anterior.
    const fresh = new PrismaClient();
    try {
      assert.deepEqual((await fresh.mensaje.findMany({ where: { matchId: match.id }, orderBy: [{ enviadoEn: 'asc' }, { id: 'asc' }] })).map((m) => m.id), [first.id, second.id]);
    } finally { await fresh.$disconnect(); }
    assert.equal((await matchService.obtenerMatchesPorUsuario(a))[0].noLeidos, 1);
    await service.marcarLeidos(match.id, { usuarioId: a, hastaMensajeId: second.id });
    assert.equal((await matchService.obtenerMatchesPorUsuario(a))[0].noLeidos, 0);
    assert.equal((await prisma.mensaje.findUnique({ where: { id: first.id } })).leido, false);
    await prisma.bloqueo.create({ data: { usuarioBloqueadorId: b, usuarioBloqueadoId: a } });
    await assert.rejects(service.crear(match.id, { emisorId: a, contenido: 'Bloqueado' }), { statusCode: 403 });
    assert.equal(await prisma.mensaje.count({ where: { matchId: match.id } }), 2);
  } finally {
    // Solo los usuarios creados por esta prueba; cascade limpia SU match y SUS mensajes.
    await prisma.usuario.deleteMany({ where: { id: { in: ids }, email: { startsWith: token } } });
    assert.deepEqual(await prisma.match.findMany({ orderBy: { id: 'asc' } }), originals.matches);
    assert.deepEqual(await prisma.interaccion.findMany({ orderBy: { id: 'asc' } }), originals.interacciones);
    await prisma.$disconnect();
  }
});
