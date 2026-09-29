const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function crearBloqueo(usuarioBloqueadorId, usuarioBloqueadoId) {
  return prisma.bloqueo.create({
    data: {
      usuarioBloqueadorId,
      usuarioBloqueadoId,
    },
  });
}

async function buscarBloqueo(usuarioBloqueadorId, usuarioBloqueadoId) {
  return prisma.bloqueo.findUnique({
    where: {
      usuarioBloqueadorId_usuarioBloqueadoId: {
        usuarioBloqueadorId,
        usuarioBloqueadoId,
      },
    },
  });
}

async function obtenerBloqueosDeUsuario(usuarioId) {
  return prisma.bloqueo.findMany({
    where: {
      usuarioBloqueadorId: usuarioId,
    },
    include: {
      usuarioBloqueado: true,
    },
    orderBy: {
      fecha: "desc",
    },
  });
}

async function eliminarBloqueo(usuarioBloqueadorId, usuarioBloqueadoId) {
  return prisma.bloqueo.delete({
    where: {
      usuarioBloqueadorId_usuarioBloqueadoId: {
        usuarioBloqueadorId,
        usuarioBloqueadoId,
      },
    },
  });
}

module.exports = {
  crearBloqueo,
  buscarBloqueo,
  obtenerBloqueosDeUsuario,
  eliminarBloqueo,
};