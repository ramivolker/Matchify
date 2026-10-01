const { PrismaClient } = require('../../config/prisma');

const prisma = new PrismaClient();

async function bloquearUsuario(usuarioId, bloqueadorId) {
  return prisma.bloqueo.create({
    data: {
      usuarioId,
      bloqueadorId,
      fechaBloqueo: new Date(),
    },
    include: {
      usuario: true,
      bloqueador: true,
    },
  });
}

async function desbloquearUsuario(usuarioId, bloqueadorId) {
  return prisma.bloqueo.deleteMany({
    where: {
      usuarioId,
      bloqueadorId,
    },
  });
}

async function verificarBloqueo(usuarioId, bloqueadorId) {
  const bloqueo = await prisma.bloqueo.findUnique({
    where: {
      usuarioId_bloqueadorId: {
        usuarioId,
        bloqueadorId,
      },
    },
  });
  return !!bloqueo;
}

async function obtenerUsuariosBloqueados(usuarioId) {
  return prisma.bloqueo.findMany({
    where: { bloqueadorId: usuarioId },
    include: {
      usuario: true,
    },
  });
}

module.exports = {
  bloquearUsuario,
  desbloquearUsuario,
  verificarBloqueo,
  obtenerUsuariosBloqueados,
};