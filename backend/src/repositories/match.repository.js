const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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
      usuario1: true,
      usuario2: true,
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
  crearMatch,
  obtenerMatchesPorUsuario,
  desactivarMatchEntreUsuarios,
};

