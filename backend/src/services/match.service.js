const matchRepository = require("../repositories/match.repository");
const usuarioRepository = require('../repositories/usuario.repository');
const { validarId } = require('../validators/mensaje.validator');
const NotFoundError = require('../errors/not-found-error');
const AppError = require('../errors/app-error');

async function obtenerMatchesPorUsuario(usuarioId) {
  validarId(usuarioId, 'usuarioId');
  if (!await usuarioRepository.obtenerPorId(usuarioId)) throw new NotFoundError('Usuario no encontrado');
  const matches = await matchRepository.obtenerMatchesPorUsuario(usuarioId);
  return matches.map(({ mensajes, _count, ...match }) => ({
    ...match,
    otroUsuario: match.usuario1Id === usuarioId ? match.usuario2 : match.usuario1,
    ultimoMensaje: mensajes[0] ?? null,
    noLeidos: _count.mensajes,
  })).sort((a, b) => {
    if (!!a.ultimoMensaje !== !!b.ultimoMensaje) return a.ultimoMensaje ? -1 : 1;
    return new Date(b.ultimoMensaje?.enviadoEn ?? b.fecha) - new Date(a.ultimoMensaje?.enviadoEn ?? a.fecha) || b.id - a.id;
  });
}

async function terminarMatch(matchId, usuarioId) {
  validarId(matchId, 'matchId');
  const match = await matchRepository.obtenerMatchPorId(matchId);
  if (!match) throw new NotFoundError('Match no encontrado');

  if (usuarioId !== undefined && usuarioId !== null && !Number.isNaN(usuarioId)) {
    validarId(usuarioId, 'usuarioId');
    if (match.usuario1Id !== usuarioId && match.usuario2Id !== usuarioId) {
      throw new AppError('No pertenecés a este match', 403);
    }
  }

  if (!match.activo) {
    return match;
  }

  return matchRepository.desactivarMatchPorId(matchId);
}

module.exports = {
  obtenerMatchesPorUsuario,
  terminarMatch,
};
