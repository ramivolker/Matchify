const prisma = require('../config/prisma');

const enTransaccion = (operacion) => prisma.$transaction(operacion, { isolationLevel: 'Serializable' });
const obtenerMatch = (id, tx) => tx.match.findUnique({ where: { id } });
const obtenerUsuario = (id, tx) => tx.usuario.findUnique({ where: { id }, select: { id: true } });
const obtenerBloqueo = (a, b, tx) => tx.bloqueo.findFirst({
  where: { OR: [
    { usuarioBloqueadorId: a, usuarioBloqueadoId: b },
    { usuarioBloqueadorId: b, usuarioBloqueadoId: a },
  ] },
});
const obtenerHistorial = (matchId, tx) => tx.mensaje.findMany({
  where: { matchId }, orderBy: [{ enviadoEn: 'asc' }, { id: 'asc' }],
});
const crear = (datos, tx) => tx.mensaje.create({ data: datos });
const marcarLeidos = (matchId, usuarioId, hastaMensajeId, tx) => tx.mensaje.updateMany({
  where: { matchId, emisorId: { not: usuarioId }, leido: false, id: { lte: hastaMensajeId } },
  data: { leido: true },
});

module.exports = { enTransaccion, obtenerMatch, obtenerUsuario, obtenerBloqueo, obtenerHistorial, crear, marcarLeidos };
