const repository = require('../repositories/mensaje.repository');
const { validarId, validarMensaje } = require('../validators/mensaje.validator');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const AppError = require('../errors/app-error');

// Cuando haya autenticación, usuarioId procederá del contexto autenticado del controller.
const comprobarAcceso = async (matchId, usuarioId, tx) => {
  const match = await repository.obtenerMatch(matchId, tx);
  if (!match) throw new NotFoundError('Match no encontrado');
  if (!await repository.obtenerUsuario(usuarioId, tx)) throw new NotFoundError('Usuario no encontrado');
  if (match.usuario1Id !== usuarioId && match.usuario2Id !== usuarioId) {
    throw new AppError('No pertenecés a este match', 403);
  }
  if (await repository.obtenerBloqueo(match.usuario1Id, match.usuario2Id, tx)) {
    throw new AppError('La conversación no está disponible porque existe un bloqueo', 403);
  }
  if (!match.activo) throw new ValidationError('El match está inactivo');
};

const obtenerHistorial = async (matchId, usuarioId) => {
  validarId(matchId, 'matchId');
  validarId(usuarioId, 'usuarioId');
  return repository.enTransaccion(async (tx) => {
    await comprobarAcceso(matchId, usuarioId, tx);
    return repository.obtenerHistorial(matchId, tx);
  });
};

const crear = async (matchId, datos) => {
  validarId(matchId, 'matchId');
  validarMensaje(datos);
  return repository.enTransaccion(async (tx) => {
    await comprobarAcceso(matchId, datos.emisorId, tx);
    return repository.crear({ matchId, emisorId: datos.emisorId, contenido: datos.contenido.trim() }, tx);
  });
};

const marcarLeidos = async (matchId, datos) => {
  validarId(matchId, 'matchId');
  validarId(datos?.usuarioId, 'usuarioId');
  validarId(datos?.hastaMensajeId, 'hastaMensajeId');
  return repository.enTransaccion(async (tx) => {
    await comprobarAcceso(matchId, datos.usuarioId, tx);
    // Solo los recibidos hasta el último mensaje cargado, nunca mensajes propios.
    return repository.marcarLeidos(matchId, datos.usuarioId, datos.hastaMensajeId, tx);
  });
};

module.exports = { obtenerHistorial, crear, marcarLeidos };
