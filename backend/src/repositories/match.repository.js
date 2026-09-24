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

module.exports = {
  crearMatch,
};