const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

test('MySQL y HTTP: sancion reversible, acceso por ID e historicos intactos', { skip: process.env.RUN_DB_TESTS !== '1' }, async (t) => {
  require('dotenv').config();
  const prisma = require('../src/config/prisma');
  const { PrismaClient } = require('@prisma/client');
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const request = (path, method = 'GET', body) => fetch(`http://127.0.0.1:${server.address().port}/api${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
  const token = randomUUID(); const ids = []; let ubicacion; let hobbie;
  const fresh = new PrismaClient();
  try {
    ubicacion = await prisma.ubicacion.create({ data: { ciudad: token, provincia: 'Test', pais: 'Test', latitud: 0, longitud: 0 } });
    hobbie = await prisma.hobbie.create({ data: { nombre: token } });
    for (const nombre of ['A', 'B', 'C']) ids.push((await prisma.usuario.create({ data: { nombre, apellido: 'Estado test', email: `${token}-${nombre}@test.matchify.test`, fechaNacimiento: new Date('2000-01-01'), activo: true, genero: 'OTRO', ubicacionId: ubicacion.id,
      preferencia: { create: { edadMinima: 18, edadMaxima: 80, distanciaMaxKm: 200, generos: { create: [{ genero: 'OTRO' }] } } },
    } })).id);
    const [a, b, c] = ids;
    const match = await prisma.match.create({ data: { usuario1Id: Math.min(a, b), usuario2Id: Math.max(a, b) } });
    await prisma.mensaje.create({ data: { matchId: match.id, emisorId: b, contenido: 'Historico conservado' } });
    await prisma.interaccion.create({ data: { usuarioEmisorId: a, usuarioDestinatarioId: b, tipo: 'LIKE' } });
    await prisma.usuarioHobbie.create({ data: { usuarioId: b, hobbieId: hobbie.id } });
    await prisma.foto.create({ data: { usuarioId: b, url: 'https://example.com/test.jpg' } });
    const report = await (await request('/reportes', 'POST', { usuarioReportanteId: a, usuarioReportadoId: b, motivo: 'spam' })).json();
    assert.ok(report.id);
    const snapshot = async () => ({
      matches: await prisma.match.findMany({ where: { id: match.id } }),
      mensajes: await prisma.mensaje.findMany({ where: { matchId: match.id } }),
      interacciones: await prisma.interaccion.findMany({ where: { usuarioEmisorId: a } }),
      hobbies: await prisma.usuarioHobbie.findMany({ where: { usuarioId: b } }),
      preferencias: await prisma.preferencia.findMany({ where: { usuarioId: b }, include: { generos: true } }),
      reportes: await prisma.reporte.findMany({ where: { id: report.id } }),
      fotos: await prisma.foto.findMany({ where: { usuarioId: b } }),
    });
    const originals = await snapshot();
    const state = (activo) => request(`/usuarios/${b}/estado`, 'PATCH', { activo });
    await t.test('candidato activo visible', async () => {
      const res = await request(`/usuarios/${c}/candidatos`); assert.equal(res.status, 200); assert.ok((await res.json()).some((u) => u.id === b));
    });
    await t.test('desactivar persiste en otra conexion MySQL', async () => {
      const res = await state(false); assert.equal(res.status, 200); assert.equal((await res.json()).activo, false);
      assert.equal((await fresh.usuario.findUnique({ where: { id: b } })).activo, false);
    });
    await t.test('admin consulta inactivo y el reporte sigue pendiente', async () => {
      assert.equal((await (await request(`/usuarios/${b}`)).json()).activo, false);
      assert.ok((await (await request('/usuarios')).json()).some((u) => u.id === b && u.activo === false));
      const r = await (await request(`/reportes/${report.id}`)).json(); assert.equal(r.estado, 'PENDIENTE'); assert.equal(r.usuarioReportado.activo, false);
    });
    await t.test('candidato inactivo excluido', async () => assert.ok(!(await (await request(`/usuarios/${c}/candidatos`)).json()).some((u) => u.id === b)));
    const profile = { nombre: 'B', apellido: 'Estado test', email: `${token}-B@test.matchify.test`, fechaNacimiento: '2000-01-01', biografia: 'Cambio prohibido' };
    for (const [label, path, method, body] of [
      ['candidatos', `/usuarios/${b}/candidatos`],
      ['interaccion', '/interacciones', 'POST', { usuarioEmisorId: b, usuarioDestinatarioId: c, tipo: 'LIKE' }],
      ['interaccion recibida', '/interacciones', 'POST', { usuarioEmisorId: c, usuarioDestinatarioId: b, tipo: 'LIKE' }],
      ['mensaje', `/matches/${match.id}/mensajes`, 'POST', { emisorId: b, contenido: 'No debe guardarse' }],
      ['historial', `/matches/${match.id}/mensajes?usuarioId=${b}`],
      ['matches', `/matches/${b}`],
      ['lecturas', `/matches/${match.id}/mensajes/leidos`, 'PATCH', { usuarioId: b, hastaMensajeId: 1 }],
      ['preferencias', `/usuarios/${b}/preferencia`, 'PUT', { edadMinima: 18, edadMaxima: 80, distanciaMaxKm: 100, generos: ['OTRO'] }],
      ['perfil', `/usuarios/${b}/perfil`, 'PATCH', profile],
      ['fotos', `/usuarios/${b}/fotos`, 'POST', { url: 'https://example.com/otra.jpg' }],
      ['hobbies', `/usuarios/${b}/hobbies/${hobbie.id}`, 'DELETE'],
      ['reporte', '/reportes', 'POST', { usuarioReportanteId: b, usuarioReportadoId: c, motivo: 'spam' }],
    ]) await t.test(`ID inactivo rechazado: ${label}`, async () => {
      const res = await request(path, method, body); assert.equal(res.status, 403); assert.match((await res.json()).error, /desactivada/);
    });
    await t.test('historia intacta tras desactivacion y acciones rechazadas', async () => assert.deepEqual(await snapshot(), originals));
    await t.test('payload de estado estricto, ID invalido y ausente', async () => {
      for (const body of [{ activo: 'false' }, {}, { activo: false, nombre: 'Otro' }]) assert.equal((await request(`/usuarios/${b}/estado`, 'PATCH', body)).status, 400);
      assert.equal((await request('/usuarios/abc/estado', 'PATCH', { activo: false })).status, 400);
      assert.equal((await request('/usuarios/2147483647/estado', 'PATCH', { activo: false })).status, 404);
    });
    await t.test('reactivar persiste, restaura acceso y conserva historia', async () => {
      assert.equal((await state(true)).status, 200);
      assert.equal((await fresh.usuario.findUnique({ where: { id: b } })).activo, true);
      assert.equal((await request(`/usuarios/${b}/candidatos`)).status, 200);
      assert.equal((await request(`/matches/${match.id}/mensajes?usuarioId=${b}`)).status, 200);
      assert.ok((await (await request(`/usuarios/${c}/candidatos`)).json()).some((u) => u.id === b));
      assert.deepEqual(await snapshot(), originals);
      assert.equal((await request(`/usuarios/${b}/perfil`, 'PATCH', { ...profile, activo: true })).status, 400);
      assert.equal((await request(`/usuarios/${b}/perfil`, 'PATCH', profile)).status, 200);
    });
    await t.test('resolver reporte no desactiva cuenta', async () => {
      assert.equal((await request(`/reportes/${report.id}/estado`, 'PATCH', { estado: 'RESUELTO' })).status, 200);
      assert.equal((await fresh.usuario.findUnique({ where: { id: b } })).activo, true);
    });
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await prisma.usuario.deleteMany({ where: { id: { in: ids }, email: { startsWith: token } } });
    if (hobbie) await prisma.hobbie.delete({ where: { id: hobbie.id } });
    if (ubicacion) await prisma.ubicacion.delete({ where: { id: ubicacion.id } });
    await fresh.$disconnect(); await prisma.$disconnect();
  }
});
