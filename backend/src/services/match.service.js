const { comprobarUsuarioActivo } = require('./usuario-activo.service');
const matchRepository = require("../repositories/match.repository");
const usuarioRepository = require('../repositories/usuario.repository');
const { validarId } = require('../validators/mensaje.validator');
const NotFoundError = require('../errors/not-found-error');

async function obtenerMatchesPorUsuario(usuarioId) {
  validarId(usuarioId, 'usuarioId');
  comprobarUsuarioActivo(await usuarioRepository.obtenerPorId(usuarioId));
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

module.exports = {
  obtenerMatchesPorUsuario,
};
