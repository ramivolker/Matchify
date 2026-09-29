const bloqueoRepository = require("../repositories/bloqueo.repository");
const matchRepository = require("../repositories/match.repository");

async function bloquearUsuario(usuarioBloqueadorId, usuarioBloqueadoId) {
  if (!usuarioBloqueadorId || !usuarioBloqueadoId) {
    throw new Error("Los IDs de los usuarios son obligatorios");
  }

  if (usuarioBloqueadorId === usuarioBloqueadoId) {
    throw new Error("Un usuario no puede bloquearse a sí mismo");
  }

  const bloqueoExistente = await bloqueoRepository.buscarBloqueo(
    usuarioBloqueadorId,
    usuarioBloqueadoId
  );

  if (bloqueoExistente) {
    throw new Error("El usuario ya está bloqueado");
  }

  const bloqueo = await bloqueoRepository.crearBloqueo(
    usuarioBloqueadorId,
    usuarioBloqueadoId
  );

  await matchRepository.desactivarMatchEntreUsuarios(
    usuarioBloqueadorId,
    usuarioBloqueadoId
  );

  return bloqueo;
}

async function obtenerBloqueados(usuarioId) {
  return bloqueoRepository.obtenerBloqueosDeUsuario(usuarioId);
}

async function desbloquearUsuario(usuarioBloqueadorId, usuarioBloqueadoId) {
  const bloqueoExistente = await bloqueoRepository.buscarBloqueo(
    usuarioBloqueadorId,
    usuarioBloqueadoId
  );

  if (!bloqueoExistente) {
    throw new Error("No existe un bloqueo entre estos usuarios");
  }

  return bloqueoRepository.eliminarBloqueo(
    usuarioBloqueadorId,
    usuarioBloqueadoId
  );
}

module.exports = {
  bloquearUsuario,
  obtenerBloqueados,
  desbloquearUsuario,
};