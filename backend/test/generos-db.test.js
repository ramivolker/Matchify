const { test } = require('node:test');
const assert = require('node:assert/strict');

// Opt-in: ejecuta el seed sobre la base configurada. No borra datos de prueba.
test('seed de géneros idempotente y conservación de usuarios reales e interacciones', {
  skip: process.env.RUN_DB_TESTS !== '1',
}, async () => {
  const prisma = require('../src/config/prisma');
  const { seed, usuarios } = require('../prisma/seed');
  const emails = usuarios.map((u) => u.email);
  const snapshot = async () => ({
    reales: await prisma.usuario.findMany({
      where: { email: { notIn: emails } }, orderBy: { id: 'asc' },
      include: { preferencia: { include: { generos: { orderBy: { genero: 'asc' } } } } },
    }),
    likes: await prisma.interaccion.findMany({ orderBy: { id: 'asc' } }),
    matches: await prisma.match.findMany({ orderBy: { id: 'asc' } }),
    bloqueos: await prisma.bloqueo.findMany({ orderBy: { id: 'asc' } }),
  });
  const seedSnapshot = async () => (await prisma.usuario.findMany({
    where: { email: { in: emails } }, orderBy: { id: 'asc' },
    include: { preferencia: { include: { generos: { orderBy: { genero: 'asc' } } } } },
  })).map(({ actualizadoEn, ...user }) => user);
  try {
    const before = await snapshot();
    await seed(prisma);
    const once = await seedSnapshot();
    assert.equal(once.length, usuarios.length);
    assert.equal(new Set(once.map((u) => u.genero)).size, 4);
    for (const user of once) {
      const expected = usuarios.find((u) => u.email === user.email);
      assert.equal(user.genero, expected.genero);
      assert.deepEqual(user.preferencia.generos.map((g) => g.genero).sort(), [...expected.preferencia.generos].sort());
    }
    await seed(prisma);
    assert.deepEqual(await seedSnapshot(), once);
    assert.deepEqual(await snapshot(), before);
  } finally {
    await prisma.$disconnect();
  }
});
