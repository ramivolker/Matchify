const chatRepository = require('../../repositories/chat');
const usuarioRepository = require('../../repositories/usuario.repository');
const matchRepository = require('../../repositories/match.repository');
const NotFoundError = require('../../errors/not-found-error');
const ValidationError = require('../../errors/validation-error');

const comprobarUsuario = async (usuarioId) => {
  const usuario = await usuarioRepository.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }
};

const comprobarMatch = async (matchId) => {
  const match = await matchRepository.obtenerPorId(matchId);

  if (!match) {
    throw new NotFoundError('Match no encontrado');
  }
};

const crearMensaje = async (datos) => {
  const { usuarioId, matchId } = datos;

  await comprobarUsuario(usuarioId);
  await comprobarMatch(matchId);

  // Verificar que el usuario es parte del match
  const match = await matchRepository.obtenerPorId(matchId);

  if (match.usuario1Id !== usuarioId && match.usuario2Id !== usuarioId) {
    throw new ValidationError('El usuario no es parte de este match');
  }

  return chatRepository.crearMensaje({
    ...datos,
    fechaCreacion: new Date(),
  });
};

const obtenerMensajesPorMatch = async (matchId, usuarioId) => {
  await comprobarUsuario(usuarioId);
  await comprobarMatch(matchId);

  // Verificar que el usuario es parte del match
  const match = await matchRepository.obtenerPorId(matchId);

  if (match.usuario1Id !== usuarioId && match.usuario2Id !== usuarioId) {
    throw new ValidationError('El usuario no es parte de este match');
  }

  return chatRepository.obtenerMensajesPorMatch(matchId);
};

const eliminarMensaje = async (id, usuarioId) => {
  await comprobarUsuario(usuarioId);

  const mensaje = await chatRepository.buscarMensajePorId(id);

  if (!mensaje) {
    throw new NotFoundError('Mensaje no encontrado');
  }

  if (mensaje.usuarioId !== usuarioId) {
    throw new ValidationError('El usuario no tiene permiso para eliminar este mensaje');
  }

  await chatRepository.eliminarMensaje(id, usuarioId);
  return { mensajeEliminado: true };
};

module.exports = {
  crearMensaje,
  obtenerMensajesPorMatch,
  eliminarMensaje,
};