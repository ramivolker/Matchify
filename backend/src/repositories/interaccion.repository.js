const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function crearInteraccion(usuarioEmisorId, usuarioDestinatarioId, tipo) {
  return prisma.interaccion.create({
    data: {
      usuarioEmisorId,
      usuarioDestinatarioId,
      tipo,
    },
  });
}

async function buscarInteraccion(usuarioEmisorId, usuarioDestinatarioId) {
  return prisma.interaccion.findUnique({
    where: {
      usuarioEmisorId_usuarioDestinatarioId: {
        usuarioEmisorId,
        usuarioDestinatarioId,
      },
    },
  });
}

module.exports = {
  crearInteraccion,
  buscarInteraccion,
};