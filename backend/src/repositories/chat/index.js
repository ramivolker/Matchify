const { PrismaClient } = require('../../config/prisma');

const prisma = new PrismaClient();

async function crearMensaje(datos) {
  return prisma.mensaje.create({
    data: datos,
    include: {
      match: true,
      usuario: true,
    },
  });
}

async function obtenerMensajesPorMatch(matchId) {
  return prisma.mensaje.findMany({
    where: { matchId },
    include: {
      usuario: true,
    },
    orderBy: {
      fechaCreacion: 'asc',
    },
  });
}

async function eliminarMensaje(id, usuarioId) {
  return prisma.mensaje.deleteMany({
    where: {
      id,
      usuarioId,
    },
  });
}

async function buscarMensajePorId(id) {
  return prisma.mensaje.findUnique({
    where: { id },
    include: {
      usuario: true,
    },
  });
}

module.exports = {
  crearMensaje,
  obtenerMensajesPorMatch,
  eliminarMensaje,
  buscarMensajePorId,
};