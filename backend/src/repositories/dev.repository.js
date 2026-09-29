const prisma = require('../config/prisma');
const NotFoundError = require('../errors/not-found-error');

const resetearInteracciones = (usuarioId) => prisma.$transaction(async (tx) => {
  if (usuarioId !== undefined && !await tx.usuario.findUnique({ where: { id: usuarioId } })) {
    throw new NotFoundError('Usuario no encontrado');
  }
  // Ambos modelos dependen solamente de Usuario; no se elimina ningún usuario.
  const matches = await tx.match.deleteMany({
    where: usuarioId === undefined ? {} : { OR: [{ usuario1Id: usuarioId }, { usuario2Id: usuarioId }] },
  });
  const interacciones = await tx.interaccion.deleteMany({
    where: usuarioId === undefined ? {} : { OR: [{ usuarioEmisorId: usuarioId }, { usuarioDestinatarioId: usuarioId }] },
  });
  return { interaccionesEliminadas: interacciones.count, matchesEliminados: matches.count };
});

module.exports = { resetearInteracciones };
