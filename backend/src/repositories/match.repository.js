const prisma = require('../config/prisma');

async function crearMatch(usuarioAId, usuarioBId) {
  const usuario1Id = Math.min(usuarioAId, usuarioBId);
  const usuario2Id = Math.max(usuarioAId, usuarioBId);

  return prisma.match.create({
    data: {
      usuario1Id,
      usuario2Id,
    },
  });
}

async function obtenerMatchesPorUsuario(usuarioId) {
  return prisma.match.findMany({
    where: {
      OR: [
        { usuario1Id: usuarioId },
        { usuario2Id: usuarioId },
      ],
      activo: true,
    },
    include: {
      usuario1: { include: { fotos: { orderBy: { orden: 'asc' } } } },
      usuario2: { include: { fotos: { orderBy: { orden: 'asc' } } } },
      mensajes: { take: 1, orderBy: [{ enviadoEn: 'desc' }, { id: 'desc' }] },
      _count: { select: { mensajes: { where: { leido: false, emisorId: { not: usuarioId } } } } },
    },
  });
}

async function desactivarMatchEntreUsuarios(usuarioAId, usuarioBId) {
  const usuario1Id = Math.min(usuarioAId, usuarioBId);
  const usuario2Id = Math.max(usuarioAId, usuarioBId);

  return prisma.match.updateMany({
    where: {
      usuario1Id,
      usuario2Id,
      activo: true,
    },
    data: {
      activo: false,
    },
  });
}

module.exports = {
  // Consulta histórica: no filtrar por actividad del match ni de sus participantes.
  obtenerEntreUsuarios: (a, b) => prisma.match.findUnique({
    where: { usuario1Id_usuario2Id: { usuario1Id: Math.min(a, b), usuario2Id: Math.max(a, b) } },
    select: { id: true, activo: true },
  }),
  crearMatch,
  obtenerMatchesPorUsuario,
  desactivarMatchEntreUsuarios,
};

