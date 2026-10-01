const { PrismaClient } = require('../../config/prisma');

const prisma = new PrismaClient();

async function terminarMatch(matchId, usuarioId) {
  return prisma.match.updateMany({
    where: {
      id: matchId,
      OR: [
        { usuario1Id: usuarioId },
        { usuario2Id: usuarioId },
      ],
    },
    data: {
      activo: false,
      fechaFinalizacion: new Date(),
    },
  });
}

async function verificarMatchActiva(matchId, usuarioId) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      activo: true,
      usuario1Id: true,
      usuario2Id: true,
    },
  });

  if (!match) {
    throw new Error('Match no encontrado');
  }

  if (!match.activo) {
    throw new Error('Match ya está terminada');
  }

  if (match.usuario1Id !== usuarioId && match.usuario2Id !== usuarioId) {
    throw new Error('No tienes permiso para terminar este match');
  }

  return match;
}

module.exports = {
  terminarMatch,
  verificarMatchActiva,
};